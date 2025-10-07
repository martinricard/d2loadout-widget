require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (Render uses this to verify deployment)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'D2 Loadout Widget Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// OAuth callback endpoint (placeholder for now)
app.get('/auth/callback', (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ 
      error: 'No authorization code provided' 
    });
  }

  // TODO: Exchange code for access token with Bungie API
  res.json({
    message: 'OAuth callback received',
    note: 'Token exchange will be implemented next'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth callback: http://localhost:${PORT}/auth/callback`);
});