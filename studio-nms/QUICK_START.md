# Quick Start: Protected Distribution

## 🎯 Goal
Distribute your D2 Loadout Widget with code protection - users get a simple loader, your code stays hidden.

## ⚡ Fast Setup (5 minutes)

### 1. Build Protected Version

```bash
cd studio-nms
node build-protected.js
```

This creates `dist/` folder with minified files.

### 2. Host on GitHub Pages (Free & Easy)

**Option A: Same Repository**
```bash
# Copy dist files to a public folder
mkdir -p ../public
cp dist/* ../public/
git add ../public
git commit -m "Add protected widget build"
git push

# Enable GitHub Pages:
# Go to Settings → Pages → Source: main branch → /public folder
```

**Option B: Separate Repository** (recommended for cleaner organization)
```bash
# Create new repo on GitHub: yourusername/d2loadout-widget-cdn
git clone https://github.com/yourusername/d2loadout-widget-cdn
cd d2loadout-widget-cdn
cp ../d2loadout-widget/studio-nms/dist/* .
git add .
git commit -m "Initial widget build"
git push

# Enable GitHub Pages:
# Settings → Pages → Source: main branch → / (root)
```

Your CDN URL will be: `https://yourusername.github.io/d2loadout-widget-cdn/`

### 3. Update Loader with Your CDN URL

Edit `loader.html` line 7:
```html
script.src = 'https://yourusername.github.io/d2loadout-widget-cdn/d2loadout-widget.min.js?_t=' + Date.now();
```

### 4. Distribute to Users

Give users these 2 files:
- `loader.html` (paste in HTML tab)
- `fields.json` (paste in Fields tab)

That's it! Users can't see your code. ✨

## 🚀 Alternative Hosting Options

### Cloudflare Pages (Fastest CDN)
1. Sign up at cloudflare.com
2. Create new Pages project
3. Upload `dist/` folder
4. Get URL: `https://your-project.pages.dev`

### Netlify
1. Sign up at netlify.com
2. Drag & drop `dist/` folder
3. Get URL: `https://your-site.netlify.app`

### Your Own Server
Upload `dist/` files to any web server with HTTPS.

## 🔄 Updating Your Widget

When you fix bugs or add features:

```bash
# 1. Make changes to widget source files
# 2. Rebuild
cd studio-nms
node build-protected.js

# 3. Re-upload dist/ files to your CDN
# (same filenames, overwrites old files)

# 4. Users automatically get updates!
# (thanks to ?_t= cache busting)
```

No need to notify users - they get updates automatically! 🎉

## 📊 File Sizes

Typical output:
- `d2loadout-widget.min.js` - ~2KB (loader)
- `widget.min.css` - ~8KB (styles, 40-60% smaller)
- `widget-core.min.js` - ~25KB (logic, minified)

Total: ~35KB (fast loading!)

## ⚠️ Important: CORS Setup

Your CDN must allow CORS from StreamElements:

**GitHub Pages**: ✅ Works automatically
**Cloudflare Pages**: ✅ Works automatically  
**Custom Server**: Add to server config:

```
Access-Control-Allow-Origin: *
```

Or specifically for StreamElements:
```
Access-Control-Allow-Origin: https://*.streamelements.com
```

## ✅ Testing

Before distributing:

1. **Test locally**: Open `loader.html` in browser (won't work until hosted)
2. **Test in StreamElements**:
   - Create test overlay
   - Add custom widget
   - Paste loader.html + fields.json
   - Configure Bungie ID
   - Check if widget loads

## 💡 Pro Tips

1. **Version Control**: Keep source and dist in sync
2. **Backup**: Save dist files before rebuilding
3. **Monitor**: Check CDN bandwidth usage
4. **Support**: Keep original files for debugging
5. **Updates**: Announce major updates to users

## 🔒 Security Notes (Studio NMS Protection)

- ✅ Code is minified and hard to read
- ✅ Users can't modify or steal code easily
- ✅ You control all updates
- ⚠️ Advanced users can still view network requests
- ⚠️ For maximum protection, add obfuscation:
  ```bash
  npx javascript-obfuscator dist/widget-core.min.js --output dist/widget-core.min.js
  ```

## 📝 What Users See

**HTML Tab:**
```html
<head><script>/* loader script */</script></head>
<body></body>
```

**CSS Tab:** (empty)

**JS Tab:** (empty)

**Fields Tab:**
```json
{ "bungieInput": { ... }, "autoHide": { ... } }
```

Your actual widget code? Hidden on your CDN. 🔒

---

**Ready to protect your code? Run `node build-protected.js` now!**
