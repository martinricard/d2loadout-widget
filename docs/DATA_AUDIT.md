# Data Audit: What's Captured vs. What's Not

**Test Date:** October 7, 2025  
**Tested With:** Marty#2689  
**Backend:** https://d2loadout-widget.onrender.com

---

## ✅ Currently Captured (Future-Proof Ready!)

### **Weapons** (kinetic, energy, power)
- ✅ **Name** - "Mint Retrograde", "Wolfsbane" (exotic)
- ✅ **Icon URL** - Full Bungie.net path
- ✅ **Item Type** - "Pulse Rifle", "Submachine Gun", "Sword"
- ✅ **Tier Type** - "Legendary", "Exotic"
- ✅ **Exotic Detection** - `isExotic: true/false`
- ✅ **Damage Type** - Arc (3), Solar (7)
- ✅ **Power Level** - 474, 472, 475
- ✅ **Weapon Stats** - Range, Stability, Reload Speed, Handling, RPM, Magazine, etc.
- ✅ **Perks** - All equipped perks captured as `plugHash` arrays
  - Example: `[2928496916, 3471392239, 1065371964, 1563455254, 496047945]`
  - **STATUS:** Hash IDs only (names not yet fetched)

### **Armor** (helmet, arms, chest, legs, classItem)
- ✅ **Name** - "Lustrous Cover", "Solipsism" (exotic class item)
- ✅ **Icon URL** - Full Bungie.net path
- ✅ **Item Type** - "Helmet", "Gauntlets", "Chest Armor", "Leg Armor", "Warlock Bond"
- ✅ **Tier Type** - "Legendary", "Exotic"
- ✅ **Exotic Detection** - Class item detected as exotic!
- ✅ **Power Level** - 417, 451, 200, 438, 475
- ✅ **Armor Stats** - Mobility, Resilience, Recovery, Discipline, Intellect, Strength (per piece)
- ✅ **Mods** - All equipped mods captured as `plugHash` arrays in perks
  - Example: `[350061697, 2414626352, 2414626352, 2414626352, 2653012761]`
  - **STATUS:** Hash IDs only (names not yet fetched)
- ✅ **Energy Info** - Type (Arc/Solar/Void/Stasis/Strand), capacity, used, unused
  - Example: `energyCapacity: 11, energyUsed: 10, energyUnused: 1`

### **Subclass** ⭐
- ✅ **Name** - "Prismatic Warlock"
- ✅ **Icon URL** - Full Bungie.net path
- ✅ **Item Type** - "Warlock Subclass"
- ✅ **Damage Type** - 0 (Prismatic doesn't have single element)
- ✅ **Aspects & Fragments** - All captured in perks array!
  - Example: `[1444664836, 5333293, 1869939005, 3644045870, 3994381207]`
  - These are the equipped aspects and fragments
  - **STATUS:** Hash IDs only (names not yet fetched)
- ✅ **Super** - Captured in primary stat (Recovery = 10)
- ✅ **Energy Info** - Prismatic energy type (5), capacity, usage

### **Stats** (aggregated)
- ✅ **Total Stats** - Calculated across all armor pieces
  - Mobility: 76
  - Resilience: 82
  - Recovery: 51
  - Discipline: 110
  - Intellect: 141
  - Strength: 22

### **Character Info**
- ✅ **Class** - "Warlock"
- ✅ **Light Level** - 425
- ✅ **Emblem** - (captured in character data)
- ✅ **Display Name** - "Marty"

---

## 🔧 What Needs Enhancement

### **Perk/Mod Names**
- **Current:** Hash IDs only (`plugHash: 2928496916`)
- **Needed:** Fetch names from manifest
  - Example: `{ hash: 2928496916, name: "Rangefinder", icon: "..." }`
- **Impact:** Critical for displaying readable perk lists

### **Aspect & Fragment Names**
- **Current:** Hash IDs in subclass perks (`plugHash: 1444664836`)
- **Needed:** Fetch aspect/fragment names and icons from manifest
  - Example: `{ hash: 1444664836, name: "Feed the Void", type: "aspect", icon: "..." }`
- **Impact:** Critical for subclass build visualization

### **Weapon Masterwork**
- **Current:** Not explicitly separated
- **Potential:** May be in perks array, needs investigation
- **Impact:** Medium priority for build optimization

### **Armor Artifice Slot**
- **Current:** Not explicitly tracked
- **Potential:** May be detectable via special mod socket
- **Impact:** Low priority, nice-to-have for hardcore players

---

## ❌ Not Currently Captured (API Limitations)

### **Artifact Mods** 🚫
- **Status:** NOT available in character equipment API
- **Reason:** Seasonal artifact is a separate progression system, not part of character inventory
- **Workaround:** Would need separate artifact progression API call
- **Priority:** Low - changes every season, not part of "loadout"

### **Equipped Emotes/Finishers** 🚫
- **Status:** NOT in equipment API
- **Reason:** Cosmetic items in separate API endpoint
- **Priority:** Very Low - not relevant to build display

### **Ghost/Ship/Sparrow** 🚫
- **Status:** Available in inventory API but not in equipment
- **Reason:** Not part of combat loadout
- **Priority:** Very Low - cosmetic only

---

## 🎯 Future-Proof Assessment

### **Excellent Coverage For:**
1. ✅ **Loadout Sharing** - All combat-relevant equipment captured
2. ✅ **Build Optimization** - Stats, exotics, subclass fully available
3. ✅ **PvP/PvE Builds** - Weapons, armor, subclass complete
4. ✅ **Fashion Display** - Icons and exotic highlighting possible
5. ✅ **Stat Tracking** - Full stat breakdown available

### **Ready to Display When Needed:**
- **Weapon Perks** - Just need to fetch names from manifest (hash IDs captured)
- **Armor Mods** - Just need to fetch names from manifest (hash IDs captured)
- **Aspects/Fragments** - Just need to fetch names from manifest (hash IDs captured)
- **Energy Levels** - Already captured, can show which armor can slot more mods
- **Exotic Perks** - Intrinsic exotic perks are in the perks array

### **Enhancement Priority:**
1. **HIGH:** Fetch perk/mod/aspect/fragment names from manifest
2. **HIGH:** Add perk/mod icons to display
3. **MEDIUM:** Separate aspects vs fragments in subclass
4. **MEDIUM:** Identify masterwork perks
5. **LOW:** Artifact mods (separate API call needed)
6. **LOW:** Armor artifice detection

---

## 💡 Recommendation

**Your system is HIGHLY future-proof!** 🎉

All essential loadout data is captured:
- Weapons with perks ✅
- Armor with mods ✅
- Subclass with aspects/fragments ✅
- Exotic detection ✅
- Stats ✅

The only limitation is that perk/mod/aspect names are currently hash IDs. This is **easily solvable** by enhancing the manifest fetching system (similar to how we fetch weapon/armor names).

**You can display everything when you're ready** - the data is there, it just needs name translation!

---

## 🚀 Next Steps (When Ready)

1. **Phase 1:** Enhance manifest system to fetch perk definitions
2. **Phase 2:** Add aspect/fragment definitions
3. **Phase 3:** Add perk/mod icons to widget
4. **Phase 4:** Create "detailed view" toggle to show perks
5. **Phase 5:** Add subclass aspect/fragment display

**Current Focus:** Get widget live with weapons/armor/stats/subclass, then iterate! 🎨
