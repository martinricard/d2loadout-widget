# 🎮 StreamElements Quick Setup Guide

**Ready to test your D2 Loadout Widget!**

---

## 📋 What You Need

### 4 Files to Copy/Paste:
1. **widget.html** - Widget structure
2. **widget.css** - Widget styling  
3. **widget.js** - Widget logic
4. **fields.json** - Settings configuration

**Location:** All in `widget/` folder

---

## 🚀 Step-by-Step Setup

### 1. Open StreamElements
Go to: https://streamelements.com/dashboard/overlays

### 2. Create/Edit Overlay
- Click on an existing overlay, or
- Create a new overlay

### 3. Add Custom Widget
- Click **"+ Add Widget"**
- Scroll down to **"Static / Custom"**
- Click **"Custom Widget"**

### 4. Copy Files

#### A. HTML Tab
Copy entire contents of `widget/widget.html` and paste into HTML tab

#### B. CSS Tab  
Copy entire contents of `widget/widget.css` and paste into CSS tab

#### C. JS Tab
Copy entire contents of `widget/widget.js` and paste into JS tab

#### D. Fields Tab
Copy entire contents of `widget/fields.json` and paste into Fields tab

#### E. Data Tab
Leave empty (not needed)

### 5. Configure Settings
After pasting all files, click **"Settings"** in the widget panel:

**Required:**
- 🎮 **Your Bungie Name:** Enter your Bungie name (e.g., `Marty#2689`)

**Optional:**
- Widget Size: Standard / Compact / Full
- Show/Hide Sections: Weapons, Armor, Stats, Subclass, Artifact
- Colors: Background, Border, Text, Exotic
- Font: Family and Size
- Refresh Rate: 30-300 seconds

### 6. Save & Test
- Click **"Done"** or **"Save"**
- Widget should load and show your loadout!
- Wait up to 2 seconds for API response

---

## ✅ Testing Checklist

### After setup, verify:
- [ ] Widget loads without errors
- [ ] Your character name appears
- [ ] Weapons show with icons
- [ ] Armor shows with icons
- [ ] Stats display with bars
- [ ] Artifact shows with mods
- [ ] Exotic items have golden borders
- [ ] Artifact mods show in grid
- [ ] Hover over artifact mods shows tooltips

---

## 🐛 Troubleshooting

### Widget shows "Loading..."
- Check your Bungie name is correct (e.g., `Name#1234`)
- Check console for errors (F12)
- Verify API endpoint is set to: `https://d2loadout-widget.onrender.com`

### No images showing
- Wait a few seconds, they load from Bungie CDN
- Check browser console for blocked requests

### Widget not updating
- Check refresh rate setting (default 60s)
- Make sure you changed your loadout in-game
- Wait for next refresh cycle

### Error message appears
- Check Bungie name spelling
- Make sure your profile is public (Bungie.net settings)
- Check that you've played Destiny 2 recently

---

## 🎨 Customization Tips

### Make it yours:
1. **Background Color** - Match your stream overlay
2. **Border Color** - Subtle or bold
3. **Font** - Choose from Google Fonts
4. **Size** - Compact for small scenes, Full for showcasing

### Popular Settings:
- **Minimal:** Compact size, hide stats, show weapons only
- **Full Build:** Standard size, show everything
- **Artifact Focus:** Show artifact & mods, hide weapons

---

## 📊 Widget Settings Reference

### ⚙️ Settings Group
- **Your Bungie Name** - Required! (e.g., Marty#2689)
- **Character** - Last Played / Hunter / Titan / Warlock
- **Refresh Rate** - 30-300 seconds (default: 60)

### 🎨 Display Group  
- **Widget Size** - Compact / Standard / Full
- **Show Weapons** - Toggle ✅
- **Show Armor** - Toggle ✅
- **Show Stats** - Toggle ✅
- **Show Subclass** - Toggle ✅
- **Show Artifact & Mods** - Toggle ✅
- **Show Weapon Perks** - Toggle (future feature)

### 🎨 Colors Group
- **Background Color** - Default: #101014
- **Border Color** - Default: #2c2c2f
- **Text Color** - Default: #ffffff
- **Exotic Highlight** - Default: #CEAE33 (gold)

### 🔠 Font Group
- **Font Family** - Google Fonts (default: Roboto Condensed)
- **Font Size** - 10-24px (default: 14)

### 🔧 Advanced Group
- **API Endpoint** - Default: https://d2loadout-widget.onrender.com
  - *Don't change unless using custom backend*

---

## 🎯 Expected Result

### You should see:

```
┌─────────────────────────────────────────┐
│  [🎮] MARTY                              │
│       Warlock • 1991 ⚡                  │
├─────────────────────────────────────────┤
│  WEAPONS                                 │
│  [Kinetic] [Energy] [Power]             │
│   with icons and power levels           │
├─────────────────────────────────────────┤
│  ARMOR                                   │
│  [Helmet] [Arms] [Chest] [Legs] [Class] │
│   with icons and power levels           │
├─────────────────────────────────────────┤
│  STATS                                   │
│  Mobility    [████░░░] 76    T7         │
│  Resilience  [████████] 82    T8         │
│  Recovery    [█████░░░] 51    T5         │
│  Discipline  [███████░] 110   T11        │
│  Intellect   [██████░░] 141   T14        │
│  Strength    [██░░░░░░] 22    T2         │
├─────────────────────────────────────────┤
│  SEASONAL ARTIFACT           +1 Power    │
│  [🔱] Implement of Curiosity             │
│       12 Points Unlocked                 │
│                                          │
│  CHAMPION MODS                           │
│  [🛡️] [⚔️] [🔥] ... (6 mods)          │
│                                          │
│  ARTIFACT PERKS                          │
│  [🧵] [⚡] [💥] ... (12 perks)          │
└─────────────────────────────────────────┘
```

---

## 🎥 Adding to OBS

### Once working in StreamElements:
1. Copy the overlay URL from StreamElements
2. In OBS, add **Browser Source**
3. Paste overlay URL
4. Set width/height (recommended: 600x800)
5. Done! Widget appears on stream

---

## 📝 Quick Test Command

After setup, test API directly:
```
https://d2loadout-widget.onrender.com/api/loadout/YourName#1234
```

Replace `YourName#1234` with your actual Bungie name.

---

## ✨ Tips for Best Results

### 1. Profile Must Be Public
- Go to Bungie.net → Settings → Privacy
- Make sure "Game History" is public

### 2. Play Recently
- Widget shows most recently played character
- Switch characters in-game to update

### 3. Change Loadout
- Equip new weapons/armor in-game
- Wait for widget refresh (60s default)
- See updates automatically!

### 4. Size Matters
- **Small overlay scene?** Use Compact size
- **Full screen showcase?** Use Full size
- **Standard stream layout?** Use Standard size

---

## 🚀 Ready to Test!

**Copy these 4 files from `widget/` folder:**
1. ✅ widget.html
2. ✅ widget.css
3. ✅ widget.js
4. ✅ fields.json

**Then paste into StreamElements Custom Widget!**

**Need help? Check console (F12) for errors.** 🔧

---

**Good luck! Your widget is production-ready!** 🎮✨
