require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://streamelements.com',
    'https://overlay.streamelements.com',
    'https://cdn.streamelements.com',
    'http://localhost:3000' // For local testing
  ]
}));
app.use(express.json());

// Bungie API Base URL
const BUNGIE_API_BASE = 'https://www.bungie.net/Platform';

// Health check endpoint (Render uses this to verify deployment)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'D2 Loadout Widget Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
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
    // Components: 100=Profile, 200=Characters, 205=CharacterEquipment, 
    //             300=ItemInstances, 304=ItemStats, 305=ItemSockets
    const components = '?components=100,200,205,300,304,305';
    const profileUrl = `${BUNGIE_API_BASE}/Destiny2/${platform}/Profile/${membershipId}/${components}`;
    
    const response = await axios.get(profileUrl, {
      headers: {
        'X-API-Key': process.env.BUNGIE_API_KEY
      }
    });
    
    // TODO: Process the loadout data
    // For now, return raw data
    const data = response.data.Response;
    
    res.json({
      success: true,
      displayName: data.profile?.data?.userInfo?.displayName || 'Guardian',
      membershipId: membershipId,
      platform: platform,
      platformName: getPlatformName(platform),
      characters: data.characters?.data || {},
      equipment: data.characterEquipment?.data || {},
      itemComponents: {
        instances: data.itemComponents?.instances?.data || {},
        stats: data.itemComponents?.stats?.data || {},
        sockets: data.itemComponents?.sockets?.data || {}
      },
      note: 'Raw data - processing will be implemented next'
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Loadout endpoint: http://localhost:${PORT}/api/loadout/{platform}/{membershipId}`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search/{displayName}`);
  console.log('');
  console.log('✅ No OAuth required - using API key only!');
});