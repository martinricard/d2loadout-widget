# D2 Loadout Widget - StreamElements Integration

## 📦 Widget Files

This folder contains the complete StreamElements custom widget files for the D2 Loadout Widget.

### Files
- **widget.html** - Widget HTML structure
- **widget.css** - Widget styling (inspired by Guardian.report aesthetic)
- **widget.js** - Widget logic and API integration
- **fields.json** - StreamElements field configuration

---

## 🚀 How to Install on StreamElements

### Step 1: Create Custom Widget
1. Go to https://streamelements.com/dashboard
2. Navigate to **Streaming Tools** → **My Overlays**
3. Select your overlay (or create a new one)
4. Click **+ Add Widget** → **Custom Widget** → **Custom Widget**

### Step 2: Import Widget Files

#### HTML Tab:
Copy the entire content of **widget.html** and paste it into the HTML editor.

#### CSS Tab:
Copy the entire content of **widget.css** and paste it into the CSS editor.

#### JS Tab:
Copy the entire content of **widget.js** and paste it into the JS editor.

#### Fields Tab:
Copy the entire content of **fields.json** and paste it into the Fields editor.

#### JSON Tab:
Leave default or empty.

### Step 3: Configure Widget Settings

In the widget settings panel (right side), you'll see:

#### ⚙️ Settings
- **🎮 Your Bungie Name**: Enter your Bungie name (e.g., `Marty#2689`)
- **Character**: Choose which character to display
  - Last Played (recommended)
  - Hunter
  - Titan
  - Warlock
- **Refresh Rate**: How often to update (30-300 seconds, default: 60)

#### 🎨 Display
- **Widget Size**: Compact / Standard / Full Details
- **Show Weapons**: Toggle weapon display
- **Show Armor**: Toggle armor display
- **Show Stats**: Toggle stats display
- **Show Subclass**: Toggle subclass display
- **Show Weapon Perks**: Toggle perk details (coming soon)

#### 🎨 Colors
- **Background Color**: Widget background (#101014)
- **Border Color**: Border color (#2c2c2f)
- **Text Color**: Text color (#ffffff)
- **Exotic Highlight**: Exotic item glow (#CEAE33)

#### 🔠 Font
- **Font Family**: Choose from Google Fonts (default: Roboto Condensed)
- **Font Size**: 10-24px (default: 14px)

#### 🔧 Advanced
- **API Endpoint**: Backend URL (default: https://d2loadout-widget.onrender.com)

---

## 🎨 Design Features

### Inspired by Guardian.report
- **Clean, modern aesthetic** matching Guardian.report's loadout view
- **Dark theme** optimized for streaming overlays
- **Exotic highlighting** with golden glow effect
- **Stat bars** with visual tier indicators
- **Hover effects** for better interactivity

### Color Coding
- **Exotic items**: Golden glow (#CEAE33)
- **Power level**: Golden text
- **Stats**: Color-coded bars (Mobility=Blue, Resilience=Purple, Recovery=Orange, etc.)
- **Character light**: Golden highlight

### Responsive Design
- Adapts to different widget sizes
- Compact mode for minimal overlays
- Standard mode for general use
- Full mode for detailed build showcases

---

## 🔧 Customization

### Widget Sizes

**Compact** (400px × 600px):
- Weapons + Armor icons + Stats
- Perfect for small overlays

**Standard** (600px × 800px) - Recommended:
- All content with clean spacing
- Best balance of detail and size

**Full** (800px × 1200px):
- Everything including detailed info
- Ideal for "build showcase" scenes

### Custom Colors

Match your stream branding by changing:
- Background color
- Border color
- Text color
- Exotic glow color

### Font Options

Choose from Google Fonts:
- Roboto Condensed (default, clean)
- Montserrat (modern)
- Oswald (bold)
- Lato (rounded)

---

## 🐛 Troubleshooting

### Widget shows "Loading..."
- Check that you've entered your Bungie name correctly (format: `Name#1234`)
- Verify the API endpoint is set to: `https://d2loadout-widget.onrender.com`
- Check browser console (F12) for error messages

### Widget shows error message
- **"Player not found"**: Double-check your Bungie name spelling
- **"API Error"**: Backend might be starting up (Render free tier), wait 30 seconds and refresh
- **"Failed to fetch"**: Check your internet connection

### Data not updating
- Check the refresh rate setting
- Verify you've played Destiny 2 recently with that character
- Try increasing the refresh rate if it's too low

### Icons not displaying
- Icons load from Bungie CDN (requires internet connection)
- Some items may not have icons in the API response
- Check browser console for blocked resources

---

## 📊 What Data is Displayed

### Character Info
- Display name (Bungie name)
- Character class (Hunter/Titan/Warlock)
- Light level
- Character emblem

### Weapons (3)
- Kinetic weapon
- Energy weapon
- Power weapon
- Shows: Name, type, power level, icon
- Exotic highlighting

### Armor (5)
- Helmet
- Arms
- Chest
- Legs
- Class Item
- Shows: Name, type, power level, icon
- Exotic highlighting

### Stats (6)
- Mobility
- Resilience  
- Recovery
- Discipline
- Intellect
- Strength
- Shows: Value, tier (T0-T10), visual bar

### Subclass
- Subclass name
- Subclass icon

---

## 🔄 Auto-Updates

The widget automatically refreshes based on your **Refresh Rate** setting:
- Default: Every 60 seconds
- Minimum: 30 seconds
- Maximum: 300 seconds (5 minutes)

Changes to your loadout in-game will appear after the next refresh cycle.

---

## 💡 Tips

1. **Use "Last Played" character** for automatic switching
2. **Set refresh rate to 60 seconds** for good balance
3. **Use "Standard" size** for most stream layouts
4. **Enable only sections you need** for cleaner look
5. **Match colors to your stream branding** for cohesive design

---

## 📝 Notes

- Widget requires an active internet connection
- Data fetched from Bungie API via our backend
- No authentication required (uses public data)
- Updates reflect your currently equipped loadout
- Backend hosted on Render (free tier, may have cold starts)

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console (F12) for errors
3. Verify all files are copied correctly
4. Ensure API endpoint is correct

---

## 📄 License

Commercial product - All rights reserved by martinricard

---

**Made with ❤️ for Destiny 2 streamers**

GitHub: https://github.com/martinricard/d2loadout-widget
