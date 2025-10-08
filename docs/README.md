# 📚 Documentation Index - v0.1

Complete documentation for the D2 Loadout Widget

---

## 📋 Overview

- **[Version 0.1 Release Notes](V0.1_RELEASE.md)** - What's new and included
- **[Project Status](STATUS.md)** - Current features and roadmap
- **[Project Specification](PROJECT_SPEC.md)** - Complete technical details

---

## 🚀 Getting Started

### Setup & Deployment
- **[Bungie App Setup](BUNGIE_APP_SETUP.md)** - Create your Bungie API application
- **[Bungie Configuration](BUNGIE_CONFIG.md)** - API credentials setup
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Commit Checklist](COMMIT_CHECKLIST.md)** - Before committing changes

---

## 📖 User Guides

### For Streamers
- **[User Guide](USER_GUIDE.md)** - How to use the widget on your stream
- **[Visual Specification](VISUAL_SPEC.md)** - Widget appearance and customization

### For Developers
- **[Simplified Overview](SIMPLIFIED.md)** - High-level system architecture
- **[Data Audit](DATA_AUDIT.md)** - Complete list of captured data

---

## 🔧 Technical Documentation

### Architecture
- **[Authentication Strategy](AUTH_STRATEGY.md)** - Public API approach (no OAuth)
- **[No Secret Needed](NO_SECRET_NEEDED.md)** - Why OAuth isn't required
- **[External Hosting](EXTERNAL_HOSTING.md)** - Render.com deployment details

### Implementation Details
- **[Artifact Implementation](ARTIFACT_IMPLEMENTATION.md)** - How artifact mods work
- **[Images and Icons](IMAGES_AND_ICONS.md)** - Image loading from Bungie CDN

### Reference
- **[OAuth and Hosting](OAUTH_AND_HOSTING.md)** - Why we don't use OAuth
- **[Answered Questions](ANSWERED.md)** - Common questions and solutions

---

## 📊 Quick Reference

### File Structure
```
d2loadout-widget/
├── .gitignore
├── README.md           # Project overview (START HERE!)
├── render.yaml         # Render.com deployment config
│
├── backend/            # Node.js API server
│   ├── server.js       # Main server file
│   ├── package.json    # Dependencies
│   └── .env.example    # Environment template
│
├── widget/             # StreamElements widget
│   ├── widget.html     # Widget structure
│   ├── widget.css      # Widget styling
│   ├── widget.js       # Widget logic
│   ├── fields.json     # Widget settings
│   └── README.md       # Widget installation
│
└── docs/               # All documentation (you are here)
    ├── README.md             # This file
    ├── STATUS.md             # Current version status
    ├── PROJECT_SPEC.md       # Technical specification
    ├── V0.1_RELEASE.md       # Release notes
    └── ... (15 more guides)
```

### Key URLs
- **Live API:** https://d2loadout-widget.onrender.com
- **Health Check:** https://d2loadout-widget.onrender.com/health
- **Loadout Endpoint:** https://d2loadout-widget.onrender.com/api/loadout/YourName#1234

---

## 🎯 Quick Links by Task

### "I want to deploy this"
1. [Bungie App Setup](BUNGIE_APP_SETUP.md)
2. [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
3. [External Hosting](EXTERNAL_HOSTING.md)

### "I want to use this on my stream"
1. [User Guide](USER_GUIDE.md)
2. [Visual Specification](VISUAL_SPEC.md)
3. [Widget README](../widget/README.md)

### "I want to understand how it works"
1. [Simplified Overview](SIMPLIFIED.md)
2. [Authentication Strategy](AUTH_STRATEGY.md)
3. [Data Audit](DATA_AUDIT.md)

### "I want to customize it"
1. [Visual Specification](VISUAL_SPEC.md)
2. [Images and Icons](IMAGES_AND_ICONS.md)
3. [Artifact Implementation](ARTIFACT_IMPLEMENTATION.md)

---

## 📝 Version Info

- **Version:** 0.1 (Initial Release)
- **Last Updated:** October 7, 2025
- **Status:** Production Ready ✅
- **Bungie API:** Public data only (no OAuth)
- **Hosting:** Render.com free tier

---

**For the main project overview, see [../README.md](../README.md)**
