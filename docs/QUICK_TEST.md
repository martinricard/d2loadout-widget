# Quick Test Guide - Layout Switching

## How to Test Right Now

### Step 1: Open Widget Files in Browser
1. Open `widget.html` in a browser
2. Open browser DevTools (F12)
3. Go to Console tab

### Step 2: Manually Test Layout Switching

**Run these commands in console:**

```javascript
// Test COMPACT layout (your mockup)
document.querySelector('.widget-container').className = 'widget-container layout-compact';
console.log('✅ COMPACT layout applied');

// Test STANDARD layout (wide horizontal)
document.querySelector('.widget-container').className = 'widget-container layout-standard';
console.log('✅ STANDARD layout applied');

// Test FULL layout (everything visible)
document.querySelector('.widget-container').className = 'widget-container layout-full';
console.log('✅ FULL layout applied');
```

### Step 3: Check What's Visible

**After each layout change, check:**

```javascript
// Check which sections are visible
const sections = ['weapons', 'armor', 'stats', 'subclass', 'artifact'];
sections.forEach(s => {
  const el = document.getElementById(`${s}Section`);
  const display = window.getComputedStyle(el).display;
  console.log(`${s}: ${display !== 'none' ? '✅ VISIBLE' : '❌ HIDDEN'}`);
});
```

## Expected Results

### COMPACT Layout
```
✅ Weapons: VISIBLE (2 columns)
❌ Armor: HIDDEN
✅ Stats: VISIBLE (2×3 grid)
✅ Subclass: VISIBLE
✅ Artifact: VISIBLE
```

### STANDARD Layout
```
✅ Weapons: VISIBLE (vertical)
✅ Armor: VISIBLE (2×3 grid)
✅ Stats: VISIBLE (horizontal 1×6)
✅ Subclass: VISIBLE
❌ Artifact: HIDDEN
```

### FULL Layout
```
✅ Weapons: VISIBLE
✅ Armor: VISIBLE
✅ Stats: VISIBLE (6 columns)
✅ Subclass: VISIBLE
✅ Artifact: VISIBLE
```

## Visual Indicators

### Check Width
```javascript
// Get current width
const width = document.querySelector('.widget-container').offsetWidth;
console.log(`Width: ${width}px`);

// Expected:
// Compact: ~900px
// Standard: ~1400px
// Full: ~1200px
```

### Check Grid Structure
```javascript
// Get grid columns
const grid = window.getComputedStyle(document.querySelector('.widget-container'));
console.log('Grid columns:', grid.gridTemplateColumns);

// Expected:
// Compact: "1fr 1fr 1fr"
// Standard: "auto 1px auto 1px auto 1px auto"
// Full: "1fr 1fr"
```

## StreamElements Test

### In Widget Settings
1. Find **"Widget Size"** dropdown
2. Try each option:
   - **Compact** → Should show mockup layout
   - **Standard** → Should show wide horizontal
   - **Full** → Should show everything

### Verify in Preview
Watch the widget container change instantly when you select different options.

## Debugging

### If Layout Doesn't Change
```javascript
// Check if class is applied
console.log('Container classes:', 
  document.querySelector('.widget-container').className
);

// Should show: "widget-container layout-compact" (or -standard/-full)
```

### If Sections Don't Show/Hide
```javascript
// Check computed display values
document.querySelectorAll('[id$="Section"]').forEach(el => {
  const style = window.getComputedStyle(el);
  console.log(el.id, 'display:', style.display, 'grid-column:', style.gridColumn);
});
```

### If Aspects/Fragments Missing
```javascript
// Check if containers exist and have content
console.log('Aspects container:', document.getElementById('aspectsContainer'));
console.log('Aspects grid children:', 
  document.getElementById('aspectsGrid').children.length
);

// If 0 children → No data from backend yet
// If >0 but not visible → Check display style
```

## Common Issues

### Issue: "All layouts look the same"
**Fix:** Clear browser cache, reload page

### Issue: "Aspects/fragments still hidden"
**Check:**
```javascript
// Should NOT have display:none inline style
console.log(document.getElementById('aspectsContainer').style.display);
// Should be empty string "" (not "none")
```

### Issue: "Artifact section never shows"
**Check:**
```javascript
// In Compact or Full layout:
const style = window.getComputedStyle(document.getElementById('artifactSection'));
console.log('Artifact display:', style.display);
// Should be "block" in compact/full, "none" in standard
```

## Success Criteria

✅ **Layout switching works** - Changing widgetSize updates grid
✅ **Compact matches mockup** - 3 columns, weapons split, artifact visible
✅ **Standard is wide** - 4 sections horizontal with dividers
✅ **Full shows all** - 2 columns with all sections
✅ **Aspects visible** - When data exists, they appear
✅ **Fragments visible** - When data exists, they appear  
✅ **Artifact toggles** - Shows in compact/full, hides in standard

## Next Steps After Testing

1. If layouts work locally → Upload to StreamElements
2. If aspects/fragments appear → Backend is working
3. If switching works → Fields.json is configured correctly
4. If sizes look good → Ready for production

## Quick Commands Reference

```javascript
// Switch layouts
document.querySelector('.widget-container').className = 'widget-container layout-compact';
document.querySelector('.widget-container').className = 'widget-container layout-standard';
document.querySelector('.widget-container').className = 'widget-container layout-full';

// Check visibility
['weapons', 'armor', 'stats', 'subclass', 'artifact'].forEach(s => 
  console.log(s, window.getComputedStyle(document.getElementById(s+'Section')).display)
);

// Check data
console.log('Aspects:', document.getElementById('aspectsGrid').children.length);
console.log('Fragments:', document.getElementById('fragmentsGrid').children.length);
console.log('Artifact mods:', document.getElementById('championModsGrid').children.length);

// Force fetch data (if already loaded)
fetchLoadout();
```
