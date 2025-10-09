# D2 Loadout Widget

A **StreamElements custom widget** that displays your Destiny 2 character's current loadout in real-time on your stream!

Inspired by [Guardian.report](https://guardian.report/)'s loadout display with enhanced interactivity.

## 🎮 Features

Shows your active Destiny 2 character's complete loadout with **real images from Bungie**:
- ⚔️ **3 Equipped Weapons** with icons, power levels, perks, and mods
- 🛡️ **5 Armor Pieces** with icons, power levels, and exotic perks
- 📊 **Character Stats** with Final Shape icons (Weapons, Health, Class, Grenade, Super, Melee)
- ✨ **Subclass Build** with aspects and fragments
- 🔱 **Seasonal Artifact** with unlocked mods
- � **Auto-Hide Mode** with chat command triggers
- 📱 **Command Modes** - Show specific sections (!loadout, !subclass, !stats, !weapons, !armor, !artifact)
- 🔗 **DIM Link Integration** with TinyURL shortening
- 💎 **Exotic Items** highlighted with golden text
- 🖼️ **Character Emblem** as header background
- 🔄 **Auto-updates** every 60 seconds (configurable)

Perfect for viewers who want to see exactly what build you're using!

## 🚀 Quick Start

### 1. Get Your Bungie API Key
Follow the [Bungie App Setup Guide](docs/BUNGIE_APP_SETUP.md)

### 2. Deploy Backend
The backend is deployed on Render.com at:
```
https://d2loadout-widget.onrender.com
```

### 3. Install Widget
Add the widget to StreamElements using the files in [`widget/`](widget/)
- Copy `widget.html`, `widget.css`, `widget.js`, and `fields.json`
- Configure your Bungie ID in widget settings
- See [User Guide](docs/USER_GUIDE.md) for detailed setup

## 📖 Documentation

All documentation is in the [`docs/`](docs/) folder:

### Essential Guides
- **[User Guide](docs/USER_GUIDE.md)** - StreamElements setup for streamers
- **[Command Modes](docs/COMMAND_MODES.md)** - Chat command feature guide
- **[Bungie API Setup](docs/BUNGIE_APP_SETUP.md)** - Get your API key
- **[Project Status](docs/STATUS.md)** - Current version (v1.0)

### Technical Documentation
- **[Project Specification](docs/PROJECT_SPEC.md)** - Architecture details
- **[Visual Design](docs/VISUAL_SPEC.md)** - UI/UX reference
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment

## 🎬 Chat Commands (Auto-Hide Mode)

When Auto-Hide is enabled, viewers can trigger the widget with commands:

| Command | Shows |
|---------|-------|
| `!loadout` | Full build (everything) |
| `!subclass` | Subclass + aspects + fragments + artifact |
| `!stats` | Character stats only |
| `!weapons` | Equipped weapons only |
| `!armor` | Equipped armor only |
| `!artifact` | Artifact mods only |

All commands are customizable in widget settings!

## 🛠️ Local Development

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Add your BUNGIE_API_KEY and TINYURL_TOKEN to .env
npm run dev
```

Server starts at `http://localhost:3000`

## 📝 Environment Variables

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
├── backend/              # Express.js API server
│   ├── server.js        # Main API endpoints
│   └── package.json
├── widget/              # StreamElements widget
│   ├── widget.html      # Widget markup
│   ├── widget.css       # Widget styles (1050+ lines)
│   ├── widget.js        # Widget logic (940+ lines)
│   ├── fields.json      # Configuration fields
│   └── archive/         # Old versions
├── docs/                # All documentation
│   ├── README.md        # Documentation index
│   ├── USER_GUIDE.md    # Streamer setup guide
│   ├── COMMAND_MODES.md # Chat commands feature
│   └── [38 other docs]
├── README.md            # This file
└── render.yaml          # Render.com config
```

## ✅ Current Status

**Version**: v1.0 - Production Ready

### Completed Features
- ✅ Backend API with Bungie integration
- ✅ TinyURL DIM link shortening
- ✅ Full widget UI (compact wide layout)
- ✅ Power level styling (pinnacle indicators)
- ✅ Enhanced perk indicators (yellow arrows)
- ✅ Auto-hide with smooth animations
- ✅ Feathered fade effect (After Effects style)
- ✅ Chat command system with display modes
- ✅ Rotating DIM link messages
- ✅ Character emblem header background
- ✅ Final Shape stat icons

### Deployment Status
- 🟢 Backend: Live on Render.com
- 🟡 Widget: Ready for StreamElements upload
- 🔵 Testing: Needs production validation

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Hosting**: Render.com (Free tier)
- **APIs**: Bungie.net API, TinyURL API v2
- **Frontend**: Vanilla JavaScript, CSS Grid
- **Platform**: StreamElements Custom Widget

## 📦 Dependencies

### Backend
- `express` - Web server
- `axios` - HTTP client
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Widget
- No external dependencies (vanilla JS)
- Roboto Condensed font (Google Fonts)

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub Issues.

## 📄 License

Private project - All rights reserved

---

**Made with 🎮 for Destiny 2 streamers**

## Security Notes

- API keys are stored as environment variables (never committed to git)
- CORS configured for StreamElements domain
- OAuth tokens will be handled server-side only
- All API calls proxied through backend to protect credentials

## License

Commercial product - All rights reserved

## 📦 Technology Stack

- **Backend**: Node.js + Express (Render.com)
- **API**: Bungie.net Platform API
- **Frontend**: StreamElements Custom Widget (HTML/CSS/JS)
- **Data**: Real-time character loadout from Bungie API

## 📄 License

Commercial product - All rights reserved.

---

Made with ❤️ for Destiny 2 streamers
