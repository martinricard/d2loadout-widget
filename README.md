# D2 Loadout Widget

A **StreamElements/Streamlabs widget** that displays your Destiny 2 character's current loadout in real-time on your stream!

Inspired by [Guardian.report](https://guardian.report/)'s loadout display feature.

## 🎮 Features

Shows your active Destiny 2 character's complete loadout with **real images from Bungie**:
- ⚔️ **3 Equipped Weapons** with icons, perks, and mods
- 🛡️ **5 Armor Pieces** with icons, stats, and mods
- 📊 **Character Stats** (Mobility, Resilience, Recovery, Discipline, Intellect, Strength)
- ✨ **Subclass & Super** with icon and element
- 🔱 **Seasonal Artifact** with power bonus and unlocked mods
- 🎯 **24 Artifact Mods** with champion mods and perks (color-coded with icons!)
- 💎 **Exotic Items** highlighted with golden borders
- �️ **All item images** loaded directly from Bungie's CDN
- �🔄 **Auto-updates** when you change your loadout in-game

Perfect for viewers who want to see exactly what build you're using!

## 🚀 Quick Start

**Live API URL**: https://d2loadout-widget.onrender.com

### Get Your Loadout

```bash
# By Bungie name (easiest)
https://d2loadout-widget.onrender.com/api/loadout/YourName#1234

# Or by platform and membership ID
https://d2loadout-widget.onrender.com/api/loadout/3/4611686018467484767
```

**Supported Platforms**: 
- `1` = Xbox
- `2` = PlayStation  
- `3` = Steam
- `5` = Stadia

## 📖 Documentation

All documentation is organized in the [`docs/`](docs/) folder:

- **[Documentation Index](docs/README.md)** - Complete guide navigation
- **[Project Status](docs/STATUS.md)** - Current version and features (v0.1)
- **[Project Specification](docs/PROJECT_SPEC.md)** - Technical details
- **[Release Notes](docs/V0.1_RELEASE.md)** - v0.1 release summary

### Quick Links
- **[Setup Guide](docs/BUNGIE_APP_SETUP.md)** - Get your Bungie API key
- **[User Guide](docs/USER_GUIDE.md)** - For streamers
- **[Widget Installation](widget/README.md)** - StreamElements setup
- **[Visual Design](docs/VISUAL_SPEC.md)** - UI/UX reference

## 🛠️ Local Development

```bash
# Install dependencies
cd backend
npm install

# Create .env from example
cp .env.example .env

# Run development server
npm run dev
```

Server starts at `http://localhost:3000`

## 📝 Environment Variables

```bash
BUNGIE_API_KEY=your-api-key-here
NODE_ENV=development
PORT=3000
```

See [docs/BUNGIE_APP_SETUP.md](docs/BUNGIE_APP_SETUP.md) for Bungie API setup instructions.

## 🎯 Current Status

✅ **Phase 1 Complete**: Backend deployed with working API endpoints  
🚧 **Phase 2 In Progress**: Data processing layer (converting hashes to readable names)  
⏳ **Phase 3 Next**: Widget frontend with StreamElements integration

See [STATUS.md](STATUS.md) for detailed progress.
- [ ] Implement rate limiting and caching
- [ ] Build StreamElements widget frontend
- [ ] Implement license key validation system

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Hosting**: Render.com (Free tier)
- **API**: Bungie.net API

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
