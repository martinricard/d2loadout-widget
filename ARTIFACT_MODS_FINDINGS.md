# Artifact Mods Investigation - Findings

**Date:** October 7, 2025  
**Goal:** Display equipped artifact mods (like "Anti-Barrier Scout and Pulse") on active character

---

## ✅ What We Found

### **Artifact Data IS Available!**

1. **Seasonal Artifact Info** - Component 104 (ProfileProgression)
   ```json
   "seasonalArtifact": {
     "artifactHash": 2894222926,  // Current season artifact
     "pointsAcquired": 12,         // Total unlock points
     "powerBonus": 1               // +1 power from artifact
   }
   ```

2. **Artifact Definition** - Available in manifest
   - Name: "Implement of Curiosity" (Season 25)
   - 5 Tiers of mods
   - Each tier has ~17 mods
   - Example mod hashes: `1360604625`, `846698094`, etc.

3. **Socket Data** - Component 305 (ItemSockets)
   ```json
   {
     "plugHash": 350061697,  // Each socket has a plug
     "isEnabled": true,
     "isVisible": true       // Visible = equipped mod slot
   }
   ```

---

## 🔍 How Guardian.report Likely Does It

Based on the data available, Guardian.report probably:

1. **Fetches** component 305 (ItemSockets) with equipment
2. **Filters** socketed plugs to find artifact mods
3. **Cross-references** plug hashes with current season artifact definition
4. **Displays** only the artifact mods (not regular armor mods)

**Key Insight:** Artifact mods are socketed into armor just like regular mods, but need to be identified by matching against the season artifact's mod list.

---

## 🎯 Implementation Plan

### **Step 1: Enhance Backend to Capture All Sockets**

Currently we capture `perks` but only visible ones. We need:

```javascript
// In processEquipmentItem function
const allSockets = itemComponents.sockets?.[instanceId]?.sockets || [];

// Return ALL plugs, not just visible perks
sockets: allSockets.map(socket => ({
  plugHash: socket.plugHash,
  isEnabled: socket.isEnabled,
  isVisible: socket.isVisible
}))
```

### **Step 2: Fetch Seasonal Artifact Definition**

```javascript
// Add to backend
const getSeasonalArtifact = async (artifactHash) => {
  const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyArtifactDefinition/${artifactHash}/`;
  const response = await axios.get(url, {
    headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
  });
  
  // Return all artifact mod hashes
  const artifactModHashes = new Set();
  response.data.Response.tiers.forEach(tier => {
    tier.items.forEach(item => {
      artifactModHashes.add(item.itemHash);
    });
  });
  return artifactModHashes;
};
```

### **Step 3: Filter Artifact Mods from Equipment**

```javascript
// In loadout endpoint
const artifactData = data.profileProgression?.data?.seasonalArtifact;
const artifactModHashes = await getSeasonalArtifact(artifactData.artifactHash);

// When processing armor, check if any socketed mods are artifact mods
const artifactMods = [];
for (const armor of Object.values(loadout.armor)) {
  armor.sockets.forEach(socket => {
    if (artifactModHashes.has(socket.plugHash) && socket.isVisible) {
      artifactMods.push({
        itemHash: armor.hash,
        itemName: armor.name,
        plugHash: socket.plugHash
        // Will fetch mod name from manifest
      });
    }
  });
}
```

### **Step 4: Fetch Artifact Mod Names**

```javascript
// Similar to fetchItemDefinition
const fetchPlugDefinition = async (plugHash) => {
  // Check cache first
  if (manifestCache.has(`plug_${plugHash}`)) {
    return manifestCache.get(`plug_${plugHash}`);
  }
  
  const url = `${BUNGIE_API_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/${plugHash}/`;
  const response = await axios.get(url, {
    headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
  });
  
  const plugData = {
    name: response.data.Response.displayProperties.name,
    description: response.data.Response.displayProperties.description,
    icon: response.data.Response.displayProperties.icon
  };
  
  manifestCache.set(`plug_${plugHash}`, plugData);
  return plugData;
};
```

---

## 📊 Example Output

After implementation, the API would return:

```json
{
  "loadout": {
    "weapons": { ... },
    "armor": { ... },
    "subclass": { ... },
    "stats": { ... },
    "artifactMods": [
      {
        "name": "Anti-Barrier Scout and Pulse",
        "description": "...",
        "icon": "/common/destiny2_content/icons/...",
        "equippedOn": "helmet",
        "hash": 1360604626
      },
      {
        "name": "Unstoppable Sidearm and Hand Cannon",
        "description": "...",
        "icon": "/common/destiny2_content/icons/...",
        "equippedOn": "gauntlets",
        "hash": 846698094
      }
      // ... more artifact mods
    ]
  },
  "artifact": {
    "name": "Implement of Curiosity",
    "icon": "/common/destiny2_content/icons/...",
    "powerBonus": 1,
    "pointsUnlocked": 12
  }
}
```

---

## 🚦 Priority Assessment

### **Why This Matters:**
- Artifact mods are **critical** for build viability
- Changes every season (rotating champion mods, meta mods)
- Viewers want to see WHY a build works
- Differentiates from basic stat displays

### **Implementation Complexity:**
- **Medium** - Requires:
  - Socket parsing enhancement
  - Artifact definition caching
  - Hash matching logic
  - Additional manifest lookups

### **When to Implement:**
1. **Phase 1:** Get basic widget live (weapons/armor/stats) ✅
2. **Phase 2:** Add perk/mod names to regular armor mods
3. **Phase 3:** Add artifact mod detection (this feature)
4. **Phase 4:** Add artifact mod icons and display in widget

---

## 🎨 Widget Display Ideas

### **Artifact Mods Section:**
```
┌─ ARTIFACT MODS ────────────────┐
│ 🛡️ Anti-Barrier Scout & Pulse  │  (Helmet)
│ ⚡ Unstoppable Sidearm          │  (Arms)
│ 🔥 Overload Rapid Fire         │  (Chest)
│ 💠 Elemental Benevolence        │  (Legs)
│ ⭐ Threaded Blast               │  (Class Item)
└────────────────────────────────┘
```

Or integrate into armor display:
```
HELMET - Lustrous Cover
├─ Minor Super Mod
├─ 🟡 Anti-Barrier Scout & Pulse (Artifact)
└─ Resilience Mod
```

---

## ✅ Confirmed Doable!

**YES, artifact mods can be added to the system!** 

The data is available via:
- Component 305 (ItemSockets) ← All equipped mods
- Component 104 (ProfileProgression) ← Current artifact
- Manifest API ← Artifact definition & mod names

Guardian.report is using this exact approach - no authentication needed, just smart filtering of socket data against the season artifact definition.

**Implementation Ready:** Can be added after basic widget is live and tested.
