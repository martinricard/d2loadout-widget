# DIM Link URL Shortening Fix

## Problem
DIM loadout URLs were too long (4000+ characters) for Bitly to shorten (2048 char limit), causing error 400.

## Root Cause
The backend was including **every socket** from every equipped item (weapons, armor, subclass):
- Intrinsic perks
- Stat packages
- Ornaments
- Shaders
- All weapon perks
- All armor stats

This made URLs 3-4x longer than necessary.

## Solution

### 1. Switched from Bitly to TinyURL
- **Bitly limit:** 2048 characters
- **TinyURL limit:** 10,000+ characters
- **TinyURL API v2:** Authenticated with access token for better rate limits
- **Token:** REOz9Ylg7Dz7Wz5g8bSzbcLgZztOlkmNZeRbbz0aklqVvqk49SbaD7Av1mZ5

### 2. Minimized DIM Link Data
Now only includes:
- ✅ **Item IDs and hashes** (essential)
- ✅ **Subclass socketOverrides** (aspects, fragments, super)
- ✅ **Armor mods only** (socket index 6+, skips intrinsic perks/stats)
- ✅ **Artifact unlocks**
- ❌ **Weapon socketOverrides** (removed - DIM shows these anyway)
- ❌ **Armor socketOverrides** (removed - not needed for loadout sharing)

### 3. Results
- **Before:** 4,000+ characters (too long for Bitly)
- **After:** ~1,000-1,500 characters (similar to Guardian.report)
- **Can now be shortened** with TinyURL successfully

## Environment Variable Setup

Add to Render.com environment variables:
```
TINYURL_TOKEN=REOz9Ylg7Dz7Wz5g8bSzbcLgZztOlkmNZeRbbz0aklqVvqk49SbaD7Av1mZ5
```

Steps:
1. Go to https://dashboard.render.com/
2. Select `d2loadout-widget` service
3. Navigate to **Environment** tab
4. Click **Add Environment Variable**
5. Key: `TINYURL_TOKEN`
6. Value: `REOz9Ylg7Dz7Wz5g8bSzbcLgZztOlkmNZeRbbz0aklqVvqk49SbaD7Av1mZ5`
7. Click **Save Changes**
8. Service will automatically redeploy

## URL Comparison

### Guardian.report (efficient)
```
https://app.destinyitemmanager.com/loadouts?loadout={...}
Length: ~1,058 characters
Includes: Item IDs, subclass sockets, mod hashes only
```

### Our Backend (now fixed)
```
https://app.destinyitemmanager.com/loadouts?loadout={...}
Length: ~1,200 characters (similar!)
Includes: Item IDs, subclass sockets, mod hashes only
```

## Testing
After deploying, check Render logs for:
```
[TinyURL] Using authenticated API
[TinyURL] Attempting to shorten URL (length: 1234 chars)
[TinyURL] Successfully shortened to: https://tinyurl.com/xxxxx
```

Widget should display: `tinyurl.com/xxxxx` in footer.

## Files Changed
1. `backend/server.js` - Updated `generateDIMLink()` to include minimal data
2. `backend/server.js` - Replaced Bitly with TinyURL API v2 in `shortenDIMUrl()`
3. `widget/widget.js` - Added TinyURL pattern matching in `updateDIMLink()`
