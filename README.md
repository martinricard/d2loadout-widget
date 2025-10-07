# D2 Loadout Widget - Backend Service

Backend service for the Destiny 2 StreamElements loadout widget.

## Current Status: MVP Deployment

This is a minimal Express backend deployed to Render.com to provide:
- HTTPS endpoint for Bungie OAuth callback
- Health check endpoints for monitoring
- Foundation for full Bungie API integration

## Deployment

**Live URL**: https://d2-loadout-widget.onrender.com (Update after deployment)

### Bungie Application Details
- **Application Name**: StreamElement Loadout Widget
- **OAuth Client Type**: Public (no client secret required)
- **Redirect URL**: `https://d2-loadout-widget.onrender.com/auth/callback` (Update with actual Render URL)
- **Scope**: Read Destiny 2 information (Vault, Inventory, and Vendors)

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
BUNGIE_CLIENT_ID=50883
NODE_ENV=production
PORT=<auto-set-by-render>
```

**Note**: No client secret needed - Public OAuth clients don't use secrets.

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
