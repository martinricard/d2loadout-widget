require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for StreamElements compatibility
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Bungie API Base URL
const BUNGIE_API_BASE = 'https://www.bungie.net/Platform';

// In-memory cache for manifest data (to reduce API calls)
const manifestCache = {
  items: new Map(),
  stats: new Map(),
  plugs: new Map(),
  artifacts: new Map(),
  lastUpdate: null,
  TTL: 3600000 // 1 hour
};

// Bucket hashes for item slots
const BUCKET_HASHES = {
  KINETIC: 1498876634,
  ENERGY: 2465295065,
  POWER: 953998645,
  HELMET: 3448274439,
  ARMS: 3551918588,
  CHEST: 14239492,
  LEGS: 20886954,
  CLASS_ITEM: 1585787867,
  SUBCLASS: 3284755031
};

// Stat hashes for armor (The Final Shape - corrected mapping based on actual API data)
const STAT_HASHES = {
  '2996146975': 'Strength',      // Melee stat (API returns this as Strength value)
  '392767087': 'Mobility',       // Weapons stat (API returns this as Mobility value)
  '1943323491': 'Recovery',      // Class stat
  '1735777505': 'Discipline',    // Grenade stat
  '144602215': 'Intellect',      // Super stat
  '4244567218': 'Resilience'     // Health stat (API returns this as Resilience value)
};

// Health check endpoint (Render uses this to verify deployment)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'D2 Loadout Widget Backend is running',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    endpoints: [
      'GET /health - Health check',
      'GET /api/loadout/:platform/:membershipId - Get character loadout',
      'GET /api/search/:displayName - Search player by Bungie name'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Search player by Bungie display name (e.g., Marty#2689)
app.get('/api/search/:displayName', async (req, res) => {
  const { displayName } = req.params;
  
  try {
    const searchUrl = `${BUNGIE_API_BASE}/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(displayName)}/`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'X-API-Key': process.env.BUNGIE_API_KEY
      }
    });
    
    const players = response.data.Response;
    
    if (!players || players.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found',
        message: `No player found with Bungie name: ${displayName}`
      });
    }
    
    res.json({
      success: true,
      count: players.length,
      players: players.map(p => ({
        membershipId: p.membershipId,
        membershipType: p.membershipType,
        displayName: p.displayName,
        iconPath: p.iconPath,
        platformName: getPlatformName(p.membershipType)
      }))
    });
    
  } catch (error) {
    console.error('Player search error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Player search failed',
      message: error.response?.data?.Message || error.message 
    });
  }
});

// Get character loadout - supports both membership ID and Bungie name
app.get('/api/loadout/:platformOrName/:membershipIdOrTag?', async (req, res) => {
  let { platformOrName, membershipIdOrTag } = req.params;
  let platform = platformOrName;
  let membershipId = membershipIdOrTag;
  
  // If membershipIdOrTag is provided, it's the normal format: /api/loadout/3/4611686018467484767
  // If not, platformOrName might be a Bungie name: /api/loadout/Marty#2689
  if (!membershipIdOrTag && platformOrName.includes('#')) {
    // It's a Bungie name, search for it first
    try {
      const searchUrl = `${BUNGIE_API_BASE}/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(platformOrName)}/`;
      const searchResponse = await axios.get(searchUrl, {
        headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
      });
      
      const players = searchResponse.data.Response;
      if (!players || players.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Player not found',
          message: `No player found with Bungie name: ${platformOrName}`
        });
      }
      
      // Use the first result (primary platform)
      platform = players[0].membershipType;
      membershipId = players[0].membershipId;
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to search player',
        message: error.message
      });
    }
  }
  
  if (!process.env.BUNGIE_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'Bungie API key not configured'
    });
  }
  
  try {
    // Fetch profile with character equipment and stats
    // Components: 100=Profile, 104=ProfileProgression, 200=Characters, 202=CharacterProgressions,
    //             205=CharacterEquipment, 300=ItemInstances, 304=ItemStats, 305=ItemSockets
    const components = '?components=100,104,200,202,205,300,304,305';
    const profileUrl = `${BUNGIE_API_BASE}/Destiny2/${platform}/Profile/${membershipId}/${components}`;
    
    const response = await axios.get(profileUrl, {
      headers: {
        'X-API-Key': process.env.BUNGIE_API_KEY
      }
    });
    
    const data = response.data.Response;
    const characters = data.characters?.data || {};
    const equipment = data.characterEquipment?.data || {};
    const characterProgressions = data.characterProgressions?.data || {};
    const profileProgression = data.profileProgression?.data || {};
    const itemComponents = {
      instances: data.itemComponents?.instances?.data || {},
      stats: data.itemComponents?.stats?.data || {},
      sockets: data.itemComponents?.sockets?.data || {}
    };
    
    // Get seasonal artifact info from profile
    const seasonalArtifact = profileProgression.seasonalArtifact || null;
    let artifactInfo = null;
    
    if (seasonalArtifact && seasonalArtifact.artifactHash) {
      artifactInfo = await fetchArtifactModHashes(seasonalArtifact.artifactHash);
    }
    
    // Find the most recently played character
    let mostRecentCharacterId = null;
    let mostRecentDate = null;
    
    for (const [charId, charData] of Object.entries(characters)) {
      const lastPlayed = new Date(charData.dateLastPlayed);
      if (!mostRecentDate || lastPlayed > mostRecentDate) {
        mostRecentDate = lastPlayed;
        mostRecentCharacterId = charId;
      }
    }
    
    if (!mostRecentCharacterId) {
      return res.status(404).json({
        success: false,
        error: 'No characters found',
        message: 'This player has no Destiny 2 characters'
      });
    }
    
    // Get character info
    const character = characters[mostRecentCharacterId];
    const characterEquipment = equipment[mostRecentCharacterId];
    
    // Get character progression data for artifact mods
    const characterProgression = characterProgressions[mostRecentCharacterId];
    
    // Process the loadout
    const loadout = await processLoadout(
      mostRecentCharacterId,
      characterEquipment,
      itemComponents,
      character // Pass character data to get accurate stats
    );
    
    // Extract artifact mods from character progression (not armor sockets!)
    const artifactMods = await extractArtifactMods(characterProgression);
    
    // Add artifact mods to loadout
    loadout.artifactMods = artifactMods;
    
    // Get class name
    const classNames = {
      0: 'Titan',
      1: 'Hunter',
      2: 'Warlock'
    };
    
    // Generate DIM loadout link
    const dimLink = await generateDIMLink(
      data.profile?.data?.userInfo?.displayName || 'Guardian',
      character.classType,
      characterEquipment,
      itemComponents,
      artifactMods,
      characterProgression
    );
    
    // ============================================================================
    // LOG STATS BEING SENT TO CLIENT
    // ============================================================================
    console.log('🎯🎯🎯 STATS BEING SENT TO CLIENT 🎯🎯🎯');
    console.log('Stats object:', JSON.stringify(loadout.stats, null, 2));
    console.log('🎯🎯🎯 END STATS 🎯🎯🎯');
    
    res.json({
      success: true,
      displayName: data.profile?.data?.userInfo?.displayName || 'Guardian',
      membershipId: membershipId,
      platform: platform,
      platformName: getPlatformName(parseInt(platform)),
      character: {
        id: mostRecentCharacterId,
        class: classNames[character.classType] || 'Unknown',
        race: character.raceType,
        light: character.light,
        emblemPath: character.emblemPath 
          ? `https://www.bungie.net${character.emblemPath}` 
          : null,
        emblemBackgroundPath: character.emblemBackgroundPath
          ? `https://www.bungie.net${character.emblemBackgroundPath}`
          : null,
        lastPlayed: character.dateLastPlayed
      },
      artifact: seasonalArtifact ? {
        name: artifactInfo?.name || 'Unknown Artifact',
        icon: artifactInfo?.icon || '',
        iconUrl: artifactInfo?.iconUrl || null,
        powerBonus: seasonalArtifact.powerBonus || 0,
        pointsUnlocked: seasonalArtifact.pointsAcquired || 0
      } : null,
      loadout: loadout,
      dimLink: dimLink, // Add DIM link to response
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Loadout fetch error:', error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      error: 'Failed to fetch loadout',
      message: error.response?.data?.Message || error.message,
      errorCode: error.response?.data?.ErrorCode || 'Unknown'
    });
  }
});

// New endpoint: Get just the DIM link (for StreamElements custom commands)
// Usage: /api/dimlink/:platformOrName/:membershipIdOrTag?
// Query param: ?format=text returns plain text URL (for StreamElements)
// Returns: { success: true, dimLink: "https://tinyurl.com/..." } or plain text
// This endpoint does minimal processing - just generates the DIM link without full loadout processing
app.get('/api/dimlink/:platformOrName/:membershipIdOrTag?', async (req, res) => {
  try {
    const { platformOrName, membershipIdOrTag } = req.params;
    const format = req.query.format;
    
    console.log(`[DIM Link] Request for: ${platformOrName}${membershipIdOrTag ? '/' + membershipIdOrTag : ''}`);
    
    // Parse Bungie ID or platform
    let platform, membershipId;
    
    if (membershipIdOrTag) {
      platform = platformOrName;
      membershipId = membershipIdOrTag;
    } else {
      // It's a Bungie name (e.g., "Marty#2689")
      try {
        const searchResponse = await axios.get(
          `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/All/`,
          {
            headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
            data: {
              displayName: platformOrName.split('#')[0],
              displayNameCode: platformOrName.split('#')[1] || '0000'
            }
          }
        );
        
        const players = searchResponse.data.Response;
        if (!players || players.length === 0) {
          return res.status(404).json({ success: false, error: 'Player not found' });
        }
        
        platform = players[0].membershipType;
        membershipId = players[0].membershipId;
      } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to search player', message: error.message });
      }
    }
    
    // Fetch profile with minimal components (just what we need for DIM link)
    const profileUrl = `https://www.bungie.net/Platform/Destiny2/${platform}/Profile/${membershipId}/?components=100,200,205,300,304,305`;
    const { data } = await axios.get(profileUrl, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
    });
    
    if (!data.Response) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    
    // Get most recent character
    const characters = data.Response.characters?.data;
    if (!characters) {
      return res.status(404).json({ success: false, error: 'No characters found' });
    }
    
    const mostRecentCharacterId = Object.keys(characters).sort((a, b) => 
      new Date(characters[b].dateLastPlayed) - new Date(characters[a].dateLastPlayed)
    )[0];
    
    const character = characters[mostRecentCharacterId];
    const equipment = data.Response.characterEquipment?.data?.[mostRecentCharacterId]?.items || [];
    const itemComponents = data.Response.itemComponents;
    
    // Get artifact mods (simplified)
    const characterProgression = data.Response.characterProgressions?.data?.[mostRecentCharacterId];
    const artifactMods = await extractArtifactMods(characterProgression, itemComponents);
    
    // Generate DIM link
    const displayName = data.Response.profile?.data?.userInfo?.displayName || 'Guardian';
    const dimLink = await generateDIMLink(
      displayName,
      character.classType,
      equipment,
      itemComponents,
      artifactMods,
      characterProgression
    );
    
    console.log(`[DIM Link] Generated: ${dimLink}`);
    
    // Return based on format
    if (format === 'text') {
      res.type('text/plain');
      res.send(dimLink || 'DIM link generation failed');
    } else {
      res.json({
        success: true,
        dimLink: dimLink,
        displayName: displayName,
        characterClass: ['Titan', 'Hunter', 'Warlock'][character.classType] || 'Unknown'
      });
    }
    
  } catch (error) {
    console.error('[DIM Link] Error:', error.message);
    console.error('[DIM Link] Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate DIM link',
      message: error.message
    });
  }
});

// Helper function to get platform name
function getPlatformName(membershipType) {
  const platforms = {
    1: 'Xbox',
    2: 'PlayStation',
    3: 'Steam',
    4: 'Blizzard',
    5: 'Stadia',
    6: 'Epic Games',
    10: 'Demon',
    254: 'BungieNext'
  };
  return platforms[membershipType] || 'Unknown';
}

// Fetch item definition from Bungie manifest
async function fetchItemDefinition(itemHash) {
  // Check cache first
  if (manifestCache.items.has(itemHash)) {
    return manifestCache.items.get(itemHash);
  }
  
  try {
    const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}/`;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
    });
    
    const definition = response.data.Response;
    
    // Cache the result
    manifestCache.items.set(itemHash, definition);
    
    return definition;
  } catch (error) {
    console.error(`Failed to fetch item definition for ${itemHash}:`, error.message);
    return null;
  }
}

// Fetch plug (mod/perk) definition from Bungie manifest
async function fetchPlugDefinition(plugHash) {
  // Check cache first
  if (manifestCache.plugs.has(plugHash)) {
    return manifestCache.plugs.get(plugHash);
  }
  
  try {
    const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/${plugHash}/`;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
    });
    
    const definition = response.data.Response;
    const plugData = {
      name: definition.displayProperties?.name || 'Unknown Mod',
      description: definition.displayProperties?.description || '',
      icon: definition.displayProperties?.icon || '',
      iconUrl: definition.displayProperties?.icon 
        ? `https://www.bungie.net${definition.displayProperties.icon}` 
        : null
    };
    
    // Cache the result
    manifestCache.plugs.set(plugHash, plugData);
    
    return plugData;
  } catch (error) {
    console.error(`Failed to fetch plug definition for ${plugHash}:`, error.message);
    return null;
  }
}

// Fetch seasonal artifact definition and get all artifact mod hashes
async function fetchArtifactModHashes(artifactHash) {
  // Check cache first
  if (manifestCache.artifacts.has(artifactHash)) {
    return manifestCache.artifacts.get(artifactHash);
  }
  
  try {
    const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyArtifactDefinition/${artifactHash}/`;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
    });
    
    const artifactDef = response.data.Response;
    const artifactModHashes = new Set();
    const artifactInfo = {
      name: artifactDef.displayProperties?.name || 'Unknown Artifact',
      description: artifactDef.displayProperties?.description || '',
      icon: artifactDef.displayProperties?.icon || '',
      iconUrl: artifactDef.displayProperties?.icon 
        ? `https://www.bungie.net${artifactDef.displayProperties.icon}` 
        : null,
      modHashes: artifactModHashes
    };
    
    // Collect all artifact mod hashes from all tiers
    if (artifactDef.tiers) {
      for (const tier of artifactDef.tiers) {
        if (tier.items) {
          for (const item of tier.items) {
            artifactModHashes.add(item.itemHash);
          }
        }
      }
    }
    
    // Cache the result
    manifestCache.artifacts.set(artifactHash, artifactInfo);
    
    return artifactInfo;
  } catch (error) {
    console.error(`Failed to fetch artifact definition for ${artifactHash}:`, error.message);
    return { name: 'Unknown Artifact', modHashes: new Set() };
  }
}

// Process a single equipment item
async function processEquipmentItem(itemData, itemComponents) {
  const itemHash = itemData.itemHash;
  const itemInstanceId = itemData.itemInstanceId;
  
  // Fetch item definition
  const definition = await fetchItemDefinition(itemHash);
  if (!definition) {
    return {
      name: 'Unknown Item',
      hash: itemHash,
      instanceId: itemInstanceId
    };
  }
  
  // Get item instance data
  const instance = itemComponents.instances[itemInstanceId] || {};
  const stats = itemComponents.stats[itemInstanceId] || {};
  const sockets = itemComponents.sockets[itemInstanceId] || {};
  
  // Extract perks and mods from sockets
  const perksAndMods = [];
  const allSockets = [];
  const weaponPerks = [];
  const exoticClassItemPerks = [];
  
  if (sockets.sockets) {
    for (let i = 0; i < sockets.sockets.length; i++) {
      const socket = sockets.sockets[i];
      if (socket.plugHash && socket.isEnabled) {
        // Store all sockets for artifact mod detection
        allSockets.push({
          plugHash: socket.plugHash,
          isVisible: socket.isVisible || false,
          isEnabled: socket.isEnabled || false
        });
        
        // Only add visible sockets to perks list
        if (socket.isVisible) {
          perksAndMods.push({
            plugHash: socket.plugHash
          });
        }
      }
    }
    
    const isWeapon = definition.itemType === 3; // DestinyItemType.Weapon = 3
    const isClassItem = itemData.bucketHash === BUCKET_HASHES.CLASS_ITEM;
    const isExotic = definition.inventory?.tierType === 6;
    
    // Extract weapon perks - Only the first TWO main perks (columns 4-5, socket indexes 3-4)
    if (isWeapon && definition.sockets?.socketEntries) {
      let perkCount = 0;
      const maxPerks = 2; // Only show 2 main perks
      
      for (let i = 0; i < sockets.sockets.length && i < definition.sockets.socketEntries.length; i++) {
        const socket = sockets.sockets[i];
        const socketDef = definition.sockets.socketEntries[i];
        
        if (!socket.plugHash || !socket.isEnabled) continue;
        
        // Socket type hash for weapon mod
        const MOD_SOCKET_TYPE = 3851138800; // Weapon Mod Socket
        
        // Check if this is a major perk socket (columns 4-5, socket indexes 3-4)
        const isMajorPerk = socketDef.socketTypeHash && (
          socketDef.reusablePlugSetHash || 
          socketDef.randomizedPlugSetHash
        ) && i >= 3 && i <= 4 && socket.isVisible;
        
        // Only add the first 2 perks found
        if (isMajorPerk && perkCount < maxPerks) {
          weaponPerks.push({
            plugHash: socket.plugHash,
            socketIndex: i,
            isMod: false
          });
          perkCount++;
        }
      }
    }
    
    // Extract exotic class item "Spirit of..." perks ONLY
    if (isClassItem && isExotic && definition.sockets?.socketEntries) {
      console.log(`[Exotic Class Item] Detected: ${definition.displayProperties?.name}, checking ${definition.sockets.socketEntries.length} sockets...`);
      console.log(`[Exotic Class Item] Instance sockets count: ${sockets.sockets.length}`);
      
      // Spirit perks are intrinsic perks, not in mod sockets
      // Check ALL sockets and filter by "Spirit of" name
      for (let i = 0; i < sockets.sockets.length && i < definition.sockets.socketEntries.length; i++) {
        const socket = sockets.sockets[i];
        const socketDef = definition.sockets.socketEntries[i];
        
        // Skip empty sockets
        if (!socket.plugHash) {
          continue;
        }
        
        // Fetch the plug definition to check the name
        const plugDef = await fetchPlugDefinition(socket.plugHash);
        const plugName = plugDef?.name || '';
        
        console.log(`[Exotic Class Item] Socket ${i}: plugHash=${socket.plugHash}, name="${plugName}"`);
        
        // Only add if it's a "Spirit of..." perk
        // Spirit perks are intrinsic perks bound to exotic class items
        if (plugName && plugName.startsWith('Spirit of')) {
          console.log(`[Exotic Class Item] ✅ Found Spirit perk in socket ${i}: "${plugName}" (hash: ${socket.plugHash})`);
          exoticClassItemPerks.push({
            plugHash: socket.plugHash,
            socketIndex: i
          });
        }
      }
      
      console.log(`[Exotic Class Item] Total exotic perks found: ${exoticClassItemPerks.length}`);
    }
  }
  
  // Determine weapon tier BEFORE processing perks (needed for enhanced perk detection)
  // Edge of Fate uses tier ornaments to determine weapon tier
  let finalWeaponTier = definition.quality?.currentVersion; // Base tier from quality
  
  // Check if weapon has a tier ornament applied
  if (itemData.overrideStyleItemHash) {
    const ornamentDef = await fetchPlugDefinition(itemData.overrideStyleItemHash);
    if (ornamentDef && ornamentDef.description) {
      // Check if ornament description contains "tier X" (e.g., "tier 5 weapon ornament")
      const tierMatch = ornamentDef.description.match(/tier\s+(\d+)/i);
      if (tierMatch) {
        const ornamentTier = parseInt(tierMatch[1]);
        finalWeaponTier = ornamentTier - 1; // Convert tier display (1-5) to currentVersion (0-4)
        console.log(`[Weapon Tier] Found tier ornament: "${ornamentDef.name}" - Tier ${ornamentTier} (currentVersion: ${finalWeaponTier})`);
      }
    }
  }
  
  // Fetch perk definitions for weapon perks
  const weaponPerkData = [];
  if (weaponPerks.length > 0) {
    // Use the pre-computed weapon tier (accounts for tier ornaments)
    const hasEdgeTier = finalWeaponTier !== undefined && finalWeaponTier !== null && finalWeaponTier >= 1; // Tier 2+ weapons have enhanced perks
    
    console.log(`[Weapon Perks] Processing ${weaponPerks.length} perks for weapon: ${definition.displayProperties?.name} (Final Tier: ${finalWeaponTier}, Has Enhanced: ${hasEdgeTier})`);
    
    for (const perk of weaponPerks) {
      const perkDef = await fetchPlugDefinition(perk.plugHash);
      if (perkDef) {
        // Check if this is an enhanced perk:
        // 1. Name contains "Enhanced"
        // 2. OR description contains enhanced indicators
        // 3. OR Edge of Fate Tier 2+ weapon (finalWeaponTier >= 1) and this is a main perk (socket 3 or 4)
        const nameHasEnhanced = perkDef.name && perkDef.name.includes('Enhanced');
        const descHasEnhanced = perkDef.description && (
          perkDef.description.includes('additional') ||
          perkDef.description.includes('Additional') ||
          perkDef.description.includes('longer lasting') ||
          perkDef.description.includes('Longer lasting') ||
          perkDef.description.includes('more powerful') ||
          perkDef.description.includes('More powerful') ||
          perkDef.description.includes('increased') ||
          perkDef.description.includes('Increased')
        );
        
        // For Edge of Fate weapons at Tier 2+, perks in columns 3 & 4 are enhanced
        const isMainPerk = perk.socketIndex === 3 || perk.socketIndex === 4;
        const isEnhancedByTier = hasEdgeTier && isMainPerk;
        
        const isEnhanced = nameHasEnhanced || descHasEnhanced || isEnhancedByTier;
        
        console.log(`[Weapon Perk] "${perkDef.name}" (socket ${perk.socketIndex}) - nameHasEnhanced: ${nameHasEnhanced}, descHasEnhanced: ${descHasEnhanced}, tierEnhanced: ${isEnhancedByTier}, FINAL: ${isEnhanced}`);
        
        weaponPerkData.push({
          ...perkDef,
          socketIndex: perk.socketIndex,
          isEnhanced: isEnhanced
        });
      }
    }
  }
  
  // Fetch perk definitions for exotic class item perks
  const exoticPerkData = [];
  if (exoticClassItemPerks.length > 0) {
    console.log(`[Exotic Class Item] Found ${exoticClassItemPerks.length} exotic perks`);
    for (const perk of exoticClassItemPerks) {
      const perkDef = await fetchPlugDefinition(perk.plugHash);
      if (perkDef) {
        console.log(`[Exotic Class Item] Perk: "${perkDef.name}" (hash: ${perk.plugHash})`);
        exoticPerkData.push({
          ...perkDef,
          socketIndex: perk.socketIndex
        });
      }
    }
    console.log(`[Exotic Class Item] Total exotic perks processed: ${exoticPerkData.length}`);
  }
  
  // Determine the correct icon based on weapon tier (Edge of Fate tiered weapons)
  let displayIcon = definition.displayProperties?.icon || '';
  let displayIconUrl = displayIcon ? `https://www.bungie.net${displayIcon}` : null;
  let displayName = definition.displayProperties?.name || 'Unknown';
  
  // Check if this is a tiered weapon with quality versions
  if (definition.quality?.versions && definition.quality.versions.length > 0) {
    const currentVersion = definition.quality.currentVersion || 0;
    
    // Quality versions array contains different properties for each tier
    // Tier 5 (version 4) often has a special "Achronal" ornament applied automatically
    if (definition.quality.versions[currentVersion]) {
      const tierData = definition.quality.versions[currentVersion];
      
      // Use tier-specific icon if available
      if (tierData.displayProperties?.icon) {
        displayIcon = tierData.displayProperties.icon;
        displayIconUrl = `https://www.bungie.net${displayIcon}`;
      }
      
      // Use tier-specific name if available (e.g., "Achronal Yeartide Apex" for Tier 5)
      if (tierData.displayProperties?.name) {
        displayName = tierData.displayProperties.name;
      }
    }
  }
  
  // Check for override style (ornaments, including holofoil variants)
  if (itemData.overrideStyleItemHash) {
    try {
      const ornamentDef = await fetchItemDefinition(itemData.overrideStyleItemHash);
      if (ornamentDef?.displayProperties?.icon) {
        displayIcon = ornamentDef.displayProperties.icon;
        displayIconUrl = `https://www.bungie.net${displayIcon}`;
      }
    } catch (error) {
      console.error(`Failed to fetch ornament ${itemData.overrideStyleItemHash}:`, error.message);
    }
  }
  
  const result = {
    name: displayName,
    description: definition.displayProperties?.description || '',
    icon: displayIcon,
    iconUrl: displayIconUrl,
    hash: itemHash,
    instanceId: itemInstanceId,
    itemType: definition.itemTypeDisplayName || '',
    tierType: definition.inventory?.tierTypeName || 'Common',
    isExotic: definition.inventory?.tierType === 6,
    damageType: instance.damageType || 0,
    primaryStat: instance.primaryStat || null,
    stats: stats.stats || {},
    perks: perksAndMods.slice(0, 5), // Legacy perks list
    weaponPerks: weaponPerkData, // New: properly filtered weapon perks
    exoticPerks: exoticPerkData, // New: exotic class item perks
    sockets: allSockets, // Store ALL sockets for artifact mod detection
    energy: instance.energy || null,
    // Add item state and quality for masterwork/holofoil overlays
    state: itemData.state || 0,
    overrideStyleItemHash: itemData.overrideStyleItemHash || null,
    quality: definition.quality || null,
    // Weapon tier: Use finalWeaponTier which accounts for tier ornaments
    // Edge of Fate (S27+): Tier determined by ornament if applied, otherwise quality.currentVersion
    // Legacy: Check if ANY weapon perk is enhanced (indicates T2+ for old crafted weapons)
    weaponTier: finalWeaponTier !== undefined && finalWeaponTier !== null
      ? finalWeaponTier // Use pre-computed tier (accounts for ornaments)
      : (weaponPerkData.some(perk => perk.isEnhanced) ? 1 : null), // Legacy enhanced perk detection
    iconWatermark: definition.iconWatermark || null,
    iconWatermarkShelved: definition.iconWatermarkShelved || null
  };
  
  // Log weapon tier info for debugging
  if (weaponPerkData.length > 0) {
    const hasEnhanced = weaponPerkData.some(perk => perk.isEnhanced);
    const qualityTier = definition.quality?.currentVersion;
    console.log(`[Weapon Tier] "${result.name}" - Quality Tier: ${qualityTier}, Final Weapon Tier: ${result.weaponTier}, Has Enhanced Perks: ${hasEnhanced}`);
  }
  
  return result;
}

// Process subclass to extract aspects and fragments
async function processSubclassDetails(itemData, itemComponents) {
  const itemHash = itemData.itemHash;
  const itemInstanceId = itemData.itemInstanceId;
  
  // Get basic item data
  const basicData = await processEquipmentItem(itemData, itemComponents);
  
  // Get sockets
  const sockets = itemComponents.sockets[itemInstanceId] || {};
  
  const aspects = [];
  const fragments = [];
  
  if (sockets.sockets) {
    // Fetch plug definitions to categorize them
    const plugPromises = sockets.sockets
      .filter(s => s.plugHash && s.isEnabled && s.isVisible)
      .map(async (socket) => {
        const plugDef = await fetchItemDefinition(socket.plugHash);
        if (!plugDef) return null;
        
        const plugCategory = plugDef.plug?.plugCategoryIdentifier || '';
        const itemTypeDisplay = plugDef.itemTypeDisplayName || '';
        
        const plugData = {
          name: plugDef.displayProperties?.name || 'Unknown',
          description: plugDef.displayProperties?.description || '',
          icon: plugDef.displayProperties?.icon || '',
          iconUrl: plugDef.displayProperties?.icon 
            ? `https://www.bungie.net${plugDef.displayProperties.icon}` 
            : null,
          plugHash: socket.plugHash,
          itemType: itemTypeDisplay,
          category: plugCategory
        };
        
        // Categorize by plug category or item type
        if (plugCategory.includes('aspects') || itemTypeDisplay.includes('Aspect')) {
          return { type: 'aspect', data: plugData };
        } else if (plugCategory.includes('fragments') || itemTypeDisplay.includes('Fragment')) {
          return { type: 'fragment', data: plugData };
        }
        
        return null;
      });
    
    const results = await Promise.all(plugPromises);
    
    for (const result of results) {
      if (result) {
        if (result.type === 'aspect') {
          aspects.push(result.data);
        } else if (result.type === 'fragment') {
          fragments.push(result.data);
        }
      }
    }
  }
  
  return {
    ...basicData,
    aspects,
    fragments
  };
}

// Generate DIM loadout link (minimal version to stay under URL length limits)
// V11: Socket category filtering + only equipped artifact mods
async function generateDIMLink(displayName, classType, equipment, itemComponents, artifactMods, characterProgression) {
  try {
    const equipped = [];
    const modHashes = [];
    
    // Define which bucket hashes to include in the DIM link (weapons, armor, subclass ONLY)
    const LOADOUT_BUCKETS = new Set([
      BUCKET_HASHES.KINETIC,
      BUCKET_HASHES.ENERGY,
      BUCKET_HASHES.POWER,
      BUCKET_HASHES.HELMET,
      BUCKET_HASHES.ARMS,
      BUCKET_HASHES.CHEST,
      BUCKET_HASHES.LEGS,
      BUCKET_HASHES.CLASS_ITEM,
      BUCKET_HASHES.SUBCLASS
    ]);
    
    // Process each equipped item - ONLY include loadout items (weapons, exotic armor, subclass)
    for (const item of equipment.items || []) {
      // Skip items that aren't part of the actual loadout (emblems, ships, sparrows, ghosts, etc.)
      if (!LOADOUT_BUCKETS.has(item.bucketHash)) {
        continue;
      }
      
      const isArmor = item.bucketHash === BUCKET_HASHES.HELMET ||
                      item.bucketHash === BUCKET_HASHES.ARMS ||
                      item.bucketHash === BUCKET_HASHES.CHEST ||
                      item.bucketHash === BUCKET_HASHES.LEGS ||
                      item.bucketHash === BUCKET_HASHES.CLASS_ITEM;
      
      // Collect COMBAT mods from ALL armor pieces (we'll add them to parameters.mods)
      if (isArmor) {
        const sockets = itemComponents.sockets?.[item.itemInstanceId];
        
        // Get item definition to check tier type
        const definition = await fetchItemDefinition(item.itemHash);
        const isExotic = definition?.inventory?.tierType === 6;
        
        if (sockets && sockets.sockets && definition?.sockets?.socketEntries) {
          console.log(`[DIM Link] Checking ${definition.displayProperties?.name || 'Unknown'} (Exotic: ${isExotic}, ${sockets.sockets.length} sockets)`);
          
          // Socket type hashes for ACTUAL MOD SOCKETS (not cosmetics/perks)
          const COMBAT_MOD_SOCKET_TYPES = new Set([
            3956125808, // Armor Mods (Combat Style)
            2912171003, // Armor Mods (General)
            4243480345, // Armor Mods (Seasonal)
            // Add more if needed
          ]);
          
          for (let i = 0; i < sockets.sockets.length && i < definition.sockets.socketEntries.length; i++) {
            const socket = sockets.sockets[i];
            const socketDef = definition.sockets.socketEntries[i];
            
            // Skip empty, invalid, NOT ENABLED, or NOT VISIBLE sockets (must be actively equipped and visible in UI)
            if (!socket || !socket.plugHash || socket.plugHash === 0 || !socket.isEnabled || !socket.isVisible) {
              console.log(`[DIM Link] ⏭️  Skipping socket ${i}: empty, disabled, or hidden (isVisible: ${socket?.isVisible})`);
              continue;
            }
            
            // Check if this is a combat mod socket type
            const isCombatModSocket = socketDef.socketTypeHash && COMBAT_MOD_SOCKET_TYPES.has(socketDef.socketTypeHash);
            
            // Fetch the plug definition to check if it's a mod
            const plugDef = await fetchItemDefinition(socket.plugHash);
            
            // Get the mod name and plug category for better filtering
            const modName = plugDef?.displayProperties?.name || '';
            const plugCategoryHash = plugDef?.plug?.plugCategoryHash;
            
            console.log(`[DIM Link] Checking socket ${i}: ${modName} (hash: ${socket.plugHash}, socketType: ${socketDef.socketTypeHash}, plugCategory: ${plugCategoryHash}, itemType: ${plugDef?.itemType})`);
            
            // Exclude non-combat mods using plug category hash
            // These are the categories we want to EXCLUDE:
            const EXCLUDED_PLUG_CATEGORIES = new Set([
              2973005342, // Shaders (cosmetic)
              3124752623, // Intrinsic Traits (Exotic armor perks)
              2487827355, // Armor Cosmetics (Ornaments/Transmog)
              1744546145, // Masterwork Tier (Upgrade Armor)
              3993098925, // Empty Mod Socket (default socket)
              2457930460, // Armor Stat Mods (old system, replaced by stats)
              208760563,  // Armor Tier (not a combat mod)
              1282012138, // Reusable Armor Mods (older system)
              965959289,  // Ornament sockets
              590099826,  // Armor Appearance (Transmog/Ornaments)
              2833320680, // Armor Ornaments Universal
              2673423377, // Exotic Armor Ornaments (e.g., Getaway Artist ornaments)
              1509135441, // Universal Ornaments - Chest (Warlock)
              505602046,  // Universal Ornaments - Class Item (Warlock Bond)
              3281006437, // Universal Ornaments - Legs (Warlock)
            ]);
            
            const isExcluded = plugCategoryHash && EXCLUDED_PLUG_CATEGORIES.has(plugCategoryHash);
            
            // Exclude by name patterns (catches things like "Upgrade Armor", ornaments, etc)
            const EXCLUDED_MOD_NAMES = [
              'upgrade armor',      // Masterwork
              'default shader',     // Default shader
              'restore defaults',   // Default ornament
              'default ornament',   // Default ornament
              'spirit of',          // Exotic class item perks (intrinsic, not mods)
              'empty',              // Empty mod slots
              'ornament',           // All ornaments (armor appearance/transmog)
              'shader',             // All shaders
              // Armor archetypes (Armor 3.0 intrinsic properties, not equippable mods)
              'brawler',            // Melee archetype
              'grenadier',          // Grenade archetype
              'paragon',            // Class ability archetype
            ];
            const isExcludedByName = EXCLUDED_MOD_NAMES.some(pattern => modName.toLowerCase().includes(pattern));
            
            // Exclude old stat mods by pattern (+X stat)
            const isOldStatMod = modName.match(/^\+\d+\s+(super|melee|grenade|weapons|health|class)/i);
            
            // Exclude if it's a "tuning" socket (balanced tuning mods are OK, but empty tuning sockets are not)
            const isEmptyTuning = modName.toLowerCase().includes('tuning') && modName.toLowerCase().includes('empty');
            
            // Skip early if excluded by category or name (before checking item type)
            if (isExcluded || isExcludedByName || isOldStatMod || isEmptyTuning) {
              console.log(`[DIM Link] ⏭️  Skipping socket ${i}: ${socket.plugHash} (excluded - category: ${plugCategoryHash}, name: ${modName}, oldStatMod: ${!!isOldStatMod}, emptyTuning: ${isEmptyTuning})`);
              continue;
            }
            
            // itemType 19 = Armor Mod (current Armor 3.0 system)
            // itemType 20 = Legacy Armor Mod (old armor mod system)
            // itemType 42 = Weapon Mod (e.g., Adept mods, Temporal Tuning)
            const isArmorMod = plugDef?.itemType === 19 || plugDef?.itemType === 20; 
            const isWeaponMod = plugDef?.itemType === 42;
            const isMod = isArmorMod || isWeaponMod;
            
            if (isMod) {
              modHashes.push(socket.plugHash);
              console.log(`[DIM Link] ✅ Including mod from socket ${i}: ${socket.plugHash} (${modName}, itemType: ${plugDef?.itemType}, socketType: ${socketDef.socketTypeHash})`);
            } else {
              console.log(`[DIM Link] ⏭️  Skipping socket ${i}: ${socket.plugHash} (itemType: ${plugDef?.itemType || 'unknown'}, name: ${modName}, not a mod)`);
            }
          }
        }
        
        // Only add exotic armor to equipped array
        if (!isExotic) {
          console.log(`[DIM Link] ⏭️  Skipping legendary armor in equipped array: ${definition?.displayProperties?.name || 'Unknown'}`);
          continue; // Skip adding this item to equipped array
        } else {
          console.log(`[DIM Link] ✅ Including exotic armor in equipped array: ${definition?.displayProperties?.name || 'Unknown'}`);
        }
      }
      
      // Build item data for equipped array (weapons, exotic armor, subclass)
      const itemData = {
        id: item.itemInstanceId,
        hash: item.itemHash
      };
      
      // Include socketOverrides for weapons (for Temporal mods) and subclass (for aspects/fragments)
      const isWeapon = item.bucketHash === BUCKET_HASHES.KINETIC ||
                       item.bucketHash === BUCKET_HASHES.ENERGY ||
                       item.bucketHash === BUCKET_HASHES.POWER;
      const isSubclass = item.bucketHash === BUCKET_HASHES.SUBCLASS;
      
      if (isWeapon || isSubclass) {
        const sockets = itemComponents.sockets?.[item.itemInstanceId];
        if (sockets && sockets.sockets) {
          const socketOverrides = {};
          
          for (let i = 0; i < sockets.sockets.length; i++) {
            const socket = sockets.sockets[i];
            if (socket.plugHash && socket.plugHash !== 0) {
              socketOverrides[i.toString()] = socket.plugHash;
            }
          }
          
          if (Object.keys(socketOverrides).length > 0) {
            itemData.socketOverrides = socketOverrides;
          }
        }
      }
      
      equipped.push(itemData);
    }
    
    // Get artifact unlocks - ALL 12 active artifact perks + weapon mods from artifact
    // Guardian.report includes both:
    // 1. The 12 slotted artifact perks
    // 2. Weapon mods from artifact (e.g., Temporal Armaments, Temporal Blast)
    const artifactUnlocks = {
      unlockedItemHashes: [],
      seasonNumber: 27 // Season 27 (current season as of Oct 2025)
    };
    
    // Use artifactMods array (filtered with isVisible = equipped perks + weapon mods)
    if (artifactMods && artifactMods.length > 0) {
      console.log(`[DIM Link] Processing ${artifactMods.length} equipped artifact items (12 perks + weapon mods)`);
      
      // Include ALL equipped artifact items (no hard cap - includes 12 perks + weapon mods)
      for (const mod of artifactMods) {
        if (mod.hash) {
          artifactUnlocks.unlockedItemHashes.push(mod.hash);
          console.log(`[DIM Link] ✅ Including artifact item: ${mod.name} (hash: ${mod.hash}, itemType: ${mod.itemType || 'unknown'})`);
        }
      }
      
      console.log(`[DIM Link] Total artifact items: ${artifactUnlocks.unlockedItemHashes.length} (12 perks + ${artifactUnlocks.unlockedItemHashes.length - 12} weapon mods)`);
    }
    
    // Build the loadout object
    const loadoutObj = {
      name: `${displayName}'s Loadout`,
      classType: classType,
      equipped: equipped,
      parameters: {
        mods: modHashes,
        artifactUnlocks: artifactUnlocks
      }
    };
    
    // Debug logging
    console.log('[DIM Link] Generated loadout with:');
    console.log(`  - ${equipped.length} equipped items`);
    console.log(`  - ${modHashes.length} mod hashes (should be ~23 for your build: 20 armor + 3 balanced tuning)`);
    console.log(`  - ${artifactUnlocks.unlockedItemHashes.length} artifact unlocks (should be 12 equipped, or 14 if including champion mods)`);
    console.log(`  - Items: ${equipped.map(i => i.hash).join(', ')}`);
    console.log(`  - Mods: ${modHashes.join(', ')}`);
    console.log(`  - Artifact: ${artifactUnlocks.unlockedItemHashes.join(', ')}`);
    
    // Create the long DIM URL
    const loadoutJson = JSON.stringify(loadoutObj);
    const encodedLoadout = encodeURIComponent(loadoutJson);
    const longUrl = `https://app.destinyitemmanager.com/loadouts?loadout=${encodedLoadout}`;
    
    console.log(`[DIM Link] URL length: ${longUrl.length} characters`);
    
    // Shorten the URL using DIM's URL shortener
    const shortUrl = await shortenDIMUrl(longUrl);
    
    return shortUrl || longUrl; // Fallback to long URL if shortening fails
    
  } catch (error) {
    console.error('Error generating DIM link:', error.message);
    return null;
  }
}

// Shorten URL using TinyURL API (supports longer URLs than Bitly)
async function shortenDIMUrl(longUrl) {
  try {
    console.log('[TinyURL] Attempting to shorten URL (length:', longUrl.length, 'chars)');
    
    const TINYURL_TOKEN = process.env.TINYURL_TOKEN;
    
    if (!TINYURL_TOKEN) {
      console.warn('[TinyURL] TINYURL_TOKEN not configured, using free API');
      // Fall back to free API without authentication
      const response = await axios.get('https://tinyurl.com/api-create.php', {
        params: {
          url: longUrl
        },
        timeout: 5000
      });
      
      if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
        console.log('[TinyURL] Successfully shortened to:', response.data);
        return response.data;
      }
      
      console.warn('[TinyURL] Invalid response, returning long URL');
      return longUrl;
    }
    
    // Use authenticated API v2 for better rate limits
    console.log('[TinyURL] Using authenticated API');
    const response = await axios.post('https://api.tinyurl.com/create', {
      url: longUrl,
      domain: 'tinyurl.com'
    }, {
      headers: {
        'Authorization': `Bearer ${TINYURL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.data && response.data.data.tiny_url) {
      console.log('[TinyURL] Successfully shortened to:', response.data.data.tiny_url);
      return response.data.data.tiny_url;
    }
    
    console.warn('[TinyURL] Invalid response, returning long URL');
    return longUrl;
  } catch (error) {
    console.error('[TinyURL] Error shortening DIM URL:', error.message);
    if (error.response) {
      console.error('[TinyURL] Response status:', error.response.status);
      console.error('[TinyURL] Response data:', JSON.stringify(error.response.data));
    }
    // Fallback: Return long URL - frontend will display as "DIM Loadout"
    return longUrl;
  }
}

// Process character loadout
async function processLoadout(characterId, equipment, itemComponents, characterData = null) {
  const items = equipment.items || [];
  
  // Find items by bucket
  const findItemByBucket = (bucketHash) => {
    return items.find(item => item.bucketHash === bucketHash);
  };
  
  // Process weapons
  const kinetic = findItemByBucket(BUCKET_HASHES.KINETIC);
  const energy = findItemByBucket(BUCKET_HASHES.ENERGY);
  const power = findItemByBucket(BUCKET_HASHES.POWER);
  
  // Process armor
  const helmet = findItemByBucket(BUCKET_HASHES.HELMET);
  const arms = findItemByBucket(BUCKET_HASHES.ARMS);
  const chest = findItemByBucket(BUCKET_HASHES.CHEST);
  const legs = findItemByBucket(BUCKET_HASHES.LEGS);
  const classItem = findItemByBucket(BUCKET_HASHES.CLASS_ITEM);
  
  // Process subclass
  const subclass = findItemByBucket(BUCKET_HASHES.SUBCLASS);
  
  // Process each item (in parallel for speed)
  const [
    kineticData,
    energyData,
    powerData,
    helmetData,
    armsData,
    chestData,
    legsData,
    classItemData,
    subclassData
  ] = await Promise.all([
    kinetic ? processEquipmentItem(kinetic, itemComponents) : null,
    energy ? processEquipmentItem(energy, itemComponents) : null,
    power ? processEquipmentItem(power, itemComponents) : null,
    helmet ? processEquipmentItem(helmet, itemComponents) : null,
    arms ? processEquipmentItem(arms, itemComponents) : null,
    chest ? processEquipmentItem(chest, itemComponents) : null,
    legs ? processEquipmentItem(legs, itemComponents) : null,
    classItem ? processEquipmentItem(classItem, itemComponents) : null,
    subclass ? processSubclassDetails(subclass, itemComponents) : null
  ]);
  
  // Get accurate character stats from Bungie API
  // The character.stats object contains the FINAL calculated stats including:
  // - Base armor stats
  // - Armor mods (stat mods, artifice mods, etc.)
  // - Masterwork bonuses
  // - Fragment bonuses from subclass
  // - Any other stat modifiers
  const totalStats = {};
  
  if (characterData && characterData.stats) {
    console.log('='.repeat(80));
    console.log('[STATS] Using Bungie API character stats (includes ALL bonuses)');
    console.log('='.repeat(80));
    
    // Map Bungie's stat hash IDs to stat names
    for (const [statHash, statValue] of Object.entries(characterData.stats)) {
      const statName = STAT_HASHES[statHash];
      if (statName) {
        totalStats[statName] = statValue;
        console.log(`[STATS] ${statName} (hash ${statHash}): ${statValue}`);
      }
    }
    
    console.log('='.repeat(80));
    console.log('[STATS] ⭐ FINAL CHARACTER STATS:', JSON.stringify(totalStats, null, 2));
    console.log('='.repeat(80));
  } else {
    console.warn('[STATS] ⚠️ Warning: characterData or characterData.stats not available, stats will be empty');
  }
  
  return {
    weapons: {
      kinetic: kineticData,
      energy: energyData,
      power: powerData
    },
    armor: {
      helmet: helmetData,
      arms: armsData,
      chest: chestData,
      legs: legsData,
      classItem: classItemData
    },
    subclass: subclassData,
    stats: totalStats
  };
}

// Extract artifact mods from character progression data
async function extractArtifactMods(characterProgressionData) {
  if (!characterProgressionData || !characterProgressionData.seasonalArtifact) {
    return [];
  }
  
  const seasonalArtifact = characterProgressionData.seasonalArtifact;
  const artifactMods = [];
  
  // Iterate through all tiers
  if (seasonalArtifact.tiers) {
    for (const tier of seasonalArtifact.tiers) {
      if (!tier.items) continue;
      
      // Find all EQUIPPED mods in this tier (isVisible = equipped in loadout)
      for (const item of tier.items) {
        // isActive = unlocked (can be > 12 total)
        // isVisible = actively equipped in loadout (max 12 perks + weapon mods)
        if (item.isActive && item.isVisible) {
          // Fetch the mod's name and details from manifest
          const plugDef = await fetchPlugDefinition(item.itemHash);
          
          if (plugDef) {
            // Include ALL visible/equipped artifact items (perks + weapon mods)
            artifactMods.push({
              name: plugDef.name,
              description: plugDef.description,
              icon: plugDef.icon,
              iconUrl: plugDef.iconUrl,
              hash: item.itemHash,
              isVisible: item.isVisible,
              isActive: item.isActive,
              itemType: plugDef.itemType, // For debugging (19=armor, 42=weapon, etc)
              tierHash: tier.tierHash
            });
            console.log(`[Artifact] ✅ Including EQUIPPED artifact item: ${plugDef.name} (hash: ${item.itemHash}, itemType: ${plugDef.itemType})`);
          }
        } else if (item.isActive && !item.isVisible) {
          // Unlocked but not equipped - skip for DIM link
          const plugDef = await fetchPlugDefinition(item.itemHash);
          console.log(`[Artifact] ⏭️  Skipping unlocked but NOT equipped: ${plugDef?.name || item.itemHash}`);
        }
      }
    }
  }
  
  return artifactMods;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Loadout endpoint: http://localhost:${PORT}/api/loadout/{platform}/{membershipId}`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search/{displayName}`);
  console.log('');
  console.log('✅ No OAuth required - using API key only!');
});