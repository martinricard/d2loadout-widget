# 📦 Installation Guide for Streamers

Complete step-by-step guide to install the D2 Loadout Widget on StreamElements.

**Time Required**: 5-10 minutes  
**Difficulty**: Beginner-friendly  
**Requirements**: StreamElements account, Bungie.net profile set to public

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Get Your Bungie ID](#step-1-get-your-bungie-id)
3. [Step 2: Download Widget Files](#step-2-download-widget-files)
4. [Step 3: Create Custom Widget in StreamElements](#step-3-create-custom-widget-in-streamelements)
5. [Step 4: Configure Widget Settings](#step-4-configure-widget-settings)
6. [Step 5: Set Up Chat Commands](#step-5-set-up-chat-commands-optional)
7. [Step 6: Test Your Widget](#step-6-test-your-widget)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- ✅ **StreamElements account** - [Sign up here](https://streamelements.com/) if you don't have one
- ✅ **Bungie.net profile** - Your Destiny 2 profile must be set to **public**
- ✅ **Active Destiny 2 character** - Log into the character you want to display
- ✅ **OBS or Streaming Software** - To add the overlay to your stream

---

## Step 1: Get Your Bungie ID

Your Bungie ID is your Bungie name with the number tag (e.g., `YourName#1234`).

### How to Find It:

1. Go to https://www.bungie.net/
2. Sign in with your platform account
3. Click your profile icon (top right)
4. Your Bungie name is displayed with a `#` and 4-digit number
5. **Write it down exactly** - you'll need it in Step 4

**Example**: `Martin_Ricard#2689`

### Make Your Profile Public:

1. On Bungie.net, go to **Settings** → **Privacy**
2. Ensure **"Show my Destiny game Activity"** is enabled
3. Set **Character Display** to **Public**
4. Save changes

---

## Step 2: Download Widget Files

### Option A: Download from GitHub Releases (Recommended)

1. Go to [Releases](https://github.com/martinricard/d2loadout-widget/releases)
2. Download the latest release ZIP file
3. Extract the ZIP to a folder on your computer
4. Open the `widget/` folder

### Option B: Copy from GitHub Repository

1. Go to https://github.com/martinricard/d2loadout-widget
2. Navigate to the `widget/` folder
3. Open each file and copy its contents:
   - `widget.html`
   - `widget.css`
   - `widget.js`
   - `fields.json`

You'll paste these in Step 3.

---

## Step 3: Create Custom Widget in StreamElements

### 3.1 Access StreamElements Dashboard

1. Go to https://streamelements.com/dashboard
2. Sign in with your streaming platform account
3. Click **Streaming Tools** in the left sidebar
4. Click **My Overlays**

### 3.2 Create or Open an Overlay

**If you don't have an overlay yet:**
1. Click **Create blank overlay**
2. Give it a name (e.g., "D2 Loadout")
3. Click **Start**

**If you already have an overlay:**
1. Click on your existing overlay to open it

### 3.3 Add Custom Widget

1. In the overlay editor, click the **+** button (bottom left)
2. Click **Static / Custom**
3. Click **Custom widget**
4. A new widget will appear in the center of the screen

### 3.4 Paste Widget Code

You'll see a panel on the right with 4 tabs: **HTML**, **CSS**, **JS**, **Fields**

**For each tab:**

1. **HTML Tab**:
   - Delete any existing code
   - Open `widget.html` from your downloaded files
   - Copy ALL the contents
   - Paste into the HTML tab

2. **CSS Tab**:
   - Delete any existing code
   - Open `widget.css` from your downloaded files
   - Copy ALL the contents (1020+ lines)
   - Paste into the CSS tab

3. **JS Tab**:
   - Delete any existing code
   - Open `widget.js` from your downloaded files
   - Copy ALL the contents (1112+ lines)
   - Paste into the JS tab

4. **Fields Tab**:
   - Delete any existing code
   - Open `fields.json` from your downloaded files
   - Copy ALL the contents
   - Paste into the Fields tab

5. Click **Save** (top right corner)

### 3.5 Position the Widget

1. The widget is **760px wide** by default
2. Drag it to your desired position on the overlay
3. Common placements:
   - **Bottom center** - Classic position
   - **Bottom left** - Leaves room for chat
   - **Top right** - Less obtrusive
4. Click **Save** when positioned

---

## Step 4: Configure Widget Settings

After saving, click the **Settings** icon (gear) on the widget.

### Required Settings:

| Setting | Value | Example |
|---------|-------|---------|
| **Bungie ID** | Your Bungie name with # and number | `Martin_Ricard#2689` |

### Recommended Settings:

| Setting | Description | Recommended Value |
|---------|-------------|-------------------|
| **Auto-Hide** | Widget hides after displaying | `Enabled` (for clean stream) |
| **Hide Duration** | Seconds before auto-hiding | `30` (adjust to preference) |
| **Update Interval** | How often to refresh data (seconds) | `60` (prevents API limits) |
| **Feathered Edge** | Smooth fade at bottom | `Enabled` (looks polished) |

### Optional Settings:

| Setting | Description | Default |
|---------|-------------|---------|
| **Chat Command** | Command to show full loadout | `!loadout` |
| **Command Weapons** | Show weapons only | `!weapons` |
| **Command Armor** | Show armor only | `!armor` |
| **Command Stats** | Show stats only | `!stats` |
| **Command Subclass** | Show subclass only | `!subclass` |
| **Command Artifact** | Show artifact only | `!artifact` |

**💡 Tip**: You can change commands to anything you want! Use `!build` instead of `!loadout` if you prefer.

Click **Done** to save your settings.

---

## Step 5: Set Up Chat Commands (Optional)

These steps enable chat commands and the `!dimlink` feature.

### 5.1 Enable Bot Commands

The widget automatically listens for commands like `!loadout`, `!weapons`, etc. when **Auto-Hide** is enabled.

**No additional setup needed for display commands!**

### 5.2 Add !dimlink Command (Optional)

This allows viewers to get your DIM loadout link in chat.

**In StreamElements Dashboard:**

1. Go to **Chatbot** → **Custom commands**
2. Click **Add new command**
3. Fill in the details:

| Field | Value |
|-------|-------|
| **Command** | `!dimlink` |
| **Response** | `$(customapi https://d2loadout-widget.onrender.com/api/dimlink/YOUR_BUNGIE_ID?format=text)` |
| **Enabled** | ✅ Yes |
| **User Level** | Everyone |
| **Cooldown** | 30 seconds (recommended) |

**IMPORTANT**: Replace `YOUR_BUNGIE_ID` with your actual Bungie ID (e.g., `Martin_Ricard#2689`)

**Example response:**
```
$(customapi https://d2loadout-widget.onrender.com/api/dimlink/Martin_Ricard#2689?format=text)
```

4. Click **Save**

Now when viewers type `!dimlink`, they'll get a TinyURL link to your DIM loadout!

### 5.3 Set Up Channel Point Redemptions (Optional)

You can create channel point rewards that trigger the widget:

1. Go to **Twitch Dashboard** → **Community** → **Channel Points**
2. Click **Add New Custom Reward**
3. Create rewards like:

| Reward Name | What It Does |
|-------------|--------------|
| "Show Loadout" | Displays full build |
| "Show Subclass" | Shows subclass configuration |
| "Show Weapons" | Shows weapon loadout |

The widget listens for these redemptions automatically when you set the **Redemption Names** in widget settings.

---

## Step 6: Test Your Widget

### 6.1 Test in StreamElements

1. In the overlay editor, the widget should show your loadout
2. If you see an error, check:
   - Is your Bungie ID correct?
   - Is your Bungie profile set to public?
   - Are you logged into that character on Bungie.net?

### 6.2 Test Chat Commands

1. Go to your **Twitch channel**
2. Type `!loadout` in chat
3. The widget should appear on stream (if Auto-Hide is enabled)
4. Type `!dimlink` to test the DIM link command
5. You should see a TinyURL link in chat

### 6.3 Test in OBS/Streaming Software

1. Open your streaming software (OBS, Streamlabs, etc.)
2. Add a **Browser Source**
3. Copy the **Overlay URL** from StreamElements (click Share → Copy URL)
4. Paste it into the browser source URL field
5. Set width to **1920** and height to **1080** (or your stream resolution)
6. Click **OK**
7. Position the source in your scene

### 6.4 Test on Stream

1. Start a test stream
2. Open your stream in another window
3. Type `!loadout` in chat
4. Watch the widget appear on stream
5. Verify all information is correct

**🎉 Congratulations!** Your widget is installed and working!

---

## Troubleshooting

### Widget Shows "Loading..." Forever

**Possible Causes:**
- Bungie ID is incorrect (check spelling and `#1234` format)
- Bungie profile is set to private
- Backend server is down (rare)

**Solutions:**
1. Double-check your Bungie ID in widget settings
2. Go to Bungie.net → Settings → Privacy → Set to Public
3. Check backend status: https://d2loadout-widget.onrender.com/health
4. Open browser console (F12) and check for error messages

### Widget Shows "Error Loading Data"

**Possible Causes:**
- You're not logged into that character on Bungie.net
- Character has no equipped items
- API timeout (backend spinning up from sleep)

**Solutions:**
1. Log into Destiny 2 with the character you want to display
2. Equip a full loadout (weapons, armor, subclass)
3. Wait 30 seconds and refresh (Render.com free tier sleeps after inactivity)
4. Check backend logs for errors

### Chat Commands Not Working

**Possible Causes:**
- Auto-Hide mode is disabled
- Command names don't match widget settings
- StreamElements bot is not in your channel

**Solutions:**
1. Enable **Auto-Hide** in widget settings
2. Verify command names match exactly (case-insensitive)
3. Make sure StreamElements bot is a moderator in your channel
4. Check widget.js console logs for command recognition

### !dimlink Command Not Working

**Possible Causes:**
- Custom command not set up in StreamElements
- Bungie ID has spaces or typos in the command
- Backend server is sleeping (first request may be slow)

**Solutions:**
1. Verify custom command is saved in StreamElements chatbot
2. Check the URL format: `...dimlink/YourName#1234?format=text`
3. Test the URL directly in browser first
4. Wait 5-10 seconds for backend to wake up on first request

### DIM Link Is Empty

**Possible Causes:**
- Character has no mods equipped
- Loadout data failed to load
- TinyURL rate limit reached (very rare)

**Solutions:**
1. Equip some mods on your armor
2. Wait 60 seconds for widget to refresh data
3. Check backend logs for TinyURL errors
4. Try again after a few minutes

### Widget Position Is Wrong in OBS

**Possible Causes:**
- Browser source resolution doesn't match overlay
- Transform/crop settings applied

**Solutions:**
1. Set browser source to match your canvas resolution (1920x1080)
2. Right-click source → Transform → Reset Transform
3. Reposition using StreamElements overlay editor
4. Copy the overlay URL again if needed

### Stats Are Incorrect

**Possible Causes:**
- Bungie API hasn't updated yet
- Character switched gear recently
- Update interval is too low

**Solutions:**
1. Wait 60 seconds for the next auto-refresh
2. Change gear in-game and wait for API to sync
3. Increase **Update Interval** to 60+ seconds in settings
4. Manually refresh the browser source in OBS

---

## 🎉 Success!

Your D2 Loadout Widget should now be fully installed and working!

### Next Steps:

1. **Customize** - Adjust colors, commands, and settings to your preference
2. **Test** - Try different characters and builds
3. **Stream** - Show off your builds to viewers!
4. **Share** - Tell other D2 streamers about the widget

### Need More Help?

- 📖 **User Guide**: [USER_GUIDE.md](USER_GUIDE.md)
- 💬 **GitHub Issues**: Report bugs or ask questions
- 📘 **Documentation**: Check other docs in the `docs/` folder

---

**Made with 🎮 for Destiny 2 streamers**

*Happy streaming, Guardian!*
