# 🌐 External Widget Hosting (Advanced Option)

## Overview

You can host the widget on your own web server and load it into StreamElements using a loader script - exactly like the widget you showed!

---

## 🎯 Why Use External Hosting?

### Pros:
- ✅ **More Control**: Update widget without touching StreamElements
- ✅ **Advanced Features**: Can have complex interactions
- ✅ **Version Management**: Easy to push updates
- ✅ **Better Performance**: Direct CDN access
- ✅ **Easier Development**: Test locally, deploy anywhere
- ✅ **One Codebase**: Same widget works on StreamElements & Streamlabs

### Cons:
- ❌ Need to host files somewhere (but cheap/free options exist!)
- ❌ Slightly more setup

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│ StreamElements Widget (Minimal HTML)               │
│ Just loads: widget-loader.js?widget-id=xxx         │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ Your Web Host (GitHub Pages, Netlify, etc.)        │
│ - widget-loader.js (loads full widget)             │
│ - loadout-widget.html (full UI)                    │
│ - loadout-widget.css (styling)                     │
│ - loadout-widget.js (logic)                        │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ Render Backend API                                  │
│ https://d2loadout-widget.onrender.com              │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Implementation

### 1. StreamElements Widget (Minimal)

#### HTML:
```html
<head>
  <script>
    const script = document.createElement('script');
    // Your widget host URL
    script.src = 'https://your-host.com/d2-loadout-loader.js?_t=' + Date.now();
    script.async = true;
    script.setAttribute('data-widget-id', "{{widgetId}}");
    document.head.appendChild(script);
  </script>
</head>

<body>
  <!-- Widget content will be injected here -->
</body>
```

#### Fields JSON (Same as before):
```json
{
  "widgetId": {
    "type": "hidden",
    "label": "Widget ID",
    "value": "d2-loadout-widget-v1"
  },
  "bungieInput": {
    "type": "text",
    "label": "🎮 Your Bungie Name",
    "value": "",
    "placeholder": "Marty#2689",
    "group": "⚙️ ⋮ Settings"
  },
  "characterSelect": {
    "type": "dropdown",
    "label": "Character",
    "value": "last-played",
    "options": {
      "last-played": "Last Played",
      "hunter": "Hunter",
      "titan": "Titan",
      "warlock": "Warlock"
    },
    "group": "⚙️ ⋮ Settings"
  },
  "widgetSize": {
    "type": "dropdown",
    "label": "Widget Size",
    "value": "standard",
    "options": {
      "compact": "Compact",
      "standard": "Standard",
      "full": "Full (with perks/mods)"
    },
    "group": "⚙️ ⋮ Settings"
  },
  "showWeapons": {
    "type": "checkbox",
    "label": "Show Weapons",
    "value": true,
    "group": "🎨 ⋮ Display Options"
  },
  "showArmor": {
    "type": "checkbox",
    "label": "Show Armor",
    "value": true,
    "group": "🎨 ⋮ Display Options"
  },
  "showStats": {
    "type": "checkbox",
    "label": "Show Stats",
    "value": true,
    "group": "🎨 ⋮ Display Options"
  },
  "showSubclass": {
    "type": "checkbox",
    "label": "Show Subclass",
    "value": true,
    "group": "🎨 ⋮ Display Options"
  },
  "backgroundColor": {
    "type": "colorpicker",
    "label": "Background Color",
    "value": "#101014",
    "group": "🎨 ⋮ Colors"
  },
  "borderColor": {
    "type": "colorpicker",
    "label": "Border Color",
    "value": "#2c2c2f",
    "group": "🎨 ⋮ Colors"
  },
  "textColor": {
    "type": "colorpicker",
    "label": "Text Color",
    "value": "#ffffff",
    "group": "🎨 ⋮ Colors"
  },
  "exoticGlowColor": {
    "type": "colorpicker",
    "label": "Exotic Glow Color",
    "value": "#CEAE33",
    "group": "🎨 ⋮ Colors"
  },
  "fontFamily": {
    "type": "googleFont",
    "label": "Font Family",
    "value": "Roboto Condensed",
    "group": "🔠 ⋮ Font"
  },
  "refreshRate": {
    "type": "number",
    "label": "Refresh Rate (seconds)",
    "value": 60,
    "min": 30,
    "max": 300,
    "group": "⚙️ ⋮ Settings"
  },
  "version": {
    "type": "hidden",
    "label": "D2 Loadout Widget [ v1.0 ]",
    "value": ""
  },
  "credits": {
    "type": "text",
    "label": "💫 Created by martinricard",
    "value": "github.com/martinricard/d2loadout-widget",
    "group": "ℹ️ ⋮ Info"
  }
}
```

---

### 2. Loader Script (Host on your server)

#### `d2-loadout-loader.js`:
```javascript
(function() {
  'use strict';
  
  const widgetId = document.currentScript.getAttribute('data-widget-id');
  const baseUrl = 'https://your-host.com/widgets/d2-loadout/';
  
  // Load CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = `${baseUrl}loadout-widget.css?v=${Date.now()}`;
  document.head.appendChild(cssLink);
  
  // Load main widget script
  const mainScript = document.createElement('script');
  mainScript.src = `${baseUrl}loadout-widget.js?v=${Date.now()}`;
  mainScript.async = true;
  mainScript.onload = function() {
    // Initialize widget when loaded
    if (window.D2LoadoutWidget) {
      window.D2LoadoutWidget.init(widgetId);
    }
  };
  document.head.appendChild(mainScript);
  
  console.log('[D2 Loadout Widget] Loader initialized');
})();
```

---

### 3. Main Widget Files (Host on your server)

#### `loadout-widget.js`:
```javascript
window.D2LoadoutWidget = {
  fieldData: {},
  apiBase: 'https://d2loadout-widget.onrender.com',
  
  init: function(widgetId) {
    console.log('[D2 Loadout Widget] Initializing...');
    
    // Listen for StreamElements widget load event
    window.addEventListener('onWidgetLoad', (obj) => {
      this.fieldData = obj.detail.fieldData;
      this.createWidget();
      this.fetchLoadout();
    });
  },
  
  createWidget: function() {
    // Inject HTML structure into body
    const container = document.createElement('div');
    container.id = 'd2-loadout-widget';
    container.className = `widget-size-${this.fieldData.widgetSize || 'standard'}`;
    
    container.innerHTML = `
      <div class="loadout-container">
        <div class="character-info">
          <div class="character-name" id="characterName">Loading...</div>
          <div class="character-class" id="characterClass"></div>
        </div>
        
        <div class="weapons-section" id="weaponsSection"></div>
        <div class="armor-section" id="armorSection"></div>
        <div class="stats-section" id="statsSection"></div>
        <div class="subclass-section" id="subclassSection"></div>
        
        <div class="error-message" id="errorMessage" style="display:none;"></div>
        <div class="last-updated" id="lastUpdated">v1.0</div>
      </div>
    `;
    
    document.body.appendChild(container);
    this.applyStyles();
  },
  
  applyStyles: function() {
    const root = document.getElementById('d2-loadout-widget');
    if (!root) return;
    
    root.style.setProperty('--bg-color', this.fieldData.backgroundColor || '#101014');
    root.style.setProperty('--border-color', this.fieldData.borderColor || '#2c2c2f');
    root.style.setProperty('--text-color', this.fieldData.textColor || '#ffffff');
    root.style.setProperty('--exotic-glow', this.fieldData.exoticGlowColor || '#CEAE33');
    root.style.setProperty('--font-family', this.fieldData.fontFamily || 'Roboto Condensed');
  },
  
  fetchLoadout: async function() {
    const bungieInput = this.fieldData.bungieInput;
    
    if (!bungieInput) {
      this.showError('Please enter your Bungie Name in widget settings');
      return;
    }
    
    try {
      const url = `${this.apiBase}/api/loadout/${encodeURIComponent(bungieInput)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch loadout');
      }
      
      const data = await response.json();
      this.displayLoadout(data);
      
    } catch (error) {
      this.showError(error.message);
    }
    
    // Set up refresh interval
    const refreshRate = parseInt(this.fieldData.refreshRate || 60) * 1000;
    setInterval(() => this.fetchLoadout(), refreshRate);
  },
  
  displayLoadout: function(data) {
    // Update character info
    document.getElementById('characterName').textContent = data.displayName || 'Guardian';
    
    // Display weapons (if enabled)
    if (this.fieldData.showWeapons) {
      this.displayWeapons(data.weapons);
    }
    
    // Display armor (if enabled)
    if (this.fieldData.showArmor) {
      this.displayArmor(data.armor);
    }
    
    // Display stats (if enabled)
    if (this.fieldData.showStats) {
      this.displayStats(data.stats);
    }
    
    // Display subclass (if enabled)
    if (this.fieldData.showSubclass) {
      this.displaySubclass(data.subclass);
    }
    
    // Hide error
    document.getElementById('errorMessage').style.display = 'none';
  },
  
  displayWeapons: function(weapons) {
    // TODO: Implement weapon display
  },
  
  displayArmor: function(armor) {
    // TODO: Implement armor display
  },
  
  displayStats: function(stats) {
    // TODO: Implement stats display
  },
  
  displaySubclass: function(subclass) {
    // TODO: Implement subclass display
  },
  
  showError: function(message) {
    const errorEl = document.getElementById('errorMessage');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }
};
```

#### `loadout-widget.css`:
```css
#d2-loadout-widget {
  --bg-color: #101014;
  --border-color: #2c2c2f;
  --text-color: #ffffff;
  --exotic-glow: #CEAE33;
  --font-family: 'Roboto Condensed', sans-serif;
  
  font-family: var(--font-family);
  color: var(--text-color);
}

.loadout-container {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
}

/* More styles... */
```

---

## 🌐 Where to Host Your Widget Files

### Free Options:

#### 1. **GitHub Pages** (Recommended for free!) ✅
```bash
# Create a new repo: d2loadout-widget-files
# Add your files:
- /widgets/d2-loadout/
  - d2-loadout-loader.js
  - loadout-widget.js
  - loadout-widget.css

# Enable GitHub Pages in repo settings
# Access at: https://yourusername.github.io/d2loadout-widget-files/
```

#### 2. **Netlify** (Easy deployment) ✅
- Drag & drop your files
- Auto CDN
- Free SSL
- Custom domain support

#### 3. **Vercel** (Similar to Netlify) ✅
- Free hosting
- Fast CDN
- Easy updates

#### 4. **Cloudflare Pages** ✅
- Free unlimited bandwidth
- Fast global CDN

### Paid Options (If you want):
- Your own web host
- AWS S3 + CloudFront
- DigitalOcean Spaces

---

## 🎯 Benefits of External Hosting

### For You (Developer):
- Update widget without changing StreamElements code
- Version control
- A/B testing
- Analytics
- Better debugging

### For Users:
- Always get latest version
- Faster load times (CDN)
- More reliable
- Better performance

---

## 🚀 Deployment Workflow

```bash
# 1. Develop locally
npm run dev

# 2. Test
# Open in browser

# 3. Build
npm run build

# 4. Deploy to GitHub Pages / Netlify
git push origin main
# or
netlify deploy --prod

# 5. Update StreamElements widget loader URL
# All users get the update automatically!
```

---

## 💡 Recommendation

### For MVP (Start Simple):
Use **Approach 1** (no external hosting):
- Users enter Bungie name in StreamElements
- Widget calls your Render API
- Everything in StreamElements ✅

### For Production (Scale & Control):
Use **Approach 2** (external hosting):
- Host widget files on GitHub Pages (free!)
- Load into StreamElements via loader script
- Easy updates without touching StreamElements ✅

---

## 🎯 Your Question Answered

> "I dont think me putting the widget on my own webhost would help right?"

**Actually, it WOULD help!** Here's why:

### Without External Hosting:
- Widget code lives in StreamElements
- Updates require users to re-import widget
- Limited by StreamElements editor
- Harder to maintain

### With External Hosting (Like your example):
- ✅ Update once, all users get update automatically
- ✅ No StreamElements editor limitations
- ✅ Professional development workflow
- ✅ Same widget works on StreamElements AND Streamlabs
- ✅ Can track usage analytics
- ✅ Easier to debug

---

## 🎉 Best of Both Worlds

You can offer **both**:

1. **Simple Version**: Pure StreamElements (for beginners)
2. **Pro Version**: External hosted (for better performance)

Users choose based on their needs!

---

## 📋 Summary

**For OAuth Question**: 
- ❌ No, can't do OAuth in StreamElements widgets
- ✅ Don't need it anyway! Bungie name input works perfectly

**For External Hosting Question**:
- ✅ **YES**, external hosting IS helpful!
- ✅ Same pattern as the widget you bought
- ✅ Free options available (GitHub Pages)
- ✅ Professional, scalable approach

**Recommendation**: Start with simple approach (MVP), then add external hosting for the production version!

---

Want me to create the external hosting setup for you? I can create all the loader files and show you how to deploy to GitHub Pages (free)! 🚀
