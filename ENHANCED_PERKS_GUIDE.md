# Enhanced Weapon Perks - Implementation Guide

## ✅ Enhanced Perk Indicator Active

### 🎨 Visual Design

**Yellow arrow overlay** appears in top-left corner of perk icons when enhanced.

**SVG Used:** Official enhanced perk icon (proper version)
```
data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'...
```

**CSS Implementation:**
```css
.weapon-perk-icon.enhanced::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,...");
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 10;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
}
```

---

## 🎯 Enhanced Perk Detection Logic

### Weapon Tier System (Edge of Fate)

**Tier 0-indexed in API:**
- `weaponTier: 0` = **Tier 1** (Base weapon, no enhanced)
- `weaponTier: 1` = **Tier 2** (Enhanced perks START here)
- `weaponTier: 2` = **Tier 3** (More enhanced perks)
- `weaponTier: 3` = **Tier 4** (Even more enhanced)
- `weaponTier: 4` = **Tier 5** (All perks enhanced)

### Detection Rules

Enhanced indicator shows when:
1. ✅ `perk.isEnhanced === true` (API flag)
2. ✅ OR weapon is **Tier 2+** (`weaponTier >= 1`)
3. ❌ NOT on weapon mods (`perk.isMod === false`)

### JavaScript Logic

```javascript
// Enhanced perks start appearing at Tier 2+ (weaponTier >= 1)
const weaponTier = weaponData.weaponTier;
const hasEnhancedPerks = weaponTier !== null && 
                         weaponTier !== undefined && 
                         weaponTier >= 1;

// Show enhanced indicator if:
if ((perk.isEnhanced || (hasEnhancedPerks && weaponTier >= 1)) && !perk.isMod) {
  perkIcon.classList.add('enhanced');
}
```

---

## 📊 Tier Breakdown

| Display | API Value | Enhanced Perks? | Notes |
|---------|-----------|-----------------|-------|
| **Tier 1** | `weaponTier: 0` | ❌ No | Base weapon |
| **Tier 2** | `weaponTier: 1` | ✅ **START** | Column 3 enhanced |
| **Tier 3** | `weaponTier: 2` | ✅ Yes | More enhanced |
| **Tier 4** | `weaponTier: 3` | ✅ Yes | Even more |
| **Tier 5** | `weaponTier: 4` | ✅ All | Fully enhanced |

---

## 🔍 Debugging

Console logs show:
```
[Kinetic] Weapon: "Bygones", Tier: 2, Has Enhanced: true, Perks: 4
[Kinetic] ✨ Enhanced perk: "Rampage" (API: false, Tier: 2)
```

**What to check:**
- `Weapon Tier` - 0-4 (displays as T1-T5 in UI)
- `Has Enhanced` - true if Tier 2+
- `API: true/false` - If API marks perk as enhanced
- `Tier: X` - Actual tier value

---

## 🎨 Visual Examples

### Tier 1 (No Enhanced)
```
[Icon] [Icon] [Icon] [Icon]
```

### Tier 2+ (With Enhanced)
```
[Icon] [Icon] [⚡Icon] [⚡Icon]
         ↑ Yellow arrow overlay
```

### Weapon Mods (Never Enhanced)
```
[Icon with border] ← Different styling, no arrow
```

---

## 📝 Tooltip Text

**Regular Perk:**
```
Rampage
Kills increase damage temporarily
```

**Enhanced Perk (Tier 2+):**
```
Rampage (Enhanced)
Kills increase damage temporarily
```

---

## ⚙️ Settings Control

**Field:** `showPerks`
- **Default:** `false` (hidden)
- **Enable:** Set to `true` in StreamElements settings

**When Disabled:**
- Perks hidden
- No enhanced indicators
- Clean layout

**When Enabled:**
- Perks display below weapon name
- Enhanced arrows show on Tier 2+ weapons
- Tooltips on hover

---

## 🔧 CSS Customization

### Change Arrow Color
```css
/* Current: Yellow (#fc0) */
fill='%23fc0'

/* Change to white: */
fill='%23fff'

/* Change to exotic gold: */
fill='%23CEAE33'
```

### Change Arrow Size
```css
.weapon-perk-icon.enhanced::before {
  width: 14px;  /* Current */
  height: 14px; /* Adjust as needed */
}
```

### Change Arrow Position
```css
.weapon-perk-icon.enhanced::before {
  top: -2px;   /* Overlap top edge */
  left: -2px;  /* Overlap left edge */
}
```

---

## 🚀 Testing

**Test Cases:**
1. ✅ Tier 1 weapon (no arrows)
2. ✅ Tier 2 weapon (arrows on perks)
3. ✅ Tier 5 weapon (all perks enhanced)
4. ✅ Weapon mods (no arrows, different border)
5. ✅ Exotic weapons with perks
6. ✅ Hover tooltips show "(Enhanced)"

**Console Check:**
```javascript
// Look for these logs:
[Kinetic] Weapon: "Name", Tier: X, Has Enhanced: true/false
[Kinetic] ✨ Enhanced perk: "Name" (API: true/false, Tier: X)
```

---

## 📚 Related Files

- **CSS:** `widget/widget.css` (lines 365-375)
- **JavaScript:** `widget/widget.js` (lines 295-325)
- **HTML:** `widget/widget.html` (weapon-perks containers)
- **SVG Source:** `enhanced-perk-data-uris.txt` (attachment)

---

## ✨ Summary

- ✅ Enhanced arrow overlay active
- ✅ Shows on Tier 2+ weapons
- ✅ Uses official enhanced perk SVG
- ✅ Yellow arrow in top-left corner
- ✅ Drop shadow for visibility
- ✅ Hidden on weapon mods
- ✅ Console logging for debugging

**All perks on Tier 2+ weapons will show the enhanced indicator!** 🎯
