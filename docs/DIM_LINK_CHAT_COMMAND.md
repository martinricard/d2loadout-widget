# DIM Link Chat Command Setup

This guide explains how to set up a chat command that posts the DIM loadout link when requested.

## Overview

The widget backend provides a dedicated endpoint `/api/dimlink/:bungieId` that returns just the TinyURL for the DIM loadout link. This can be used with StreamElements custom commands to post the link in chat.

## API Endpoint

**URL:** `https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689`

**Response:**
```json
{
  "success": true,
  "dimLink": "https://tinyurl.com/abc123",
  "displayName": "Marty",
  "characterClass": "Warlock"
}
```

## StreamElements Custom Command Setup

### Step 1: Create the Custom Command

1. Go to your StreamElements dashboard: https://streamelements.com/dashboard
2. Navigate to **Chatbot** → **Commands** → **Custom Commands**
3. Click **+ New Command**

### Step 2: Configure the Command

**Command Name:** `!dimlink` (or `!loadoutlink`, `!build`, etc.)

**Response:**
```
${user.name}'s ${urlfetch https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689}
```

Or for a cleaner format with JSONPath:

```
${user.name}'s Warlock loadout: ${customapi.https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689.dimLink}
```

**Note:** Replace `Marty%232689` with your actual Bungie ID (URL-encoded, with `%23` instead of `#`).

### Step 3: Set Command Options

- **Cooldown:** 10-30 seconds (recommended to prevent spam)
- **User Level:** Everyone (or set to Subscribers/VIPs if preferred)
- **Cost:** 0 channel points (or set a cost if desired)
- **Enabled:** ✅ Checked

### Example Responses

**Basic:**
```
${urlfetch https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689}
```
Output: `https://tinyurl.com/abc123`

**With username:**
```
${user.name}'s loadout: ${customapi.https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689.dimLink}
```
Output: `viewer123's loadout: https://tinyurl.com/abc123`

**With character class:**
```
Check out ${user.name}'s ${customapi.https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689.characterClass} build: ${customapi.https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689.dimLink}
```
Output: `Check out viewer123's Warlock build: https://tinyurl.com/abc123`

**Fancy format:**
```
🎮 ${user.name} wants to see the loadout! | ${customapi.https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689.characterClass}: ${customapi.https://d2loadout-widget.onrender.com/api/dimlink/Marty%232689.dimLink} | Try it in DIM! ⚔️
```
Output: `🎮 viewer123 wants to see the loadout! | Warlock: https://tinyurl.com/abc123 | Try it in DIM! ⚔️`

## StreamElements Variables

According to StreamElements documentation, you can use:

- `${urlfetch URL}` - Fetches content from a URL and returns the entire response
- `${customapi.URL.jsonPath}` - Fetches JSON from a URL and extracts a specific field using JSONPath

Available JSONPath fields from the `/api/dimlink` endpoint:
- `.dimLink` - The TinyURL link
- `.displayName` - Player's Bungie display name
- `.characterClass` - Character class (Warlock, Hunter, Titan)
- `.success` - Boolean indicating if the request was successful

## Testing

1. After creating the command, test it in your Twitch chat: `!dimlink`
2. The bot should respond with the DIM link
3. Click the link to verify it loads your current loadout in DIM

## Troubleshooting

**Bot doesn't respond:**
- Check that the command is enabled
- Verify the command name matches what you typed in chat
- Check cooldown settings
- Ensure your Bungie ID is correct and URL-encoded

**Link returns an error:**
- Verify your Bungie ID is correct (replace `Marty%232689` with your actual ID)
- Make sure your Destiny 2 profile is public (check Bungie.net privacy settings)
- Check that the backend server is running: https://d2loadout-widget.onrender.com/health

**Link is outdated:**
- DIM links are generated in real-time when the command is used
- The link reflects your currently equipped gear at the time of the request
- If you change gear, request a new link with the command

## Multiple Character Support

The endpoint always returns the loadout for your **most recently played character**. This is the same behavior as the widget.

## Rate Limiting

- The backend has no rate limiting, but StreamElements command cooldowns help prevent spam
- Recommended cooldown: 10-30 seconds
- TinyURL API limits: The backend caches TinyURL results to avoid hitting rate limits

## Advanced: Dynamic Bungie ID

If you want viewers to get their own loadouts, you would need to:
1. Store viewer Bungie IDs in a database
2. Create a more complex custom API that looks up the viewer's ID
3. Use StreamElements variables like `${user}` or `${user.name}`

This would require additional backend development beyond the current scope.

## Related Commands

You can create multiple commands for different purposes:

- `!dimlink` - Shows the full loadout link
- `!build` - Alias for !dimlink
- `!loadout` - Shows the widget on stream (triggers widget display)
- `!weapons` - Shows just weapons section of widget
- `!subclass` - Shows just subclass section of widget

## Documentation Links

- StreamElements Custom Commands: https://docs.streamelements.com/chatbot/commands/custom
- StreamElements Variables: https://docs.streamelements.com/chatbot/variables
- Widget Setup: See `docs/STREAMELEMENTS_SETUP.md`
