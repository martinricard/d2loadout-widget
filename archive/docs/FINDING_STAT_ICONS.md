# Finding The Final Shape Stat Icons

## Known Icons (from user)

✅ **Weapons** (was Mobility):
`https://www.bungie.net/common/destiny2_content/icons/bc69675acdae9e6b9a68a02fb4d62e07.png`

✅ **Health** (was Resilience):
`https://www.bungie.net/common/destiny2_content/icons/717b8b218cc14325a54869bef21d2964.png`

## Searching for Remaining Icons

Based on the hash pattern and Bungie's icon directory structure, the remaining icons should follow this format:
`https://www.bungie.net/common/destiny2_content/icons/[32-char-hash].png`

### Potential Icon Hashes to Try

**Class Ability** (was Recovery):
- Try: `e26e0e93a9daf4fdd21bf64eb9246340.png` (old Mobility hash - might be reused)
- Try: Light.gg or Guardian.report for actual hash

**Grenade** (was Discipline):
- Likely has a grenade symbol
- Check DIM source code for hash

**Super** (was Intellect):
- Likely has a super/ultimate ability symbol
- Check Guardian.report

**Melee** (was Strength):
- Likely has a fist/melee symbol
- Should be in same directory

## Quick Test Script

You can test icon URLs in browser console:
```javascript
// Test an icon URL
const testUrl = 'https://www.bungie.net/common/destiny2_content/icons/HASH.png';
const img = new Image();
img.onload = () => console.log('✅ Icon exists:', testUrl);
img.onerror = () => console.log('❌ Icon not found:', testUrl);
img.src = testUrl;
```

## Alternative: Use Guardian.report Icons

If we can't find official Bungie icons, we can:
1. Visit https://guardian.report
2. Inspect their stat icons
3. Extract the URLs they use
4. They should be using official Bungie CDN URLs

## Temporary Solution

For now, the widget uses:
- ✅ New Weapons icon (correct)
- ✅ New Health icon (correct)
- ⚠️ Old Recovery icon (works but outdated)
- ⚠️ Old Discipline icon (works but outdated)
- ⚠️ Old Intellect icon (works but outdated)
- ⚠️ Old Strength icon (works but outdated)

**Still functional!** Just need to update the remaining 4 URLs when found.

## Action Items

1. Visit Guardian.report and inspect stat icons
2. Check their network tab for icon URLs
3. Update widget.js with correct URLs
4. Test that all 6 icons load properly
5. Document findings in this file
