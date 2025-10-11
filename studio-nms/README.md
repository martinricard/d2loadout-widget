# D2 Loadout Widget - Protected Distribution Setup
# Studio Notice Me Senpai (Studio NMS)

This folder contains files for distributing the D2 Loadout Widget with code protection.

## 🔒 How It Works (Studio NMS Protection)

Instead of users copying your HTML/CSS/JS directly into StreamElements, they only paste a simple loader that fetches your widget from an external server. This:

1. **Protects your code** - Users can't see or steal your implementation
2. **Centralized updates** - Fix bugs once, everyone gets the update
3. **Analytics** - Track widget usage (optional)
4. **Licensing control** - Can require widget IDs or validation

## 📦 What Users Get

Users only paste this into StreamElements HTML tab:

```html
<head>
  <script>
    const script = document.createElement('script');
    script.src = 'https://YOUR-CDN.com/d2loadout-widget.js?_t=' + Date.now();
    script.async = true;
    script.setAttribute('data-widget-id', "d2loadout-widget");
    document.head.appendChild(script);
  </script>
</head>

<body>
</body>
```

And your field configuration in the Fields tab.

## 🚀 Setup Steps

### 1. Host Your Widget Files

You need to host these files on a CDN or web server:

- `d2loadout-widget.js` - The bundled widget loader
- `widget.css` - Your widget styles
- `widget-core.js` - Your widget logic

**Hosting Options:**
- **GitHub Pages** (free, simple)
- **Cloudflare Pages** (free, fast CDN)
- **Netlify** (free tier available)
- **AWS S3 + CloudFront** (paid, professional)
- **Your own server**

### 2. Create the Loader Script

The loader script (`d2loadout-widget.js`) will:
1. Load your CSS
2. Load your widget HTML
3. Initialize your widget code
4. Pass field data from StreamElements

### 3. Bundle Your Code

Use the provided build script to create minified, obfuscated versions:

```bash
npm run build:protected
```

This creates:
- `dist/d2loadout-widget.min.js` - Minified loader
- `dist/widget.min.css` - Minified styles
- `dist/widget-core.min.js` - Obfuscated widget logic

### 4. Upload to CDN

Upload the `dist/` folder contents to your hosting provider.

### 5. Update Loader URL

Update the loader HTML with your actual CDN URL:

```html
script.src = 'https://YOUR-ACTUAL-CDN.com/d2loadout-widget.min.js?_t=' + Date.now();
```

## 📋 Files in This Folder

- `loader.html` - HTML template for users to paste
- `fields.json` - Field configuration (users paste in Fields tab)
- `build-loader.js` - Script to create the loader
- `widget-loader.js` - Main loader script template
- `README.md` - This file

## 🔧 Building the Protected Version

### Prerequisites

```bash
npm install -g terser
npm install -g clean-css-cli
npm install -g javascript-obfuscator
```

### Build Command

```bash
node build-protected.js
```

This will:
1. Minify CSS (reduces size ~60%)
2. Obfuscate JavaScript (makes it unreadable)
3. Bundle everything into a single loader
4. Output to `dist/` folder

## 🎯 User Installation

Users will follow these simple steps:

1. Go to StreamElements → Overlays → Add Widget → Custom Widget
2. **HTML Tab**: Paste the loader HTML
3. **CSS Tab**: Leave empty (loaded remotely)
4. **JS Tab**: Leave empty (loaded remotely)
5. **Fields Tab**: Paste the fields.json
6. Configure their Bungie ID in widget settings
7. Done!

## 🔄 Updating Your Widget

When you fix bugs or add features:

1. Update your source files
2. Run `npm run build:protected`
3. Upload new files to CDN (same filenames)
4. All users automatically get the update (due to `?_t=` cache busting)

No need for users to reinstall anything!

## 🔐 Optional: License Validation

You can add license checking to the loader:

```javascript
// In widget-loader.js
async function validateLicense(widgetId) {
  const response = await fetch(`https://your-api.com/validate/${widgetId}`);
  return response.ok;
}
```

Then only load the widget if validation passes.

## 📊 Optional: Analytics

Track widget usage:

```javascript
// In widget-loader.js
fetch('https://your-analytics.com/track', {
  method: 'POST',
  body: JSON.stringify({
    widgetId: widgetId,
    timestamp: Date.now()
  })
});
```

## ⚠️ Important Notes

1. **CORS**: Your CDN must allow CORS from `*.streamelements.com`
2. **HTTPS**: Must use HTTPS (StreamElements requires it)
3. **Cache Busting**: The `?_t=` parameter prevents browser caching
4. **Minification**: Reduces bandwidth and load times
5. **Obfuscation**: Makes code harder (but not impossible) to steal

## 📝 Example CDN Setup (GitHub Pages)

1. Create a new repository: `d2loadout-widget-cdn`
2. Enable GitHub Pages in settings
3. Upload files to root or `/docs` folder
4. Your URL will be: `https://USERNAME.github.io/d2loadout-widget-cdn/`

## 🎨 Customization

Users can still customize via fields:
- Colors (if you add color fields)
- Commands
- Display settings
- All your existing field options

They just can't modify the core code.

## 💡 Benefits Over Open Source Distribution

**Open Source (Current):**
- ✅ Transparent
- ✅ Users can customize
- ❌ Code can be stolen
- ❌ Users need to manually update
- ❌ Hard to track usage

**Protected Distribution:**
- ✅ Code protected
- ✅ Automatic updates
- ✅ Usage tracking possible
- ✅ Can monetize
- ❌ Less transparent
- ❌ Users depend on your hosting

## 🚀 Next Steps

1. Decide on hosting provider
2. Run build script to create protected version
3. Upload to CDN
4. Test with StreamElements
5. Distribute loader HTML + fields.json to users

---

**Made for Destiny 2 Streamers** 🎮
