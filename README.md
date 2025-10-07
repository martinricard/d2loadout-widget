# D2 Loadout Widget - Backend Service

A **StreamElements/Streamlabs widget** that displays your Destiny 2 character's current loadout in real-time on your stream!

Inspired by [Guardian.report](https://guardian.report/)'s loadout display feature.

## 🎮 What This Widget Does

Shows your active Destiny 2 character's complete loadout:
- ⚔️ **3 Equipped Weapons** (Kinetic, Energy, Heavy) with icons
- 🛡️ **5 Armor Pieces** (Helmet, Arms, Chest, Legs, Class Item) with icons
- 📊 **Character Stats** (Mobility, Resilience, Recovery, Discipline, Intellect, Strength)
- ✨ **Subclass & Super** currently equipped
- 💎 **Exotic Items** highlighted
- 🔄 **Auto-updates** when you change your loadout in-game

Perfect for viewers who want to know what build you're using!

## Current Status: Phase 1 - Backend Deployment

This is a minimal Express backend deployed to Render.com to provide:
- HTTPS endpoint for Bungie OAuth callback
- Health check endpoints for monitoring
- Foundation for full Bungie API integration
- Data proxy to fetch loadout information

## Deployment

**Live URL**: https://d2loadout-widget.onrender.com ✅

### API Endpoints
- `GET /` - API status and available endpoints
- `GET /health` - Health check
- `GET /api/loadout/:platform/:membershipId` - Get loadout by membership ID
- `GET /api/loadout/:bungieId` - Get loadout by Bungie name (e.g., Marty#2689)
- `GET /api/search/:displayName` - Search player by Bungie name

### Bungie Application Details
- **Application Name**: StreamElement Loadout Widget
- **API Key**: Configured (server-side only)
- **OAuth**: Not required - uses public API access only ✅

## API Endpoints

### `GET /`
Health check endpoint - Returns service status and timestamp.

### `GET /health`
Simple health check - Returns `{ status: 'healthy' }`.

### `GET /auth/callback`
OAuth callback endpoint for Bungie authentication (currently a placeholder).

## Environment Variables

Required environment variables (set in Render dashboard):

```bash
BUNGIE_API_KEY=baadf0eb52e14b6f9a6e79dbd1f824f4
NODE_ENV=production
PORT=<auto-set-by-render>
```

**Note**: No OAuth credentials needed - we use public API access only!

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/martinricard/d2loadout-widget.git
cd d2loadout-widget
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials (if different from defaults)

5. Run development server:
```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Next Steps

- [x] Deploy minimal backend to Render
- [ ] Update Bungie application with production redirect URL
- [ ] Obtain and configure OAuth client secret
- [ ] Implement full OAuth token exchange
- [ ] Add Bungie API proxy endpoints
- [ ] Implement rate limiting and caching
- [ ] Build StreamElements widget frontend
- [ ] Implement license key validation system

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Hosting**: Render.com (Free tier)
- **API**: Bungie.net API

## Security Notes

- API keys are stored as environment variables (never committed to git)
- CORS configured for StreamElements domain
- OAuth tokens will be handled server-side only
- All API calls proxied through backend to protect credentials

## License

Commercial product - All rights reserved

## Support

For issues or questions, contact: [Your contact info]

---

**Project Status**: Issue #4 - MVP Backend Deployment ✅
