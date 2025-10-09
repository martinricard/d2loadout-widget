# Widget Command Modes - Feature Documentation

## Overview
The widget now supports **multiple chat commands** that show different parts of your loadout. Each command displays only the requested section with an optimized layout.

## Available Commands

### 1. **`!loadout`** - Full Build
Shows everything:
- ✅ Weapons
- ✅ Armor
- ✅ Stats
- ✅ Subclass (Aspects + Fragments)
- ✅ Artifact Mods

**Layout**: 3-column grid (weapons | armor | stats), subclass row at bottom

---

### 2. **`!subclass`** - Subclass Build Only
Shows only:
- ✅ Subclass icon & name
- ✅ Aspects (2 equipped)
- ✅ Fragments (up to 5 equipped)
- ✅ Artifact mods

**Layout**: Full-width horizontal display, optimized for subclass focus

---

### 3. **`!stats`** - Stats Only
Shows only:
- ✅ All 6 stats (Mobility, Resilience, Recovery, Discipline, Intellect, Strength)

**Layout**: Centered, 2-column grid for clean stat display

---

### 4. **`!weapons`** - Weapons Only
Shows only:
- ✅ Kinetic weapon
- ✅ Energy weapon
- ✅ Power weapon
- ✅ Perks (if enabled in settings)

**Layout**: Single column, vertically stacked weapons

---

### 5. **`!armor`** - Armor Only
Shows only:
- ✅ Helmet
- ✅ Gauntlets
- ✅ Chest Armor
- ✅ Leg Armor
- ✅ Class Item (with exotic perks if applicable)

**Layout**: Single column, vertically stacked armor pieces

---

### 6. **`!artifact`** - Artifact Mods Only
Shows only:
- ✅ Subclass icon & name (for context)
- ✅ All equipped artifact mods

**Layout**: Full-width display with artifact mod grid

---

## Configuration

All commands are **fully customizable** in the widget field settings:

### Field Settings (StreamElements)
```
Auto-Hide - Full Loadout Command: !loadout
Auto-Hide - Subclass Only Command: !subclass
Auto-Hide - Stats Only Command: !stats
Auto-Hide - Weapons Only Command: !weapons
Auto-Hide - Armor Only Command: !armor
Auto-Hide - Artifact Only Command: !artifact
```

You can change any command to whatever you prefer (e.g., `!build`, `!sub`, `!gear`, etc.)

---

## How It Works

### 1. Auto-Hide Mode Required
Commands only work when **"Auto-Hide Widget"** is set to **"Yes"** in settings.

### 2. Chat Detection
When a viewer types a command in chat, the widget:
1. Detects the command
2. Determines which display mode to use
3. Hides all other sections
4. Adjusts the layout dynamically
5. Shows the widget with smooth slide-up animation
6. Auto-hides after configured duration (default: 15 seconds)

### 3. Layout Optimization
Each mode automatically adjusts:
- **Grid columns** (1, 2, or 3 columns depending on content)
- **Section visibility** (hides unused sections)
- **Borders** (removes unnecessary dividers)
- **Spacing** (optimizes padding for focused display)

---

## Use Cases

### Viewer Questions → Quick Answers

| Viewer Question | Command | What Shows |
|----------------|---------|------------|
| "What subclass are you using?" | `!subclass` | Just your subclass build |
| "What are your stats?" | `!stats` | Just your 6 stats |
| "What's that weapon?" | `!weapons` | Just your 3 weapons |
| "Full build?" | `!loadout` | Everything |
| "What artifact mods?" | `!artifact` | Just artifact mods |
| "What armor?" | `!armor` | Just your 5 armor pieces |

### Streamer Benefits
- **Clean presentation** - No clutter, only relevant info
- **Flexible showcase** - Choose what to highlight
- **Viewer engagement** - Interactive commands
- **Professional look** - Smooth animations with feathered fade

---

## Animation & Visuals

### Slide Animation
- **Slide Up**: 1.2s smooth cubic-bezier easing
- **Slide Down**: 1.2s smooth cubic-bezier easing with feathered fade
- **Feather Effect**: Gradual 100px fade at bottom edge (After Effects style)

### Transitions
- All sections fade in/out smoothly
- Layout adjustments are instant (no jarring shifts)
- Auto-hide respects configured duration

---

## Technical Details

### Display Mode Logic
```javascript
const modes = {
  full: { weapons: true, armor: true, stats: true, subclass: true, artifact: true },
  subclass: { weapons: false, armor: false, stats: false, subclass: true, artifact: true },
  stats: { weapons: false, armor: false, stats: true, subclass: false, artifact: false },
  weapons: { weapons: true, armor: false, stats: false, subclass: false, artifact: false },
  armor: { weapons: false, armor: true, stats: false, subclass: false, artifact: false },
  artifact: { weapons: false, armor: false, stats: false, subclass: true, artifact: true }
};
```

### Command Detection
- **Case-insensitive** - `!STATS`, `!stats`, `!StAtS` all work
- **Trim whitespace** - Handles extra spaces
- **Starts-with matching** - Only checks command prefix

---

## Testing Checklist

- [ ] Auto-Hide enabled in widget settings
- [ ] All commands configured with unique values
- [ ] Test `!loadout` - Full build shows
- [ ] Test `!subclass` - Only subclass/aspects/fragments/artifact show
- [ ] Test `!stats` - Only stats show (centered layout)
- [ ] Test `!weapons` - Only weapons show (single column)
- [ ] Test `!armor` - Only armor show (single column)
- [ ] Test `!artifact` - Only subclass + artifact show
- [ ] Verify auto-hide duration (default 15s)
- [ ] Check feathered fade effect on slide-down
- [ ] Confirm smooth animations

---

## Deployment Notes

### Files Modified
1. **`widget/fields.json`** - Added 5 new command fields
2. **`widget/widget.js`** - Added display mode logic and command detection
3. **`widget/widget.css`** - Already supports dynamic layout (no changes needed)

### Environment Variables
No new environment variables required. This is a **frontend-only feature**.

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (may need testing for mask gradients)

---

## Future Enhancements (Optional)

- [ ] Command aliases (e.g., `!sub` = `!subclass`)
- [ ] Combined modes (e.g., `!weapons+stats`)
- [ ] Moderator-only commands
- [ ] Custom duration per command
- [ ] Transition effects between modes

---

## Version
**Feature**: Command-based Display Modes  
**Added**: 2025-10-08  
**Widget Version**: v1.0+  
**Status**: ✅ Production Ready
