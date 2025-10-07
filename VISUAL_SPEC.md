# D2 Loadout Widget - Visual Design Specification

Based on Guardian.report loadout view: https://guardian.report/?view=LOADOUT&guardians=4611686018467484767

## 🎨 Guardian.report Loadout Layout Analysis

### Full Loadout Display Structure

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  CHARACTER HEADER                                           ┃
┃  [Emblem Background]                                        ┃
┃  Guardian Name | Class Icon | Light Level                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  WEAPONS SECTION                                            ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │ [Kinetic Icon] Weapon Name                         │   ┃
┃  │ Weapon Type | Archetype | Power Level             │   ┃
┃  │ ○ Perk 1   ○ Perk 2   ○ Perk 3   ○ Perk 4        │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │ [Energy Icon] Weapon Name (Solar/Arc/Void)        │   ┃
┃  │ Weapon Type | Archetype | Power Level             │   ┃
┃  │ ○ Perk 1   ○ Perk 2   ○ Perk 3   ○ Perk 4        │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │ [Power Icon] Weapon Name                           │   ┃
┃  │ Weapon Type | Archetype | Power Level             │   ┃
┃  │ ○ Perk 1   ○ Perk 2   ○ Perk 3   ○ Perk 4        │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ARMOR SECTION                                              ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │ [Helmet Icon] Armor Name                  [Element]│   ┃
┃  │ Power Level | Energy Tier                          │   ┃
┃  │ MOB:12 RES:10 REC:12 DIS:10 INT:10 STR:10        │   ┃
┃  │ ◉ Mod 1   ◉ Mod 2   ◉ Mod 3   ◉ Mod 4           │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┃  [Repeat for Arms, Chest, Legs, Class Item]              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  TOTAL STATS                                                ┃
┃  Mobility:     ████████░░ 82 (T8)  💡 +10 from mods      ┃
┃  Resilience:   ██████████ 100 (T10) 💡 +20 from mods     ┃
┃  Recovery:     ███████░░░ 72 (T7)                         ┃
┃  Discipline:   ██████░░░░ 64 (T6)                         ┃
┃  Intellect:    █████░░░░░ 54 (T5)                         ┃
┃  Strength:     ████░░░░░░ 42 (T4)                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  SUBCLASS                                                   ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │ [Subclass Icon] Subclass Name (Solar/Arc/Void)     │   ┃
┃  │                                                     │   ┃
┃  │ SUPER: [Icon] Super Name                           │   ┃
┃  │                                                     │   ┃
┃  │ ASPECTS:                                           │   ┃
┃  │ ◆ Aspect 1 Name (+ description)                   │   ┃
┃  │ ◆ Aspect 2 Name (+ description)                   │   ┃
┃  │                                                     │   ┃
┃  │ FRAGMENTS:                                         │   ┃
┃  │ ◇ Fragment 1 (+stat bonuses)                      │   ┃
┃  │ ◇ Fragment 2 (+stat bonuses)                      │   ┃
┃  │ ◇ Fragment 3 (+stat bonuses)                      │   ┃
┃  │ ◇ Fragment 4 (+stat bonuses)                      │   ┃
┃  │                                                     │   ┃
┃  │ ABILITIES:                                         │   ┃
┃  │ Grenade: [Icon] Name                              │   ┃
┃  │ Melee: [Icon] Name                                │   ┃
┃  │ Class Ability: [Icon] Name                        │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  GHOST, SPARROW, SHIP (Optional)                           ┃
┃  [Ghost Icon]   [Sparrow Icon]   [Ship Icon]              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## 📋 Detailed Component Breakdown

### 1. Character Header
**Data to Display**:
- Guardian Name (e.g., "Marty#2689")
- Class Icon (Hunter/Titan/Warlock symbol)
- Emblem background image
- Overall Power Level (e.g., "1850")
- Last Active timestamp (optional)

**Visual Style**:
- Large emblem as background
- Text overlay with character name
- Class icon prominently displayed
- Power level in large, bold text

---

### 2. Weapons Section (3 Cards)

#### Per Weapon Card:
**Primary Info**:
- Weapon icon/image (large, 64x64px or bigger)
- Weapon name (with exotic gold coloring if exotic)
- Weapon type (e.g., "Hand Cannon", "Scout Rifle")
- Archetype (e.g., "Precision Frame", "Aggressive Frame")
- Power Level
- Element indicator (Solar/Arc/Void/Stasis/Strand icon)

**Perks Display** (2-4 perks per weapon):
- Selected perk icons
- Perk names on hover
- Active perk columns highlighted

**Masterwork**:
- Masterwork stat (+10 Range, etc.)
- Kill tracker (optional)

**Example**:
```
┌─────────────────────────────────────────┐
│ [🔫 Icon] Ace of Spades          1850 ⚫│
│ Hand Cannon | 140 RPM                   │
│ ○ Firefly  ○ Memento Mori  ○ Outlaw   │
│ Masterwork: Range +10                   │
└─────────────────────────────────────────┘
```

---

### 3. Armor Section (5 Cards)

#### Per Armor Piece:
**Primary Info**:
- Armor icon/image
- Armor name (exotic gold if exotic)
- Power Level
- Element (Solar/Arc/Void/Stasis/Strand)
- Energy capacity (e.g., "10 energy")

**Individual Stats**:
```
MOB: 12  RES: 10  REC: 12
DIS: 10  INT: 10  STR: 10
```

**Mods Equipped** (up to 5 per piece):
- Mod icons
- Mod names
- Mod costs (energy)

**Example**:
```
┌─────────────────────────────────────────┐
│ [🪖 Icon] Celestial Nighthawk    1850 ☀│
│ Exotic Helmet | Solar | 10 Energy      │
│ MOB:12 RES:2 REC:22 DIS:2 INT:12 STR:14│
│ ◉ Ashes to Assets  ◉ Heavy Ammo Finder│
└─────────────────────────────────────────┘
```

---

### 4. Total Stats Display

**Format**:
```
Mobility:     82/100  ████████░░  T8  💡 +10 from mods
Resilience:  100/100  ██████████  T10 💡 +20 from mods
Recovery:     72/100  ███████░░░  T7
Discipline:   64/100  ██████░░░░  T6
Intellect:    54/100  █████░░░░░  T5
Strength:     42/100  ████░░░░░░  T4
```

**Visual Elements**:
- Stat name
- Current value / Max value
- Visual bar (filled based on percentage)
- Tier indicator (T1-T10)
- Bonus indicator (from mods/fragments)

**Color Coding**:
- Mobility: Green (#6B9080)
- Resilience: Blue (#4A7BA7)
- Recovery: Red (#C14953)
- Discipline: Orange (#E77C2F)
- Intellect: Purple (#8777AF)
- Strength: Yellow (#D9B235)

---

### 5. Subclass Section

**Super Display**:
- Subclass icon (large)
- Subclass name
- Damage type icon (Solar/Arc/Void/Stasis/Strand)
- Super ability name
- Super icon

**Aspects** (usually 2):
```
◆ Touch of Thunder
  Improves Arc grenades and grants an additional charge
```

**Fragments** (up to 4-5):
```
◇ Spark of Shock (+10 Recovery)
  Jolts targets on melee hit
```

**Abilities**:
- Grenade type & icon
- Melee type & icon
- Class ability type & icon

---

## 🎨 Color Scheme & Styling

### Damage Type Colors
```css
.kinetic { color: #8B8B8B; }
.solar { color: #F8731D; background: linear-gradient(135deg, #F8731D, #FF9C42); }
.arc { color: #85C5EC; background: linear-gradient(135deg, #85C5EC, #A0D8F4); }
.void { color: #B084CC; background: linear-gradient(135deg, #B084CC, #C89FE0); }
.stasis { color: #4D88FF; background: linear-gradient(135deg, #4D88FF, #6BA0FF); }
.strand { color: #00B894; background: linear-gradient(135deg, #00B894, #00D2A0); }
```

### Rarity Colors
```css
.exotic { 
  border: 2px solid #CEAE33;
  box-shadow: 0 0 10px rgba(206, 174, 51, 0.5);
}
.legendary { border: 2px solid #522F65; }
.rare { border: 2px solid #5076A3; }
.uncommon { border: 2px solid #366F42; }
.common { border: 2px solid #C3BCAF; }
```

### Layout Styling
```css
.loadout-container {
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
}

.item-card {
  background: rgba(30, 30, 30, 0.9);
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
  transition: all 0.3s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.stat-bar {
  height: 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  transition: width 0.5s ease;
}
```

---

## 📊 Data Requirements from Bungie API

### For Each Weapon:
```javascript
{
  itemHash: 347366834,
  itemInstanceId: "6917529...",
  name: "Ace of Spades",
  icon: "/common/destiny2_content/icons/...",
  type: "Hand Cannon",
  damageType: "Kinetic",
  powerLevel: 1850,
  tierType: 6, // Exotic
  perks: [
    { name: "Firefly", icon: "...", selected: true },
    { name: "Memento Mori", icon: "...", selected: true }
  ],
  masterwork: { stat: "Range", value: 10 }
}
```

### For Each Armor Piece:
```javascript
{
  itemHash: 2489664775,
  itemInstanceId: "6917529...",
  name: "Celestial Nighthawk",
  icon: "/common/destiny2_content/icons/...",
  slot: "Helmet",
  damageType: "Solar",
  powerLevel: 1850,
  tierType: 6, // Exotic
  energy: { capacity: 10, used: 8 },
  stats: {
    mobility: 12,
    resilience: 2,
    recovery: 22,
    discipline: 2,
    intellect: 12,
    strength: 14
  },
  mods: [
    { name: "Ashes to Assets", icon: "...", cost: 3 },
    { name: "Heavy Ammo Finder", icon: "...", cost: 3 }
  ]
}
```

### For Subclass:
```javascript
{
  name: "Gunslinger",
  damageType: "Solar",
  icon: "/common/destiny2_content/icons/...",
  super: {
    name: "Golden Gun - Marksman",
    icon: "..."
  },
  aspects: [
    { name: "Touch of Flame", description: "...", icon: "..." },
    { name: "Knock 'Em Down", description: "...", icon: "..." }
  ],
  fragments: [
    { name: "Ember of Torches", description: "...", stats: { strength: 10 }, icon: "..." },
    { name: "Ember of Singeing", description: "...", stats: { discipline: -10 }, icon: "..." }
  ],
  abilities: {
    grenade: { name: "Incendiary Grenade", icon: "..." },
    melee: { name: "Knife Trick", icon: "..." },
    classAbility: { name: "Marksman's Dodge", icon: "..." }
  }
}
```

---

## 🎯 Widget Size Recommendations

### Compact Mode (For small overlays)
- **Dimensions**: 400px × 600px
- **Shows**: Weapons + Armor icons only + Stats
- **Hides**: Perks, mods, fragments

### Standard Mode (Recommended)
- **Dimensions**: 600px × 800px
- **Shows**: All weapons, armor, stats, subclass basics
- **Hides**: Detailed descriptions

### Full Mode (For dedicated scenes)
- **Dimensions**: 800px × 1200px
- **Shows**: Everything including perks, mods, aspects, fragments
- **Best for**: "Build showcase" stream scenes

---

## 🔄 Update Strategy

**Refresh Intervals**:
- **Active Gameplay**: Every 30-60 seconds
- **Orbit/Menu**: Every 2-5 minutes
- **Manual Refresh**: Button in widget settings

**Change Detection**:
- Highlight changed items in yellow for 3 seconds
- Animate stat changes
- Show "Updated X seconds ago" timestamp

---

**This specification matches Guardian.report's comprehensive loadout view!** 🎮✨

Use this as your design reference when building the widget UI.
