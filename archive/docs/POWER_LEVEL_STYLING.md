# Power Level Styling Update

## Changes Made

Updated the visual styling for weapon and armor power levels to differentiate between normal (200 and under) and pinnacle (over 200) power levels.

### Normal Power (≤200)
- **Color:** Pale grey (`#666`)
- **Icon:** No diamond icon displayed
- **Alignment:** Numbers align with pinnacle power numbers

### Pinnacle Power (>200)
- **Color:** Cyan (`#00e8d3`)
- **Icon:** No icon (just shows the number with `+` suffix)
- **Weight:** Bold (900)
- **Display:** Shows as `X +` (e.g., "12 +" for 2012 power level)

## CSS Classes

### Weapon Power
```css
/* Normal power - pale grey, no diamond */
.weapon-power:not(.pinnacle-power) {
  color: #666;
}

.weapon-power:not(.pinnacle-power) .power-icon {
  display: none;
}

/* Pinnacle power - cyan */
.weapon-power.pinnacle-power {
  color: #00e8d3;
  font-weight: 900;
}
```

### Armor Power
```css
/* Normal power - pale grey, no diamond */
.armor-power:not(.pinnacle-power) {
  color: #666;
}

.armor-power:not(.pinnacle-power) .power-icon {
  display: none;
}

/* Pinnacle power - cyan */
.armor-power.pinnacle-power {
  color: #00e8d3;
  font-weight: 900;
}
```

## Visual Examples

### Before
- Normal: 🔶 2000 (gold with diamond)
- Pinnacle: 12 + (cyan)

### After
- Normal: 2000 (pale grey, no diamond)
- Pinnacle: 12 + (cyan)

## Benefits
1. **Cleaner look** for non-pinnacle items
2. **Better visual hierarchy** - pinnacle items stand out
3. **Reduced visual clutter** - fewer icons on screen
4. **Consistent alignment** - all power numbers line up properly

## Files Modified
- `widget/widget.css` - Added new CSS rules for normal vs pinnacle power styling
