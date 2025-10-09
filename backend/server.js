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
      itemComponents
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
  
  // Fetch perk definitions for weapon perks
  const weaponPerkData = [];
  if (weaponPerks.length > 0) {
    for (const perk of weaponPerks) {
      const perkDef = await fetchPlugDefinition(perk.plugHash);
      if (perkDef) {
        // Check if this is an enhanced perk:
        // 1. Name contains "Enhanced"
        // 2. OR description contains enhanced indicators like "additional", "increased", "longer lasting", "more powerful"
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
        const isEnhanced = nameHasEnhanced || descHasEnhanced;
        
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
  
  return {
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
    // Weapon tier: Check if ANY weapon perk is enhanced (indicates T2+ weapon)
    weaponTier: weaponPerkData.some(perk => perk.isEnhanced) ? 1 : null,
    iconWatermark: definition.iconWatermark || null,
    iconWatermarkShelved: definition.iconWatermarkShelved || null
  };
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
            
            // Skip empty, invalid, or NOT ENABLED sockets (must be actively equipped)
            if (!socket || !socket.plugHash || socket.plugHash === 0 || !socket.isEnabled) {
              continue;
            }
            
            // Check if this is a combat mod socket type
            const isCombatModSocket = socketDef.socketTypeHash && COMBAT_MOD_SOCKET_TYPES.has(socketDef.socketTypeHash);
            
            // Fetch the plug definition to check if it's a mod (itemType 19)
            const plugDef = await fetchItemDefinition(socket.plugHash);
            const isArmorMod = plugDef?.itemType === 19; // 19 = Armor Mod
            
            // Exclude non-combat mods using plug category hash
            // These are the categories we want to EXCLUDE:
            const EXCLUDED_PLUG_CATEGORIES = new Set([
              2973005342, // Shaders
              3124752623, // Intrinsic Traits (Exotic armor perks)
              2487827355, // Armor Cosmetics (Ornaments/Transmog)
              1744546145, // Masterwork Tier
              3993098925, // Empty Mod Socket (default socket)
              2457930460, // Armor Stat Mods (old system, replaced by stats)
              208760563,  // Armor Tier (not a combat mod)
              1282012138, // Reusable Armor Mods (older system)
            ]);
            
            const plugCategoryHash = plugDef?.plug?.plugCategoryHash;
            const isExcluded = plugCategoryHash && EXCLUDED_PLUG_CATEGORIES.has(plugCategoryHash);
            
            // Only include if: it's an armor mod AND (it's in a combat mod socket OR it's not excluded)
            // This double-checks to ensure we ONLY get combat mods
            if (isArmorMod && !isExcluded && (isCombatModSocket || socket.isVisible)) {
              modHashes.push(socket.plugHash);
              console.log(`[DIM Link] ✅ Including armor mod from socket ${i}: ${socket.plugHash} (${plugDef?.displayProperties?.name || 'Unknown'}, socketType: ${socketDef.socketTypeHash})`);
            } else if (isExcluded) {
              console.log(`[DIM Link] ⏭️  Skipping socket ${i}: ${socket.plugHash} (excluded category: ${plugCategoryHash}, name: ${plugDef?.displayProperties?.name || 'Unknown'})`);
            } else if (isArmorMod && !isCombatModSocket) {
              console.log(`[DIM Link] ⏭️  Skipping socket ${i}: ${socket.plugHash} (not a combat mod socket, socketType: ${socketDef.socketTypeHash}, name: ${plugDef?.displayProperties?.name || 'Unknown'})`);
            } else {
              console.log(`[DIM Link] ⏭️  Skipping socket ${i}: ${socket.plugHash} (itemType: ${plugDef?.itemType || 'unknown'}, not a mod)`);
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
    
    // Get artifact unlocks - ALL 12 active artifact perks (V11: game allows 12 active out of 35 total)
    const artifactUnlocks = {
      unlockedItemHashes: [],
      seasonNumber: 22 // You might want to make this dynamic based on current season
    };
    
    // Use artifactMods array (already filtered with isActive = the 12 equipped perks)
    if (artifactMods && artifactMods.length > 0) {
      console.log(`[DIM Link] Processing ${artifactMods.length} active artifact mods (12 max equipped)`);
      for (const mod of artifactMods) {
        // Add all active mods (isActive already filters to the 12 equipped perks)
        if (mod.hash) {
          artifactUnlocks.unlockedItemHashes.push(mod.hash);
          console.log(`[DIM Link] ✅ Including ACTIVE artifact perk: ${mod.name} (hash: ${mod.hash})`);
        }
      }
      console.log(`[DIM Link] Total active artifact perks: ${artifactUnlocks.unlockedItemHashes.length}/12`);
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
    console.log(`  - ${modHashes.length} mod hashes`);
    console.log(`  - ${artifactUnlocks.unlockedItemHashes.length} artifact unlocks`);
    console.log(`  - Items: ${equipped.map(i => i.hash).join(', ')}`);
    
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
async function processLoadout(characterId, equipment, itemComponents) {
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
  
  // Calculate total armor stats INCLUDING armor mods
  const totalStats = {};
  const armorPieces = [helmetData, armsData, chestData, legsData, classItemData].filter(Boolean);
  const armorItems = [helmet, arms, chest, legs, classItem].filter(Boolean);
  
  console.log('='.repeat(80));
  console.log('[STATS DEBUG] Calculating total armor stats from', armorPieces.length, 'pieces');
  console.log('='.repeat(80));
  
  // Step 1: Add base armor stats
  for (const piece of armorPieces) {
    if (piece.stats) {
      console.log(`[STATS DEBUG] Processing ${piece.name} (base stats):`);
      console.log(`  [STATS DEBUG] Item hash: ${piece.hash}, Instance ID: ${piece.instanceId}`);
      for (const [statHash, statData] of Object.entries(piece.stats)) {
        const statName = STAT_HASHES[statHash];
        if (statName) {
          const statValue = statData.value || 0;
          totalStats[statName] = (totalStats[statName] || 0) + statValue;
          console.log(`  [STATS DEBUG] ${statName} (hash ${statHash}): ${statValue} (running total: ${totalStats[statName]})`);
        } else {
          console.log(`  [STATS DEBUG] ⚠️ Unknown stat hash: ${statHash} = ${statData.value || 0}`);
        }
      }
    }
  }
  
  console.log('[STATS DEBUG] Base stats calculated. Now checking armor mods...');
  
  // Step 2: Add armor mod bonuses
  // Socket category hashes to SKIP (these are stat mods that are already counted in base stats)
  const SKIP_MOD_CATEGORIES = [
    2487827355, // Armor stat mods (Minor/Major Mobility/Resilience/Recovery/Discipline/Intellect/Strength Mod)
    4062961227, // Deprecated armor 1.0 mods
    2973005342  // Shaders
  ];
  
  // Socket types to SKIP (intrinsic armor sockets whose stats are already in base stats)
  const SKIP_SOCKET_TYPES = [
    2104613635, // Deprecated class ability mods socket (Paragon, Grenadier, etc - non-stat)
    1271523453, // Intrinsic armor stat socket (already counted in base stats)
    2212837421, // Intrinsic armor stat socket (already counted in base stats)
    3303600813  // Intrinsic armor stat socket (already counted in base stats)
  ];
  
  for (let i = 0; i < armorItems.length; i++) {
    const item = armorItems[i];
    const itemData = armorPieces[i];
    if (!item || !itemData) continue;
    
    const itemInstanceId = item.itemInstanceId;
    const sockets = itemComponents.sockets[itemInstanceId];
    
    // Fetch item definition to get socket type info
    const itemDef = await fetchItemDefinition(item.itemHash);
    
    if (sockets && sockets.sockets && itemDef?.sockets?.socketEntries) {
      console.log(`[STATS DEBUG] Checking mods for ${itemData.name}:`);
      
      for (let socketIndex = 0; socketIndex < sockets.sockets.length; socketIndex++) {
        const socket = sockets.sockets[socketIndex];
        if (socket.plugHash && socket.isEnabled) {
          try {
            const plugDef = await fetchItemDefinition(socket.plugHash);
            
            // Skip intrinsic armor sockets (their stats are already in base armor stats)
            const socketDef = itemDef.sockets.socketEntries[socketIndex];
            const socketTypeHash = socketDef?.socketTypeHash;
            if (socketTypeHash && SKIP_SOCKET_TYPES.includes(socketTypeHash)) {
              const modName = plugDef?.displayProperties?.name || 'Unknown Mod';
              console.log(`  [STATS DEBUG] ⏭️  Skipping intrinsic socket: ${modName} (socketType: ${socketTypeHash})`);
              continue;
            }
            
            // Skip stat mods in socket 0 (already counted in base stats)
            if (plugDef && plugDef.plug && plugDef.plug.plugCategoryHash) {
              if (SKIP_MOD_CATEGORIES.includes(plugDef.plug.plugCategoryHash)) {
                const modName = plugDef.displayProperties?.name || 'Unknown Mod';
                console.log(`  [STATS DEBUG] ⏭️  Skipping stat mod: ${modName} (category: ${plugDef.plug.plugCategoryHash})`);
                continue;
              }
            }
            
            // Skip "Upgrade Armor" - masterwork stats are already in base stats
            const modName = plugDef.displayProperties?.name || 'Unknown Mod';
            if (modName === 'Upgrade Armor') {
              console.log(`  [STATS DEBUG] ⏭️  Skipping masterwork: ${modName} (stats already in base)`);
              continue;
            }
            
            if (plugDef && plugDef.investmentStats && plugDef.investmentStats.length > 0) {
              // This mod has stat bonuses
              console.log(`  [STATS DEBUG] Found mod with stats: ${modName}`);
              
              for (const investment of plugDef.investmentStats) {
                const statName = STAT_HASHES[investment.statTypeHash];
                if (statName && investment.value !== 0) {
                  totalStats[statName] = (totalStats[statName] || 0) + investment.value;
                  console.log(`    [STATS DEBUG] ${modName} → ${statName}: ${investment.value > 0 ? '+' : ''}${investment.value} (new total: ${totalStats[statName]})`);
                }
              }
            }
          } catch (error) {
            // Silently skip mods we can't fetch
          }
        }
      }
    }
  }
  
  console.log('='.repeat(80));
  console.log('[STATS DEBUG] ⭐ FINAL TOTAL STATS (WITH MODS):', JSON.stringify(totalStats, null, 2));
  console.log('='.repeat(80));
  
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
      
      // Find all active mods in this tier
      for (const item of tier.items) {
        if (item.isActive) {
          // Fetch the mod's name and details from manifest
          const plugDef = await fetchPlugDefinition(item.itemHash);
          
          if (plugDef) {
            artifactMods.push({
              name: plugDef.name,
              description: plugDef.description,
              icon: plugDef.icon,
              iconUrl: plugDef.iconUrl,
              hash: item.itemHash,
              isVisible: item.isVisible || false,
              tierHash: tier.tierHash
            });
          }
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