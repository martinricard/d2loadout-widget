# D2 Loadout Widget - Visual Preview

## 🎨 Widget Layout

```
┌─────────────────────────────────────────────────────┐
│  [🎯]  Marty                                        │
│        Hunter • 455 ⚡                               │
├─────────────────────────────────────────────────────┤
│  WEAPONS                                            │
│  ┌─────────────────────────────────────────────┐   │
│  │ [⚔️] Outbreak Perfected  | Hand Cannon | 200│   │
│  │ [⚡] Sunshot              | Hand Cannon | 467│   │
│  │ [💣] Gjallarhorn         | Rocket       | 472│   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  ARMOR                                              │
│  ┌───────────────────┐ ┌───────────────────┐      │
│  │ [🪖] Mask of      │ │ [🧤] Grips of    │      │
│  │    Bakris    473  │ │    Doom     470  │      │
│  └───────────────────┘ └───────────────────┘      │
│  ┌───────────────────┐ ┌───────────────────┐      │
│  │ [👕] Vest of      │ │ [👖] Strides of  │      │
│  │    Sixth Coyote   │ │    Doom     471  │      │
│  │              470  │ │                   │      │
│  └───────────────────┘ └───────────────────┘      │
│  ┌───────────────────┐                             │
│  │ [🧣] Cloak        │                             │
│  │    of Doom   472  │                             │
│  └───────────────────┘                             │
├─────────────────────────────────────────────────────┤
│  STATS                                              │
│  🏃 Mobility     ████████░░ 46  T4                 │
│  🛡️ Resilience   ███████░░░ 77  T7                 │
│  ❤️  Recovery     ███░░░░░░░ 35  T3                 │
│  💥 Discipline   ██████████ 159 T15                │
│  🧠 Intellect    ██████████ 101 T10                │
│  💪 Strength     █████░░░░░ 50  T5                 │
├─────────────────────────────────────────────────────┤
│  SUBCLASS                                           │
│  [🌟] Arc Strider                                  │
└─────────────────────────────────────────────────────┘
     Last updated: 3:45:22 PM
```

---

## 🎨 Color Scheme

### Default Dark Theme
```css
Background:      #101014  (Dark charcoal)
Border:          #2c2c2f  (Medium gray)
Text:            #ffffff  (White)
Text Secondary:  #b3b3b3  (Light gray)
Exotic:          #CEAE33  (Destiny gold)
```

### Element Colors
```css
Kinetic:  #ffffff  (White)
Solar:    #f0631e  (Orange)
Arc:      #79bbe8  (Blue)
Void:     #b184c5  (Purple)
Stasis:   #4d88ff  (Light blue)
Strand:   #00ff88  (Green)
```

### Rarity Colors
```css
Exotic:    #CEAE33  (Gold)
Legendary: #522f65  (Purple)
Rare:      #5076a3  (Blue)
Uncommon:  #366f42  (Green)
Common:    #c3bcb4  (Gray)
```

---

## 📐 Size Options

### Compact Mode
```
Dimensions: 400px × 600px
Perfect for: Small corner overlays
Shows: Icons + Names + Stats
Hides: Detailed descriptions
```

### Standard Mode (Recommended)
```
Dimensions: 600px × 800px
Perfect for: Main overlay
Shows: Full details with spacing
Hides: Nothing (all content visible)
```

### Full Mode
```
Dimensions: 800px × 1200px
Perfect for: Dedicated build showcase
Shows: Everything + extra details
Future: Will include perks/mods
```

---

## ✨ Visual Effects

### Exotic Items
- **Golden border**: `border-color: #CEAE33`
- **Glow effect**: `box-shadow: 0 0 15px rgba(206, 174, 51, 0.3)`
- **Golden text**: `color: #CEAE33`

### Stat Bars
- **Gradient fills**: Color-coded by stat type
- **Animated**: Smooth width transition
- **Tier badge**: Golden `Tx` indicator

### Hover Effects
- **Background**: Lightens on hover
- **Border**: Becomes more visible
- **Transition**: Smooth 0.2s ease

### Loading State
- **Pulsing animation**: Opacity 1 ↔ 0.5
- **Duration**: 1.5s infinite
- **Text**: "Loading..."

---

## 🎯 Element Hierarchy

### Typography
```css
Character Name:    1.4em, Bold, Uppercase
Section Titles:    1.1em, Bold, Uppercase
Weapon/Armor Name: 1.05em, Semi-bold
Stat Names:        0.9em, Bold, Uppercase
Stat Values:       1.05em, Bold
Stat Tiers:        0.85em, Bold
Metadata:          0.75em, Light
```

### Spacing
```css
Container Padding:  20px
Section Gaps:       20px
Item Gaps:          10-12px
Border Radius:      8px (large), 6px (medium), 4px (small)
```

---

## 📱 Responsive Behavior

### Desktop (>600px)
- Armor grid: 2 columns
- Full stat names visible
- All spacing at 100%

### Mobile/Compact (<600px)
- Armor grid: 1 column
- Condensed stat names
- Reduced padding (15px)

---

## 🎬 Animation Examples

### On Data Load
```javascript
1. Fade in character info (0.3s)
2. Slide in weapons (0.4s, staggered 0.1s each)
3. Fade in armor (0.5s)
4. Animate stat bars filling (0.5s, eased)
5. Fade in subclass (0.3s)
```

### On Refresh
```javascript
1. Subtle pulse on changed items
2. Stat bars re-animate to new values
3. Updated timestamp fades in
```

---

## 🖼️ Icon Display

### Weapons & Armor
- **Size**: 50px × 50px (weapons), 40px × 40px (armor)
- **Border**: 1px solid border
- **Radius**: 6px rounded corners
- **Fallback**: Gray placeholder if icon missing

### Character Emblem
- **Size**: 60px × 60px
- **Border**: 2px solid border
- **Radius**: 8px rounded corners
- **Position**: Top-left of header

### Subclass Icon
- **Size**: 50px × 50px
- **Style**: Same as weapons
- **Position**: Subclass section

---

## 🎨 StreamElements Settings Preview

```
┌─────────────────────────────────────┐
│ ⚙️ Settings                          │
│ ┌─────────────────────────────────┐ │
│ │ 🎮 Your Bungie Name             │ │
│ │ Marty#2689                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Character: [Last Played ▼]         │
│ Refresh Rate: [60] seconds         │
├─────────────────────────────────────┤
│ 🎨 Display                          │
│ Widget Size: [Standard ▼]          │
│ ☑ Show Weapons                      │
│ ☑ Show Armor                        │
│ ☑ Show Stats                        │
│ ☑ Show Subclass                     │
│ ☐ Show Weapon Perks                 │
├─────────────────────────────────────┤
│ 🎨 Colors                            │
│ Background:  [#101014 🎨]          │
│ Border:      [#2c2c2f 🎨]          │
│ Text:        [#ffffff 🎨]          │
│ Exotic:      [#CEAE33 🎨]          │
├─────────────────────────────────────┤
│ 🔠 Font                              │
│ Font Family: [Roboto Condensed ▼]  │
│ Font Size:   [14] ◄──────► [24]   │
└─────────────────────────────────────┘
```

---

## 🎯 Usage Examples

### Small Overlay (Corner)
```
Size: Compact
Position: Top-right or bottom-right
Opacity: 90%
Shows: Essential info only
```

### Main Overlay (Center-right)
```
Size: Standard
Position: Right side, center
Opacity: 100%
Shows: Full loadout details
```

### Build Showcase Scene
```
Size: Full
Position: Center screen
Opacity: 100%
Shows: Everything + future perks/mods
```

---

**This visual guide shows exactly what the widget looks like and how it behaves!**

Ready to test on StreamElements! 🚀
