# DIM Link Analysis - Guardian.report vs Our Implementation

## Guardian.report DIM Link (Decoded)

```json
{
  "name": "Marty's Loadout",
  "classType": 2,
  "equipped": [
    // 5 items total:
    // - 3 weapons (hash: 42435996, 1681583613, 3926153598)
    // - 1 armor (hash: 4177778015 - likely exotic)
    // - 1 subclass (hash: 3893112950 with socket overrides)
  ],
  "parameters": {
    "mods": [
      // 25 mod hashes total
      // User confirmed: 20 armor mods + 3 balanced tuning mods = 23
      // So 25 total might include some duplicates or class item mods
    ],
    "artifactUnlocks": {
      "unlockedItemHashes": [
        // 14 artifact mod hashes
        // User said they have 12 equipped
        // Might include 2 champion mods that show as "unlocked"
      ],
      "seasonNumber": 22
    }
  }
}
```

## Key Findings

### 1. Equipped Items
- Guardian.report includes: **3 weapons + 1 subclass + 1 exotic armor** = 5 items
- Our implementation: Should do the same ✅
- **Legendary armor is NOT included** in equipped array (DIM infers it)

### 2. Mods Array
- Guardian.report has: **25 mod hashes**
- User has: **20 armor mods + 3 balanced tuning mods** = 23 (maybe 25 with some duplicates?)
- Our implementation: Should collect from **ALL 5 armor pieces** regardless of rarity

### 3. Artifact Unlocks
- Guardian.report has: **14 artifact mod hashes**
- User said: **12 equipped artifact mods**
- Difference: 2 extra might be champion mods OR unlocked-but-not-equipped mods
- Our fix: Now filters by `isActive AND isVisible` to get only the 12 equipped

## What We Need to Fix

### ✅ Already Fixed:
1. Artifact filtering now uses `isActive && isVisible` (only equipped)
2. Mod filtering expanded to include itemType 19, 20, and 42 (armor + weapon mods)
3. Removed strict socket type requirement (was blocking valid mods)

### 🔍 To Verify:
1. Are we collecting mods from ALL 5 armor pieces? (Yes - code confirms this)
2. Are we properly detecting "balanced tuning" mods? (Need to check itemType in logs)
3. Are we filtering out masterwork/ornaments properly? (Yes - exclusion list is good)

## Expected vs Actual

### Expected DIM Link for User's Build:
```json
{
  "equipped": [5],  // 3 weapons + 1 subclass + 1 exotic armor
  "parameters": {
    "mods": [23-25],  // 20 armor + 3 balanced tuning + maybe 2 duplicates
    "artifactUnlocks": {
      "unlockedItemHashes": [12-14]  // 12 equipped, maybe 2 champion mods
    }
  }
}
```

## Next Steps

1. **Test the API** and check console logs for:
   - How many mods are being included (should be ~23-25)
   - What itemType "balanced tuning" mods have
   - How many artifact mods (should be 12, not 14)

2. **Compare** our generated DIM link to Guardian.report's link

3. **Adjust** filtering if needed based on actual itemType values in logs
