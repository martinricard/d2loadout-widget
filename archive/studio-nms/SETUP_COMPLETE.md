# 🔒 Protected Distribution - Complete Setup
# Studio Notice Me Senpai (Studio NMS)

## ✅ What's Been Created

The `studio-nms/` folder now contains everything you need to distribute your D2 Loadout Widget with **code protection**:

### 📁 Files Created

```
studio-nms/
├── README.md              # Full documentation
├── QUICK_START.md         # 5-minute setup guide
├── build-protected.js     # Build script (creates dist/)
├── widget-loader.js       # Loader script template
├── loader.html            # What users paste in HTML tab
├── fields.json            # What users paste in Fields tab
└── dist/                  # Generated files (after build)
    ├── d2loadout-widget.min.js   # Main loader
    ├── widget.min.css            # Minified styles
    ├── widget-core.min.js        # Minified widget logic
    ├── widget.html               # HTML template
    └── widget-core.js            # Unminified (debug)
```

## 🎯 How It Works

### Current (Open Source) Distribution:
Users paste 1000+ lines of HTML/CSS/JS → Anyone can copy your code ❌

### Protected Distribution:
Users paste 10 lines of loader HTML → Your code stays on your CDN ✅

## 🚀 Next Steps

### Step 1: Build Protected Files
```bash
cd studio-nms
node build-protected.js
```

This creates the `dist/` folder with minified files.

### Step 2: Host Files
Upload `dist/` folder to:
- **GitHub Pages** (free, easiest)
- **Cloudflare Pages** (free, fastest)
- **Netlify** (free)
- **Your own server**

### Step 3: Update Loader
Edit `loader.html` with your CDN URL:
```html
script.src = 'https://YOUR-ACTUAL-URL.com/d2loadout-widget.min.js?_t=' + Date.now();
```

### Step 4: Distribute
Give users:
1. `loader.html` (paste in HTML tab)
2. `fields.json` (paste in Fields tab)

Done! Your code is protected. 🔒

## 📖 Full Guides

- **QUICK_START.md** - 5-minute setup for GitHub Pages
- **README.md** - Complete documentation with all hosting options

## 💡 Benefits

✅ **Code Protection** - Users can't see/steal your implementation  
✅ **Automatic Updates** - Fix bugs once, everyone gets it  
✅ **Smaller Files** - Minified code = faster loading  
✅ **Centralized Control** - You own the distribution  
✅ **Professional** - Like commercial widget makers  

## ⚠️ Prerequisites

Install build tools (one-time):
```bash
npm install -g terser clean-css-cli
```

## 📊 File Size Comparison

**Before (Open Source):**
- widget.html: ~5KB
- widget.css: ~20KB
- widget.js: ~45KB
- **Total: ~70KB** that users can copy

**After (Protected):**
- User sees: 10 lines of HTML (loader)
- Your CDN hosts: ~35KB minified
- **50% size reduction + code protected!**

## 🔄 Updating Process

1. Make changes to source files
2. Run `node build-protected.js`
3. Upload new `dist/` files to CDN (overwrite)
4. Users automatically get updates!

No need to notify users - the `?_t=` timestamp forces cache refresh.

## 🎓 Learning Resources

- **How Nanitabs works**: Same concept - loader + remote code
- **JavaScript obfuscation**: Optional extra protection layer
- **CDN hosting**: Free options with global distribution
- **CORS**: Required for cross-origin resource loading

## 🤔 FAQs

**Q: Will this slow down widget loading?**  
A: No! CDNs are fast, and minification actually makes it faster.

**Q: Can users still steal my code?**  
A: Advanced users can view network requests, but it's minified and hard to understand. For maximum protection, add obfuscation.

**Q: What if my CDN goes down?**  
A: Widget won't work. Use reliable hosting (GitHub Pages has 99%+ uptime).

**Q: Can I charge for my widget now?**  
A: Yes! You can add license validation to the loader.

**Q: How do I debug if something breaks?**  
A: Keep the unminified `widget-core.js` file for debugging. Or temporarily host unminified versions.

## 🛠️ Advanced: Add Obfuscation

For maximum protection (makes code unreadable):

```bash
npm install -g javascript-obfuscator
cd nanitabs/dist
javascript-obfuscator widget-core.min.js --output widget-core.min.js --compact true --self-defending true
```

This makes reverse-engineering extremely difficult.

## 📞 Support

If you need help:
1. Read QUICK_START.md for step-by-step setup
2. Check README.md for detailed documentation
3. Test locally before distributing
4. Join widget development communities

---

## ⚡ TL;DR - Get Started Now

```bash
# 1. Build
cd studio-nms
node build-protected.js

# 2. Host on GitHub Pages (or any hosting)
# 3. Update loader.html with your URL
# 4. Give users loader.html + fields.json

# Your code is now protected! 🎉
```

---

**Made with 🔒 by Studio Notice Me Senpai (Studio NMS)**
