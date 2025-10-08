# 📐 Repository Structure Rules

**Last Updated:** October 7, 2025  
**Version:** 0.1

---

## 📁 Root Directory

**ONLY these files belong in root:**

```
d2loadout-widget/
├── .gitignore          ✅ Git configuration
├── README.md           ✅ Project overview ONLY
└── render.yaml         ✅ Deployment configuration
```

**That's it! Just 3 files!**

---

## 📚 Documentation Location

**ALL documentation goes in `docs/` folder:**

```
docs/
├── README.md                   # Documentation index
├── STATUS.md                   # Version status
├── PROJECT_SPEC.md             # Technical specification
├── V0.1_RELEASE.md             # Release notes
├── BUNGIE_APP_SETUP.md         # Setup guides
├── USER_GUIDE.md               # User documentation
├── ... etc                     # All other .md files
```

---

## 🚫 What NOT to Put in Root

### Never in root:
- ❌ STATUS.md
- ❌ PROJECT_SPEC.md
- ❌ RELEASE_NOTES.md
- ❌ SUMMARY.md
- ❌ CLEANUP.md
- ❌ Any documentation files
- ❌ Temporary files
- ❌ Test files

### Always put in docs/:
- ✅ All .md files except README.md
- ✅ Documentation of any kind
- ✅ Release notes
- ✅ Status updates
- ✅ Specifications
- ✅ Guides and tutorials

---

## 📝 README.md Guidelines

**Root README.md should contain:**
- ✅ Project title and brief description
- ✅ Quick features list
- ✅ Quick start / usage example
- ✅ Links to docs/ folder
- ✅ Basic installation steps
- ✅ License information

**Root README.md should NOT contain:**
- ❌ Detailed technical specifications
- ❌ Complete API documentation
- ❌ Step-by-step guides
- ❌ Development history
- ❌ Detailed status updates
- ❌ Release notes

**Keep it SHORT! Link to docs/ for details.**

---

## 🎯 Why This Structure?

### Benefits:
1. **Clean Root** - Easy to understand at a glance
2. **Organized Docs** - All documentation in one place
3. **Easy Navigation** - docs/README.md as index
4. **Professional** - Industry standard structure
5. **No Clutter** - No temporary files in root
6. **Easy Maintenance** - Clear where everything goes

### Industry Standard:
```
project/
├── README.md           # Overview
├── LICENSE             # License
├── .gitignore          # Git config
├── package.json        # If Node.js project
├── docker-compose.yml  # If using Docker
├── src/                # Source code
├── tests/              # Tests
└── docs/               # ALL documentation
```

---

## 🔧 When Creating New Files

### New documentation file?
→ Put it in `docs/`

### New status update?
→ Update `docs/STATUS.md`

### New release notes?
→ Put in `docs/` (e.g., `docs/V0.2_RELEASE.md`)

### New guide or tutorial?
→ Put in `docs/`

### Summary or cleanup notes?
→ Put in `docs/` or delete when done

### Temporary working file?
→ Put in `docs/` or better yet, don't commit it

---

## ✅ Quick Checklist

Before committing, verify:
- [ ] Only .gitignore, README.md, render.yaml in root
- [ ] All .md files (except README.md) are in docs/
- [ ] No temporary files in root
- [ ] No duplicate documentation
- [ ] docs/README.md is updated if needed
- [ ] Root README.md links to docs/ correctly

---

## 🎉 Result

**Root directory stays clean forever!**

```
d2loadout-widget/
├── .gitignore
├── README.md
└── render.yaml         ← Only 3 files! Beautiful! ✨
```

**All documentation organized:**

```
docs/
└── 19 well-organized files with clear index
```

---

**Remember: If it's a .md file and it's not README.md, it goes in docs/!** 📚✨
