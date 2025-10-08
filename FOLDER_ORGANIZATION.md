# 📁 Widget Folder Organization

## ✅ Clean Structure - No More Clutter!

Your widget folder is now organized with separate folders for backups and archives.

---

## 📂 Current Structure:

```
widget/
├── 📄 widget.html          ← Active HTML (clean version)
├── 📄 widget.css           ← Active CSS (clean version)
├── 📄 widget.js            ← Active JavaScript (clean version)
├── 📄 fields.json          ← Active field config
├── 📄 README.md            ← Widget documentation
├── 📁 backups/             ← Old/backup files
│   ├── widget-old.html
│   ├── widget-old.js
│   ├── fields-old.json
│   ├── widget-backup-20251008-094640.css
│   └── README.md
└── 📁 archive/             ← Reference/template files
    ├── widget-clean.css    (your crispy template)
    ├── widget-clean.html   (clean template)
    └── README.md
```

---

## 📁 Folder Purposes:

### **Root (`widget/`)**
Active files currently in use by your widget:
- `widget.html` - Current HTML
- `widget.css` - Current CSS (clean version)
- `widget.js` - Current JavaScript
- `fields.json` - Current settings
- `README.md` - Widget documentation

### **`backups/`**
Previous versions created during development:
- Files saved before switching to clean version
- Timestamped CSS backups
- Can be restored if needed
- Safe to delete after confirming new version works

### **`archive/`**
Reference versions and templates:
- Clean working CSS (your crispy baseline)
- Template files for future modifications
- Known-good versions to compare against
- Keep these as reference!

---

## 🔄 How to Restore from Backup:

```powershell
# Restore previous HTML
Copy-Item "widget\backups\widget-old.html" "widget\widget.html" -Force

# Restore previous JavaScript
Copy-Item "widget\backups\widget-old.js" "widget\widget.js" -Force

# Restore previous CSS
Copy-Item "widget\backups\widget-backup-20251008-094640.css" "widget\widget.css" -Force

# Restore previous fields
Copy-Item "widget\backups\fields-old.json" "widget\fields.json" -Force
```

---

## 📋 Use Clean Template:

```powershell
# Start new CSS from clean template
Copy-Item "widget\archive\widget-clean.css" "widget\widget-new.css"

# Compare current vs clean
code --diff "widget\widget.css" "widget\archive\widget-clean.css"
```

---

## 🗑️ Cleanup After Testing:

Once you've confirmed the new version works perfectly:

```powershell
# Delete old backups (optional)
Remove-Item "widget\backups\widget-old.*" -Force
Remove-Item "widget\backups\widget-backup-*.css" -Force

# Keep archive folder - those are your reference templates!
```

---

## 📊 File Inventory:

| Location | Files | Purpose |
|----------|-------|---------|
| `widget/` | 5 files | **Active/Production** files |
| `widget/backups/` | 5 files | **Backup** versions from Oct 8, 2025 |
| `widget/archive/` | 3 files | **Reference** templates (keep forever!) |

---

## ✨ Benefits:

- ✅ **Clean root folder** - Only active files visible
- ✅ **Easy to find** - Backups in one place
- ✅ **Safe templates** - Archive preserved
- ✅ **Clear purpose** - Each folder documented
- ✅ **No clutter** - Organized structure

---

## 🎯 What to Deploy:

**Only copy these files to StreamElements:**
```
widget/widget.html   → Custom Widget HTML
widget/widget.css    → Custom Widget CSS
widget/widget.js     → Custom Widget JS
widget/fields.json   → Custom Widget Fields
```

**Do NOT upload:**
- ❌ `backups/` folder
- ❌ `archive/` folder
- ❌ `README.md` files

---

**Your widget folder is now clean and organized!** 🎉
