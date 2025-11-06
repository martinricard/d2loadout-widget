# Enhanced Perk Detection - Debug Logging Added

## Issue Reported

Power weapon (Heavy) with Tier 5 quality doesn't show enhanced perk arrows, while Kinetic and Energy weapons show them correctly.

## How Enhanced Perk Detection Works

### Backend (server.js)

1. **Perk Extraction** (lines ~470-500):
   - For weapons, extracts first 2 main perks from socket indexes 3-4
   - These are the major perk columns (columns 4-5 in the game UI)

2. **Enhanced Detection** (lines ~543-566):
   - Checks if perk name contains "Enhanced"
   - OR checks if perk description contains keywords:
     - "additional" / "Additional"
     - "longer lasting" / "Longer lasting"
     - "more powerful" / "More powerful"
     - "increased" / "Increased"
   - Sets `isEnhanced: true` if either condition is met

3. **Weapon Tier Calculation** (line ~654):
   ```javascript
   weaponTier: weaponPerkData.some(perk => perk.isEnhanced) ? 1 : null
   ```
   - If ANY perk is enhanced → weaponTier = 1 (Tier 2+)
   - If NO perks are enhanced → weaponTier = null (Tier 1)

### Frontend (widget.js)

Lines ~595-625:
```javascript
const weaponTier = weaponData.weaponTier;
const hasEnhancedPerks = weaponTier !== null && weaponTier !== undefined && weaponTier >= 1;

// Add enhanced class if:
// 1. Perk is marked as enhanced by API (perk.isEnhanced)
// 2. OR weapon is Tier 2+ (hasEnhancedPerks) and this is NOT a mod
if ((perk.isEnhanced || hasEnhancedPerks) && !perk.isMod) {
  perkIcon.classList.add('enhanced'); // Adds arrow
}
```

## Debug Logging Added

### 1. Weapon Perk Processing (lines ~543-566)
```javascript
console.log(`[Weapon Perks] Processing ${weaponPerks.length} perks for weapon: ${definition.displayProperties?.name}`);
console.log(`[Weapon Perk] "${perkDef.name}" - nameHasEnhanced: ${nameHasEnhanced}, descHasEnhanced: ${descHasEnhanced}, isEnhanced: ${isEnhanced}`);
```

**What it shows**:
- Total number of perks being processed
- For each perk:
  - Perk name
  - Whether name contains "Enhanced"
  - Whether description contains enhanced keywords
  - Final `isEnhanced` determination

### 2. Weapon Tier Calculation (lines ~660-665)
```javascript
console.log(`[Weapon Tier] "${result.name}" - Has Enhanced Perks: ${hasEnhanced}, Weapon Tier: ${weaponTier}`);
```

**What it shows**:
- Weapon name
- Whether ANY perk was detected as enhanced
- Final weaponTier value (1 = Tier 2+, null = Tier 1)

## How to Use Debug Logs

1. **Start the server** with updated code
2. **Make a request** to `/api/loadout` endpoint
3. **Check console output** for:

### Example Good Output (Kinetic/Energy):
```
[Weapon Perks] Processing 2 perks for weapon: Fatebringer (Adept)
[Weapon Perk] "Enhanced Explosive Payload" - nameHasEnhanced: true, descHasEnhanced: false, isEnhanced: true
[Weapon Perk] "Enhanced Firefly" - nameHasEnhanced: true, descHasEnhanced: false, isEnhanced: true
[Weapon Tier] "Fatebringer (Adept)" - Has Enhanced Perks: true, Weapon Tier: 1
```

### Example Issue (Power weapon):
If Power weapon shows:
```
[Weapon Perks] Processing 2 perks for weapon: Apex Predator
[Weapon Perk] "Explosive Payload" - nameHasEnhanced: false, descHasEnhanced: false, isEnhanced: false
[Weapon Perk] "Firefly" - nameHasEnhanced: false, descHasEnhanced: false, isEnhanced: false
[Weapon Tier] "Apex Predator" - Has Enhanced Perks: false, Weapon Tier: null
```

**This would indicate**: Power weapon doesn't have enhanced perks, which is the root cause.

### Possible Scenarios:

1. **Power weapon has NO enhanced perks**:
   - Expected behavior if it's actually Tier 1
   - User may have mistaken Tier 5 (masterwork level) for Tier 5 (enhanced perk tier)

2. **Power weapon HAS enhanced perks but not detected**:
   - Check perk names in logs
   - May need to add more keyword detection
   - May be a different naming convention for Power weapons

3. **Perks not being extracted at all**:
   - `Processing 0 perks` would indicate socket index issue
   - May need to adjust socket index range for Power weapons

## Notes

- **Weapon Tier** (T1-T5) refers to enhanced perk columns, not masterwork level
- **Masterwork Level** is separate (shown as gold border)
- All weapon types (Kinetic, Energy, Power) use the SAME detection logic
- Socket indexes 3-4 should work for all weapon types

## Next Steps

1. Run server with debug logs
2. Check console output for Power weapon
3. Compare Power weapon output to Kinetic/Energy output
4. Identify difference and apply fix
