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

## Chat Command Integration 💬

### Setting Up the !dimlink Command

Your viewers can type `!dimlink` in chat to get your current loadout link!

#### Step 1: Create the Command in StreamElements

1. Go to your StreamElements dashboard
2. Navigate to **Chatbot** → **Commands** → **Custom Commands**
3. Click **Add New Command**
4. Use these settings:
   - **Command Name:** `!dimlink`
   - **Response:** `$(user)'s loadout: $(customapi https://d2loadout-widget.onrender.com/api/dimlink/YOUR_BUNGIE_NAME?format=text)`
   - **Cooldown:** 10-30 seconds (to prevent spam)
   - **User Level:** Everyone

#### Step 2: Replace YOUR_BUNGIE_NAME

In the response URL, replace `YOUR_BUNGIE_NAME` with your actual Bungie ID:

**Example:**
- If your Bungie Name is `Marty#2689`
- Replace spaces with `%20` and `#` with `%23`
- Final URL: `Marty%232689`

**Full command response:**
```
$(user)'s loadout: $(customapi https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689?format=text)
```

#### Step 3: Test It!

Type `!dimlink` in your chat. The bot should respond with:
```
YourViewer's loadout: https://tinyurl.com/abc123
```

#### Alternative: Use Nightbot or Other Bots

**Nightbot:**
```
!addcom !dimlink $(user)'s loadout: $(urlfetch https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689?format=text)
```

**Fossabot:**
```
!addcom !dimlink $(user)'s loadout: $(customapi https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689?format=text)
```

### How It Works

1. Viewer types `!dimlink` in chat
2. Bot calls our API with your Bungie ID
3. API fetches your current loadout from Bungie
4. API generates a DIM link (identical to widget's link)
5. API shortens it with TinyURL
6. Bot posts the short link in chat

### Troubleshooting Chat Commands

**"unable to make request"**
- Check that your Bungie Name is URL-encoded correctly
- Make sure you're using `?format=text` at the end
- Verify the API is online: https://d2loadout-widget.onrender.com/health

**Empty loadout in DIM**
- This should not happen - the chat command uses the same logic as the widget
- If it does, contact support

**Bot not responding**
- Check command cooldown hasn't triggered
- Verify command name is correct (case-sensitive)
- Test the API URL directly in your browser

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

### DIM Link Only (for Chat Commands):
```
GET /api/dimlink/Marty#2689?format=text
```
Returns just the TinyURL as plain text (for chat bots).

**Without `?format=text`, returns JSON:**
```json
{
  "success": true,
  "dimLink": "https://tinyurl.com/abc123",
  "displayName": "Marty",
  "characterClass": "Warlock"
}
```

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

---

## 🐛 Bug Reports & Support

Found an issue? Help us improve the widget!

### How to Report a Bug

**Send to:** [Your preferred contact method - Discord, Email, GitHub Issues]

**Include in your report:**

1. **📸 Screenshot(s)**
   - Widget display showing the issue
   - StreamElements settings panel
   - Browser console (F12 → Console tab)

2. **📝 Description**
   - What were you trying to do?
   - What happened instead?
   - When did this start happening?

3. **⚙️ Your Setup**
   - Browser: (Chrome, Firefox, etc.)
   - Bungie Name or Membership ID (if comfortable sharing)
   - Which sections are visible (weapons, armor, stats, etc.)

4. **🔍 Console Logs (Important!)**
   - Press F12 in your browser
   - Click the "Console" tab
   - Look for messages starting with `[D2 Loadout Widget]` or `[D2 Widget]`
   - Take a screenshot or copy the text

### Common Issues & Quick Fixes

**Widget not loading?**
- Check the browser console for errors (F12)
- Verify your Bungie Name is entered correctly (include # and numbers)
- Check that your Destiny 2 profile is set to public

**DIM link showing ornaments/cosmetics?**
- Take a screenshot of the link in DIM
- Note which specific items shouldn't be there
- This helps us add new filters quickly!

**Stats not updating?**
- Check the "Last updated" timestamp in the widget footer
- Default refresh is 60 seconds - may need to wait
- Verify Bungie API isn't in maintenance: https://help.bungie.net/hc/en-us/articles/360049199271-Destiny-Server-and-Update-Status

**Widget looks blurry?**
- This can happen if window zoom is not 100%
- Check your browser zoom level (Ctrl+0 to reset)
- Ensure StreamElements canvas isn't being scaled

### Feature Requests

Have an idea? We'd love to hear it!

- Describe what feature you'd like
- Explain how it would help your stream
- Include mockups/screenshots if you have them

**Contact:** [Your preferred contact method]

---

