# Changelog

All notable changes to the D2 Loadout Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-10

### 🎉 Initial Release

The first production-ready release of D2 Loadout Widget for StreamElements!

### ✨ Features

#### Core Functionality
- **Full Loadout Display** - Shows all equipped weapons, armor, stats, subclass, and artifact
- **Real-time Updates** - Auto-refreshes every 60 seconds (configurable)
- **Bungie API Integration** - Direct integration with Bungie.net Platform API
- **Character Support** - Works with all 3 classes (Warlock, Titan, Hunter)

#### Visual Features
- **Exotic Highlighting** - Exotic items displayed in golden text
- **Enhanced Perks** - Yellow arrow indicators for Enhanced perks (Edge of Fate Tier 2+)
- **Pinnacle Power** - Cyan color for max power level items
- **Character Emblem** - Profile emblem as header background
- **Final Shape Icons** - Modern stat icons from The Final Shape
- **Feathered Fade** - Smooth gradient fade at bottom edge
- **Compact Layout** - 760px wide, optimized for streams

#### Interactivity
- **Auto-Hide Mode** - Widget appears on command, then smoothly hides
- **Chat Commands** - Customizable commands (!loadout, !weapons, !armor, !stats, !subclass, !artifact)
- **Channel Points** - Support for channel point redemptions
- **Display Modes** - Show specific sections based on command

#### DIM Integration
- **DIM Link Generation** - Automatic loadout link creation
- **TinyURL Shortening** - Short, shareable links
- **Smart Filtering** - Only includes ~25 relevant mods (excludes ornaments, shaders, archetypes)
- **!dimlink Command** - Viewers can request loadout link in chat

#### Subclass & Build
- **Subclass Display** - Shows equipped super ability
- **Aspects** - Displays 2 equipped aspects with icons
- **Fragments** - Shows up to 5 equipped fragments with icons
- **Artifact Mods** - Displays all unlocked seasonal artifact mods (Season 27+)
- **Hover Tooltips** - Names appear on hover for aspects/fragments/artifacts

#### Technical
- **No Login Required** - Uses public profile data only
- **Secure Backend** - API keys stored server-side only
- **CORS Protection** - Configured for StreamElements domain
- **Error Handling** - Graceful error messages for common issues
- **Health Checks** - Backend monitoring endpoint

### 🔧 Backend

- **API Server** - Express.js backend hosted on Render.com
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/loadout/:bungieId` - Full loadout data (JSON)
  - `GET /api/dimlink/:bungieId` - DIM link only (JSON)
  - `GET /api/dimlink/:bungieId?format=text` - Plain text for StreamElements
- **Bungie API** - Components: 100, 104, 200, 202, 205, 300, 304, 305
- **TinyURL Integration** - v2 API for link shortening
- **iconSequences Support** - Uses correct frame for artifact mod icons

### 🎨 Widget

- **HTML** - Semantic markup with accessibility
- **CSS** - 1020 lines of polished styling
- **JavaScript** - 1112 lines of vanilla JS (no dependencies)
- **Fields** - Comprehensive configuration options
- **Instructions** - Built-in setup guide

### 📖 Documentation

- **README.md** - Complete project overview
- **INSTALLATION_GUIDE.md** - Step-by-step setup for streamers
- **USER_GUIDE.md** - Feature documentation and configuration
- **DIM_LINK_CHAT_COMMAND.md** - Chat command setup guide
- **PROJECT_SPEC.md** - Technical architecture documentation
- **VISUAL_SPEC.md** - UI/UX design reference
- **40+ additional docs** - Comprehensive development documentation

### 🐛 Bug Fixes

- Fixed artifact mod icon brightness (using iconSequences[0].frames[0])
- Fixed artifact mod background color (#242424 for consistency)
- Fixed DIM link generation (chat command calls /api/loadout internally)
- Fixed empty DIM links from StreamElements commands
- Fixed enhanced perk detection for Edge of Fate weapons (Tier 2-5)
- Fixed stats accuracy (verified with 160 Discipline character)
- Fixed channel point handling (removed dimlink from widget, chat only)

### 🔒 Security

- API keys stored as environment variables (never committed)
- CORS configured for StreamElements and localhost only
- All Bungie API calls proxied through backend
- No OAuth tokens stored client-side
- No viewer data collected or stored

### ✅ Tested & Verified

- ✅ All 3 character classes (Warlock, Titan, Hunter)
- ✅ All subclass types (Arc, Solar, Void, Stasis, Strand, Prismatic)
- ✅ Enhanced perk arrows (Tier 2-5 weapons)
- ✅ Stats accuracy (160 Discipline confirmed)
- ✅ DIM link filtering (~25 relevant mods)
- ✅ TinyURL link generation
- ✅ Chat command integration
- ✅ Season 27 artifact mods
- ✅ Auto-hide animations
- ✅ StreamElements compatibility

### 📦 Dependencies

**Backend:**
- express ^4.18.2
- axios ^1.6.0
- cors ^2.8.5
- dotenv ^16.3.1

**Widget:**
- No external dependencies (vanilla JavaScript)
- Roboto Condensed font (Google Fonts CDN)

### 🚀 Deployment

- **Backend**: Live at https://d2loadout-widget.onrender.com
- **Hosting**: Render.com (Free tier)
- **Uptime**: Health check endpoint for monitoring
- **Auto-deploy**: Deploys from GitHub main branch

---

## [Unreleased]

### Planned Features
- Screenshot examples in README
- Video tutorial for setup
- Multiple character support (switch between characters)
- Loadout comparison mode
- Custom color themes
- More granular display modes

### Known Issues
- First API request may be slow (Render.com free tier cold start)
- Very long armor/weapon names may truncate
- Artifact icon brightness varies slightly between mods (Bungie asset issue)

---

## Version History

- **1.0.0** (2025-10-10) - Initial production release
- **0.2.x** (2024-2025) - Private development and testing
- **0.1.x** (2024) - Early prototypes

---

**Format**: [Version] - Date

**Categories**:
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
