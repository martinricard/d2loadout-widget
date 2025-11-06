# Edge of Fate - New Tier System Support

## What Changed in Season 27 (Edge of Fate DLC)

### Old System (Pre-S27):
- **Crafted weapons**: Could have enhanced perks
- **Normal/Adept weapons**: Fixed rolls, no tiers
- **Detection**: Check if perk name contains "Enhanced"

### New System (S27 - Edge of Fate):
- **ALL NEW weapons & armor**: Tier 1-5 system
- **Higher tiers**: Better stats + enhanced perks (weapons) / more mod capacity (armor)
- **Old gear**: No tier system (still works as before)
- **Exotic armor**: No tier system
- **Tier indicator**: `definition.quality.currentVersion` (0-4 = Tier 1-5)

## Fix Applied

### Backend (server.js)

Changed weapon tier detection to prioritize the new Edge of Fate tier system:

```javascript
// BEFORE (Enhanced perk detection only)
weaponTier: weaponPerkData.some(perk => perk.isEnhanced) ? 1 : null

// AFTER (Edge of Fate tier system first, enhanced perk fallback)
weaponTier: definition.quality?.currentVersion !== undefined 
  ? definition.quality.currentVersion // Edge of Fate tier (0-4)
  : (weaponPerkData.some(perk => perk.isEnhanced) ? 1 : null) // Legacy
```

### How It Works:

1. **Check if weapon has quality.currentVersion** (Edge of Fate weapon)
   - If YES → Use `currentVersion` as tier (0-4 maps to Tier 1-5)
   - If NO → Fall back to enhanced perk detection (legacy crafted weapons)

2. **Frontend displays enhanced perk arrows** when `weaponTier >= 1`:
   - **Tier 1** (currentVersion=0) → weaponTier=0 → No arrows
   - **Tier 2** (currentVersion=1) → weaponTier=1 → Show arrows ✅
   - **Tier 3** (currentVersion=2) → weaponTier=2 → Show arrows ✅
   - **Tier 4** (currentVersion=3) → weaponTier=3 → Show arrows ✅
   - **Tier 5** (currentVersion=4) → weaponTier=4 → Show arrows ✅

### Enhanced Debug Logging:

```javascript
console.log(`[Weapon Tier] "${result.name}" - Quality Tier: ${qualityTier}, Has Enhanced Perks: ${hasEnhanced}, Final Weapon Tier: ${finalTier}`);
```

**Example Output:**
```
// Edge of Fate Tier 5 weapon
[Weapon Tier] "Boomslang-4fr" - Quality Tier: 4, Has Enhanced Perks: false, Final Weapon Tier: 4

// Legacy crafted weapon with enhanced perks
[Weapon Tier] "Fatebringer (Adept)" - Quality Tier: undefined, Has Enhanced Perks: true, Final Weapon Tier: 1

// Old weapon with no tier
[Weapon Tier] "Better Devils" - Quality Tier: undefined, Has Enhanced Perks: false, Final Weapon Tier: null
```

## What This Fixes

### Before:
- ❌ Boomslang-4fr (Tier 5) showed `weaponTier: null` (no arrows)
- ❌ Only detected enhanced perks by name ("Enhanced...")
- ❌ Edge of Fate weapons not recognized

### After:
- ✅ Boomslang-4fr (Tier 5) shows `weaponTier: 4` (arrows displayed)
- ✅ Detects Edge of Fate tier system from `quality.currentVersion`
- ✅ Falls back to enhanced perk detection for legacy weapons
- ✅ Old weapons still work (no tier = null)

## API Data Structure

### Edge of Fate Weapon:
```json
{
  "quality": {
    "currentVersion": 4,  // Tier 5 (0-indexed)
    "versions": [
      {
        "displayProperties": {
          "name": "Boomslang-4fr",
          "icon": "/path/to/tier1/icon.jpg"
        }
      },
      // ... versions for tiers 2-5
      {
        "displayProperties": {
          "name": "Achronal Boomslang-4fr",  // Tier 5 special name
          "icon": "/path/to/tier5/icon.jpg"
        }
      }
    ]
  }
}
```

### Legacy Crafted Weapon:
```json
{
  "quality": null,  // No tier system
  "weaponPerks": [
    {
      "name": "Enhanced Firefly",  // "Enhanced" in name
      "isEnhanced": true
    }
  ]
}
```

## Testing

After deploying, check Render logs for your Tier 5 weapon:

```
[Weapon Perk] "Envious Arsenal" - nameHasEnhanced: false, descHasEnhanced: false, isEnhanced: false
[Weapon Perk] "Precision Instrument" - nameHasEnhanced: false, descHasEnhanced: false, isEnhanced: false
[Weapon Tier] "Boomslang-4fr" - Quality Tier: 4, Has Enhanced Perks: false, Final Weapon Tier: 4
```

**Expected Result**: `weaponTier: 4` → Enhanced perk arrows displayed ✅

## Files Modified:
- `backend/server.js`:
  - Updated weaponTier calculation (line ~654)
  - Added quality tier logging (line ~664)
