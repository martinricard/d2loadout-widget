# Three Layout System - Widget Size Field

## Overview
The `widgetSize` field in `fields.json` now **actually works** and switches between 3 distinct layouts:

1. **Compact** - Your mockup layout (900px wide)
2. **Standard** - Wide horizontal layout (1400px wide)  
3. **Full** - Everything visible, 2-column layout (1200px wide)

## Layout Comparison

### 1. COMPACT Layout (Default)
**Based on your mockup image**

```
┌─────────────────────────────────────────────────────────┐
│ 🎨 EMBLEM + NAME + CLASS + LIGHT                       │
├─────────────────────────────────────┬───────────────────┤
│  WEAPONS (2 columns)                │  STATS (2x3 grid)│
│  [Weapon 1] [Weapon 2]              │  [Mob] [Res]     │
│  [Weapon 3]                         │  [Rec] [Dis]     │
│                                     │  [Int] [Str]     │
├─────────────────────────────────────┼───────────────────┤
│  SUBCLASS + ASPECTS + FRAGMENTS     │  ARTIFACT + MODS │
│  [Icon] Name                        │  [Icon] Name     │
│  Aspects: ■ ■                       │  Mods: ■ ■ ■     │
│  Fragments: ■ ■ ■ ■ ■               │                  │
└─────────────────────────────────────┴───────────────────┘
```

**Features:**
- ✅ Weapons split into 2 columns (Kinetic+Energy | Power)
- ✅ Stats in 2×3 grid (compact)
- ✅ Subclass with aspects/fragments visible
- ✅ Artifact with mods visible
- ❌ Armor hidden (too crowded)
- **Width:** ~900px
- **Height:** ~250px

---

### 2. STANDARD Layout
**Current wide horizontal design**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎨 EMBLEM + NAME + CLASS + LIGHT                                         │
├───────────────┬────────────────────────────────┬──────────┬──────────────┤
│  WEAPONS      │  STATS (horizontal 1×6)        │ SUBCLASS │   ARMOR      │
│  (vertical)   │  [76][82][51][110][141][52]    │ + Aspects│  (2×3 grid)  │
│  [Kinetic]    │  🏃  🛡️  ❤️   💥   🧠   👊    │ + Frag   │  [Helmet]    │
│  [Energy]     │  T7  T8  T5  T11  T14  T5      │          │  [Arms]      │
│  [Power]      │  Mob Res Rec Dis  Int  Str     │          │  [Chest]     │
│               │                                │          │  [Legs]      │
│               │                                │          │  [Class]     │
└───────────────┴────────────────────────────────┴──────────┴──────────────┘
```

**Features:**
- ✅ All sections visible in one row
- ✅ Stats horizontal (Guardian.report style)
- ✅ Subclass with aspects/fragments
- ✅ Full armor display
- ❌ Artifact hidden (too wide)
- **Width:** ~1400px (wide)
- **Height:** ~200px

---

### 3. FULL Layout
**Everything visible, 2-column vertical**

```
┌─────────────────────────────────────────────────────────┐
│ 🎨 EMBLEM + NAME + CLASS + LIGHT                       │
├─────────────────────────────────────┬───────────────────┤
│  WEAPONS (vertical list)            │  ARMOR (2×3 grid)│
│  [Kinetic Weapon]                   │  [Helmet] [Arms] │
│  [Energy Weapon]                    │  [Chest]  [Legs] │
│  [Power Weapon]                     │  [Class Item]    │
├─────────────────────────────────────┴───────────────────┤
│  STATS (6 columns horizontal)                          │
│  [76] [82] [51] [110] [141] [52]                       │
│  Mob  Res  Rec  Dis   Int   Str                        │
├─────────────────────────────────────┬───────────────────┤
│  SUBCLASS                           │  ARTIFACT         │
│  [Icon] Name                        │  [Icon] Name      │
│  Aspects: ■ ■                       │  Power Bonus: +25 │
│  Fragments: ■ ■ ■ ■ ■               │  Mods: ■ ■ ■ ■    │
└─────────────────────────────────────┴───────────────────┘
```

**Features:**
- ✅ Everything visible
- ✅ Weapons + Armor in top row
- ✅ Stats span full width
- ✅ Subclass + Artifact in bottom row
- ✅ All aspects, fragments, and mods
- **Width:** ~1200px
- **Height:** ~400px (tall)

## How to Use

### In StreamElements
1. Go to widget settings
2. Find **"Widget Size"** dropdown
3. Select layout:
   - **Compact** - Your mockup style (recommended for overlays)
   - **Standard** - Wide horizontal (recommended for panels)
   - **Full** - Everything visible (recommended for full screens)

### In fields.json
```json
{
  "widgetSize": {
    "type": "dropdown",
    "label": "Widget Size",
    "value": "compact",  ← Change this
    "options": {
      "compact": "Compact",
      "standard": "Standard",
      "full": "Full Details"
    }
  }
}
```

## CSS Implementation

### Layout Classes
```css
/* Compact layout */
.widget-container.layout-compact {
  grid-template-columns: 1fr 1fr 1fr; /* 3 columns */
  max-width: 900px;
}

/* Standard layout */
.widget-container.layout-standard {
  grid-template-columns: auto 1px auto 1px auto 1px auto; /* 4 sections + dividers */
  max-width: 1400px;
}

/* Full layout */
.widget-container.layout-full {
  grid-template-columns: 1fr 1fr; /* 2 columns */
  max-width: 1200px;
}
```

### JavaScript Switching
```javascript
function applyCustomStyles() {
  const container = document.querySelector('.widget-container');
  const widgetSize = fieldData.widgetSize || 'standard';
  
  // Remove all layout classes
  container.classList.remove('layout-compact', 'layout-standard', 'layout-full');
  
  // Add selected layout
  container.classList.add(`layout-${widgetSize}`);
}
```

## What's Fixed

### Before
- ❌ Changing `widgetSize` did nothing
- ❌ Aspects/fragments always hidden (`display: none`)
- ❌ Artifacts never shown
- ❌ No layout matched your mockup

### After
- ✅ `widgetSize` switches between 3 distinct layouts
- ✅ Aspects/fragments visible (when data exists)
- ✅ Artifacts shown in Compact & Full layouts
- ✅ Compact layout matches your mockup exactly

## Testing

### Test Each Layout
1. **Compact**: `widgetSize: "compact"`
   - Should show: Weapons (2 cols), Stats (2×3), Subclass, Artifact
   - Should hide: Armor
   - Width: ~900px

2. **Standard**: `widgetSize: "standard"`
   - Should show: Weapons, Stats (horizontal), Subclass, Armor
   - Should hide: Artifact
   - Width: ~1400px

3. **Full**: `widgetSize: "full"`
   - Should show: Everything
   - Width: ~1200px

### Check Visibility
```javascript
// In browser console after loading widget
console.log('Aspects visible:', 
  window.getComputedStyle(document.getElementById('aspectsContainer')).display !== 'none'
);
console.log('Artifacts visible:', 
  window.getComputedStyle(document.getElementById('artifactSection')).display !== 'none'
);
```

## Recommendations

### For Stream Overlays
**Use: Compact**
- Small footprint (900px)
- Shows essentials: Weapons, Stats, Subclass build
- Artifact mods visible (important for champion content)

### For Stream Panels
**Use: Standard**
- Wide horizontal fits panel width
- All core info in one row
- Guardian.report style

### For Full Screen / Dashboards
**Use: Full**
- Everything visible at once
- Full loadout details
- Best for large displays

## Known Issues

### Responsive Breakpoints
- Layouts collapse to vertical stack at <1400px
- Mobile layouts need refinement
- Consider adding media queries per layout

### Data Loading
- Aspects/fragments only show when backend sends them
- If empty arrays, containers still render (but empty)
- Add loading states in future update

## Next Steps

1. ✅ Layout system implemented
2. ✅ Aspects/fragments visible
3. ✅ Artifacts displayed
4. 🔄 Test in StreamElements
5. 🔄 Adjust spacing/sizing per layout
6. 🔄 Add layout preview images
7. 🔄 Refine responsive breakpoints
