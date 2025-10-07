# Bungie Application Configuration

## Application Details
- **Application Name**: StreamElement Loadout Widget
- **Website**: https://github.com/martinricard/d2loadout-widget
- **Application Status**: Private
- **Status**: Active ✅

## API Keys
- **API Key**: `baadf0eb52e14b6f9a6e79dbd1f824f4`
- **OAuth Authorization URL**: `https://www.bungie.net/en/OAuth/Authorize`
- **OAuth client_id**: `50883`

## App Authentication
- **OAuth Client Type**: Public (No client secret required)
- **Current Redirect URL**: `https://d2loadout-widget.onrender.com`

## Important Notes

### Public OAuth Client
Your application is configured as a **Public** OAuth client, which is correct for:
- Browser-based applications
- StreamElements widgets
- Mobile apps
- Any client where you can't securely store secrets

**Public clients do NOT have or need a client secret** - this is by design for security.

### Redirect URL Update Required
Once your Render deployment is complete, you need to update the Redirect URL in your Bungie application:

**Current**: `https://d2loadout-widget.onrender.com`
**Should be**: `https://d2-loadout-widget.onrender.com/auth/callback`

(Or whatever your actual Render URL is + `/auth/callback`)

## OAuth Flow for Public Clients

Since you're using a Public client, the OAuth flow is:

1. **Authorization Request** (from widget/frontend):
   ```
   https://www.bungie.net/en/OAuth/Authorize?client_id=50883&response_type=code&redirect_uri=https://your-render-url.onrender.com/auth/callback
   ```

2. **User Authorizes** - Bungie redirects to your callback with a code

3. **Token Exchange** (backend only):
   ```
   POST https://www.bungie.net/Platform/App/OAuth/Token/
   Headers: X-API-Key: baadf0eb52e14b6f9a6e79dbd1f824f4
   Body: {
     grant_type: "authorization_code",
     code: "<auth_code>",
     client_id: "50883"
   }
   ```
   **Note**: No client_secret needed!

4. **Access Token Response** - Use to make API calls

## Environment Variables for Render

Only these two are needed:
```
BUNGIE_API_KEY=baadf0eb52e14b6f9a6e79dbd1f824f4
BUNGIE_CLIENT_ID=50883
NODE_ENV=production
```

## Next Steps After Deployment

1. ✅ Deploy to Render (in progress)
2. 📝 Get your actual Render URL (e.g., `https://d2-loadout-widget.onrender.com`)
3. 🔧 Update Bungie Redirect URL to include `/auth/callback` path
4. ✅ Set environment variables in Render dashboard
5. 🧪 Test OAuth flow

---

**Last Updated**: October 7, 2025
**Configuration Status**: Ready to deploy (no client secret needed) ✅
