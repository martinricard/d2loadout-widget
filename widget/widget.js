// D2 Loadout Widget - JavaScript
// StreamElements Custom Widget

let fieldData = {};
let widgetConfig = {};
let refreshInterval = null;

// Widget initialization
window.addEventListener('onWidgetLoad', function (obj) {
  fieldData = obj.detail.fieldData;
  widgetConfig = obj.detail;
  
  console.log('[D2 Loadout Widget] Initializing...');
  console.log('Bungie ID:', fieldData.bungieInput);
  
  // Apply custom styles
  applyCustomStyles();
  
  // Hide sections based on settings
  toggleSections();
  
  // Fetch initial data
  if (fieldData.bungieInput && fieldData.bungieInput.trim() !== '') {
    fetchLoadout();
    
    // Setup refresh interval
    const refreshRate = parseInt(fieldData.refreshRate || 60) * 1000;
    refreshInterval = setInterval(() => fetchLoadout(), refreshRate);
  } else {
    showError('Please enter your Bungie name in widget settings (e.g., Marty#2689)');
  }
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
  
  // Add size class
  const widget = document.getElementById('d2-loadout-widget');
  if (fieldData.widgetSize) {
    widget.classList.add(`widget-size-${fieldData.widgetSize}`);
  }
}

// Toggle sections based on settings
function toggleSections() {
  if (!fieldData.showWeapons) {
    document.getElementById('weaponsSection').classList.add('hidden');
  }
  if (!fieldData.showArmor) {
    document.getElementById('armorSection').classList.add('hidden');
  }
  if (!fieldData.showStats) {
    document.getElementById('statsSection').classList.add('hidden');
  }
  if (!fieldData.showSubclass) {
    document.getElementById('subclassSection').classList.add('hidden');
  }
}

// Fetch loadout data from API
async function fetchLoadout() {
  const apiEndpoint = fieldData.apiEndpoint || 'https://d2loadout-widget.onrender.com';
  const bungieId = fieldData.bungieInput.trim();
  
  if (!bungieId) {
    showError('Please enter your Bungie name');
    return;
  }
  
  try {
    console.log(`[D2 Loadout Widget] Fetching loadout for: ${bungieId}`);
    
    // Show loading state
    document.getElementById('characterName').textContent = 'Loading...';
    document.getElementById('characterName').classList.add('loading');
    
    const response = await fetch(`${apiEndpoint}/api/loadout/${encodeURIComponent(bungieId)}`);
    
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
}

// Display loadout data
function displayLoadout(data) {
  // Character info
  document.getElementById('characterName').textContent = data.displayName || 'Guardian';
  document.getElementById('characterName').classList.remove('loading');
  document.getElementById('characterClass').textContent = data.character?.class || '';
  document.getElementById('characterLight').textContent = `${data.character?.light || 0} ⚡`;
  
  // Character emblem
  if (data.character?.emblemPath) {
    document.getElementById('characterEmblem').style.backgroundImage = 
      `url('${data.character.emblemPath}')`;
  }
  
  // Weapons
  if (data.loadout?.weapons && fieldData.showWeapons) {
    displayWeapon('kineticSlot', data.loadout.weapons.kinetic, 'Kinetic');
    displayWeapon('energySlot', data.loadout.weapons.energy, 'Energy');
    displayWeapon('powerSlot', data.loadout.weapons.power, 'Power');
  }
  
  // Armor
  if (data.loadout?.armor && fieldData.showArmor) {
    displayArmor('helmetSlot', data.loadout.armor.helmet, 'Helmet');
    displayArmor('armsSlot', data.loadout.armor.arms, 'Arms');
    displayArmor('chestSlot', data.loadout.armor.chest, 'Chest');
    displayArmor('legsSlot', data.loadout.armor.legs, 'Legs');
    displayArmor('classItemSlot', data.loadout.armor.classItem, 'Class Item');
  }
  
  // Stats
  if (data.loadout?.stats && fieldData.showStats) {
    displayStats(data.loadout.stats);
  }
  
  // Subclass
  if (data.loadout?.subclass && fieldData.showSubclass) {
    displaySubclass(data.loadout.subclass);
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
    slot.classList.remove('exotic');
    return;
  }
  
  slot.querySelector('.weapon-name').textContent = weaponData.name || 'Unknown';
  slot.querySelector('.weapon-type').textContent = weaponData.itemType || slotName;
  slot.querySelector('.weapon-power').textContent = weaponData.primaryStat?.value || '';
  
  if (weaponData.iconUrl) {
    slot.querySelector('.weapon-icon').style.backgroundImage = `url('${weaponData.iconUrl}')`;
  }
  
  if (weaponData.isExotic) {
    slot.classList.add('exotic');
  } else {
    slot.classList.remove('exotic');
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
    slot.classList.remove('exotic');
    return;
  }
  
  slot.querySelector('.armor-name').textContent = armorData.name || 'Unknown';
  slot.querySelector('.armor-type').textContent = armorData.itemType || slotName;
  slot.querySelector('.armor-power').textContent = armorData.primaryStat?.value || '';
  
  if (armorData.iconUrl) {
    slot.querySelector('.armor-icon').style.backgroundImage = `url('${armorData.iconUrl}')`;
  }
  
  if (armorData.isExotic) {
    slot.classList.add('exotic');
  } else {
    slot.classList.remove('exotic');
  }
}

// Display character stats
function displayStats(stats) {
  const statNames = ['Mobility', 'Resilience', 'Recovery', 'Discipline', 'Intellect', 'Strength'];
  
  statNames.forEach(statName => {
    const value = stats[statName] || 0;
    const tier = Math.floor(value / 10);
    const percentage = Math.min((value / 100) * 100, 100);
    
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
  
  document.getElementById('subclassName').textContent = subclassData.name || 'Unknown';
  
  if (subclassData.iconUrl) {
    document.getElementById('subclassIcon').style.backgroundImage = 
      `url('${subclassData.iconUrl}')`;
  }
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
