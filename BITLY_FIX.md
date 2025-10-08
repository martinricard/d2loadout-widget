# Bitly Integration & Subclass Spacing Fix

## Changes Made

### 1. Backend - Bitly URL Shortener (`backend/server.js`)

**Replaced DIM URL shortener with Bitly API:**

```javascript
async function shortenDIMUrl(longUrl) {
  try {
    const BITLY_TOKEN = process.env.BITLY_TOKEN;
    
    if (!BITLY_TOKEN) {
      console.warn('BITLY_TOKEN not configured, returning long URL');
      return longUrl;
    }
    
    const response = await axios.post('https://api-ssl.bitly.com/v4/shorten', {
      long_url: longUrl
    }, {
      headers: {
        'Authorization': `Bearer ${BITLY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.link) {
      return response.data.link;
    }
    
    return longUrl;
  } catch (error) {
    console.error('Error shortening DIM URL:', error.message);
    return longUrl; // Fallback to long URL
  }
}
```

**Key changes:**
- Changed endpoint from `api.dim.gg/short_url` (doesn't exist) to `api-ssl.bitly.com/v4/shorten`
- Added Authorization header with Bearer token
- Changed request body from `{ url: ... }` to `{ long_url: ... }`
- Changed response field from `short_url` to `link`
- Returns long URL instead of null on failure

### 2. Environment Variables

**Local (.env):**
```env
BITLY_TOKEN=029c448e1c6033d5bb3b5659a993c43ae4558e3e
```

**Render Environment:**
You must add this in Render dashboard:
- Key: `BITLY_TOKEN`
- Value: `029c448e1c6033d5bb3b5659a993c43ae4558e3e`

### 3. Subclass Spacing Fix (`widget/widget.css`)

**Fixed "Threadrunner" overlapping "Aspects" label:**

- `.subclass-icon` → `margin-top: 26px` (was 16px)
- `.subclass-info` → added `margin-bottom: 12px`
- `.aspects-container` → `margin-top: 22px` (was 0px)
- `.fragments-container` → `margin-top: 22px` (was 0px)

This creates proper vertical spacing so subclass names don't overlap with aspect/fragment labels.

## Deployment Steps

1. ✅ Save all changes
2. ✅ Commit to git:
   ```bash
   git add backend/server.js backend/.env widget/widget.css
   git commit -m "fix: replace DIM shortener with Bitly API, fix subclass spacing"
   git push
   ```
3. ⚠️ **IMPORTANT**: Add `BITLY_TOKEN` to Render environment variables
4. ✅ Redeploy on Render

## Expected Results

After deployment:
- ✅ No more "ENOTFOUND api.dim.gg" errors in logs
- ✅ DIM links shortened successfully via Bitly
- ✅ Shortened links display as `https://bit.ly/xxxxx`
- ✅ Subclass names properly spaced from aspect labels
- ✅ No text overlap in subclass section

## Testing

1. Check Render logs - should see no DNS errors
2. Check widget - DIM link should show short Bitly URL
3. Verify subclass section - "Threadrunner" or other names shouldn't overlap "Aspects"
4. Click shortened link - should redirect to full DIM loadout URL
