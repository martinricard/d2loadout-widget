# D2 Loadout Widget for StreamElements

A **StreamElements custom widget** that displays your Destiny 2 character's current loadout in real-time on your stream!

Perfect for viewers who want to see exactly what build you're using - complete with weapons, armor, stats, subclass, and artifact mods, all with **real images from Bungie**.

Inspired by [Guardian.report](https://guardian.report/)'s loadout display with enhanced interactivity.

![Version](https://img.shields.io/badge/version-1.0-blue)
![Platform](https://img.shields.io/badge/platform-StreamElements-purple)
![Game](https://img.shields.io/badge/game-Destiny%202-orange)

## ✨ Key Features

### 🎯 Complete Loadout Display
- ⚔️ **3 Equipped Weapons** - Icons, power levels, perks, and mods
- 🛡️ **5 Armor Pieces** - Icons, power levels, and exotic perks
- 📊 **Character Stats** - All 6 stats with Final Shape icons (Mobility, Resilience, Recovery, Discipline, Intellect, Strength)
- ✨ **Subclass Build** - Subclass super with aspects and fragments
- 🔱 **Seasonal Artifact** - All unlocked artifact mods displayed

### 💬 Viewer Interaction
- **!dimlink Chat Command** - Viewers type `!dimlink` to get your loadout link instantly
- **Channel Point Redemptions** - Viewers can use points to request loadout display
- **Auto-Hide Mode** - Widget appears on command, then smoothly fades away
- **Display Modes** - Show specific sections (!loadout, !subclass, !stats, !weapons, !armor, !artifact)

### 🎨 Visual Polish
- 💎 **Exotic Items** highlighted with golden text
- 🎯 **Enhanced Perks** marked with yellow arrows (Edge of Fate weapons Tier 2+)
- ⚡ **Pinnacle Power** shown in cyan for max-level items
- 🖼️ **Character Emblem** as beautiful header background
- 🌊 **Smooth Animations** with feathered fade effects
- 🔄 **Auto-updates** every 60 seconds (configurable)

### 🔗 DIM Integration
- 🔗 **DIM Links** automatically generated for each loadout
- 📱 **TinyURL Shortening** for easy sharing in chat
- 🎯 **Smart Filtering** - Only includes ~25 relevant mods (no ornaments/shaders)
- 💬 **Instant Sharing** - Viewers get links via chat command

## 🚀 Quick Start

### For Streamers (5-10 minutes)

**Two Installation Options:**

#### Option A: Standard Installation (Open Source)
1. **Get Your Bungie ID** - Find your Bungie name on Bungie.net (e.g., `YourName#1234`)
2. **Download Widget Files** - Get from [Releases](https://github.com/martinricard/d2loadout-widget/releases)
3. **Add to StreamElements** - Create custom widget and paste HTML/CSS/JS/Fields
4. **Configure Settings** - Enter your Bungie ID and customize options
5. **Test** - Type `!loadout` in chat to see it appear!

📖 **Complete Guide**: [Installation Guide](docs/INSTALLATION_GUIDE.md)

#### Option B: Protected Distribution (Code Hidden)
Uses a loader script to fetch widget from CDN - protects your code like commercial widgets.

1. **Download Loader** - Get `loader.html` + `fields.json` from protected release
2. **Paste in StreamElements** - HTML + Fields tabs only (CSS/JS stay empty)
3. **Configure Bungie ID** - Widget loads from CDN automatically
4. **Done!** - Code stays protected, updates automatic

📖 **Protected Setup**: See [studio-nms/](studio-nms/) folder for build instructions

💡 **Tip**: Use Option A for personal/open source, Option B to protect your code from copying.

### For Developers

```bash
# Clone repository
git clone https://github.com/martinricard/d2loadout-widget.git
cd d2loadout-widget

# Backend setup
cd backend
npm install
cp .env.example .env
# Add your BUNGIE_API_KEY and TINYURL_TOKEN to .env
npm run dev

# Server starts at http://localhost:3000
```

See [Project Specification](docs/PROJECT_SPEC.md) for architecture details.

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) folder:

### 📘 User Guides
- **[Installation Guide](docs/INSTALLATION_GUIDE.md)** - Complete step-by-step setup (beginner-friendly)
- **[User Guide](docs/USER_GUIDE.md)** - StreamElements configuration and features
- **[Chat Command Setup](docs/DIM_LINK_CHAT_COMMAND.md)** - Configure !dimlink command
- **[Testing Guide](docs/TESTING_GUIDE.md)** - How to test your widget

### 🔧 Technical Documentation
- **[Project Specification](docs/PROJECT_SPEC.md)** - Architecture and API details
- **[Visual Design](docs/VISUAL_SPEC.md)** - UI/UX reference and styling
- **[Bungie API Setup](docs/BUNGIE_APP_SETUP.md)** - For developers only

### 📊 Project Information
- **[Status](docs/STATUS.md)** - Current version and changelog
- **[Pre-Release Checklist](docs/PRERELEASE_CHECKLIST.md)** - Release preparation tasks

## 🛠️ Configuration

### Widget Settings (StreamElements Fields)

| Field | Description | Default |
|-------|-------------|---------|
| **Bungie ID** | Your Bungie name (e.g., `YourName#1234`) | Required |
| **Auto-Hide** | Widget appears on command, then hides | `false` |
| **Hide Duration** | Seconds before auto-hiding | `30` |
| **Feathered Edge** | Smooth fade at bottom | `true` |
| **Update Interval** | Data refresh rate (seconds) | `60` |
| **Chat Commands** | Custom command names | `!loadout`, `!weapons`, etc. |

### Environment Variables (Backend)

Required for running your own backend instance:

```bash
BUNGIE_API_KEY=your-bungie-api-key-here
TINYURL_TOKEN=your-tinyurl-access-token
NODE_ENV=production
PORT=3000
```

**Note**: Streamers using the public backend (https://d2loadout-widget.onrender.com) don't need API keys!

---

## 📸 Screenshots

> Coming soon! Will include:
> - Full loadout display
> - Subclass build view
> - Chat command in action
> - DIM link generation

---

## 🎬 Chat Commands & Channel Points

### Chat Commands (Customizable)

When Auto-Hide mode is enabled, viewers can trigger the widget:

| Command | Description | Shows |
|---------|-------------|-------|
| `!loadout` | Full loadout | Weapons, armor, stats, subclass, and artifact |
| `!subclass` | Subclass build | Subclass super, aspects, fragments, and artifact |
| `!stats` | Character stats | All 6 guardian statistics |
| `!weapons` | Weapons only | 3 equipped weapons with perks and mods |
| `!armor` | Armor only | 5 equipped armor pieces with exotic perks |
| `!artifact` | Artifact only | Seasonal artifact unlocked mods |
| `!dimlink` | Get DIM link | Posts your loadout link in chat (via bot) |

**Note**: All commands are customizable in widget settings! Change `!loadout` to `!build` or whatever you prefer.

### Channel Point Redemptions

Set up channel point rewards that trigger the widget:
- **"Show Loadout"** - Full build display
- **"Show Subclass"** - Subclass configuration
- **"Show Stats"** - Character statistics
- **"Show Weapons"** - Weapon loadout
- **"Show Armor"** - Armor setup

The widget listens for these redemptions automatically when configured.

### DIM Link Command Setup

For the `!dimlink` command to work, add this custom command in StreamElements:

**Command**: `!dimlink`  
**Response**: `$(customapi https://d2loadout-widget.onrender.com/api/dimlink/YOUR_BUNGIE_ID?format=text)`

Replace `YOUR_BUNGIE_ID` with your Bungie name (e.g., `Martin_Ricard#2689`).

📖 **Full Setup Guide**: [Chat Command Documentation](docs/DIM_LINK_CHAT_COMMAND.md)

## 🛠️ Local Development

Want to run your own backend or contribute to development?

### Prerequisites
- Node.js 18+ installed
- Bungie.net API key ([Get one here](https://www.bungie.net/en/Application))
- TinyURL API token ([Register here](https://tinyurl.com/app/dev))

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/martinricard/d2loadout-widget.git
cd d2loadout-widget/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your API keys:
# BUNGIE_API_KEY=your-bungie-api-key-here
# TINYURL_TOKEN=your-tinyurl-token-here
# NODE_ENV=development
# PORT=3000

# Start development server
npm run dev
```

Server will start at `http://localhost:3000`

### Testing the Widget Locally

1. Open `test-widget.html` in your browser
2. Update the `bungieId` in the file to your Bungie name
3. Widget will connect to the public backend by default
4. To use your local backend, change API URL in widget.js

### API Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /health` | Health check | Returns `{ status: 'OK' }` |
| `GET /api/loadout/:bungieId` | Full loadout data | JSON with all loadout info |
| `GET /api/dimlink/:bungieId` | DIM link only | JSON with `dimLink` field |
| `GET /api/dimlink/:bungieId?format=text` | Plain text link | For StreamElements commands |

### Development Tips

- Use `npm run dev` for auto-restart on file changes
- Check `backend/server.js` for API implementation
- Widget files are in `widget/` directory
- Test with different character classes and builds
- Monitor Render.com logs for production debugging

📖 **Full Technical Docs**: [Project Specification](docs/PROJECT_SPEC.md)

### Backend (Render.com)
```bash
BUNGIE_API_KEY=your-bungie-api-key
TINYURL_TOKEN=your-tinyurl-access-token
NODE_ENV=production
PORT=3000
```

See [DIM Link Fix Guide](docs/DIM_LINK_FIX.md) for TinyURL setup.

## 🎯 Project Structure

```
d2loadout-widget/
├── backend/                 # Express.js API server
│   ├── server.js           # Main API (1285 lines)
│   └── package.json        # Dependencies
├── widget/                 # StreamElements widget
│   ├── widget.html         # Widget markup
│   ├── widget.css          # Styling (1020 lines)
│   ├── widget.js           # Logic (1112 lines)
│   ├── fields.json         # Configuration fields
│   └── instructions.html   # Setup instructions
├── docs/                   # Documentation (40+ guides)
│   ├── USER_GUIDE.md       # Streamer setup
│   ├── PROJECT_SPEC.md     # Technical details
│   └── [38 other docs]
├── README.md               # This file
└── render.yaml             # Render.com deployment
```

## 🚀 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js 18+ with Express.js |
| **Hosting** | Render.com (Free tier) |
| **APIs** | Bungie.net Platform API, TinyURL API v2 |
| **Frontend** | Vanilla JavaScript, CSS Grid |
| **Platform** | StreamElements Custom Widget |
| **Font** | Roboto Condensed (Google Fonts) |

### Dependencies

**Backend**:
- `express` - Web framework
- `axios` - HTTP client for API requests
- `cors` - CORS middleware
- `dotenv` - Environment variable management

**Widget**:
- No external dependencies (pure vanilla JS)
- Self-contained, fast loading

## ✅ Current Status

**Version**: 1.0 - Production Ready ✨

### 🎉 Completed Features
- ✅ Full loadout display (weapons, armor, stats, subclass, artifact)
- ✅ Backend API with Bungie.net integration
- ✅ DIM link generation with TinyURL shortening
- ✅ Chat command system with display modes
- ✅ Channel point redemption support
- ✅ !dimlink chat command for viewer loadout sharing
- ✅ Power level styling with pinnacle indicators
- ✅ Enhanced perk detection (Edge of Fate Tier 2+)
- ✅ Exotic item highlighting
- ✅ Auto-hide mode with smooth animations
- ✅ Feathered fade effect
- ✅ Character emblem header background
- ✅ Final Shape stat icons
- ✅ Season 27 artifact support

### 🎯 Tested & Verified
- ✅ Warlock, Titan, Hunter support
- ✅ All subclass types (Arc, Solar, Void, Stasis, Strand, Prismatic)
- ✅ Enhanced perk arrows (Tier 2-5 weapons)
- ✅ Stats accuracy (160 Discipline confirmed)
- ✅ DIM link filtering (~25 relevant mods)
- ✅ TinyURL link generation working
- ✅ Chat command integration functional

### 🌐 Deployment
- 🟢 **Backend**: Live at https://d2loadout-widget.onrender.com
- � **Widget**: Ready for StreamElements
- 🟢 **API**: Fully operational with health checks
- � **Documentation**: Complete and up-to-date

## � Usage Tips

### For Best Results
1. **Test Before Going Live** - Use test-widget.html to preview locally
2. **Customize Commands** - Use commands that fit your stream style
3. **Set Reasonable Intervals** - 60 seconds prevents API rate limits
4. **Position Carefully** - Widget is 760px wide, plan your overlay layout
5. **Use Auto-Hide** - Keeps your stream clean when not showing builds

### Common Issues & Solutions

**Widget Not Updating?**
- Check your Bungie ID format (must include `#1234`)
- Verify you're logged into Bungie.net with that character
- Check browser console for error messages

**DIM Link Empty?**
- Ensure backend URL is correct in StreamElements command
- Verify your Bungie ID has no extra spaces
- TinyURL shortening may take 1-2 seconds

**Chat Command Not Working?**
- Verify Auto-Hide mode is enabled in widget settings
- Check that chat command names match in settings and bot
- StreamElements bot must be active in your channel

📖 **Full Troubleshooting**: See [User Guide](docs/USER_GUIDE.md#troubleshooting)

## 🤝 Contributing

This project welcomes contributions from the Destiny 2 streaming community!

### Ways to Contribute
- 🐛 **Bug Reports** - Found an issue? Let us know!
- ✨ **Feature Requests** - Have an idea? Share it!
- 📖 **Documentation** - Help improve the guides
- 💻 **Code** - Bug fixes and improvements welcome

📖 **Contributing Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines

**Bug Reports**: Please open a GitHub Issue with:
- Your Bungie ID
- Steps to reproduce
- Expected vs actual behavior
- Console error messages (if any)

**Feature Requests**: Open a GitHub Issue describing:
- The feature you'd like
- Your use case
- Why it would benefit streamers

## 📞 Support

- 📖 **Documentation**: Check [docs/](docs/) folder first
- � **Installation Help**: [Installation Guide](docs/INSTALLATION_GUIDE.md)
- �🐛 **Bug Reports**: [GitHub Issues](https://github.com/martinricard/d2loadout-widget/issues)
- 💬 **Questions**: Open a Discussion on GitHub
- 📝 **Changelog**: See [CHANGELOG.md](CHANGELOG.md) for version history

## 🔒 Security & Privacy

- ✅ No login required - uses public Bungie profile data only
- ✅ API keys stored as environment variables (never in code)
- ✅ CORS configured for StreamElements domain
- ✅ All API calls proxied through backend
- ✅ No viewer data collected or stored
- ✅ TinyURL links are public but unguessable

Your Bungie profile must be set to public for the widget to access your loadout data.

## 📄 License

Private project - All rights reserved

For licensing inquiries, please contact via GitHub.

---

**Made with 🎮 for Destiny 2 streamers**

*Show your viewers exactly what build you're using - no more "what gun is that?" questions!*
