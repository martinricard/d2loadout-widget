# 🎮 User Guide - Finding Your Bungie Information

## Easy Option: Just Use Your Bungie Name! ✅

The widget supports **both** Bungie Name and Membership ID, so users can choose the easiest method!

---

## Option 1: Use Your Bungie Name (Easiest!) 🎯

Your Bungie Name is what you see in-game, like **Marty#2689**

### How to Find It:
1. Launch Destiny 2
2. Look at the top-left corner of your screen
3. Your name will be displayed as: `YourName#1234`

**That's it!** Just enter this in the widget settings.

### Widget Configuration:
```json
{
  "bungieInput": "Marty#2689",
  "inputType": "bungie-name"
}
```

The backend will automatically:
1. Search for "Marty#2689"
2. Find your Membership ID
3. Fetch your loadout
4. Display it!

---

## Option 2: Use Membership ID (Advanced) 🔢

If you prefer to use the Membership ID directly:

### Method 1: Bungie.net Settings
1. Go to https://www.bungie.net/7/en/User/Account/IdentitySettings
2. Scroll to "Linked Accounts"
3. Find your gaming platform (Steam, Xbox, PlayStation)
4. Copy the numeric ID shown (e.g., `4611686018467484767`)

### Method 2: Guardian.report
1. Go to https://guardian.report/
2. Type your Bungie name in the search
3. Look at the URL: `https://guardian.report/?guardians=4611686018467484767`
4. Copy the number after `guardians=`

### Method 3: Use Our Search Endpoint
Visit: `https://d2loadout-widget.onrender.com/api/search/YourName%232689`

Response will show:
```json
{
  "success": true,
  "players": [{
    "membershipId": "4611686018467484767",
    "membershipType": 3,
    "displayName": "Marty#2689",
    "platformName": "Steam"
  }]
}
```

---

## Widget Field Configuration (Recommended)

### Simple Version (Bungie Name Only):
```json
{
  "bungieInput": {
    "type": "textfield",
    "label": "Your Bungie Name",
    "value": "",
    "placeholder": "Marty#2689",
    "group": "Account Settings"
  },
  "refreshRate": {
    "type": "number",
    "label": "Refresh Rate (seconds)",
    "value": 60,
    "min": 30,
    "max": 300,
    "group": "Settings"
  }
}
```

### Advanced Version (With Options):
```json
{
  "inputType": {
    "type": "dropdown",
    "label": "Input Type",
    "value": "bungie-name",
    "options": {
      "bungie-name": "Bungie Name (Easiest)",
      "membership-id": "Membership ID (Advanced)"
    },
    "group": "Account Settings"
  },
  "bungieInput": {
    "type": "textfield",
    "label": "Bungie Name or Membership ID",
    "value": "",
    "placeholder": "Marty#2689 or 4611686018467484767",
    "group": "Account Settings"
  },
  "platform": {
    "type": "dropdown",
    "label": "Platform (only if using Membership ID)",
    "value": "3",
    "options": {
      "1": "Xbox",
      "2": "PlayStation",
      "3": "Steam",
      "6": "Epic Games"
    },
    "group": "Account Settings"
  }
}
```

---

## API Endpoints

### For Users with Bungie Name:
```
GET /api/loadout/Marty#2689
```
Auto-detects platform and fetches loadout!

### For Users with Membership ID:
```
GET /api/loadout/3/4611686018467484767
```
Direct access with platform (3 = Steam) and ID.

### Search Helper:
```
GET /api/search/Marty#2689
```
Returns all accounts for that Bungie name.

---

## Widget JavaScript Example

```javascript
let fieldData = {};

window.addEventListener('onWidgetLoad', function (obj) {
    fieldData = obj.detail.fieldData;
    fetchLoadout();
});

async function fetchLoadout() {
    const bungieInput = fieldData.bungieInput || '';
    const inputType = fieldData.inputType || 'bungie-name';
    
    if (!bungieInput) {
        showError('Please enter your Bungie Name in widget settings');
        return;
    }

    try {
        let apiUrl;
        
        if (inputType === 'bungie-name' || bungieInput.includes('#')) {
            // Use Bungie name (easier!)
            apiUrl = `https://d2loadout-widget.onrender.com/api/loadout/${encodeURIComponent(bungieInput)}`;
        } else {
            // Use membership ID (advanced)
            const platform = fieldData.platform || '3';
            apiUrl = `https://d2loadout-widget.onrender.com/api/loadout/${platform}/${bungieInput}`;
        }
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        updateDisplay(data);
        
    } catch (error) {
        showError(`Failed to load data: ${error.message}`);
    }

    const refreshRate = parseInt(fieldData.refreshRate || '60') * 1000;
    setInterval(fetchLoadout, refreshRate);
}

function updateDisplay(data) {
    // Display loadout...
    document.getElementById('playerName').textContent = data.displayName;
    document.getElementById('platform').textContent = data.platformName;
    
    // Show weapons, armor, stats, etc.
}

function showError(message) {
    document.getElementById('error').textContent = message;
}
```

---

## Help Text for Widget Settings

### Bungie Name Field:
```
📝 Enter your Bungie Name (e.g., Marty#2689)

Find it:
• In-game: Top-left corner of screen
• Bungie.net: Click your profile
• Or visit: bungie.net/7/en/User/Account/IdentitySettings

Don't know it? Ask a friend to check your name in their roster!
```

### Alternative - Membership ID Field:
```
📝 Advanced: Enter your Membership ID

Find it:
1. Visit: guardian.report
2. Search your Bungie name
3. Copy the number from the URL

Or just use your Bungie Name instead! (easier)
```

---

## Cross-Platform Support

If a player has multiple platforms (e.g., Steam + PlayStation):

### Search returns all platforms:
```json
{
  "success": true,
  "count": 2,
  "players": [
    {
      "membershipId": "4611686018467484767",
      "membershipType": 3,
      "displayName": "Marty#2689",
      "platformName": "Steam"
    },
    {
      "membershipId": "4611686018467484768",
      "membershipType": 2,
      "displayName": "Marty#2689",
      "platformName": "PlayStation"
    }
  ]
}
```

### Widget can let user choose:
```json
{
  "preferredPlatform": {
    "type": "dropdown",
    "label": "If you play on multiple platforms, choose one",
    "value": "auto",
    "options": {
      "auto": "Auto-detect (use primary)",
      "3": "Steam",
      "2": "PlayStation",
      "1": "Xbox",
      "6": "Epic Games"
    }
  }
}
```

---

## Error Messages (User-Friendly)

### Player Not Found:
```
❌ Couldn't find your Bungie account!

Check:
• Is your Bungie Name spelled correctly?
• Include the # and numbers (e.g., Marty#2689)
• Try looking up your name at guardian.report
```

### Profile Private:
```
❌ Your Destiny 2 profile is set to private!

To fix:
1. Go to bungie.net
2. Click Settings → Privacy
3. Set "Show my Destiny game Activity" to Public
```

### Invalid Input:
```
❌ Please enter a valid Bungie Name (e.g., Marty#2689)
or Membership ID (e.g., 4611686018467484767)
```

---

## Testing URLs

### Test with your account (Marty#2689):
```
By Bungie Name:
https://d2loadout-widget.onrender.com/api/loadout/Marty%232689

By Membership ID:
https://d2loadout-widget.onrender.com/api/loadout/3/4611686018467484767

Search:
https://d2loadout-widget.onrender.com/api/search/Marty%232689
```

---

## Recommendation: Bungie Name Only 🎯

**Best user experience**: Only ask for Bungie Name

**Pros**:
- ✅ Easy to find (visible in-game)
- ✅ Easy to remember
- ✅ Works across all platforms
- ✅ One field only

**Cons**:
- ❌ Requires API call to search first
- ❌ Slightly slower (but cached!)

**User Experience**: 
- They just type: `Marty#2689`
- Widget handles the rest automatically!

**This is the simplest approach for streamers!** 🎮✨

---

**Your Render URL**: https://d2loadout-widget.onrender.com ✅
