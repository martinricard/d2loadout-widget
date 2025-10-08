// D2 Loadout Widget - JavaScript
// StreamElements Custom Widget

let fieldData = {};
let refreshInterval = null;

// Widget initialization
window.addEventListener('onWidgetLoad', function (obj) {
  fieldData = obj.detail.fieldData;
  
  console.log('[D2 Loadout Widget] Initializing...');
  console.log('Bungie ID:', fieldData.bungieInput);
  
  // Apply custom styles
  applyCustomStyles();
  
  // Hide sections based on settings
  toggleSections();
  
  // Fetch initial data
  fetchLoadout();
});

// Apply custom styles from field data
function applyCustomStyles() {
  const root = document.documentElement;
  
  if (fieldData.backgroundColor) root.style.setProperty('--bg-color', fieldData.backgroundColor);
  if (fieldData.borderColor) root.style.setProperty('--border-color', fieldData.borderColor);
  if (fieldData.textColor) root.style.setProperty('--text-color', fieldData.textColor);
  if (fieldData.exoticColor) root.style.setProperty('--exotic-color', fieldData.exoticColor);
  if (fieldData.fontFamily) root.style.setProperty('--font-family', fieldData.fontFamily);
  if (fieldData.fontSize) root.style.setProperty('--font-size', fieldData.fontSize + 'px');
  
  // Apply layout based on widgetSize
  const container = document.querySelector('.widget-container');
  const widgetSize = fieldData.widgetSize || 'compact';  // Default to compact (your mockup)
  
  // Remove all size classes first
  container.classList.remove('layout-compact', 'layout-standard', 'layout-full');
  
  // Add the correct layout class
  container.classList.add(`layout-${widgetSize}`);
  
  console.log(`[D2 Loadout Widget] Applied layout: ${widgetSize}`);
}

// Toggle sections based on settings
function toggleSections() {
  const container = document.querySelector('.widget-container');
  const widgetWrapper = document.getElementById('d2-loadout-widget');
  let visibleColumns = 0;
  let totalWidth = 0;
  
  // Column widths: weapons=280px, armor=320px, stats=160px
  const columnWidths = {
    weapons: 280,
    armor: 320,
    stats: 160
  };
  
  // Check which sections are visible and calculate width
  const showWeapons = fieldData.showWeapons !== 'false';
  const showArmor = fieldData.showArmor !== 'false';
  const showStats = fieldData.showStats !== 'false';
  
  if (showWeapons) {
    visibleColumns++;
    totalWidth += columnWidths.weapons;
  } else {
    document.getElementById('weaponsSection').classList.add('hidden');
  }
  
  if (showArmor) {
    visibleColumns++;
    totalWidth += columnWidths.armor;
  } else {
    document.getElementById('armorSection').classList.add('hidden');
  }
  
  if (showStats) {
    visibleColumns++;
    totalWidth += columnWidths.stats;
  } else {
    document.getElementById('statsSection').classList.add('hidden');
  }
  
  if (fieldData.showSubclass === 'false') {
    document.getElementById('subclassSection').classList.add('hidden');
  }
  if (fieldData.showArtifact === 'false') {
    document.getElementById('artifactSection').classList.add('hidden');
  }
  
  // Update widget width dynamically based on visible columns
  if (totalWidth > 0) {
    widgetWrapper.style.width = `${totalWidth}px`;
    widgetWrapper.style.maxWidth = `${totalWidth}px`;
    container.style.width = `${totalWidth}px`;
    container.style.maxWidth = `${totalWidth}px`;
    
    // Update grid template columns based on visible sections
    let gridColumns = [];
    if (showWeapons) gridColumns.push(`${columnWidths.weapons}px`);
    if (showArmor) gridColumns.push(`${columnWidths.armor}px`);
    if (showStats) gridColumns.push(`${columnWidths.stats}px`);
    
    container.style.gridTemplateColumns = gridColumns.join(' ');
    
    console.log(`[D2 Loadout Widget] Dynamic width: ${totalWidth}px (${visibleColumns} columns)`);
  }
}

// Fetch loadout data from API
async function fetchLoadout() {
  const bungieId = (fieldData.bungieInput || '').trim();
  
  if (!bungieId || bungieId === '') {
    showError('Please enter your Bungie name in widget settings (e.g., Marty#2689)');
    return;
  }
  
  try {
    console.log(`[D2 Loadout Widget] Fetching loadout for: ${bungieId}`);
    
    // Show loading state
    document.getElementById('characterName').textContent = 'Loading...';
    document.getElementById('characterName').classList.add('loading');
    
    const apiUrl = `https://d2loadout-widget.onrender.com/api/loadout/${encodeURIComponent(bungieId)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch loadout');
    }
    
    console.log('[D2 Loadout Widget] Loadout data received:', data);
    
    // Hide error, show data
    hideError();
    displayLoadout(data);
    
    // Update last updated time
    const now = new Date();
    document.getElementById('lastUpdated').textContent = 
      `Last updated: ${now.toLocaleTimeString()}`;
    
  } catch (error) {
    console.error('[D2 Loadout Widget] Error fetching loadout:', error);
    showError(error.message || 'Failed to fetch loadout data');
  }
  
  // Setup refresh interval (moved to end like comp widget)
  const refreshRate = parseInt(fieldData.refreshRate || 60) * 1000;
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchLoadout, refreshRate);
}

// Display loadout data
function displayLoadout(data) {
  // Character info
  document.getElementById('characterName').textContent = data.displayName || 'Guardian';
  document.getElementById('characterName').classList.remove('loading');
  document.getElementById('characterClass').textContent = data.character?.class || '';
  
  // Create power icon SVG element
  const lightElement = document.getElementById('characterLight');
  lightElement.textContent = `${data.character?.light || 0} `;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'power-icon');
  svg.setAttribute('viewBox', '0 0 32 32');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M22.962 8.863c-2.628-2.576-4.988-5.407-7.045-8.458l-0.123-0.193c-2.234 3.193-4.556 5.993-7.083 8.592l0.015-0.016c-2.645 2.742-5.496 5.245-8.542 7.499l-0.184 0.13c3.341 2.271 6.262 4.682 8.943 7.335l-0.005-0.005c2.459 2.429 4.71 5.055 6.731 7.858l0.125 0.182c4.324-6.341 9.724-11.606 15.986-15.649l0.219-0.133c-3.401-2.168-6.359-4.524-9.048-7.153l0.010 0.010zM18.761 18.998c-1.036 1.024-1.971 2.145-2.792 3.35l-0.050 0.078c-0.884-1.215-1.8-2.285-2.793-3.279l0 0c-1.090-1.075-2.280-2.055-3.552-2.923l-0.088-0.057c1.326-0.969 2.495-1.988 3.571-3.097l0.007-0.007c1.010-1.051 1.947-2.191 2.794-3.399l0.061-0.092c0.882 1.32 1.842 2.471 2.912 3.51l0.005 0.005c1.089 1.072 2.293 2.034 3.589 2.864l0.088 0.053c-1.412 0.905-2.641 1.891-3.754 2.994l0.002-0.002z');
  path.setAttribute('fill', '#f1d770');
  
  svg.appendChild(path);
  lightElement.appendChild(svg);
  
  // Character emblem
  if (data.character?.emblemPath) {
    const emblemUrl = data.character.emblemPath;
    document.getElementById('characterEmblem').style.backgroundImage = 
      `url('${emblemUrl}')`;
    // Use higher quality emblemBackgroundPath for header background
    const backgroundUrl = data.character.emblemBackgroundPath || emblemUrl;
    const header = document.querySelector('.character-header');
    if (header) {
      header.style.setProperty('--emblem-bg', `url('${backgroundUrl}')`);
      // Apply emblem as ::before background
      const style = document.createElement('style');
      style.textContent = `.character-header::before { background-image: url('${backgroundUrl}'); }`;
      document.head.appendChild(style);
    }
  }
  
  // Weapons
  if (data.loadout?.weapons && fieldData.showWeapons !== 'false') {
    displayWeapon('kineticSlot', data.loadout.weapons.kinetic, 'Kinetic');
    displayWeapon('energySlot', data.loadout.weapons.energy, 'Energy');
    displayWeapon('powerSlot', data.loadout.weapons.power, 'Power');
  }
  
  // Armor
  if (data.loadout?.armor && fieldData.showArmor !== 'false') {
    displayArmor('helmetSlot', data.loadout.armor.helmet, 'Helmet');
    displayArmor('armsSlot', data.loadout.armor.arms, 'Arms');
    displayArmor('chestSlot', data.loadout.armor.chest, 'Chest');
    displayArmor('legsSlot', data.loadout.armor.legs, 'Legs');
    displayArmor('classItemSlot', data.loadout.armor.classItem, 'Class Item');
  }
  
  // Stats
  if (data.loadout?.stats && fieldData.showStats !== 'false') {
    displayStats(data.loadout.stats);
  }
  
  // Subclass
  if (data.loadout?.subclass && fieldData.showSubclass !== 'false') {
    displaySubclass(data.loadout.subclass);
  }
  
  // Artifact and artifact mods
  if (data.artifact && fieldData.showArtifact !== 'false') {
    displayArtifact(data.artifact, data.loadout?.artifactMods);
  }
}

// Display a single weapon
function displayWeapon(slotId, weaponData, slotName) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  
  if (!weaponData) {
    slot.querySelector('.weapon-name').textContent = '-';
    slot.querySelector('.weapon-type').textContent = slotName;
    slot.querySelector('.weapon-power').textContent = '';
    slot.querySelector('.weapon-icon').style.backgroundImage = '';
    slot.querySelector('.weapon-perks').innerHTML = '';
    slot.classList.remove('exotic');
    return;
  }
  
  // Debug logging for exotic weapons
  if (weaponData.isExotic) {
    console.log(`[${slotName} Exotic] Name: "${weaponData.name}", isExotic: ${weaponData.isExotic}, tierType: ${weaponData.tierType}`);
  }
  
  slot.querySelector('.weapon-name').textContent = weaponData.name || 'Unknown';
  slot.querySelector('.weapon-type').textContent = weaponData.itemType || slotName;
  const powerValue = weaponData.primaryStat?.value || '';
  
  const powerElement = slot.querySelector('.weapon-power');
  powerElement.textContent = '';
  
  if (powerValue) {
    // Create SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'power-icon');
    svg.setAttribute('viewBox', '0 0 32 32');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M22.962 8.863c-2.628-2.576-4.988-5.407-7.045-8.458l-0.123-0.193c-2.234 3.193-4.556 5.993-7.083 8.592l0.015-0.016c-2.645 2.742-5.496 5.245-8.542 7.499l-0.184 0.13c3.341 2.271 6.262 4.682 8.943 7.335l-0.005-0.005c2.459 2.429 4.71 5.055 6.731 7.858l0.125 0.182c4.324-6.341 9.724-11.606 15.986-15.649l0.219-0.133c-3.401-2.168-6.359-4.524-9.048-7.153l0.010 0.010zM18.761 18.998c-1.036 1.024-1.971 2.145-2.792 3.35l-0.050 0.078c-0.884-1.215-1.8-2.285-2.793-3.279l0 0c-1.090-1.075-2.280-2.055-3.552-2.923l-0.088-0.057c1.326-0.969 2.495-1.988 3.571-3.097l0.007-0.007c1.010-1.051 1.947-2.191 2.794-3.399l0.061-0.092c0.882 1.32 1.842 2.471 2.912 3.51l0.005 0.005c1.089 1.072 2.293 2.034 3.589 2.864l0.088 0.053c-1.412 0.905-2.641 1.891-3.754 2.994l0.002-0.002z');
    path.setAttribute('fill', '#f1d770');
    
    svg.appendChild(path);
    powerElement.appendChild(svg);
    powerElement.appendChild(document.createTextNode(powerValue));
  }
  
  if (weaponData.iconUrl) {
    const iconElement = slot.querySelector('.weapon-icon');
    iconElement.style.backgroundImage = `url('${weaponData.iconUrl}')`;
    
    // Remove any existing overlays
    iconElement.classList.remove('masterwork', 'masterwork-exotic', 'tiered-weapon');
    const existingOverlay = iconElement.querySelector('.masterwork-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    const existingTierBadge = iconElement.querySelector('.weapon-tier-badge');
    if (existingTierBadge) {
      existingTierBadge.remove();
    }
    
    // Check if this is a tiered weapon (Tier 1-5 system from Edge of Fate)
    const weaponTier = weaponData.weaponTier;
    if (weaponTier !== null && weaponTier !== undefined && weaponTier >= 0) {
      // Add tier badge for tiered weapons
      iconElement.classList.add('tiered-weapon');
      
      const tierBadge = document.createElement('div');
      tierBadge.className = `weapon-tier-badge tier-${weaponTier + 1}`;
      tierBadge.textContent = `T${weaponTier + 1}`;
      iconElement.appendChild(tierBadge);
    }
    
    // Masterwork display removed - too much visual clutter
    
    // Check for watermark (seasonal/event variants)
    if (weaponData.iconWatermark) {
      const watermark = document.createElement('div');
      watermark.className = 'item-watermark';
      watermark.style.backgroundImage = `url('https://www.bungie.net${weaponData.iconWatermark}')`;
      iconElement.appendChild(watermark);
    }
  }
  
  if (weaponData.isExotic) {
    slot.classList.add('exotic');
  } else {
    slot.classList.remove('exotic');
  }
  
  // Display weapon perks (if enabled)
  const perksContainer = slot.querySelector('.weapon-perks');
  perksContainer.innerHTML = '';
  
  if (fieldData.showPerks !== 'false' && weaponData.weaponPerks && weaponData.weaponPerks.length > 0) {
    // Check if this is a Tier 5 weapon for enhanced perk display
    const isTier5 = weaponData.weaponTier === 4; // weaponTier is 0-indexed (0-4 = T1-T5)
    
    weaponData.weaponPerks.forEach(perk => {
      if (perk.iconUrl) {
        const perkIcon = document.createElement('div');
        perkIcon.className = perk.isMod ? 'weapon-mod-icon' : 'weapon-perk-icon';
        
        // Add enhanced class if it's an enhanced perk OR if it's a T5 weapon
        if ((perk.isEnhanced || isTier5) && !perk.isMod) {
          perkIcon.classList.add('enhanced');
        }
        
        perkIcon.style.backgroundImage = `url('${perk.iconUrl}')`;
        perkIcon.title = `${perk.name}${perk.isEnhanced || isTier5 ? ' (Enhanced)' : ''}\n${perk.description}`;
        perksContainer.appendChild(perkIcon);
      }
    });
  }
}

// Display a single armor piece
function displayArmor(slotId, armorData, slotName) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  
  if (!armorData) {
    slot.querySelector('.armor-name').textContent = '-';
    slot.querySelector('.armor-type').textContent = slotName;
    slot.querySelector('.armor-power').textContent = '';
    slot.querySelector('.armor-icon').style.backgroundImage = '';
    if (slot.querySelector('.exotic-perks')) {
      slot.querySelector('.exotic-perks').innerHTML = '';
    }
    slot.classList.remove('exotic');
    return;
  }
  
  slot.querySelector('.armor-name').textContent = armorData.name || 'Unknown';
  slot.querySelector('.armor-type').textContent = armorData.itemType || slotName;
  const powerValue = armorData.primaryStat?.value || '';
  
  const powerElement = slot.querySelector('.armor-power');
  powerElement.textContent = '';
  
  if (powerValue) {
    // Create SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'power-icon');
    svg.setAttribute('viewBox', '0 0 32 32');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M22.962 8.863c-2.628-2.576-4.988-5.407-7.045-8.458l-0.123-0.193c-2.234 3.193-4.556 5.993-7.083 8.592l0.015-0.016c-2.645 2.742-5.496 5.245-8.542 7.499l-0.184 0.13c3.341 2.271 6.262 4.682 8.943 7.335l-0.005-0.005c2.459 2.429 4.71 5.055 6.731 7.858l0.125 0.182c4.324-6.341 9.724-11.606 15.986-15.649l0.219-0.133c-3.401-2.168-6.359-4.524-9.048-7.153l0.010 0.010zM18.761 18.998c-1.036 1.024-1.971 2.145-2.792 3.35l-0.050 0.078c-0.884-1.215-1.8-2.285-2.793-3.279l0 0c-1.090-1.075-2.280-2.055-3.552-2.923l-0.088-0.057c1.326-0.969 2.495-1.988 3.571-3.097l0.007-0.007c1.010-1.051 1.947-2.191 2.794-3.399l0.061-0.092c0.882 1.32 1.842 2.471 2.912 3.51l0.005 0.005c1.089 1.072 2.293 2.034 3.589 2.864l0.088 0.053c-1.412 0.905-2.641 1.891-3.754 2.994l0.002-0.002z');
    path.setAttribute('fill', '#f1d770');
    
    svg.appendChild(path);
    powerElement.appendChild(svg);
    powerElement.appendChild(document.createTextNode(powerValue));
  }
  
  if (armorData.iconUrl) {
    const iconElement = slot.querySelector('.armor-icon');
    iconElement.style.backgroundImage = `url('${armorData.iconUrl}')`;
    
    // Remove any existing overlays
    iconElement.classList.remove('masterwork', 'masterwork-exotic');
    const existingOverlay = iconElement.querySelector('.masterwork-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Masterwork display removed - too much visual clutter
    
    // Check for watermark (seasonal/event variants)
    if (armorData.iconWatermark) {
      const watermark = document.createElement('div');
      watermark.className = 'item-watermark';
      watermark.style.backgroundImage = `url('https://www.bungie.net${armorData.iconWatermark}')`;
      iconElement.appendChild(watermark);
    }
  }
  
  if (armorData.isExotic) {
    slot.classList.add('exotic');
  } else {
    slot.classList.remove('exotic');
  }
  
  // Display exotic class item perks (if this is the class item slot)
  const exoticPerksContainer = slot.querySelector('.exotic-perks');
  if (exoticPerksContainer) {
    exoticPerksContainer.innerHTML = '';
    
    if (armorData.exoticPerks && armorData.exoticPerks.length > 0) {
      armorData.exoticPerks.forEach(perk => {
        if (perk.iconUrl) {
          const perkIcon = document.createElement('div');
          perkIcon.className = 'exotic-perk-icon';
          perkIcon.style.backgroundImage = `url('${perk.iconUrl}')`;
          perkIcon.title = `${perk.name}\n${perk.description}`;
          exoticPerksContainer.appendChild(perkIcon);
        }
      });
    }
  }
}

// Display character stats
function displayStats(stats) {
  // New stat names after The Final Shape expansion
  const statNames = ['Mobility', 'Resilience', 'Recovery', 'Discipline', 'Intellect', 'Strength'];
  
  // Map old stat names to new display names
  const statDisplayNames = {
    'Mobility': 'Weapons',
    'Resilience': 'Health',
    'Recovery': 'Class',
    'Discipline': 'Grenade',
    'Intellect': 'Super',
    'Strength': 'Melee'
  };
  
  // New stat icon URLs from Bungie CDN (The Final Shape)
  const statIconUrls = {
    'Mobility': 'https://www.bungie.net/common/destiny2_content/icons/bc69675acdae9e6b9a68a02fb4d62e07.png',    // Weapons
    'Resilience': 'https://www.bungie.net/common/destiny2_content/icons/717b8b218cc14325a54869bef21d2964.png',  // Health
    'Recovery': 'https://www.bungie.net/common/destiny2_content/icons/7eb845acb5b3a4a9b7e0b2f05f5c43f1.png',    // Class
    'Discipline': 'https://www.bungie.net/common/destiny2_content/icons/065cdaabef560e5808e821cefaeaa22c.png',  // Grenade
    'Intellect': 'https://www.bungie.net/common/destiny2_content/icons/585ae4ede9c3da96b34086fccccdc8cd.png',   // Super
    'Strength': 'https://www.bungie.net/common/destiny2_content/icons/fa534aca76d7f2d7e7b4ba4df4271b42.png'     // Melee
  };
  
  statNames.forEach(statName => {
    const value = stats[statName] || 0;
    const tier = Math.floor(value / 10);
    const percentage = Math.min((value / 100) * 100, 100);
    const displayName = statDisplayNames[statName] || statName;
    
    // Update value
    const valueElement = document.querySelector(`.stat-value[data-stat="${statName}"]`);
    if (valueElement) {
      valueElement.textContent = value;
    }
    
    // Update tier
    const tierElement = document.querySelector(`.stat-tier[data-stat="${statName}"]`);
    if (tierElement) {
      tierElement.textContent = `T${tier}`;
    }
    
    // Update display name (new stat names)
    const nameElement = document.querySelector(`.stat-name[data-stat="${statName}"]`);
    if (nameElement) {
      nameElement.textContent = displayName;
    }
    
    // Update icon with new Bungie icons
    const iconElement = document.querySelector(`.stat-icon.${statName.toLowerCase()}`);
    if (iconElement && statIconUrls[statName]) {
      iconElement.style.backgroundImage = `url('${statIconUrls[statName]}')`;
      // Clear the ::before content when we have a real icon
      iconElement.textContent = '';
    }
    
    // Update bar
    const fillElement = document.querySelector(`.stat-fill[data-stat="${statName}"]`);
    if (fillElement) {
      fillElement.style.width = `${percentage}%`;
    }
  });
}

// Display subclass
function displaySubclass(subclassData) {
  if (!subclassData) {
    document.getElementById('subclassName').textContent = '-';
    document.getElementById('subclassIcon').style.backgroundImage = '';
    return;
  }
  
  // Remove class name (Warlock/Titan/Hunter) from subclass name
  let subclassName = subclassData.name || 'Unknown';
  subclassName = subclassName.replace(/\s+(Warlock|Titan|Hunter)$/i, '');
  document.getElementById('subclassName').textContent = subclassName;
  
  if (subclassData.iconUrl) {
    document.getElementById('subclassIcon').style.backgroundImage = 
      `url('${subclassData.iconUrl}')`;
  }
  
  // Display aspects
  const aspectsContainer = document.getElementById('aspectsContainer');
  const aspectsGrid = document.getElementById('aspectsGrid');
  if (subclassData.aspects && subclassData.aspects.length > 0) {
    aspectsGrid.innerHTML = '';
    subclassData.aspects.forEach(aspect => {
      const aspectDiv = document.createElement('div');
      aspectDiv.className = 'aspect-item';
      if (aspect.iconUrl) {
        aspectDiv.style.backgroundImage = `url('${aspect.iconUrl}')`;
      }
      aspectDiv.title = aspect.name;
      
      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'aspect-tooltip';
      const tooltipName = document.createElement('div');
      tooltipName.className = 'aspect-tooltip-name';
      tooltipName.textContent = aspect.name;
      tooltip.appendChild(tooltipName);
      aspectDiv.appendChild(tooltip);
      
      aspectsGrid.appendChild(aspectDiv);
    });
    aspectsContainer.style.display = 'flex';
  } else {
    aspectsContainer.style.display = 'none';
  }
  
  // Display fragments
  const fragmentsContainer = document.getElementById('fragmentsContainer');
  const fragmentsGrid = document.getElementById('fragmentsGrid');
  if (subclassData.fragments && subclassData.fragments.length > 0) {
    fragmentsGrid.innerHTML = '';
    subclassData.fragments.forEach(fragment => {
      const fragmentDiv = document.createElement('div');
      fragmentDiv.className = 'fragment-item';
      if (fragment.iconUrl) {
        fragmentDiv.style.backgroundImage = `url('${fragment.iconUrl}')`;
      }
      fragmentDiv.title = fragment.name;
      
      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'fragment-tooltip';
      const tooltipName = document.createElement('div');
      tooltipName.className = 'fragment-tooltip-name';
      tooltipName.textContent = fragment.name;
      tooltip.appendChild(tooltipName);
      fragmentDiv.appendChild(tooltip);
      
      fragmentsGrid.appendChild(fragmentDiv);
    });
    fragmentsContainer.style.display = 'flex';
  } else {
    fragmentsContainer.style.display = 'none';
  }
}

// Display artifact and artifact mods
function displayArtifact(artifactData, artifactMods) {
  const artifactSection = document.getElementById('artifactSection');
  
  // Hide section if no mods
  if (!artifactMods || artifactMods.length === 0) {
    artifactSection.style.display = 'none';
    return;
  }

  // Only show visible artifact mods (exclude champion mods which are hidden)
  const visibleMods = artifactMods.filter(mod => mod.isVisible);

  if (visibleMods.length === 0) {
    artifactSection.style.display = 'none';
    return;
  }

  artifactSection.style.display = 'block';

  // Display only visible artifact mods
  const modsGrid = document.getElementById('artifactModsGrid');
  modsGrid.innerHTML = '';
  
  visibleMods.forEach(mod => {
    const modElement = createArtifactModElement(mod);
    modsGrid.appendChild(modElement);
  });
}

// Create artifact mod element with icon
function createArtifactModElement(mod) {
  const modDiv = document.createElement('div');
  modDiv.className = 'artifact-mod';

  // Icon
  const iconDiv = document.createElement('div');
  iconDiv.className = 'artifact-mod-icon';
  if (mod.iconUrl) {
    iconDiv.style.backgroundImage = `url('${mod.iconUrl}')`;
  }
  modDiv.appendChild(iconDiv);

  // Tooltip
  const tooltipDiv = document.createElement('div');
  tooltipDiv.className = 'artifact-mod-tooltip';
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'artifact-mod-tooltip-name';
  nameDiv.textContent = mod.name || 'Unknown Mod';
  tooltipDiv.appendChild(nameDiv);

  if (mod.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'artifact-mod-tooltip-desc';
    descDiv.textContent = mod.description;
    tooltipDiv.appendChild(descDiv);
  }

  modDiv.appendChild(tooltipDiv);

  return modDiv;
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  if (errorElement && errorText) {
    errorText.textContent = message;
    errorElement.style.display = 'flex';
  }
  
  console.error('[D2 Loadout Widget] Error:', message);
}

// Hide error message
function hideError() {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

// Cleanup on widget unload
window.addEventListener('beforeunload', function() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
