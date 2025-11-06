# Pre-Release Checklist

**Target Version:** v0.2.0 (or v1.0.0 if ready for production)  
**Date:** October 10, 2025

## ✅ Completed Features

### Core Functionality
- [x] Widget displays character loadout (weapons, armor, stats, subclass, artifact)
- [x] Real-time data fetching from Bungie API
- [x] Auto-refresh every 60 seconds (configurable)
- [x] Enhanced perk detection for Edge of Fate weapons (Tier 2+)
- [x] Weapon tier detection via ornaments
- [x] Character stats display (new stat names: Weapons, Health, Class, etc.)
- [x] Subclass aspects and fragments display
- [x] Artifact mods display (Season 27)
- [x] DIM link generation with TinyURL shortening
- [x] Chat command integration (`!dimlink` via StreamElements)

### Visual Features
- [x] Character emblem background
- [x] Exotic item highlighting (gold color)
- [x] Enhanced perk arrows on weapon perks
- [x] Pinnacle power level indicator (+)
- [x] Auto-hide functionality with feathered edge effect
- [x] Responsive layout (compact/standard/full modes)
- [x] Section visibility toggles

### StreamElements Integration
- [x] Chat commands: `!loadout`, `!weapons`, `!armor`, `!stats`, `!subclass`, `!artifact`
- [x] Channel point redemptions support
- [x] Display modes (full, weapons-only, armor-only, etc.)
- [x] Auto-hide duration (configurable)

### Backend API
- [x] `/api/loadout/:bungieId` - Full loadout data
- [x] `/api/dimlink/:bungieId` - DIM link only (for chat commands)
- [x] `/health` - Health check endpoint
- [x] Bungie API integration with proper error handling
- [x] Manifest caching for performance
- [x] DIM link mod filtering (~25 mods, excludes ornaments/shaders/archetypes)

## 🔄 In Progress

### Testing
- [ ] **Full end-to-end testing**
  - Test with different Bungie IDs
  - Test with all 3 classes (Titan, Hunter, Warlock)
  - Test with exotic armor and weapons
  - Test with different subclass configurations
  - Test artifact mod display consistency after backend deployment

### Bug Fixes
- [ ] Verify artifact mod icon brightness consistency after deployment
- [ ] Test DIM link with various loadout configurations
- [ ] Verify enhanced perk arrows on all Edge of Fate Tier 2+ weapons

## 📋 Pre-Release Tasks

### Documentation ✅ COMPLETED
- [x] **Update main README.md** ✅ DONE
  - Added comprehensive feature list
  - Added quick start guide
  - Added chat commands documentation
  - Added configuration tables
  - Added troubleshooting section
  - Added usage tips
  - Added tech stack overview
  - Added development guide
  - Added support information

- [x] **Create installation guide** ✅ DONE
  - Created `docs/INSTALLATION_GUIDE.md`
  - Step-by-step StreamElements setup (8 steps)
  - Field configuration guide
  - Chat command setup instructions
  - Channel point setup guide
  - Comprehensive troubleshooting section
  - Beginner-friendly with examples

- [x] **Create CHANGELOG.md** ✅ DONE
  - Created version 1.0.0 changelog
  - Documented all features
  - Listed bug fixes
  - Included dependencies
  - Noted tested features
  - Added known issues and planned features

- [ ] **Create video tutorial** (optional)
  - Widget setup walkthrough
  - Feature demonstration

### Code Quality
- [ ] **Code cleanup**
  - Remove debug console.log statements (or make them conditional)
  - Remove commented-out code
  - Verify all functions have proper error handling

- [ ] **Performance optimization**
  - Verify API caching is working
  - Check for memory leaks in auto-refresh
  - Optimize image loading

- [ ] **Security audit**
  - Verify API keys are in environment variables
  - Check for exposed sensitive data
  - Validate input sanitization

### Version Management
- [ ] **Update version numbers**
  - `package.json` version
  - Widget CSS/JS version comments
  - Documentation version references

- [ ] **Create CHANGELOG.md**
  - Document all features
  - List bug fixes
  - Note breaking changes (if any)

- [ ] **Git tagging**
  - Create release branch
  - Tag with version number
  - Push to GitHub

### Deployment
- [ ] **Backend deployment**
  - Commit and push all changes to GitHub
  - Verify Render auto-deployment
  - Test production endpoints
  - Monitor logs for errors

- [ ] **Widget files**
  - Ensure all files in `/widget/` are up to date
  - Test widget.html standalone
  - Verify fields.json is complete

### Release Preparation
- [ ] **Create GitHub Release**
  - Write release notes
  - Upload widget files as assets
  - Include setup instructions link

- [ ] **Test installation**
  - Fresh StreamElements custom widget installation
  - Follow setup guide step-by-step
  - Document any missing steps

- [ ] **Community preparation**
  - Prepare announcement post
  - Create support channel/thread
  - Set up issue templates

## 🐛 Known Issues

### Minor Issues
1. **Artifact mod icon brightness** - Some icons appear paler than others
   - **Status:** Backend fix implemented (iconSequences[0].frames[0])
   - **Next step:** Deploy and verify

### Non-Critical
1. **Widget.js dimlink recognition** - Logs message but doesn't need action (handled by bot)
   - **Status:** Working as intended

## 📝 Optional Enhancements (Post-Release)

### Future Features
- [ ] Multiple loadout profiles
- [ ] Loadout comparison view
- [ ] Historical stats tracking
- [ ] Custom color themes
- [ ] Mobile-responsive layout
- [ ] DIM link caching to reduce API calls
- [ ] Rate limiting for chat commands
- [ ] Support for multiple Bungie IDs in one widget

### Community Requests
- [ ] (To be added based on user feedback)

## 🎯 Release Criteria

### Must-Have (Blocking Release)
- [ ] All API endpoints working in production
- [ ] Chat commands functional in StreamElements
- [ ] DIM links generate correctly
- [ ] Widget displays without errors
- [ ] Documentation complete (README + setup guide)

### Should-Have (Important)
- [ ] All known bugs fixed or documented
- [ ] Performance tested with real data
- [ ] Error messages are user-friendly
- [ ] Changelog created

### Nice-to-Have (Optional)
- [ ] Video tutorial
- [ ] Multiple language support
- [ ] Advanced customization options

## 📅 Release Timeline

**Target Date:** TBD

### Week 1 (Current)
- Complete testing
- Update documentation
- Deploy backend fixes

### Week 2
- Final testing
- Create release
- Announce to community

## 🚀 Post-Release Plan

1. **Monitor feedback** - Watch for bug reports and feature requests
2. **Quick fixes** - Address critical bugs within 24-48 hours
3. **Update documentation** - Add FAQ based on common questions
4. **Community support** - Respond to user questions
5. **Plan v1.1** - Gather feedback for next release

---

## Notes

- Current backend: https://d2loadout-widget.onrender.com
- GitHub repo: martinricard/d2loadout-widget
- Main tester: Marty#2689 (Warlock)
- Season: 27 (Edge of Fate DLC)

## Immediate Next Steps

1. ✅ Commit current changes (artifact icon background fix)
2. ✅ Push to GitHub for Render deployment
3. ⏳ Test artifact mod icon consistency
4. ⏳ Update README.md
5. ⏳ Create installation guide
6. ⏳ Full end-to-end testing
7. ⏳ Create GitHub release
