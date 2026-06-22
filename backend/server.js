require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration for all origins including GitHub Pages
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// Bungie API Base URL
const BUNGIE_API_BASE = 'https://www.bungie.net/Platform';
const BUNGIE_REQUEST_TIMEOUT_MS = 15000;
const DIM_LINK_TIMEOUT_MS = 8000;

const DESTINY_PLATFORM_ALIASES = {
  auto: -1,
  any: -1,
  all: -1,
  '-1': -1,
  xbox: 1,
  xbl: 1,
  '1': 1,
  playstation: 2,
  psn: 2,
  ps: 2,
  ps4: 2,
  ps5: 2,
  '2': 2,
  steam: 3,
  pc: 3,
  '3': 3,
  blizzard: 4,
  battlenet: 4,
  battle: 4,
  '4': 4,
  stadia: 5,
  '5': 5,
  epic: 6,
  egs: 6,
  '6': 6
};

// In-memory cache for manifest data (to reduce API calls)
const manifestCache = {
  items: new Map(),
  stats: new Map(),
  plugs: new Map(),
  sandboxPerks: new Map(),
  itemSets: new Map(),
  itemSetsLoaded: false,
  artifacts: new Map(),
  lastUpdate: null,
  TTL: 3600000 // 1 hour
};

function ensureManifestCacheFresh() {
  const now = Date.now();
  if (!manifestCache.lastUpdate || (now - manifestCache.lastUpdate) > manifestCache.TTL) {
    if (manifestCache.lastUpdate) {
      console.log('[Manifest] Cache expired. Clearing manifest data to fetch latest game definitions.');
    }
    manifestCache.items.clear();
    manifestCache.stats.clear();
    manifestCache.plugs.clear();
    manifestCache.sandboxPerks.clear();
    manifestCache.itemSets.clear();
    manifestCache.itemSetsLoaded = false;
    manifestCache.artifacts.clear();
    manifestCache.lastUpdate = now;
  }
}

async function withFallbackTimeout(promise, ms, fallback, label) {
  let timeoutId;
  const timeoutPromise = new Promise(resolve => {
    timeoutId = setTimeout(() => {
      console.warn(`[${label}] Timed out after ${ms}ms; continuing without optional data.`);
      resolve(fallback);
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.error(`[${label}] Failed:`, error.message);
    return fallback;
  } finally {
    clearTimeout(timeoutId);
  }
}

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

const ARMOR_BUCKETS = new Set([
  BUCKET_HASHES.HELMET,
  BUCKET_HASHES.ARMS,
  BUCKET_HASHES.CHEST,
  BUCKET_HASHES.LEGS,
  BUCKET_HASHES.CLASS_ITEM
]);

const ARMOR_MOD_SOCKET_TYPES = new Set([
  3956125808, // Armor Mods (Combat Style)
  2912171003, // Armor Mods (General)
  4243480345  // Armor Mods (Seasonal)
]);

const ARMOR_MOD_ITEM_TYPES = new Set([19, 20]); // Current and legacy armor mod item types

const ARMOR_SET_BONUS_FALLBACKS = [
  {
    key: 'lustrous',
    setName: 'Lustrous',
    itemNamePattern: /^Lustrous\b/i,
    bonuses: [
      { pieces: 2, sandboxPerkHash: 4048287940 }, // Photogalvanic
      { pieces: 4, sandboxPerkHash: 4048287941 } // Cauterize
    ]
  },
  {
    key: 'techsec',
    setName: 'Techsec',
    itemNamePattern: /^Te?chsec\b/i,
    bonuses: [
      { pieces: 2, sandboxPerkHash: 1130213040 }, // Wrecker
      { pieces: 4, sandboxPerkHash: 1130213041 } // Concussive Rounds
    ]
  }
];

const ARMOR_SLOT_SUFFIX_PATTERN = /\s+(helm|helmet|casque|mask|cowl|hood|cover|gauntlets|grips|gloves|arms|grasps|wraps|plate|vest|robes|chest|jacket|vestment|boots|greaves|strides|slacks|legs|treads|mark|cloak|bond|class item)$/i;

// Stat hashes for armor (The Final Shape - corrected mapping based on actual API data)
const STAT_HASHES = {
  '2996146975': 'Strength',      // Melee stat (API returns this as Strength value)
  '392767087': 'Mobility',       // Weapons stat (API returns this as Mobility value)
  '1943323491': 'Recovery',      // Class stat
  '1735777505': 'Discipline',    // Grenade stat
  '144602215': 'Intellect',      // Super stat
  '4244567218': 'Resilience'     // Health stat (API returns this as Resilience value)
};

// Maintenance status cache
const maintenanceCache = {
  data: null,
  lastCheck: null,
  TTL: 300000 // 5 minutes
};

// Health check endpoint (Render uses this to verify deployment)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'D2Loadout.report Backend is running',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    endpoints: [
      'GET /health - Health check',
      'GET /api/status - Check Bungie maintenance status',
      'GET /api/loadout/:platform/:membershipId - Get character loadout',
      'GET /api/characters/:platform/:membershipId - Get available characters',
      'GET /api/search/:displayName - Search player by Bungie name'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Check Bungie maintenance status via GlobalAlerts API
app.get('/api/status', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (maintenanceCache.data && maintenanceCache.lastCheck && (now - maintenanceCache.lastCheck) < maintenanceCache.TTL) {
      console.log('[Maintenance] Returning cached status');
      return res.json(maintenanceCache.data);
    }

    console.log('[Maintenance] Fetching fresh status from Bungie GlobalAlerts API');
    const response = await axios.get(`${BUNGIE_API_BASE}/GlobalAlerts/`, {
      headers: {
        'X-API-Key': process.env.BUNGIE_API_KEY
      },
      timeout: 5000 // 5 second timeout
    });

    const alerts = response.data.Response || [];
    
    // Check for active maintenance alerts
    const maintenanceAlert = alerts.find(alert => {
      // Check if alert is currently active
      if (!alert.AlertTimestamp) return false;
      
      const alertTime = new Date(alert.AlertTimestamp);
      const alertLevel = alert.AlertLevel || 0;
      
      // Level 1 = Blue (info), Level 2 = Yellow (warning), Level 3 = Red (critical/maintenance)
      // Consider Level 2+ as maintenance/warning worthy
      return alertLevel >= 2 && alertTime <= new Date();
    });

    let status = {
      maintenance: false,
      message: null,
      estimatedEnd: null,
      alertLevel: 0,
      timestamp: new Date().toISOString()
    };

    if (maintenanceAlert) {
      status.maintenance = true;
      status.message = maintenanceAlert.AlertString || 'Destiny 2 services are experiencing issues';
      status.alertLevel = maintenanceAlert.AlertLevel || 2;
      
      // Try to parse end time from message (Bungie often includes time estimates)
      const html = maintenanceAlert.AlertHtml || '';
      const timeMatch = html.match(/until\\s+(\\d{1,2}:\\d{2}\\s*[AP]M\\s*[A-Z]{2,4})/i);
      if (timeMatch) {
        status.estimatedEnd = timeMatch[1];
      }
    }

    // Cache the result
    maintenanceCache.data = status;
    maintenanceCache.lastCheck = now;

    res.json(status);
  } catch (error) {
    console.error('[Maintenance] Error checking status:', error.message);
    
    // Don't block widget on maintenance check failure
    res.json({
      maintenance: false,
      message: null,
      estimatedEnd: null,
      alertLevel: 0,
      timestamp: new Date().toISOString(),
      error: 'Unable to check maintenance status'
    });
  }
});

// Search player by Bungie display name (e.g., Marty#2689)
app.get('/api/search/:displayName', async (req, res) => {
  const { displayName } = req.params;
  
  try {
    const searchUrl = `${BUNGIE_API_BASE}/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(displayName)}/`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'X-API-Key': process.env.BUNGIE_API_KEY
      },
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
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
// ============================================================================
// SHARED HELPER: Fetch full loadout data (used by both /api/loadout and /api/dimlink)
// ============================================================================
function normalizeRequestedMembershipType(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  const membershipType = DESTINY_PLATFORM_ALIASES[normalized];

  if (membershipType === -1) {
    return null;
  }

  if (Number.isInteger(membershipType)) {
    return membershipType;
  }

  throw new Error(`Unsupported platform "${value}". Use auto, xbox, playstation, steam, epic, or a Destiny membership type number.`);
}

function selectDestinyPlayer(players, requestedMembershipType, displayName) {
  if (!requestedMembershipType) {
    return players[0];
  }

  const selectedPlayer = players.find(player => Number(player.membershipType) === requestedMembershipType);
  if (selectedPlayer) {
    return selectedPlayer;
  }

  const requestedPlatform = getPlatformName(requestedMembershipType);
  const availablePlatforms = players
    .map(player => getPlatformName(Number(player.membershipType)))
    .filter((platformName, index, platforms) => platformName && platforms.indexOf(platformName) === index)
    .join(', ');

  throw new Error(`${displayName} was found, but no ${requestedPlatform} account was returned. Available platforms: ${availablePlatforms || 'none'}.`);
}

function getClassName(classType) {
  const classNames = {
    0: 'Titan',
    1: 'Hunter',
    2: 'Warlock'
  };
  return classNames[classType] || 'Unknown';
}

function getMostRecentCharacterId(characters) {
  let mostRecentCharacterId = null;
  let mostRecentDate = null;

  for (const [charId, charData] of Object.entries(characters)) {
    const lastPlayed = new Date(charData.dateLastPlayed);
    if (!mostRecentDate || lastPlayed > mostRecentDate) {
      mostRecentDate = lastPlayed;
      mostRecentCharacterId = charId;
    }
  }

  return mostRecentCharacterId;
}

function formatCharacterSummary(characterId, character, mostRecentCharacterId) {
  return {
    id: characterId,
    class: getClassName(character.classType),
    classType: character.classType,
    race: character.raceType,
    light: character.light,
    emblemPath: character.emblemPath ? `https://www.bungie.net${character.emblemPath}` : null,
    emblemBackgroundPath: character.emblemBackgroundPath ? `https://www.bungie.net${character.emblemBackgroundPath}` : null,
    lastPlayed: character.dateLastPlayed,
    isMostRecent: characterId === mostRecentCharacterId
  };
}

function formatCharacterList(characters) {
  const mostRecentCharacterId = getMostRecentCharacterId(characters);
  return Object.entries(characters)
    .map(([characterId, character]) => formatCharacterSummary(characterId, character, mostRecentCharacterId))
    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
}

function selectCharacterId(characters, requestedCharacterId) {
  const mostRecentCharacterId = getMostRecentCharacterId(characters);
  if (!mostRecentCharacterId) {
    throw new Error('This player has no Destiny 2 characters');
  }

  const normalizedCharacterId = String(requestedCharacterId || '').trim();
  if (!normalizedCharacterId || normalizedCharacterId === '-1' || normalizedCharacterId.toLowerCase() === 'auto') {
    return mostRecentCharacterId;
  }

  if (characters[normalizedCharacterId]) {
    return normalizedCharacterId;
  }

  const availableCharacters = formatCharacterList(characters)
    .map(character => `${character.class} (${character.id})`)
    .join(', ');
  const error = new Error(`Character ${normalizedCharacterId} was not found on this account. Available characters: ${availableCharacters || 'none'}.`);
  error.statusCode = 400;
  throw error;
}

async function resolveDestinyMembership(platformOrName, membershipIdOrTag, requestedMembershipType = null) {
  let platform = platformOrName;
  let membershipId = membershipIdOrTag;
  
  // If membershipIdOrTag is provided, it's the normal format: 3/4611686018467484767
  // If not, platformOrName might be a Bungie name: Marty#2689
  if (!membershipIdOrTag && platformOrName.includes('#')) {
    // It's a Bungie name, search for it first
    const searchUrl = `${BUNGIE_API_BASE}/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(platformOrName)}/`;
    const searchResponse = await axios.get(searchUrl, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
    });
    
    const players = searchResponse.data.Response;
    if (!players || players.length === 0) {
      throw new Error(`No player found with Bungie name: ${platformOrName}`);
    }
    
    const selectedPlayer = selectDestinyPlayer(players, requestedMembershipType, platformOrName);
    platform = selectedPlayer.membershipType;
    membershipId = selectedPlayer.membershipId;
  }

  return { platform, membershipId };
}

async function fetchDestinyProfile(platform, membershipId, components) {
  const profileUrl = `${BUNGIE_API_BASE}/Destiny2/${platform}/Profile/${membershipId}/?components=${components}`;

  const response = await axios.get(profileUrl, {
    headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
    timeout: BUNGIE_REQUEST_TIMEOUT_MS
  });

  return response.data.Response;
}

async function fetchCharacterList(platformOrName, membershipIdOrTag, requestedMembershipType = null) {
  const { platform, membershipId } = await resolveDestinyMembership(platformOrName, membershipIdOrTag, requestedMembershipType);
  const data = await fetchDestinyProfile(platform, membershipId, '100,200');
  const characters = data.characters?.data || {};

  if (Object.keys(characters).length === 0) {
    throw new Error('This player has no Destiny 2 characters');
  }

  return {
    platform,
    membershipId,
    displayName: data.profile?.data?.userInfo?.displayName || 'Guardian',
    characters: formatCharacterList(characters)
  };
}

async function fetchLoadoutData(platformOrName, membershipIdOrTag, requestedMembershipType = null, requestedCharacterId = null) {
  const { platform, membershipId } = await resolveDestinyMembership(platformOrName, membershipIdOrTag, requestedMembershipType);
  
  // Fetch profile with character equipment and stats
  // Components: 100=Profile, 104=ProfileProgression, 200=Characters, 202=CharacterProgressions,
  //             205=CharacterEquipment, 300=ItemInstances, 304=ItemStats, 305=ItemSockets
  const data = await fetchDestinyProfile(platform, membershipId, '100,104,200,202,205,300,304,305');
  const characters = data.characters?.data || {};
  const equipment = data.characterEquipment?.data || {};
  const characterProgressions = data.characterProgressions?.data || {};
  const profileProgression = data.profileProgression?.data || {};
  const itemComponents = {
    instances: data.itemComponents?.instances?.data || {},
    stats: data.itemComponents?.stats?.data || {},
    sockets: data.itemComponents?.sockets?.data || {}
  };
  
  const mostRecentCharacterId = getMostRecentCharacterId(characters);
  if (!mostRecentCharacterId) {
    throw new Error('This player has no Destiny 2 characters');
  }

  const characterId = selectCharacterId(characters, requestedCharacterId);
  const character = characters[characterId];
  const characterEquipment = equipment[characterId];
  const characterProgression = characterProgressions[characterId];

  if (!characterEquipment) {
    throw new Error(`No equipped loadout data returned for character ${characterId}`);
  }
  
  // Extract artifact mods
  const artifactMods = await extractArtifactMods(characterProgression);
  
  // Get seasonal artifact info
  const seasonalArtifact = profileProgression.seasonalArtifact || null;
  let artifactInfo = null;
  if (seasonalArtifact && seasonalArtifact.artifactHash) {
    artifactInfo = await fetchArtifactModHashes(seasonalArtifact.artifactHash);
  }
  
  // Generate DIM link, but do not block the loadout payload on optional enrichment.
  const displayName = data.profile?.data?.userInfo?.displayName || 'Guardian';
  const dimLink = await withFallbackTimeout(
    generateDIMLink(
      displayName,
      character.classType,
      characterEquipment,
      itemComponents,
      artifactMods,
      characterProgression
    ),
    DIM_LINK_TIMEOUT_MS,
    null,
    'DIM Link'
  );
  return {
    platform,
    membershipId,
    data,
    character,
    characterId,
    mostRecentCharacterId,
    characterEquipment,
    characterProgression,
    characters: formatCharacterList(characters),
    itemComponents,
    artifactMods,
    artifactInfo,
    seasonalArtifact,
    dimLink
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

app.get('/api/loadout/:platformOrName/:membershipIdOrTag?', async (req, res) => {
  const { platformOrName, membershipIdOrTag } = req.params;
  
  if (!process.env.BUNGIE_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'Bungie API key not configured'
    });
  }
  
  try {
    const requestedMembershipType = normalizeRequestedMembershipType(req.query.membershipType || req.query.platform);
    const requestedCharacterId = req.query.characterId || req.query.character || null;

    // Use shared helper to fetch all data
    const loadoutData = await fetchLoadoutData(platformOrName, membershipIdOrTag, requestedMembershipType, requestedCharacterId);
    
    // Process the loadout
    const loadout = await processLoadout(
      loadoutData.characterId,
      loadoutData.characterEquipment,
      loadoutData.itemComponents,
      loadoutData.character
    );
    
    // Add artifact mods to loadout
    loadout.artifactMods = loadoutData.artifactMods;
    
    // ============================================================================
    // LOG STATS BEING SENT TO CLIENT
    // ============================================================================
    console.log('🎯🎯🎯 STATS BEING SENT TO CLIENT 🎯🎯🎯');
    console.log('Stats object:', JSON.stringify(loadout.stats, null, 2));
    console.log('🎯🎯🎯 END STATS 🎯🎯🎯');
    
    res.json({
      success: true,
      displayName: loadoutData.data.profile?.data?.userInfo?.displayName || 'Guardian',
      membershipId: loadoutData.membershipId,
      platform: loadoutData.platform,
      platformName: getPlatformName(parseInt(loadoutData.platform)),
      character: {
        id: loadoutData.characterId,
        class: getClassName(loadoutData.character.classType),
        race: loadoutData.character.raceType,
        light: loadoutData.character.light,
        emblemPath: loadoutData.character.emblemPath 
          ? `https://www.bungie.net${loadoutData.character.emblemPath}` 
          : null,
        emblemBackgroundPath: loadoutData.character.emblemBackgroundPath
          ? `https://www.bungie.net${loadoutData.character.emblemBackgroundPath}`
          : null,
        lastPlayed: loadoutData.character.dateLastPlayed
      },
      characters: loadoutData.characters,
      artifact: loadoutData.seasonalArtifact ? {
        name: loadoutData.artifactInfo?.name || 'Unknown Artifact',
        icon: loadoutData.artifactInfo?.icon || '',
        iconUrl: loadoutData.artifactInfo?.iconUrl || null,
        powerBonus: loadoutData.seasonalArtifact.powerBonus || 0,
        pointsUnlocked: loadoutData.seasonalArtifact.pointsAcquired || 0
      } : null,
      loadout: loadout,
      dimLink: loadoutData.dimLink,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Loadout fetch error:', error.message);
    res.status(error.statusCode || error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch loadout',
      message: error.response?.data?.Message || error.message,
      errorCode: error.response?.data?.ErrorCode || 'Unknown'
    });
  }
});

app.get('/api/characters/:platformOrName/:membershipIdOrTag?', async (req, res) => {
  const { platformOrName, membershipIdOrTag } = req.params;

  if (!process.env.BUNGIE_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'Bungie API key not configured'
    });
  }

  try {
    const requestedMembershipType = normalizeRequestedMembershipType(req.query.membershipType || req.query.platform);
    const characterData = await fetchCharacterList(platformOrName, membershipIdOrTag, requestedMembershipType);

    res.json({
      success: true,
      displayName: characterData.displayName,
      membershipId: characterData.membershipId,
      platform: characterData.platform,
      platformName: getPlatformName(parseInt(characterData.platform)),
      characters: characterData.characters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Character list fetch error:', error.message);
    res.status(error.statusCode || error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch characters',
      message: error.response?.data?.Message || error.message,
      errorCode: error.response?.data?.ErrorCode || 'Unknown'
    });
  }
});

// New endpoint: Get just the DIM link (for StreamElements custom commands)
// NEW ENDPOINT: DIM Link only (for StreamElements chat commands)
// Usage: /api/dimlink/:platformOrName/:membershipIdOrTag?
// Query param: ?format=text returns plain text URL (for StreamElements)
// Returns: { success: true, dimLink: "https://tinyurl.com/..." } or plain text
// This endpoint uses the shared fetchLoadoutData function to get the same DIM link as the widget
app.get('/api/dimlink/:platformOrName/:membershipIdOrTag?', async (req, res) => {
  try {
    const { platformOrName, membershipIdOrTag } = req.params;
    const format = req.query.format;
    const requestedMembershipType = normalizeRequestedMembershipType(req.query.membershipType || req.query.platform);
    const requestedCharacterId = req.query.characterId || req.query.character || null;
    
    console.log(`[DIM Link] Request for: ${platformOrName}${membershipIdOrTag ? '/' + membershipIdOrTag : ''}`);
    
    // Use shared helper to fetch data and generate DIM link
    const loadoutData = await fetchLoadoutData(platformOrName, membershipIdOrTag, requestedMembershipType, requestedCharacterId);
    
    if (!loadoutData.dimLink) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate DIM link' 
      });
    }
    
    console.log(`[DIM Link] Successfully retrieved: ${loadoutData.dimLink}`);
    
    // Return based on format
    if (format === 'text') {
      res.type('text/plain');
      res.send(loadoutData.dimLink);
    } else {
      res.json({
        success: true,
        dimLink: loadoutData.dimLink,
        displayName: loadoutData.data.profile?.data?.userInfo?.displayName || 'Guardian',
        characterId: loadoutData.characterId,
        characterClass: getClassName(loadoutData.character.classType)
      });
    }
    
  } catch (error) {
    console.error('[DIM Link] Error:', error.message);
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
  ensureManifestCacheFresh();

  // Check cache first
  if (manifestCache.items.has(itemHash)) {
    return manifestCache.items.get(itemHash);
  }
  
  try {
    const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}/`;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
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
  ensureManifestCacheFresh();

  // Check cache first
  if (manifestCache.plugs.has(plugHash)) {
    return manifestCache.plugs.get(plugHash);
  }
  
  try {
    const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/${plugHash}/`;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
    });
    
    const definition = response.data.Response;
    
    // For artifact mods with iconSequences, use the first frame (active state)
    let iconPath = definition.displayProperties?.icon || '';
    if (definition.displayProperties?.iconSequences && 
        definition.displayProperties.iconSequences.length > 0 &&
        definition.displayProperties.iconSequences[0].frames &&
        definition.displayProperties.iconSequences[0].frames.length > 0) {
      iconPath = definition.displayProperties.iconSequences[0].frames[0];
      console.log(`[Plug ${plugHash}] Using iconSequences frame: ${iconPath}`);
    }
    
    const plugData = {
      name: definition.displayProperties?.name || 'Unknown Mod',
      description: definition.displayProperties?.description || '',
      icon: iconPath,
      iconUrl: iconPath
        ? iconPath.startsWith('http')
          ? iconPath
          : `https://www.bungie.net${iconPath}`
        : null,
      itemType: definition.itemType,
      itemTypeDisplayName: definition.itemTypeDisplayName || '',
      plugCategoryHash: definition.plug?.plugCategoryHash || null,
      plugCategoryIdentifier: definition.plug?.plugCategoryIdentifier || '',
      itemCategoryHashes: definition.itemCategoryHashes || [],
      perks: definition.perks || [],
      traitIds: definition.traitIds || []
    };
    
    // Cache the result
    manifestCache.plugs.set(plugHash, plugData);
    
    return plugData;
  } catch (error) {
    console.error(`Failed to fetch plug definition for ${plugHash}:`, error.message);
    return null;
  }
}

// Fetch sandbox perk definition from Bungie manifest.
// Armor set bonuses such as Photogalvanic/Wrecker live here, not in item sockets.
async function fetchSandboxPerkDefinition(perkHash) {
  ensureManifestCacheFresh();

  if (manifestCache.sandboxPerks.has(perkHash)) {
    return manifestCache.sandboxPerks.get(perkHash);
  }

  try {
    const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinySandboxPerkDefinition/${perkHash}/`;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
    });

    const definition = response.data.Response;
    const iconPath = definition.displayProperties?.icon || '';
    const perkData = {
      hash: perkHash,
      name: definition.displayProperties?.name || 'Unknown Perk',
      description: definition.displayProperties?.description || '',
      icon: iconPath,
      iconUrl: iconPath
        ? iconPath.startsWith('http')
          ? iconPath
          : `https://www.bungie.net${iconPath}`
        : null
    };

    manifestCache.sandboxPerks.set(perkHash, perkData);
    return perkData;
  } catch (error) {
    console.error(`Failed to fetch sandbox perk definition for ${perkHash}:`, error.message);
    return null;
  }
}

async function fetchEquipableItemSetDefinitions() {
  ensureManifestCacheFresh();

  if (manifestCache.itemSetsLoaded) {
    return manifestCache.itemSets;
  }

  try {
    const manifestResponse = await axios.get(`${BUNGIE_API_BASE}/Destiny2/Manifest/`, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
    });
    const itemSetPath = manifestResponse.data.Response?.jsonWorldComponentContentPaths?.en?.DestinyEquipableItemSetDefinition;

    if (!itemSetPath) {
      manifestCache.itemSetsLoaded = true;
      return manifestCache.itemSets;
    }

    const itemSetResponse = await axios.get(`https://www.bungie.net${itemSetPath}`, {
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
    });
    const itemSetDefinitions = itemSetResponse.data || {};

    manifestCache.itemSets.clear();

    for (const itemSet of Object.values(itemSetDefinitions)) {
      const setName = itemSet.displayProperties?.name || '';
      const bonuses = (itemSet.setPerks || [])
        .filter(perk => perk.requiredSetCount && perk.sandboxPerkHash)
        .map(perk => ({
          pieces: perk.requiredSetCount,
          sandboxPerkHash: perk.sandboxPerkHash
        }));

      if (!setName || bonuses.length === 0) {
        continue;
      }

      const setDefinition = {
        key: normalizeArmorSetKey(setName),
        setName,
        bonuses
      };

      for (const itemHash of itemSet.setItems || []) {
        manifestCache.itemSets.set(Number(itemHash), setDefinition);
      }
    }

    manifestCache.itemSetsLoaded = true;
    return manifestCache.itemSets;
  } catch (error) {
    console.error('[Armor Set Bonuses] Failed to fetch equipable item set definitions:', error.message);
    manifestCache.itemSetsLoaded = true;
    return manifestCache.itemSets;
  }
}

// Fetch seasonal artifact definition and get all artifact mod hashes
async function fetchArtifactModHashes(artifactHash) {
  ensureManifestCacheFresh();

  // Check cache first
  if (manifestCache.artifacts.has(artifactHash)) {
    return manifestCache.artifacts.get(artifactHash);
  }
  
  try {
    const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyArtifactDefinition/${artifactHash}/`;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY },
      timeout: BUNGIE_REQUEST_TIMEOUT_MS
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

function isArmorBucket(bucketHash) {
  return ARMOR_BUCKETS.has(bucketHash);
}

function isArmorModSocket(socketDef) {
  return !!socketDef?.socketTypeHash && ARMOR_MOD_SOCKET_TYPES.has(socketDef.socketTypeHash);
}

function isArmorModPlug(plugDef) {
  return !!plugDef?.itemType && ARMOR_MOD_ITEM_TYPES.has(plugDef.itemType);
}

function normalizeArmorSetKey(setName) {
  return (setName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getArmorSetNameFromItemName(itemName) {
  const cleanName = (itemName || '').trim();
  if (!cleanName) {
    return '';
  }

  const withoutSlot = cleanName.replace(ARMOR_SLOT_SUFFIX_PATTERN, '').trim();
  return withoutSlot || cleanName;
}

function getArmorSetDefinition(armorItem) {
  const itemName = armorItem?.name || '';
  return ARMOR_SET_BONUS_FALLBACKS.find(setDef => setDef.itemNamePattern.test(itemName)) || null;
}

function getArmorSetInfo(armorItem, itemSetDefinition = null) {
  const fallback = itemSetDefinition || getArmorSetDefinition(armorItem);
  const setName = fallback?.setName || armorItem?.armorSetName || getArmorSetNameFromItemName(armorItem?.name);
  const setKey = fallback?.key || armorItem?.armorSetKey || normalizeArmorSetKey(setName);
  return { setName, setKey, fallback };
}

function parseRequiredPieces(...texts) {
  const text = texts.filter(Boolean).join(' ');
  if (!text) {
    return null;
  }

  const pieceMatch = text.match(/\b([2-5])\s*[- ]?\s*pieces?\b/i);
  if (pieceMatch) {
    return parseInt(pieceMatch[1], 10);
  }

  const setBonusMatch = text.match(/\bset[_\s-]?bonus[_\s-]?([2-5])\b/i);
  return setBonusMatch ? parseInt(setBonusMatch[1], 10) : null;
}

function cleanArmorSetBonusName(name) {
  return (name || '')
    .replace(/^\s*[2-5]\s*[- ]?\s*pieces?\s*(?:bonus)?\s*(?:[|:-]\s*)?/i, '')
    .trim();
}

async function buildArmorSetBonusCandidate(perkEntry, armorSetInfo, source = {}) {
  const perkHash = perkEntry?.perkHash || perkEntry?.hash;
  if (!perkHash) {
    return null;
  }

  const perk = await fetchSandboxPerkDefinition(perkHash);
  if (!perk) {
    return null;
  }

  const pieces = parseRequiredPieces(
    perkEntry.requirementDisplayString,
    source.name,
    source.description,
    source.category,
    source.identifier
  );

  if (!pieces) {
    return null;
  }

  return {
    ...perk,
    setKey: armorSetInfo.setKey,
    setName: armorSetInfo.setName,
    pieces,
    requiredPieces: pieces,
    source: 'armorSetBonus',
    sourceHash: source.hash || null
  };
}

function buildArmorSetBonusPlugCandidate(plugDef, armorSetInfo, source = {}) {
  if (!plugDef || !armorSetInfo.setKey || !armorSetInfo.setName) {
    return null;
  }

  const pieces = parseRequiredPieces(
    plugDef.name,
    plugDef.description,
    plugDef.plugCategoryIdentifier,
    Array.isArray(plugDef.traitIds) ? plugDef.traitIds.join(' ') : '',
    source.identifier
  );

  if (!pieces) {
    return null;
  }

  const name = cleanArmorSetBonusName(plugDef.name) || plugDef.name || 'Armor Set Bonus';

  return {
    hash: source.hash || null,
    name,
    description: plugDef.description || '',
    icon: plugDef.icon || '',
    iconUrl: plugDef.iconUrl || null,
    setKey: armorSetInfo.setKey,
    setName: armorSetInfo.setName,
    pieces,
    requiredPieces: pieces,
    source: 'armorSetBonus',
    sourceHash: source.hash || null
  };
}

async function collectArmorSetBonusCandidates(perks, armorSetInfo, source = {}) {
  if (!Array.isArray(perks) || !armorSetInfo.setKey || !armorSetInfo.setName) {
    return [];
  }

  const candidates = [];
  for (const perkEntry of perks) {
    const candidate = await buildArmorSetBonusCandidate(perkEntry, armorSetInfo, source);
    if (candidate) {
      candidates.push(candidate);
    }
  }

  return candidates;
}

function addArmorSetBonusCandidate(candidates, seenKeys, candidate) {
  if (!candidate) {
    return;
  }

  const key = `${candidate.setKey}:${candidate.pieces}:${candidate.hash || candidate.name}`;
  if (seenKeys.has(key)) {
    return;
  }

  seenKeys.add(key);
  candidates.push(candidate);
}

async function getActiveArmorSetBonuses(armorItems) {
  const itemSetDefinitions = await fetchEquipableItemSetDefinitions();
  const groups = new Map();

  for (const armorItem of armorItems.filter(Boolean)) {
    const itemSetDefinition = itemSetDefinitions.get(Number(armorItem.hash)) || null;
    const armorSetInfo = getArmorSetInfo(armorItem, itemSetDefinition);
    if (!armorSetInfo.setKey || !armorSetInfo.setName) {
      continue;
    }

    if (!groups.has(armorSetInfo.setKey)) {
      groups.set(armorSetInfo.setKey, {
        setKey: armorSetInfo.setKey,
        setName: armorSetInfo.setName,
        fallback: armorSetInfo.fallback,
        pieces: 0,
        equippedItems: new Set(),
        candidates: []
      });
    }

    const group = groups.get(armorSetInfo.setKey);
    group.pieces += 1;
    group.equippedItems.add(armorItem.name);
    if (Array.isArray(armorItem.armorSetBonusCandidates)) {
      group.candidates.push(...armorItem.armorSetBonusCandidates);
    }
  }

  const activeBonuses = [];

  for (const group of groups.values()) {
    const candidateMap = new Map();
    for (const candidate of group.candidates) {
      if (!candidate?.pieces || group.pieces < candidate.pieces) {
        continue;
      }

      const key = `${candidate.hash || candidate.name}:${candidate.pieces}`;
      candidateMap.set(key, candidate);
    }

    const activeCandidates = [...candidateMap.values()];
    if (activeCandidates.length > 0) {
      for (const candidate of activeCandidates.sort((a, b) => a.pieces - b.pieces)) {
        activeBonuses.push({
          ...candidate,
          equippedPieces: group.pieces,
          equippedItems: [...group.equippedItems]
        });
      }
    }

    if (!group.fallback) {
      continue;
    }

    for (const bonusDef of group.fallback.bonuses) {
      if (group.pieces < bonusDef.pieces) {
        continue;
      }

      const key = `${bonusDef.sandboxPerkHash}:${bonusDef.pieces}`;
      if (candidateMap.has(key)) {
        continue;
      }

      const perk = await fetchSandboxPerkDefinition(bonusDef.sandboxPerkHash);
      if (!perk) {
        continue;
      }

      activeBonuses.push({
        ...perk,
        setKey: group.fallback.key,
        setName: group.fallback.setName,
        pieces: bonusDef.pieces,
        requiredPieces: bonusDef.pieces,
        equippedPieces: group.pieces,
        equippedItems: [...group.equippedItems],
        source: 'armorSetBonus'
      });
    }
  }

  return activeBonuses.sort((a, b) => {
    if (a.setName !== b.setName) {
      return a.setName.localeCompare(b.setName);
    }
    return b.pieces - a.pieces;
  });
}

function applyArmorSetBonusesToArmor(armorItems, armorSetBonuses) {
  for (const armorItem of armorItems.filter(Boolean)) {
    armorItem.perks = [];
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
  
  const isWeapon = definition.itemType === 3; // DestinyItemType.Weapon = 3
  const isClassItem = itemData.bucketHash === BUCKET_HASHES.CLASS_ITEM;
    const isArmor = isArmorBucket(itemData.bucketHash);
  const isExotic = definition.inventory?.tierType === 6;
  const armorSetInfo = isArmor ? getArmorSetInfo({ name: definition.displayProperties?.name || '' }) : {};
  const armorSetBonusCandidates = [];
  const armorSetBonusCandidateKeys = new Set();

  if (isArmor) {
    const definitionCandidates = await collectArmorSetBonusCandidates(definition.perks || [], armorSetInfo, {
      hash: itemHash,
      name: definition.displayProperties?.name || '',
      description: definition.displayProperties?.description || '',
      identifier: Array.isArray(definition.traitIds) ? definition.traitIds.join(' ') : ''
    });

    for (const candidate of definitionCandidates) {
      addArmorSetBonusCandidate(armorSetBonusCandidates, armorSetBonusCandidateKeys, candidate);
    }
  }

  if (sockets.sockets) {
    for (let i = 0; i < sockets.sockets.length; i++) {
      const socket = sockets.sockets[i];
      const socketDef = definition.sockets?.socketEntries?.[i] || {};
      if (socket.plugHash && socket.isEnabled) {
        // Store all sockets for artifact mod detection
        allSockets.push({
          plugHash: socket.plugHash,
          isVisible: socket.isVisible || false,
          isEnabled: socket.isEnabled || false
        });
        
        const plugDef = await fetchPlugDefinition(socket.plugHash);

        if (isArmor && plugDef) {
          const plugCandidate = buildArmorSetBonusPlugCandidate(plugDef, armorSetInfo, {
            hash: socket.plugHash,
            identifier: plugDef.plugCategoryIdentifier
          });
          addArmorSetBonusCandidate(armorSetBonusCandidates, armorSetBonusCandidateKeys, plugCandidate);

          const plugPerkCandidates = await collectArmorSetBonusCandidates(plugDef.perks || [], armorSetInfo, {
            hash: socket.plugHash,
            name: plugDef.name,
            description: plugDef.description,
            category: plugDef.plugCategoryIdentifier,
            identifier: Array.isArray(plugDef.traitIds) ? plugDef.traitIds.join(' ') : ''
          });

          for (const candidate of plugPerkCandidates) {
            addArmorSetBonusCandidate(armorSetBonusCandidates, armorSetBonusCandidateKeys, candidate);
          }
        }

        // Armor set bonuses are derived from equipped set pieces below.
        // Do not treat normal armor sockets as perks; they include mods, shaders, and ornaments.
        const shouldIncludePerk = !isArmor && socket.isVisible && !isArmorModSocket(socketDef) && !isArmorModPlug(plugDef);
        if (shouldIncludePerk) {
          if (plugDef) {
            perksAndMods.push({
              hash: socket.plugHash,
              name: plugDef.name,
              description: plugDef.description,
              icon: plugDef.icon,
              iconUrl: plugDef.iconUrl,
              itemType: plugDef.itemType,
              itemTypeDisplayName: plugDef.itemTypeDisplayName,
              plugCategoryHash: plugDef.plugCategoryHash,
              plugCategoryIdentifier: plugDef.plugCategoryIdentifier,
              itemCategoryHashes: plugDef.itemCategoryHashes
            });
          } else {
            perksAndMods.push({
              hash: socket.plugHash
            });
          }
        }
      }
    }
    
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
    perks: perksAndMods, // Visible perks and set bonus sockets
    weaponPerks: weaponPerkData, // New: properly filtered weapon perks
    exoticPerks: exoticPerkData, // New: exotic class item perks
    sockets: allSockets, // Store ALL sockets for artifact mod detection
    armorSetKey: armorSetInfo.setKey || null,
    armorSetName: armorSetInfo.setName || null,
    armorSetBonusCandidates,
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
              'mask',               // Festival of the Lost masks (seasonal cosmetic)
              'veiled haunting',    // Festival of the Lost ornament set (all armor pieces)
              'veteran legend',     // Universal ornaments (Veteran Legend set)
              'tiamat',             // Exotic ornament (various exotic pieces)
              'hallowfire',         // Exotic ornament names
              // Armor archetypes (Armor 3.0 intrinsic properties, not equippable mods)
              'brawler',            // Melee archetype
              'grenadier',          // Grenade archetype
              'paragon',            // Class ability archetype
            ];
            const isExcludedByName = EXCLUDED_MOD_NAMES.some(pattern => modName.toLowerCase().includes(pattern));
            const isOrnamentByCategoryIdentifier = plugDef?.plug?.plugCategoryIdentifier?.toLowerCase().includes('ornament');
            const isOrnamentByName = /ornament|transmog|appearance|holofoil|holographic|skin|mask/i.test(modName);
            
            // Exclude old stat mods by pattern (+X stat)
            const isOldStatMod = modName.match(/^\+\d+\s+(super|melee|grenade|weapons|health|class)/i);
            
            // Exclude if it's a "tuning" socket (balanced tuning mods are OK, but empty tuning sockets are not)
            const isEmptyTuning = modName.toLowerCase().includes('tuning') && modName.toLowerCase().includes('empty');
            
            // Skip early if excluded by category, name, or ornament detection (before checking item type)
            if (isExcluded || isExcludedByName || isOrnamentByCategoryIdentifier || isOrnamentByName || isOldStatMod || isEmptyTuning) {
              console.log(`[DIM Link] ⏭️  Skipping socket ${i}: ${socket.plugHash} (excluded - category: ${plugCategoryHash}, name: ${modName}, ornamentIdentifier: ${isOrnamentByCategoryIdentifier}, ornamentName: ${isOrnamentByName}, oldStatMod: ${!!isOldStatMod}, emptyTuning: ${isEmptyTuning})`);
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
        const normalizedStatValue = Math.max(0, Number(statValue) || 0);
        totalStats[statName] = normalizedStatValue;
        console.log(`[STATS] ${statName} (hash ${statHash}): ${normalizedStatValue}`);
      }
    }
    
    console.log('='.repeat(80));
    console.log('[STATS] ⭐ FINAL CHARACTER STATS:', JSON.stringify(totalStats, null, 2));
    console.log('='.repeat(80));
  } else {
    console.warn('[STATS] ⚠️ Warning: characterData or characterData.stats not available, stats will be empty');
  }
  
  const armorItems = [
    helmetData,
    armsData,
    chestData,
    legsData,
    classItemData
  ];
  const armorSetBonuses = await getActiveArmorSetBonuses(armorItems);
  applyArmorSetBonusesToArmor(armorItems, armorSetBonuses);

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
    armorSetBonuses,
    subclass: subclassData,
    stats: totalStats
  };
}

function isChampionArtifactMod(plugDef) {
  const haystack = [plugDef?.name, plugDef?.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return /anti[-\s]?barrier|unstoppable|\bunstop\b|overload|shield[-\s]?piercing|pierc(?:e|ing).*barrier|stagger.*champion|disrupt.*champion/.test(haystack);
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
            if (isChampionArtifactMod(plugDef)) {
              console.log(`[Artifact] Skipping champion artifact item: ${plugDef.name} (hash: ${item.itemHash})`);
              continue;
            }

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
            console.log(`[Artifact] Including EQUIPPED artifact item: ${plugDef.name} (hash: ${item.itemHash}, itemType: ${plugDef.itemType})`);
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
  console.log('🌐 CORS enabled for all origins (GitHub Pages compatible)');
});
