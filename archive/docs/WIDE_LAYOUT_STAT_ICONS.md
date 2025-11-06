# Wide Layout + Real Stat Icons Update

## Overview
Transformed the widget from a tall vertical layout to a **wide horizontal layout** matching Guardian.report style, and implemented **real Destiny 2 stat icons** from Bungie CDN.

## Layout Changes

### Before: Tall & Stacked
```
Stats Section: 2x3 grid (vertical)
- Mobility    Resilience
- Recovery    Discipline  
- Intellect   Strength
```

### After: Wide & Horizontal
```
Stats Section: 1x6 row (horizontal)
┌──────┬──────┬──────┬──────┬──────┬──────┐
│ MOB  │ RES  │ REC  │ DIS  │ INT  │ STR  │
│ [76] │ [82] │ [51] │ [110]│ [141]│ [22] │
│  T7  │  T8  │  T5  │  T11 │  T14 │  T2  │
└──────┴──────┴──────┴──────┴──────┴──────┘
```

## CSS Changes

### Stats Grid - Horizontal Layout
```css
.stats-grid {
  display: flex;
  flex-direction: row;  /* Was: grid with 2 columns */
  gap: 8px;
  flex-wrap: nowrap;    /* All in one row */
}

.stat-row {
  display: flex;
  flex-direction: column;  /* Value on top, icon in middle, tier on bottom */
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  min-width: 55px;
}
```

### Stats Section Width
```css
.stats-section {
  min-width: 400px;  /* Wide enough for 6 stats side-by-side */
}
```

### Stat Display Order
```css
.stat-value {
  order: -1;  /* Value appears first (top) */
  font-size: 1.1em;
  font-weight: 700;
}

.stat-icon {
  /* Icon in middle */
  width: 20px;
  height: 20px;
  background-size: contain;
}

.stat-tier {
  /* Tier last (bottom) */
  font-size: 0.65em;
}
```

### Stat Label
```css
.stat-label {
  display: flex;
  flex-direction: column;  /* Stack icon and name vertically */
  align-items: center;
  gap: 2px;
}

.stat-name {
  font-size: 0.7em;
  opacity: 0.7;
}
```

## Real Stat Icons Implementation

### JavaScript - Stat Icon URLs
```javascript
const statIconUrls = {
  'Mobility': 'https://www.bungie.net/common/destiny2_content/icons/e26e0e93a9daf4fdd21bf64eb9246340.png',
  'Resilience': 'https://www.bungie.net/common/destiny2_content/icons/202ecc1c6febeb6b97dafc856e863140.png',
  'Recovery': 'https://www.bungie.net/common/destiny2_content/icons/47d01c62ab3b20174d57e133ccafa592.png',
  'Discipline': 'https://www.bungie.net/common/destiny2_content/icons/ca62128071dc254fe75891211b98b237.png',
  'Intellect': 'https://www.bungie.net/common/destiny2_content/icons/d1484e6b82d80c29b3d3fffa52453399.png',
  'Strength': 'https://www.bungie.net/common/destiny2_content/icons/c7eefc8abbaa586eeab79e962a79d6ad.png'
};
```

### Icon Application
```javascript
// Update icon with actual Bungie icon
const iconElement = document.querySelector(`.stat-icon.${statName.toLowerCase()}`);
if (iconElement && statIconUrls[statName]) {
  iconElement.style.backgroundImage = `url('${statIconUrls[statName]}')`;
  iconElement.textContent = '';  // Clear emoji fallback
}
```

### CSS - Icon Styling
```css
.stat-icon {
  width: 20px;
  height: 20px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.9;
}

/* Emoji fallbacks (if icon fails to load) */
.stat-icon.mobility::before { content: '⚡'; }
.stat-icon.resilience::before { content: '🛡️'; }
.stat-icon.recovery::before { content: '❤️'; }
.stat-icon.discipline::before { content: '💥'; }
.stat-icon.intellect::before { content: '🧠'; }
.stat-icon.strength::before { content: '👊'; }
```

## Widget Dimensions

### Updated Max Width
```css
.widget-container {
  max-width: 1400px;  /* Was: 1200px */
}
```

### Section Widths
- **Weapons:** 280px (3 items vertical)
- **Stats:** 400px (6 items horizontal) ⭐ NEW
- **Subclass:** 140px (compact)
- **Armor:** 240px (2x3 grid)

### Total Estimated Width
~800-900px wide × ~180-200px tall

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ WHITE HEADER: MARTY • Warlock • 425 ⚡                              │
├─────────────┬─────────────────────────────┬──────────┬──────────────┤
│  WEAPONS    │          STATS              │ SUBCLASS │    ARMOR     │
│             │                             │          │              │
│ [Icon]      │ [76] [82] [51] [110][141][22]│ [Icon]  │ [Icon][Icon] │
│ Mint Retro  │  🏃   🛡️   ❤️   💥  🧠   👊 │ Prismatic│ [Icon][Icon] │
│ Pulse Rifle │  T7   T8   T5  T11  T14  T2 │          │ [Icon]       │
│        474  │ Mob  Res  Rec  Dis  Int  Str│ ASPECTS  │              │
│             │                             │ ■ ■      │              │
│ [Icon]      │                             │ FRAGMENTS│              │
│ Yeartide    │                             │ ■ ■ ■ ■ ■│              │
│ SMG    472  │                             │          │              │
│             │                             │          │              │
│ [Icon]      │                             │          │              │
│ Wolfsbane   │                             │          │              │
│ Sword  475  │                             │          │              │
└─────────────┴─────────────────────────────┴──────────┴──────────────┘
```

## Stat Icon Sources

### From Bungie Manifest
All stat icons are from the official Bungie CDN at:
```
https://www.bungie.net/common/destiny2_content/icons/
```

### Icon Hash Reference
These are extracted from `DestinyStatDefinition` in the Bungie API manifest:

| Stat | Hash | Icon Hash | 
|------|------|-----------|
| Mobility | 2996146975 | e26e0e93a9daf4fdd21bf64eb9246340 |
| Resilience | 392767087 | 202ecc1c6febeb6b97dafc856e863140 |
| Recovery | 1943323491 | 47d01c62ab3b20174d57e133ccafa592 |
| Discipline | 1735777505 | ca62128071dc254fe75891211b98b237 |
| Intellect | 4244567218 | d1484e6b82d80c29b3d3fffa52453399 |
| Strength | 144602215 | c7eefc8abbaa586eeab79e962a79d6ad |

### Alternative Sources
As mentioned in research:
1. **Destiny Wiki** - Has stat icon images in "Stat Icons" category
2. **Bungie API Manifest** - `DestinyStatDefinition` includes `displayProperties.icon`
3. **data.destinysets.com** - Community mirror with all assets
4. **Light.gg** - Database with extractable icons

## Responsive Behavior

### Desktop (>1400px)
- 4 columns side-by-side
- Stats display as 6-item horizontal row
- Full width layout

### Tablet (<1400px)
- Stacks to vertical layout
- Stats return to 2x3 grid
- Each section gets full width

```css
@media (max-width: 1400px) {
  .widget-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;  /* Back to 2 columns */
  }
}
```

## Benefits

### 1. **Guardian.report Style Match**
- Horizontal stats layout matches reference
- Clean, professional appearance
- Easy to scan at a glance

### 2. **Real D2 Icons**
- Official Bungie icons (not emoji)
- Consistent with in-game appearance
- Better visual quality

### 3. **Stream-Friendly Dimensions**
- Wide format fits better in OBS
- Less vertical space needed
- Can place above/below gameplay

### 4. **Fallback Support**
- Emoji fallbacks if icons fail to load
- CSS `::before` ensures something always shows
- Graceful degradation

## Testing Checklist

- [ ] Stats display in horizontal row (not grid)
- [ ] Real stat icons load from Bungie CDN
- [ ] Emoji fallbacks work if icons fail
- [ ] Values appear above icons
- [ ] Tiers appear below icons
- [ ] Layout is wide (~900px) not tall
- [ ] Responsive breakpoint works (<1400px)
- [ ] All 6 stats visible in one row

## Future Enhancements

### Dynamic Icon Fetching
Instead of hardcoded URLs, could fetch from manifest:
```javascript
// Fetch stat definitions from API
const statDefs = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/DestinyStatDefinition/');
// Extract icon paths dynamically
```

### Icon Caching
Cache icon URLs in localStorage to reduce API calls:
```javascript
const cachedIcons = localStorage.getItem('d2StatIcons');
if (!cachedIcons) {
  // Fetch and cache
}
```

### Custom Icon Upload
Allow users to upload custom stat icons via widget settings:
```javascript
if (fieldData.customStatIcons === 'true') {
  // Use custom uploaded icons
}
```
