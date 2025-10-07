# D2 Loadout Widget - Complete Feature Specification

## 🎯 Project Goal

Create a StreamElements/Streamlabs widget that displays a Destiny 2 player's **current active character loadout** in real-time, similar to Guardian.report's loadout display.

**Inspiration**: https://guardian.report/ (Loadout feature)
**Example Player**: Marty#2689

## 🎮 Core Features (MVP)

### Character Display
- **Active Character Detection**: Show the last-played character automatically
- **Character Info**:
  - Class (Hunter/Titan/Warlock)
  - Race (Human/Awoken/Exo)
  - Light Level / Power Level
  - Emblem/Background

### Loadout Display

#### 1. Weapons (3 Slots)
For each weapon show:
- **Weapon Icon/Image**
- **Weapon Name**
- **Weapon Type** (e.g., Hand Cannon, Pulse Rifle, Shotgun)
- **Element** (Solar/Arc/Void/Stasis/Strand/Kinetic)
- **Power Level**
- **Exotic indicator** (if exotic)
- **Active Perks** (optional for MVP)

**Weapon Slots**:
1. Kinetic (Top)
2. Energy (Middle)
3. Power/Heavy (Bottom)

#### 2. Armor (5 Pieces)
For each armor piece show:
- **Armor Icon/Image**
- **Armor Name**
- **Armor Slot** (Helmet, Gauntlets, Chest, Legs, Class Item)
- **Power Level**
- **Exotic indicator** (if exotic)
- **Total Stats** per piece

**Armor Slots**:
1. Helmet
2. Gauntlets (Arms)
3. Chest Armor
4. Leg Armor
5. Class Item (Bond/Mark/Cloak)

#### 3. Stats Display
Show the 6 main character stats with bars/numbers:
- **Mobility** (Green)
- **Resilience** (Blue)
- **Recovery** (Red)
- **Discipline** (Orange) - Grenade cooldown
- **Intellect** (Purple) - Super cooldown
- **Strength** (Yellow) - Melee cooldown

Display format:
- Stat value (0-100+)
- Tier indicator (T1-T10)
- Visual bar with color coding

#### 4. Subclass
- **Subclass Icon**
- **Subclass Name** (e.g., "Arc Staff", "Sentinel", "Dawnblade")
- **Super Ability Name**
- **Damage Type** (Solar/Arc/Void/Stasis/Strand)

#### 5. Ghost Shell (Optional)
- Ghost icon/image
- Ghost name

## 🔧 Technical Implementation

### Architecture Overview
```
┌─────────────────┐
│ StreamElements  │
│    Widget       │ (HTML/CSS/JS)
└────────┬────────┘
         │ HTTPS Requests
         ▼
┌─────────────────┐
│  Your Backend   │
│  (Render.com)   │ (Node.js/Express)
└────────┬────────┘
         │ API Calls with API Key
         ▼
┌─────────────────┐
│  Bungie.net     │
│      API        │
└─────────────────┘
```

### Bungie API Endpoints Needed

#### 1. Get Membership Data
```
GET /Platform/Destiny2/SearchDestinyPlayer/{membershipType}/{displayName}/
```
- Used to find player by Bungie Name (Marty#2689)
- Returns: membershipId, membershipType

#### 2. Get Profile Data
```
GET /Platform/Destiny2/{membershipType}/Profile/{destinyMembershipId}/
?components=100,200,201,205,300,302,304,305,307,800
```

**Components**:
- `100` - Profiles (basic info)
- `200` - Characters (list of characters)
- `201` - CharacterInventories (items on character)
- `205` - CharacterEquipment (equipped items)
- `300` - ItemInstances (item stats)
- `302` - ItemPerks (weapon perks)
- `304` - ItemStats (armor stats)
- `305` - ItemSockets (mods and perks)
- `307` - ItemTalentGrids (subclass config)
- `800` - CharacterActivities (last played data)

#### 3. Get Item Definitions (Manifest)
```
GET /Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/{itemHash}/
```
- Used to get item names, descriptions, icons
- Needs to be called for each equipped item

### Data Flow

1. **Widget Loads** → Request player data from your backend
2. **Backend** → Authenticates with Bungie API (or uses cached data)
3. **Backend** → Fetches character data and equipment
4. **Backend** → Fetches item definitions from manifest
5. **Backend** → Processes and formats data
6. **Backend** → Returns simplified JSON to widget
7. **Widget** → Displays loadout with icons and stats

### Widget Configuration

**Streamer Setup**:
```javascript
{
  bungieId: "Marty#2689",          // Bungie display name
  updateInterval: 60000,            // Update every 60 seconds
  characterSelect: "last-played",   // or "hunter", "titan", "warlock"
  showStats: true,
  showPerks: false,                 // MVP: false
  theme: "dark"                     // or "light", "custom"
}
```

## 📊 Data Structure (Backend Response)

```json
{
  "character": {
    "classType": "Hunter",
    "raceType": "Awoken",
    "lightLevel": 1850,
    "emblemPath": "https://www.bungie.net/path/to/emblem.jpg",
    "lastPlayed": "2025-10-07T20:30:00Z"
  },
  "weapons": [
    {
      "slot": "kinetic",
      "name": "Ace of Spades",
      "type": "Hand Cannon",
      "element": "Kinetic",
      "icon": "https://www.bungie.net/path/to/icon.jpg",
      "powerLevel": 1850,
      "isExotic": true
    },
    // ... energy and heavy
  ],
  "armor": [
    {
      "slot": "helmet",
      "name": "Celestial Nighthawk",
      "icon": "https://www.bungie.net/path/to/icon.jpg",
      "powerLevel": 1850,
      "isExotic": true,
      "stats": {
        "mobility": 10,
        "resilience": 2,
        "recovery": 10,
        "discipline": 20,
        "intellect": 2,
        "strength": 20
      }
    },
    // ... other armor pieces
  ],
  "stats": {
    "mobility": { "value": 80, "tier": 8 },
    "resilience": { "value": 100, "tier": 10 },
    "recovery": { "value": 70, "tier": 7 },
    "discipline": { "value": 60, "tier": 6 },
    "intellect": { "value": 50, "tier": 5 },
    "strength": { "value": 40, "tier": 4 }
  },
  "subclass": {
    "name": "Gunslinger",
    "superName": "Golden Gun",
    "damageType": "Solar",
    "icon": "https://www.bungie.net/path/to/subclass.jpg"
  }
}
```

## 🎨 Widget Design Ideas

### Layout Options

#### Option 1: Horizontal Card
```
┌────────────────────────────────────────────────────────┐
│  [Character]  [Kinetic] [Energy] [Heavy]  [Stats]     │
│  [Emblem]     [Armor Pieces x5]           [Subclass]  │
└────────────────────────────────────────────────────────┘
```

#### Option 2: Vertical Panel
```
┌──────────────────┐
│   Character      │
│   [Emblem]       │
├──────────────────┤
│   Weapons        │
│   [K] [E] [H]    │
├──────────────────┤
│   Armor          │
│   [5 pieces]     │
├──────────────────┤
│   Stats          │
│   [Mob] [Res]    │
│   [Rec] [Dis]    │
│   [Int] [Str]    │
├──────────────────┤
│   Subclass       │
│   [Icon]         │
└──────────────────┘
```

#### Option 3: Compact Horizontal
```
┌───────────────────────────────────────────────────┐
│ [Char] [3 Weapons] [5 Armor] [6 Stats] [Subclass]│
└───────────────────────────────────────────────────┘
```

### Styling Considerations
- **Exotic Items**: Gold border/glow
- **Legendary Items**: Purple accent
- **Element Colors**: 
  - Solar: Orange (#F8731D)
  - Arc: Light Blue (#85C5EC)
  - Void: Purple (#B084CC)
  - Stasis: Ice Blue (#4D88FF)
  - Strand: Green (#00B894)
  - Kinetic: White/Gray
- **Transparency**: Widget should have transparent background for OBS
- **Animations**: Smooth transitions when loadout changes

## 🚀 Implementation Phases

### Phase 1: Backend API ✅ (Current - Issue #4)
- [x] Deploy minimal backend to Render
- [x] Set up Bungie OAuth
- [ ] Implement player search endpoint
- [ ] Implement loadout fetch endpoint
- [ ] Add manifest caching
- [ ] Add rate limiting

### Phase 2: Data Processing
- [ ] Parse character equipment data
- [ ] Fetch and cache item definitions
- [ ] Calculate total stats
- [ ] Identify exotic items
- [ ] Format response for widget

### Phase 3: Widget Frontend (Issue #2)
- [ ] Create HTML/CSS layout
- [ ] Implement JavaScript for data fetching
- [ ] Add configuration panel
- [ ] Style weapons and armor display
- [ ] Add stat bars with colors
- [ ] Add subclass display
- [ ] Test on StreamElements

### Phase 4: Polish & Features
- [ ] Add character switching
- [ ] Add update animations
- [ ] Add error handling
- [ ] Add loading states
- [ ] Multiple theme options
- [ ] Streamlabs compatibility

### Phase 5: Advanced Features (Future)
- [ ] Show weapon perks
- [ ] Show armor mods
- [ ] Show seasonal artifact
- [ ] Activity stats integration
- [ ] Loadout history
- [ ] Multi-character comparison

## 📝 API Rate Limit Strategy

Bungie API: **25 requests per second**

**Caching Strategy**:
- Cache manifest data: 24 hours
- Cache character data: 60 seconds (configurable)
- Batch requests when possible
- Use Redis/Memory cache on backend

## 🔐 OAuth & Privacy

**OAuth Flow**:
1. Streamer authorizes widget via Bungie OAuth
2. Backend stores refresh token (encrypted)
3. Widget requests data from backend
4. Backend uses token to fetch from Bungie
5. Backend returns processed data to widget

**Privacy Considerations**:
- Only request minimal permissions (read-only)
- Tokens stored securely on backend
- No token exposure to widget/client
- Option to revoke access anytime

## 💰 Monetization Plan

- **License Key System**: Required for widget activation
- **Distribution**: 
  - StreamElements Store
  - Streamlabs Store  
  - Gumroad
  - Personal website
- **Pricing**: $5-15 per license
- **Updates**: Free updates for license holders

## 📋 Bungie API Compliance Checklist

- [ ] Display Bungie branding/attribution
- [ ] Link to Bungie.net
- [ ] Privacy policy for user data
- [ ] Terms of service acceptance
- [ ] Rate limit compliance
- [ ] Review Bungie API Terms for commercial use

## 🎯 Success Criteria

### MVP Success:
- ✅ Widget displays current character loadout
- ✅ Shows all 3 weapons with icons
- ✅ Shows all 5 armor pieces with icons
- ✅ Shows 6 stats with values and tiers
- ✅ Shows subclass
- ✅ Updates automatically
- ✅ Works on StreamElements
- ✅ Transparent background for OBS

### Full Release:
- All MVP features ✅
- Streamlabs compatibility
- Multiple themes
- Character switching
- License key validation
- Professional polish

## 🔗 Helpful Resources

- **Bungie API Docs**: https://bungie-net.github.io/multi/
- **Destiny Item Manager** (open source reference): https://github.com/DestinyItemManager/DIM
- **Guardian.report**: https://guardian.report/
- **Bungie.net API Forums**: https://www.bungie.net/en/Forums/Topics?pNumber=0&tg=BungieNetAPI

---

**Current Status**: Phase 1 in progress (Backend deployment)
**Next Milestone**: Complete backend API for loadout data fetching
**Target Launch**: TBD based on development progress

This is 100% achievable! 🚀
