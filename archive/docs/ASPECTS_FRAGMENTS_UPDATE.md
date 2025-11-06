# Aspects & Fragments Update

## Overview
Added aspects and fragments display to the subclass section, with very compact Guardian.report-style icons and improved stat icons.

## Backend Changes

### New Function: `processSubclassDetails()`
**Location:** `backend/server.js` (after `processEquipmentItem`)

```javascript
// Process subclass to extract aspects and fragments
async function processSubclassDetails(itemData, itemComponents) {
  // Fetches subclass socket data
  // Categorizes by plugCategoryIdentifier:
  //   - Contains 'aspects' → Aspect
  //   - Contains 'fragments' → Fragment
  // Returns: { ...basicData, aspects: [], fragments: [] }
}
```

**Detection Logic:**
- Aspects: `plugCategory.includes('aspects')` OR `itemTypeDisplayName.includes('Aspect')`
- Fragments: `plugCategory.includes('fragments')` OR `itemTypeDisplayName.includes('Fragment')`

**Data Returned:**
```json
{
  "name": "Weaver's Call",
  "description": "...",
  "icon": "/common/destiny2_content/icons/...",
  "iconUrl": "https://www.bungie.net/common/destiny2_content/icons/...",
  "plugHash": 790664810,
  "itemType": "Strand Aspect | Darkness Ability",
  "category": "warlock.prism.aspects"
}
```

### Updated Function: `processLoadout()`
Changed subclass processing from:
```javascript
subclass ? processEquipmentItem(subclass, itemComponents) : null
```
To:
```javascript
subclass ? processSubclassDetails(subclass, itemComponents) : null
```

## Frontend Changes

### HTML (`widget/widget.html`)

**Updated Subclass Section:**
```html
<div class="subclass-section" id="subclassSection">
  <div class="section-title">Subclass</div>
  <div class="subclass-display">
    <div class="subclass-icon" id="subclassIcon"></div>
    <div class="subclass-info">
      <div class="subclass-name" id="subclassName">-</div>
      <div class="subclass-type" id="subclassType">-</div>
    </div>
  </div>
  
  <!-- Aspects -->
  <div class="aspects-container" id="aspectsContainer" style="display: none;">
    <div class="aspects-label">Aspects</div>
    <div class="aspects-grid" id="aspectsGrid"></div>
  </div>
  
  <!-- Fragments -->
  <div class="fragments-container" id="fragmentsContainer" style="display: none;">
    <div class="fragments-label">Fragments</div>
    <div class="fragments-grid" id="fragmentsGrid"></div>
  </div>
</div>
```

**Updated Stat Icons:**
Changed from inline emoji to CSS classes:
```html
<!-- Before: -->
<span class="stat-icon">🏃</span>

<!-- After: -->
<span class="stat-icon mobility"></span>
```

### CSS (`widget/widget.css`)

**Layout Change:**
- **Before:** 3 columns: `Weapons | Stats | Armor`
- **After:** 4 columns: `Weapons | Stats | Subclass | Armor`

```css
.widget-container {
  grid-template-columns: auto 1px auto 1px auto 1px auto;
}

.subclass-section {
  grid-column: 5;
  grid-row: 2;
  border-right: 1px solid var(--border-color);
  min-width: 180px;
}
```

**Subclass Display - Compact Style:**
```css
.subclass-icon {
  width: 32px;       /* Was 48px */
  height: 32px;
}

.subclass-name {
  font-size: 0.8em;  /* Was 0.95em */
}
```

**Aspects - Guardian.report Style:**
```css
.aspect-item {
  width: 24px;       /* Very small, like Guardian.report */
  height: 24px;
  border-radius: 2px; /* Sharp corners */
  gap: 3px;          /* Tight spacing */
}

.aspect-item:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
```

**Fragments - Even Smaller:**
```css
.fragment-item {
  width: 20px;       /* Smaller than aspects */
  height: 20px;
  border-radius: 2px;
  gap: 3px;
}
```

**Stat Icons:**
```css
.stat-icon {
  width: 14px;
  height: 14px;
  display: inline-block;
}

.stat-icon.mobility::before { content: '⚡'; }
.stat-icon.resilience::before { content: '🛡️'; }
.stat-icon.recovery::before { content: '❤️'; }
.stat-icon.discipline::before { content: '💥'; }
.stat-icon.intellect::before { content: '🧠'; }
.stat-icon.strength::before { content: '👊'; }
```

### JavaScript (`widget/widget.js`)

**Updated `displaySubclass()` Function:**
```javascript
function displaySubclass(subclassData) {
  // Display basic subclass info
  
  // Display aspects
  if (subclassData.aspects && subclassData.aspects.length > 0) {
    aspectsGrid.innerHTML = '';
    subclassData.aspects.forEach(aspect => {
      const aspectDiv = document.createElement('div');
      aspectDiv.className = 'aspect-item';
      aspectDiv.style.backgroundImage = `url('${aspect.iconUrl}')`;
      
      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'aspect-tooltip';
      tooltip.innerHTML = `<div class="aspect-tooltip-name">${aspect.name}</div>`;
      aspectDiv.appendChild(tooltip);
      
      aspectsGrid.appendChild(aspectDiv);
    });
    aspectsContainer.style.display = 'block';
  }
  
  // Display fragments (same pattern)
}
```

## Visual Design

### Size Comparison
| Element | Old Size | New Size | Style |
|---------|----------|----------|-------|
| Subclass Icon | 48×48px | 32×32px | Compact |
| Aspects | 36×36px | 24×24px | Guardian.report |
| Fragments | 28×28px | 20×20px | Guardian.report |
| Aspect Gap | 6px | 3px | Tight |
| Fragment Gap | 4px | 3px | Tight |
| Border Radius | 4px | 2px | Sharp |

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ WHITE HEADER: Marty • Warlock • 1990 Light             │
├──────────┬──────────┬──────────┬──────────────────────┤
│ WEAPONS  │  STATS   │ SUBCLASS │       ARMOR          │
│          │          │          │                      │
│ Kinetic  │ Mob  75  │ [Icon]   │ [Helm] [Arms]        │
│ Energy   │ Res  100 │ Prismatic│ [Chest] [Legs]       │
│ Power    │ Rec  40  │          │ [Class Item]         │
│          │ Dis  80  │ ASPECTS  │                      │
│          │ Int  70  │ ■ ■      │                      │
│          │ Str  50  │          │                      │
│          │          │ FRAGMENTS│                      │
│          │          │ ■ ■ ■ ■ ■│                      │
└──────────┴──────────┴──────────┴──────────────────────┘
```

## Responsive Behavior

**Desktop (>1400px):** 4 columns side-by-side
**Tablet (<1400px):** Stacks vertically (5 rows)
**Mobile (<768px):** Single column layout

```css
@media (max-width: 1400px) {
  .widget-container {
    grid-template-rows: auto auto auto auto auto;
  }
  
  .subclass-section {
    grid-row: 4;
    border-bottom: 1px solid var(--border-color);
  }
}
```

## API Response Example

```json
{
  "loadout": {
    "subclass": {
      "name": "Prismatic Warlock",
      "iconUrl": "https://www.bungie.net/common/destiny2_content/icons/...",
      "aspects": [
        {
          "name": "Weaver's Call",
          "iconUrl": "https://www.bungie.net/...",
          "itemType": "Strand Aspect | Darkness Ability"
        },
        {
          "name": "Hellion",
          "iconUrl": "https://www.bungie.net/...",
          "itemType": "Solar Aspect | Light Ability"
        }
      ],
      "fragments": [
        {
          "name": "Facet of Courage",
          "iconUrl": "https://www.bungie.net/...",
          "itemType": "Prismatic Fragment"
        },
        // ... 4 more fragments
      ]
    }
  }
}
```

## Testing Checklist

- [ ] Backend returns aspects and fragments in subclass data
- [ ] Aspects display as 24×24px icons
- [ ] Fragments display as 20×20px icons
- [ ] Hover tooltips show names
- [ ] Stat icons use CSS classes (not inline emoji)
- [ ] 4-column layout on desktop
- [ ] Responsive stacking on smaller screens
- [ ] Deploy to Render and test live

## Future Enhancements

### For Guardian.report-Style Stat Icons
Instead of emoji, use actual Destiny 2 stat icons:
1. Bungie CDN has stat definition icons
2. Could fetch from manifest: `/Destiny2/Manifest/DestinyStatDefinition/{statHash}/`
3. Add to API response and use as background images

Example:
```javascript
const STAT_ICON_URLS = {
  'Mobility': 'https://www.bungie.net/common/destiny2_content/icons/...',
  'Resilience': 'https://www.bungie.net/common/destiny2_content/icons/...',
  // etc.
};
```

### Armor Mods Display
If we want to show armor mods like Guardian.report:
- Add armor mod extraction from armor piece sockets
- Display in compact row below each armor piece
- 16×16px icons in tight grid

## Notes

- Artifact section remains hidden for compactness
- Guardian.report reference: Very small, tightly packed icons
- Tooltip appears on hover for aspect/fragment names
- All icons load from Bungie CDN (no hosting needed)
- Emoji stat icons are temporary placeholder
