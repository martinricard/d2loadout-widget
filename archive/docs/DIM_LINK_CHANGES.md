# DIM Link Feature Implementation

## Changes Made

### Backend (server.js)
1. **Added `generateDIMLink()` function** - Builds a DIM loadout URL with:
   - Character class type
   - All equipped items (weapons, armor, subclass)
   - Socket overrides (perks and mods)
   - Armor mod hashes
   - Artifact unlocks

2. **Added `shortenDIMUrl()` function** - Calls DIM's URL shortener API
   - Endpoint: `https://api.dim.gg/short_url`
   - Returns short URLs like: `https://dim.gg/5o4745a/Equipped`
   - Falls back to long URL if shortening fails

3. **Updated `/api/loadout` response** - Added `dimLink` field to response

### Frontend (widget.js)
1. **Added `updateDIMLink()` function** - Handles DIM link display
   - Shows/hides link based on `showDIMLink` field setting
   - Extracts short code from URL for clean display (e.g., "dim.gg/5o4745a")
   - Updates link href and text content

2. **Updated `fetchLoadout()`** - Calls `updateDIMLink()` after data is fetched

### Styling (widget.css)
1. **Added `.dim-link` styles** - Monospace font, hover effects
2. **Added `.footer-separator`** - Styled separator between footer elements

### Configuration (fields.json)
1. **Added `showDIMLink` field** - Toggle to show/hide DIM link (default: true)
   - Located in "📊 Display Settings" group

## How It Works

1. Backend generates the full DIM loadout URL with all equipped items and mods
2. Backend calls DIM's API to shorten the URL
3. Frontend receives the shortened link (e.g., `https://dim.gg/5o4745a/Equipped`)
4. Widget displays it as "dim.gg/5o4745a" in the footer
5. Users can type this short URL manually (since overlay widgets aren't clickable in OBS)

## DIM URL Format

The generated URL follows DIM's loadout sharing format:
```json
{
  "name": "PlayerName's Loadout",
  "classType": 2,
  "equipped": [
    {
      "id": "6917530143428710776",
      "hash": 42435996,
      "socketOverrides": { "0": 1444664836, ... }
    }
  ],
  "parameters": {
    "mods": [3581696649, ...],
    "artifactUnlocks": {
      "unlockedItemHashes": [941476219, ...],
      "seasonNumber": 22
    }
  }
}
```

## Testing

To test:
1. Commit and push changes to GitHub
2. Render will auto-deploy the backend
3. Refresh StreamElements widget
4. Check footer for DIM link display
5. Try the link in a browser to verify loadout loads correctly

## Notes

- Short URLs are much easier to type manually than the full URLs
- DIM link only shows if `showDIMLink` is set to "true"
- Link uses monospace font to make it easy to read and type
- Season number is currently hardcoded to 22 (you may want to make this dynamic)
