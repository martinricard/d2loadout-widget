# ✅ Adjustable Cooldown Feature Added

## 🎯 What Changed

Added a **configurable cooldown** for chat commands to prevent spam and give streamers control over command frequency.

### Changes Made:

1. **widget/fields.json** - Added new field:
   ```json
   "commandCooldown": {
     "type": "number",
     "label": "Command Cooldown (seconds)",
     "value": 20,
     "min": 0,
     "max": 60,
     "group": "💬 Commands"
   }
   ```

2. **widget/widget.js** - Updated cooldown logic:
   - Removed hardcoded `COMMAND_COOLDOWN = 3000`
   - Now reads from field: `fieldData.commandCooldown`
   - Converts seconds to milliseconds automatically
   - Default: 20 seconds (higher than auto-hide duration of 15s)

3. **studio-nms/fields.json** - Already included in protected build

---

## 📋 How It Works

### In StreamElements Settings:

Users will see a new field in the **💬 Commands** group:

**Command Cooldown (seconds)**
- Min: 0 (no cooldown)
- Max: 60 seconds
- Default: 20 seconds
- Prevents spam from viewers triggering commands repeatedly
- Set higher than auto-hide duration (15s) to avoid overlap

### Behavior:

```
Viewer: !loadout
Widget: ✅ Shows loadout

[Within cooldown period]
Viewer: !loadout
Widget: ⏭️ Ignored (cooldown active)

[After cooldown expires]
Viewer: !loadout
Widget: ✅ Shows loadout again
```

---

## 🎮 Use Cases

### Short Cooldown (5-15 seconds):
- Active chat
- Frequent loadout changes
- Interactive streams

### Medium Cooldown (20-30 seconds) [RECOMMENDED]:
- Balanced approach
- Works well with auto-hide (15s display)
- Good spam prevention
- Default setting

### Long Cooldown (45-60 seconds):
- Minimize distraction
- Prevent abuse
- Chill streams

### No Cooldown (0 seconds):
- Testing
- Private streams
- ⚠️ Not recommended for public streams

---

## 🔧 Technical Details

**Code Location:** `widget/widget.js` lines ~247-252

```javascript
// Get configurable cooldown (convert seconds to milliseconds)
const commandCooldown = (parseInt(fieldData.commandCooldown) || 20) * 1000;

// Check cooldown
if (timeSinceLastCommand < commandCooldown) {
  const remainingCooldown = Math.ceil((commandCooldown - timeSinceLastCommand) / 1000);
  console.log(`[D2 Widget] Command on cooldown - ${remainingCooldown}s remaining`);
  return; // Ignore during cooldown
}
```

**Default Behavior:**
- If field not set: 10 seconds
- If invalid value: 10 seconds
- Applies to ALL commands (!loadout, !weapons, !armor, etc.)
- Applies to channel point redemptions too

---

## 📖 Documentation Updates Needed

Add to user guides:
- Installation Guide: Mention cooldown setting
- User Guide: Explain cooldown functionality
- Troubleshooting: "Commands not working" → Check cooldown

---

## ✨ Benefits

✅ **Spam Prevention** - Stops chat from spamming commands  
✅ **Flexible** - Streamers choose their own timing  
✅ **Viewer-Friendly** - Console shows remaining cooldown time  
✅ **Performance** - Reduces unnecessary widget triggers  
✅ **Professional** - Like commercial overlays  

---

## 🧪 Testing

Test with different values:
```
0s  - No cooldown (instant refire)
5s  - Short cooldown
10s - Default (recommended)
30s - Long cooldown
60s - Maximum
```

Console will show: `[D2 Widget] Command on cooldown - Xs remaining`

---

**Feature Complete!** Ready for release. 🎉
