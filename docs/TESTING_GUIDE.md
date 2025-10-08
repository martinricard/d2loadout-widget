# Widget Testing Guide

## Current Status

### ✅ Completed
1. **Layout Fixed** - Widget now has proper 4-row layout:
   - Row 1: Header with emblem background
   - Row 2: Weapons (3 columns: Kinetic | Energy | Power)
   - Row 3: Stats (6 columns: all stats in a row)
   - Row 4: Subclass | Artifacts

2. **Emblem Background** - Made clearer and more visible:
   - Dark background (#1a1a1f) instead of white
   - 60% opacity (was too washed out before)
   - Added `image-rendering: crisp-edges` for sharper image quality
   - White text with strong shadows for readability

3. **Artifact Section** - Simplified per your request:
   - Removed champion mods (only showing visible artifact mods)
   - Removed colored borders on mods
   - Removed artifact icon, name, points, and power bonus
   - Changed title to "Artifacts Equipped"

4. **Default Layout** - Set to compact automatically

### ⚠️ Known Issues

**Aspects & Fragments Missing:**
- The backend `processSubclassDetails` function exists but isn't returning data
- Possible causes:
  1. Component 305 (Sockets) not being requested correctly
  2. Plug category identifiers changed in recent Destiny 2 update
  3. Manifest definitions not being fetched properly
  
This requires backend debugging to fix.

## How to Test

### Option 1: Test with Local Backend

1. **Start the backend server:**
   ```powershell
   cd backend
   node server.js
   ```

2. **Open test file in browser:**
   - Navigate to: `file:///D:/Dropbox/Notice Me Senpai - Studio Créatif/GitHub/Repo/D2Loadout-Widget/d2loadout-widget/test-widget.html`
   - The widget should automatically load your Bungie account data

3. **Check the browser console** (F12) for any errors

### Option 2: Test in StreamElements

1. **Upload the widget files:**
   - Upload `widget.html`, `widget.css`, `widget.js`, and `fields.json`

2. **Configure settings:**
   - Enter your Bungie ID: `Marty#2689`
   - Select layout: `Compact (Recommended)`
   - Enable all sections

3. **Check what displays:**
   - ✅ Header with emblem background
   - ✅ 3 weapons in a row
   - ✅ 6 stats in a row
   - ✅ Subclass name and icon
   - ❌ Aspects (will be empty until backend fixed)
   - ❌ Fragments (will be empty until backend fixed)
   - ✅ Artifact mods (should show 12 unlocked perks)

### Option 3: Test with Live Render Backend

The widget can use the deployed backend at: `https://d2loadout-widget.onrender.com`

Just make sure the backend is deployed with the latest code.

## Current Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ [Emblem] MARTY • Warlock • 425 ⚡                   │  Row 1: Header
├──────────────────────────────────────────────────────┤
│  WEAPONS                                             │  Row 2: Weapons
│  ┌────────────┬────────────┬────────────┐           │  (3 columns)
│  │Mint Retro  │Yeartide    │Wolfsbane   │           │
│  │474         │472         │475         │           │
│  │PULSE RIFLE │SUBMACHINE  │SWORD       │           │
│  └────────────┴────────────┴────────────┘           │
├──────────────────────────────────────────────────────┤
│  STATS                                               │  Row 3: Stats
│  ┌────┬────┬────┬────┬────┬────┐                   │  (6 columns)
│  │76  │82  │51  │110 │141 │22  │                   │
│  │🔫 │❤️ │⚡ │💥 │🌟 │👊 │                   │
│  │T7  │T8  │T5  │T11 │T14 │T2  │                   │
│  └────┴────┴────┴────┴────┴────┘                   │
├────────────────────────────────┬─────────────────────┤
│  SUBCLASS                      │  ARTIFACTS EQUIPPED │  Row 4: Bottom
│  [Icon] Prismatic Warlock     │  [■][■][■][■][■]  │  (2/3 + 1/3)
│  Aspects: [empty]              │  [■][■][■][■][■]  │
│  Fragments: [empty]            │  [■][■]            │
└────────────────────────────────┴─────────────────────┘
```

## Debugging Subclass Data

If aspects and fragments don't show, check:

1. **Backend logs** when API is called:
   ```powershell
   # Watch the server terminal for errors
   ```

2. **API response** in browser console:
   ```javascript
   // Look for loadout.subclass.aspects and fragments arrays
   ```

3. **Backend code** in `server.js`:
   - Line 465: `processSubclassDetails` function
   - Check if plug categorization is working
   - Verify manifest fetching is successful

## Files Modified in This Session

- `widget.css` - Layout fixes, emblem clarity, artifact simplification
- `widget.html` - Artifact section simplified
- `widget.js` - Artifact display logic updated
- `test-widget.html` - Created for local testing

## Next Steps

1. ✅ Test the current layout - should now show 3 weapon columns
2. ✅ Verify emblem is clearer
3. ✅ Check artifacts display properly
4. ❌ Fix backend to return aspects/fragments data
5. ❌ Deploy updated code to production
