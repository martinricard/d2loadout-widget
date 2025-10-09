# DIM Link Mods Array Fix

## Issue
The `parameters.mods` array in generated DIM links was coming back empty, even though the logic to collect mods from armor pieces was in place.

## Root Cause
The socket category hash filtering approach wasn't working correctly. The socket category hashes we were using may not have matched the actual Bungie API values.

## Solution (V8 - Item Type Filtering)
Changed from socket category filtering to **item type filtering**:

```javascript
// OLD APPROACH (V7) - Socket Category Filtering
const ARMOR_MOD_SOCKET_CATEGORIES = new Set([
  2685412949, // Armor Tier (General Armor Mod)
  590099826,  // Helmet Mod
  3872696960, // Arms Mod
  // etc...
]);
// Check socket category hash
if (socketCategoryHash && ARMOR_MOD_SOCKET_CATEGORIES.has(socketCategoryHash)) {
  modHashes.push(socket.plugHash);
}

// NEW APPROACH (V8) - Item Type Filtering
// Fetch the plug definition and check if it's a mod
const plugDef = await fetchItemDefinition(socket.plugHash);
const isArmorMod = plugDef?.itemType === 19; // 19 = Armor Mod

if (isArmorMod) {
  modHashes.push(socket.plugHash);
}
```

## Expected Result
Looking at Guardian.report's example for Marty#2689:
- **25 mods** in the `parameters.mods` array
- Mods like: `3581696649, 2319885414` (repeated 4x), `350061697` (repeated 2x), etc.

## Testing
Once Render redeploys (5-10 minutes), test with:
```powershell
Invoke-WebRequest -Uri "https://d2loadout-widget.onrender.com/api/loadout/Marty%232689" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object dimLink
```

Then decode the shortened URL to verify the mods array is populated.

## Bungie API Item Types Reference
- `itemType: 19` = Armor Mod (General, Helmet, Arms, Chest, Legs, Class Item mods)
- `itemType: 1` = Weapon
- `itemType: 2` = Armor
- `itemType: 16` = Subclass

## Files Changed
- `backend/server.js` - Lines ~735-790 (generateDIMLink function)
  - Removed socket category hash filtering
  - Added item type checking (`itemType === 19`)
  - Added logging for each mod found

## Status
🔄 **Waiting for Render deployment** (pushed at ~now)
- Expected deployment time: 5-10 minutes
- Will test once deployment completes
