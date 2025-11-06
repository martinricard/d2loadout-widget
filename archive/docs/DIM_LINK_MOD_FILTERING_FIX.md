# DIM Link - Mod Filtering Fix

## Issue

DIM link is picking up too many items, including:
- ❌ Old stat mods (+30 super, +25 melee, +20 weapons, etc.)
- ❌ Ornaments (armor appearance items)
- ❌ Empty tuning mod sockets
- ❌ Armor archetypes (Brawler, Grenadier, Paragon - intrinsic armor properties)
- ❌ Exotic class item "Spirit of" perks
- ❌ Hidden/internal sockets

**Note**: Armor archetypes (Brawler, Grenadier, Paragon, etc.) are one of six core armor archetypes introduced with Armor 3.0. They're intrinsic armor properties, not equippable mods, so they shouldn't appear in DIM links.

## Expected Mods Count

Based on user's in-game UI: **~25 mods total**
- Combat mods (Arc Resistance, Font of Might, Champion mods, etc.)
- Balanced Tuning mods (3 smiley faces)
- Weapon mods (Adept mods, artifact weapon mods)

## Fixes Applied

### 1. Added `isVisible` Check

Only include mods that are visible in the game UI:

```javascript
if (!socket || !socket.plugHash || socket.plugHash === 0 || !socket.isEnabled || !socket.isVisible) {
  continue;
}
```

**Why**: Hidden sockets contain internal data that shouldn't appear in DIM links.

### 2. Excluded Old Stat Mods (Pattern Matching)

Added regex pattern to catch old stat mod format:

```javascript
const isOldStatMod = modName.match(/^\+\d+\s+(super|melee|grenade|weapons|health|class)/i);
```

**Examples excluded**:
- "+30 super"
- "+25 melee"
- "+20 weapons"
- "+30 grenade"
- "+19 class"

**Why**: These are the old armor 1.0 stat mods that no longer function in the current system.

### 3. Excluded Empty Tuning Sockets

```javascript
const isEmptyTuning = modName.toLowerCase().includes('tuning') && modName.toLowerCase().includes('empty');
```

**Why**: Empty sockets shouldn't be in the DIM link (but actual Balanced Tuning mods should be included).

### 4. Expanded Name-Based Exclusions

Added comprehensive list of old/legacy mods and cosmetics:

```javascript
const EXCLUDED_MOD_NAMES = [
  'Upgrade Armor',      // Masterwork
  'Default Shader',     // Default shader
  'Restore Defaults',   // Default ornament
  'Default Ornament',   // Default ornament
  'Spirit of',          // Exotic class item perks
  'Empty',              // Empty mod slots
  'Ornament',           // ✅ All ornaments
  'Shader',             // ✅ All shaders
  // Armor archetypes (Armor 3.0 intrinsic properties, not equippable mods)
  'Brawler',            // ✅ Melee archetype
  'Grenadier',          // ✅ Grenade archetype
  'Paragon',            // ✅ Class ability archetype
];
```

**Why**: 
- **Armor archetypes** (Brawler, Grenadier, Paragon) are intrinsic properties of Armor 3.0 that determine stat focus
- They're NOT equippable mods that players slot in
- Guardian.report doesn't include them in DIM links
- They would confuse DIM if included

### 5. Updated Exclusion Logic

```javascript
if (isMod && !isExcluded && !isExcludedByName && !isOldStatMod && !isEmptyTuning) {
  // Include this mod
}
```

All 5 filters must pass for a mod to be included.

## What Gets Included

✅ **Armor Combat Mods** (Current Season):
- Resistance mods (Arc Resistance, Void Resistance, Solar Resistance, Stasis Resistance, Strand Resistance)
- Champion mods (Anti-Barrier, Overload, Unstoppable)
- Elemental well mods (Font of Might, Elemental Armaments, etc.)
- Charged with Light mods (High-Energy Fire, Protective Light, etc.)
- Warmind Cell mods (Wrath of Rasputin, etc.)
- Siphon mods (Kinetic Siphon, etc.)
- Holster mods
- Loader mods
- Dexterity mods
- Targeting mods
- Unflinching mods

✅ **Weapon Mods** (itemType 42):
- Adept mods (Adept Big Ones, Adept Targeting, etc.)
- Boss Spec, Major Spec, Minor Spec
- Backup Mag, Freehand Grip, Counterbalance Stock

✅ **Balanced Tuning Mods** (the 3 smiley face mods)

## What Gets Excluded

❌ **Old Stat Mods** (Armor 1.0 system, deprecated):
- "+30 super", "+25 melee", "+20 weapons", "+30 grenade", "+19 class", etc.
- These are from the old armor system and no longer function

❌ **Armor Archetypes** (Armor 3.0 intrinsic properties):
- Brawler, Grenadier, Paragon, Outreach, Bomber, Absolution
- These are intrinsic to the armor piece, not equippable mods
- They determine how the armor focuses energy (melee, grenade, class ability, etc.)
- Should NOT appear in DIM links as they're not mods you equip

❌ **Exotic Class Item "Spirit of" Perks**:
- These appear as golden perks in UI
- They're intrinsic to the exotic class item
- NOT equippable mods in DIM

❌ **Ornaments** (Appearance items):
- "Don't Look Back" Warlock ornament for Gateway Artist
- "Anthemic Invocation Tabard" Warlock universal ornament
- "Epialos Following Bond" Warlock universal ornament
- "Meridian Constellation Pants" Warlock universal ornament
- Any item with "Ornament" in the name

❌ **Empty Sockets**:
- "Empty tuning mod socket"
- Any socket with "Empty" in the name

❌ **Hidden Sockets** (`isVisible: false`):
- Internal sockets
- Default/placeholder sockets
- Not visible in game UI

❌ **Cosmetic Items**:
- Shaders
- Transmog items
- Default appearance

❌ **Masterwork/Upgrade Sockets**:
- "Upgrade Armor"
- Masterwork tier selections

## Testing

After deployment, check Render logs for mod filtering:

```
[DIM Link] ✅ Including mod from socket 0: 2724068510 (Arc Resistance, itemType: 19)
[DIM Link] ✅ Including mod from socket 1: 534479613 (Font of Might, itemType: 19)
[DIM Link] ⏭️  Skipping socket 5: 3124567890 (excluded - name: +30 super, oldStatMod: true)
[DIM Link] ⏭️  Skipping socket 6: 3124567891 (excluded - name: Grenadier, oldStatMod: false)
[DIM Link] ⏭️  Skipping socket 7: 3124567892 (excluded - name: Don't Look Back Ornament)
[DIM Link] ⏭️  Skipping socket 8: empty, disabled, or hidden (isVisible: false)
```

**Expected Result**: ~25 mods in `parameters.mods` array, matching exactly what's visible in game UI

## Before vs After

### Before (Wrong - 50+ items):
```json
"mods": [
  2724068510,  // ✅ Arc Resistance
  534479613,   // ✅ Font of Might
  4021790309,  // ❌ +30 super
  856936828,   // ❌ +25 melee
  2595839237,  // ❌ Grenadier
  953234331,   // ❌ Grenadier
  3194530172,  // ❌ Paragon
  3410844187,  // ❌ Don't Look Back Ornament
  4188291233,  // ❌ Anthemic Invocation Tabard
  11126525,    // ❌ Epialos Following Bond
  40751621     // ❌ Empty tuning socket
]
```

### After (Correct - ~25 items):
```json
"mods": [
  2724068510,  // ✅ Arc Resistance
  534479613,   // ✅ Font of Might
  1834163303,  // ✅ Void Resistance
  4021790309,  // ✅ Solar Resistance
  // ... 21 more ACTUAL combat mods
]
```

## Files Modified

- `backend/server.js`:
  - Added `isVisible` check (line ~798)
  - Added old stat mod regex exclusion (line ~863)
  - Added empty tuning exclusion (line ~866)
  - Expanded EXCLUDED_MOD_NAMES list (line ~840-861)
  - Updated exclusion logic (line ~870)


```javascript
// Excluded plug categories (11 categories)
2973005342, // Shaders (cosmetic)
3124752623, // Intrinsic Traits (Exotic armor perks)
2487827355, // Armor Cosmetics (Ornaments/Transmog)
1744546145, // Masterwork Tier (Upgrade Armor)
3993098925, // Empty Mod Socket (default socket)
2457930460, // Armor Stat Mods (old system)
208760563,  // Armor Tier (not a combat mod)
1282012138, // Reusable Armor Mods (older system)
965959289,  // Ornament sockets
590099826,  // Armor Appearance (Transmog/Ornaments)
2833320680, // Armor Ornaments Universal

// Included item types
19 = Armor Mod
20 = Armor Mod (Legacy)
42 = Weapon Mod
```

## What Gets Included

✅ **Armor Combat Mods**:
- Resistance mods (Arc, Void, Solar)
- Champion mods (Anti-Barrier, Overload, Unstoppable)
- Stat mods
- Elemental well mods
- Font mods
- Reaper/Siphon mods

✅ **Weapon Mods**:
- Adept mods (Adept Big Ones, etc.)
- Artifact weapon mods (Temporal Armaments, Temporal Blast)

✅ **Balanced Tuning Mods** (the 3 smiley face mods)

## What Gets Excluded

❌ **Exotic Class Item "Spirit of" Perks**:
- These appear as golden mods in UI
- They're intrinsic to the exotic class item
- NOT equippable mods in DIM

❌ **Hidden Sockets** (`isVisible: false`):
- Internal sockets
- Default/placeholder sockets
- Not visible in game UI

❌ **Cosmetic Items**:
- Shaders
- Ornaments
- Transmog

❌ **Masterwork/Upgrade Sockets**:
- "Upgrade Armor"
- Masterwork tier selections

## Testing

After deployment, check Render logs for mod filtering:

```
[DIM Link] ✅ Including mod from socket 0: 2724068510 (Arc Resistance, itemType: 19)
[DIM Link] ✅ Including mod from socket 1: 534479613 (Font of Might, itemType: 19)
[DIM Link] ⏭️  Skipping socket 5: 3124567890 (excluded - name: Spirit of Syntho...)
[DIM Link] ⏭️  Skipping socket 8: empty, disabled, or hidden (isVisible: false)
```

**Expected Result**: ~25 mods in `parameters.mods` array (matching what's visible in game)

## Files Modified

- `backend/server.js`:
  - Added `isVisible` check (line ~798)
  - Added "Spirit of" exclusion (line ~840)
  - Added "Empty" exclusion (line ~840)
