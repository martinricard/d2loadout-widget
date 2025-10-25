/*
 * D2 Loadout Widget for StreamElements
 * Displays your Destiny 2 character's loadout on stream
 * Version 1.0
 */

let fieldData = {};
let refreshInterval = null;
let isFirstLoad = true;
let autoHideTimeout = null;
let lastCommandTime = 0;
let maintenanceCheckInterval = null;

// Widget initialization
window.addEventListener('onWidgetLoad', function (obj) {
  fieldData = obj.detail.fieldData;
  
  console.log('[D2 Loadout Widget] Initializing...');
  console.log('Bungie ID:', fieldData.bungieInput);
  
  // Apply custom styles
  applyCustomStyles();
  
  // Hide sections based on settings
  toggleSections();
  
  // Setup auto-hide behavior
  setupAutoHide();
  
  // Check maintenance status and start periodic checks
  checkMaintenanceStatus();
  maintenanceCheckInterval = setInterval(checkMaintenanceStatus, 300000); // Check every 5 minutes
  
  // Fetch initial data
  fetchLoadout();
});

// Setup auto-hide functionality
function setupAutoHide() {
  const autoHide = fieldData.autoHide === 'true';
  const widgetContainer = document.querySelector('.widget-container');
  
  if (autoHide) {
    // Wait for widget to render, then get actual height
    setTimeout(() => {
      const widgetHeight = widgetContainer.offsetHeight;
      console.log('[D2 Widget] Widget height:', widgetHeight, 'px');
      
      // Initially hide the widget - slide down to bottom of 500px container
      // Calculate how far down to move: 500px (container height) - current top position
      widgetContainer.style.transform = `translateY(500px)`;
      widgetContainer.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      console.log('[D2 Widget] Auto-hide enabled - widget hidden at bottom');
    }, 100);
  } else {
    // Make sure widget is visible
    widgetContainer.style.transform = 'translateY(0)';
    widgetContainer.style.opacity = '1';
    widgetContainer.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}

// Show widget (slide up from bottom)
function showWidget(displayMode = 'full') {
  const widgetContainer = document.querySelector('.widget-container');
  const widgetWrapper = document.getElementById('d2-loadout-widget');
  const duration = parseInt(fieldData.autoHideDuration || 15) * 1000;
  
  console.log('[D2 Widget] Showing widget - sliding up with mode:', displayMode);
  
  // Remove feathering mask when showing
  if (widgetWrapper) {
    widgetWrapper.classList.remove('feathered');
  }
  
  // Apply display mode - hide/show sections based on command
  applyDisplayMode(displayMode);
  
  // Slide up - remove any transforms
  widgetContainer.style.transform = 'translateY(0)';
  
  // Clear any existing timeout
  if (autoHideTimeout) {
    clearTimeout(autoHideTimeout);
  }
  
  // Auto-hide after duration
  autoHideTimeout = setTimeout(() => {
    hideWidget();
  }, duration);
}

// Apply display mode - show only requested sections
function applyDisplayMode(mode) {
  const sections = {
    weapons: document.getElementById('weaponsSection'),
    armor: document.getElementById('armorSection'),
    stats: document.getElementById('statsSection'),
    subclass: document.getElementById('subclassSection'),
    artifact: document.getElementById('artifactSection')
  };
  
  // Define what each mode shows
  const modes = {
    full: { weapons: true, armor: true, stats: true, subclass: true, artifact: true },
    subclass: { weapons: false, armor: false, stats: false, subclass: true, artifact: true },
    stats: { weapons: false, armor: false, stats: true, subclass: false, artifact: false },
    weapons: { weapons: true, armor: false, stats: false, subclass: false, artifact: false },
    armor: { weapons: false, armor: true, stats: false, subclass: false, artifact: false },
    artifact: { weapons: false, armor: false, stats: false, subclass: true, artifact: true }
  };
  
  const config = modes[mode] || modes.full;
  
  // Apply visibility - use inline styles to override field settings temporarily
  Object.keys(sections).forEach(key => {
    const section = sections[key];
    if (section) {
      if (config[key]) {
        section.style.display = '';
        section.classList.remove('hidden');
      } else {
        section.style.display = 'none';
      }
    }
  });
  
  // Adjust grid layout based on visible sections
  const container = document.querySelector('.widget-container');
  const footer = document.querySelector('.widget-footer');
  
  if (mode === 'stats') {
    // Center stats in a compact layout
    container.style.gridTemplateColumns = '1fr';
    container.style.gridTemplateRows = 'auto auto auto 1fr auto'; // Add flexible row before footer
    if (sections.stats) {
      sections.stats.style.gridColumn = '1';
      sections.stats.style.gridRow = '2';
      sections.stats.style.borderRight = 'none';
      sections.stats.style.borderBottom = '1px solid var(--border-color)';
    }
    if (footer) {
      footer.style.gridColumn = '1';
      footer.style.gridRow = '5'; // Footer at bottom
    }
  } else if (mode === 'weapons') {
    // Single column for weapons
    container.style.gridTemplateColumns = '1fr';
    container.style.gridTemplateRows = 'auto auto auto 1fr auto'; // Add flexible row before footer
    if (sections.weapons) {
      sections.weapons.style.gridColumn = '1';
      sections.weapons.style.gridRow = '2';
      sections.weapons.style.borderRight = 'none';
      sections.weapons.style.borderBottom = '1px solid var(--border-color)';
    }
    if (footer) {
      footer.style.gridColumn = '1';
      footer.style.gridRow = '5'; // Footer at bottom
    }
  } else if (mode === 'armor') {
    // Single column for armor
    container.style.gridTemplateColumns = '1fr';
    container.style.gridTemplateRows = 'auto auto auto 1fr auto'; // Add flexible row before footer
    if (sections.armor) {
      sections.armor.style.gridColumn = '1';
      sections.armor.style.gridRow = '2';
      sections.armor.style.borderRight = 'none';
      sections.armor.style.borderBottom = '1px solid var(--border-color)';
    }
    if (footer) {
      footer.style.gridColumn = '1';
      footer.style.gridRow = '5'; // Footer at bottom
    }
  } else if (mode === 'subclass' || mode === 'artifact') {
    // Full width for subclass/artifact
    container.style.gridTemplateColumns = '1fr';
    container.style.gridTemplateRows = 'auto auto auto 1fr auto'; // Add flexible row before footer
    if (sections.subclass) {
      sections.subclass.style.gridRow = '3';
    }
    if (footer) {
      footer.style.gridColumn = '1';
      footer.style.gridRow = '5'; // Footer at bottom
    }
  } else {
    // Reset to default 3-column layout
    container.style.gridTemplateColumns = '280px 320px 160px';
    container.style.gridTemplateRows = 'auto auto auto'; // Reset to default rows
    if (sections.weapons) {
      sections.weapons.style.gridColumn = '1';
      sections.weapons.style.gridRow = '2';
      sections.weapons.style.borderRight = '1px solid var(--border-color)';
      sections.weapons.style.borderBottom = '1px solid var(--border-color)';
    }
    if (sections.armor) {
      sections.armor.style.gridColumn = '2';
      sections.armor.style.gridRow = '2';
      sections.armor.style.borderRight = '1px solid var(--border-color)';
      sections.armor.style.borderBottom = '1px solid var(--border-color)';
    }
    if (sections.stats) {
      sections.stats.style.gridColumn = '3';
      sections.stats.style.gridRow = '2';
      sections.stats.style.borderRight = 'none';
      sections.stats.style.borderBottom = '1px solid var(--border-color)';
    }
    if (sections.subclass) {
      sections.subclass.style.gridRow = '3';
    }
    if (footer) {
      footer.style.gridColumn = '1 / -1';
      footer.style.gridRow = 'auto'; // Reset to default
    }
  }
  
  console.log('[D2 Widget] Applied display mode:', mode, config);
}

// Hide widget (slide down to bottom of container)
function hideWidget() {
  const widgetContainer = document.querySelector('.widget-container');
  const widgetWrapper = document.getElementById('d2-loadout-widget');
  console.log('[D2 Widget] Hiding widget - sliding down with feather');
  
  // Apply feathering mask when hiding
  if (widgetWrapper) {
    widgetWrapper.classList.add('feathered');
  }
  
  // Slide down to bottom of 500px container
  widgetContainer.style.transform = `translateY(500px)`;
  
  // Clear timeout
  if (autoHideTimeout) {
    clearTimeout(autoHideTimeout);
    autoHideTimeout = null;
  }
}

// Listen for chat messages (StreamElements event)
window.addEventListener('onEventReceived', function (obj) {
  if (!obj.detail) return;
  
  const { listener, event } = obj.detail;
  const autoHide = fieldData.autoHide === 'true';
  const triggerType = fieldData.triggerType || 'commands';
  
  console.log('[D2 Widget] Event received - Listener:', listener, 'Trigger Type:', triggerType, 'Auto-Hide:', autoHide);
  
  // Only process events if auto-hide is enabled
  if (!autoHide) return;
  
  // Get configurable cooldown (convert seconds to milliseconds)
  const commandCooldown = (parseInt(fieldData.commandCooldown) || 20) * 1000;
  
  // Check cooldown first - prevent spam for both commands and channel points
  const now = Date.now();
  const timeSinceLastCommand = now - lastCommandTime;
  
  if (timeSinceLastCommand < commandCooldown) {
    const remainingCooldown = Math.ceil((commandCooldown - timeSinceLastCommand) / 1000);
    console.log(`[D2 Widget] Command on cooldown - ${remainingCooldown}s remaining`);
    return; // Ignore during cooldown
  }
  
  // Handle Chat Commands
  if (triggerType === 'commands' && listener === 'message') {
    const message = (event?.data?.text || event?.text || '').toLowerCase().trim();
    
    console.log('[D2 Widget] Chat message received:', message);
    
    // Define all commands with their display modes
    const commands = {
      [fieldData.chatCommand || '!loadout']: 'full',
      [fieldData.commandSubclass || '!subclass']: 'subclass',
      [fieldData.commandStats || '!stats']: 'stats',
      [fieldData.commandWeapons || '!weapons']: 'weapons',
      [fieldData.commandArmor || '!armor']: 'armor',
      [fieldData.commandArtifact || '!artifact']: 'artifact',
      '!dimlink': 'dimlink' // Special: handled by StreamElements bot, not widget
    };
    
    // Check if message matches any command
    for (const [command, mode] of Object.entries(commands)) {
      const normalizedCommand = command.toLowerCase().trim();
      if (message.startsWith(normalizedCommand)) {
        console.log('[D2 Widget] Command triggered:', command, '- Mode:', mode);
        lastCommandTime = now; // Update last command time
        
        // Special handling for !dimlink - this is handled by StreamElements bot
        if (mode === 'dimlink') {
          console.log('[D2 Widget] !dimlink command detected.');
          console.log('[D2 Widget] This command should be handled by StreamElements bot custom command.');
          console.log('[D2 Widget] See documentation for setup: docs/DIM_LINK_CHAT_COMMAND.md');
          break;
        }
        
        showWidget(mode);
        break;
      }
    }
  }
  
  // Handle Channel Point Redemptions
  // StreamElements can send redemptions as 'redemption-latest', 'event', or other listeners
  const isRedemption = triggerType === 'channelPoints' && 
                       (listener === 'redemption-latest' || 
                        listener === 'event' || 
                        listener.includes('redemption'));
  
  if (isRedemption) {
    // StreamElements stores the reward name in event.data.redemption
    const rewardTitle = (event?.data?.redemption || event?.name || event?.title || event?.reward?.title || '').toLowerCase().trim();
    
    console.log('[D2 Widget] Channel point redemption received!');
    console.log('[D2 Widget] - Reward name:', rewardTitle);
    
    // Map reward titles to display modes (case-insensitive matching)
    const redemptions = {
      'show loadout': 'full',
      'show subclass': 'subclass',
      'show stats': 'stats',
      'show weapons': 'weapons',
      'show armor': 'armor',
      'show artifact': 'artifact'
    };
    
    // Check if redemption matches any display mode
    let matched = false;
    for (const [reward, mode] of Object.entries(redemptions)) {
      if (rewardTitle.includes(reward)) {
        console.log('[D2 Widget] ✅ Redemption matched:', reward, '- Mode:', mode);
        lastCommandTime = now; // Update last command time
        showWidget(mode);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      console.log('[D2 Widget] ⚠️ No match found for redemption title:', rewardTitle);
      console.log('[D2 Widget] Available redemptions:', Object.keys(redemptions));
    }
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
  // Check which sections are visible - DON'T calculate width dynamically
  const showWeapons = fieldData.showWeapons !== 'false';
  const showArmor = fieldData.showArmor !== 'false';
  const showStats = fieldData.showStats !== 'false';
  
  if (!showWeapons) {
    document.getElementById('weaponsSection').classList.add('hidden');
  }
  
  if (!showArmor) {
    document.getElementById('armorSection').classList.add('hidden');
  }
  
  if (!showStats) {
    document.getElementById('statsSection').classList.add('hidden');
  }
  
  if (fieldData.showSubclass === 'false') {
    document.getElementById('subclassSection').classList.add('hidden');
  }
  
  if (fieldData.showArtifact === 'false') {
    document.getElementById('artifactSection').classList.add('hidden');
  }
  
  // REMOVED: Dynamic width calculation that causes blur
  // Let CSS handle the layout naturally without JS width manipulation
  console.log(`[D2 Loadout Widget] Sections toggled - Weapons: ${showWeapons}, Armor: ${showArmor}, Stats: ${showStats}`);
}

// Check Bungie maintenance status
async function checkMaintenanceStatus() {
  try {
    console.log('[D2 Widget] Checking maintenance status...');
    const response = await fetch('https://d2loadout-widget.onrender.com/api/status');
    const data = await response.json();
    
    console.log('[D2 Widget] Maintenance status:', data);
    
    const banner = document.getElementById('maintenanceBanner');
    const messageElement = document.getElementById('maintenanceMessage');
    
    if (data.maintenance) {
      // Show maintenance banner
      let message = data.message || 'Destiny 2 services are currently unavailable';
      if (data.estimatedEnd) {
        message += ` • Expected to resume: ${data.estimatedEnd}`;
      }
      
      messageElement.textContent = message;
      banner.style.display = 'flex';
      console.log('[D2 Widget] ⚠️ Maintenance detected - banner shown');
    } else {
      // Hide maintenance banner
      banner.style.display = 'none';
      console.log('[D2 Widget] ✅ No maintenance - services operational');
    }
  } catch (error) {
    console.error('[D2 Widget] Error checking maintenance status:', error);
    // Don't show banner on check failure - only show when confirmed maintenance
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
    
    // Only show loading state on first load
    if (isFirstLoad) {
      document.getElementById('characterName').textContent = 'Loading...';
      document.getElementById('characterName').classList.add('loading');
    }
    
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
    
    // Mark first load as complete
    isFirstLoad = false;
    
    // Update last updated time
    const now = new Date();
    document.getElementById('lastUpdated').textContent = 
      `Last updated: ${now.toLocaleTimeString()}`;
    
    // Update DIM link if available and enabled
    updateDIMLink(data.dimLink);
    
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
  
  // Set power level text only (no diamond icon)
  const lightElement = document.getElementById('characterLight');
  lightElement.textContent = data.character?.light || 0;
  
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
    console.log('[D2 Widget] Weapons data:', {
      kinetic: data.loadout.weapons.kinetic?.name,
      energy: data.loadout.weapons.energy?.name,
      power: data.loadout.weapons.power?.name
    });
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
    const powerNum = parseInt(powerValue);
    // Pinnacle power range: 201-550 (cyan with + suffix)
    if (powerNum > 200) {
      powerElement.textContent = `${powerNum} +`;
      powerElement.classList.add('pinnacle-power');
    } else {
      powerElement.textContent = powerValue;
      powerElement.classList.remove('pinnacle-power');
    }
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
    
    // Tier badge display removed - using enhanced perk arrows instead
    // const weaponTier = weaponData.weaponTier;
    // if (weaponTier !== null && weaponTier !== undefined && weaponTier >= 0) {
    //   iconElement.classList.add('tiered-weapon');
    //   const tierBadge = document.createElement('div');
    //   tierBadge.className = `weapon-tier-badge tier-${weaponTier + 1}`;
    //   tierBadge.textContent = `T${weaponTier + 1}`;
    //   iconElement.appendChild(tierBadge);
    // }
    
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
    // Enhanced perks start appearing at Tier 2+ (weaponTier >= 1)
    // Tier 1 (weaponTier=0): No enhanced perks
    // Tier 2 (weaponTier=1): Enhanced perks start (column 3)
    // Tier 3+ (weaponTier>=2): More enhanced perks
    const weaponTier = weaponData.weaponTier;
    const hasEnhancedPerks = weaponTier !== null && weaponTier !== undefined && weaponTier >= 1;
    
    console.log(`[${slotName}] Weapon: "${weaponData.name}", Tier: ${weaponTier}, Has Enhanced: ${hasEnhancedPerks}, Perks: ${weaponData.weaponPerks.length}`);
    
    weaponData.weaponPerks.forEach(perk => {
      if (perk.iconUrl) {
        const perkIcon = document.createElement('div');
        perkIcon.className = perk.isMod ? 'weapon-mod-icon' : 'weapon-perk-icon';
        
        // Add enhanced class if:
        // 1. Perk is marked as enhanced by API (perk.isEnhanced)
        // 2. OR weapon is Tier 2+ (hasEnhancedPerks) and this is NOT a mod
        if ((perk.isEnhanced || hasEnhancedPerks) && !perk.isMod) {
          perkIcon.classList.add('enhanced');
          console.log(`[${slotName}] ✨ Enhanced perk: "${perk.name}" (API isEnhanced: ${perk.isEnhanced}, Weapon Tier: ${weaponTier}, Has Enhanced: ${hasEnhancedPerks})`);
        }
        
        perkIcon.style.backgroundImage = `url('${perk.iconUrl}')`;
        perkIcon.title = `${perk.name}${perk.isEnhanced || hasEnhancedPerks ? ' (Enhanced)' : ''}\n${perk.description}`;
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
  
  // Debug logging for exotic armor
  if (armorData.isExotic) {
    console.log(`[${slotName} Exotic] Name: "${armorData.name}", isExotic: ${armorData.isExotic}, tierType: ${armorData.tierType}, exoticPerks count: ${armorData.exoticPerks?.length || 0}`);
  }
  
  slot.querySelector('.armor-name').textContent = armorData.name || 'Unknown';
  slot.querySelector('.armor-type').textContent = armorData.itemType || slotName;
  const powerValue = armorData.primaryStat?.value || '';
  
  const powerElement = slot.querySelector('.armor-power');
  powerElement.textContent = '';
  
  if (powerValue) {
    const powerNum = parseInt(powerValue);
    // Pinnacle power range: 201-550 (cyan with + suffix)
    if (powerNum > 200) {
      powerElement.textContent = `${powerNum} +`;
      powerElement.classList.add('pinnacle-power');
    } else {
      powerElement.textContent = powerValue;
      powerElement.classList.remove('pinnacle-power');
    }
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
      console.log(`[${slotName}] Found ${armorData.exoticPerks.length} exotic perks:`, armorData.exoticPerks);
      
      // Check if user wants text or icon display
      const displayMode = fieldData.exoticPerksDisplay || 'text';
      
      if (displayMode === 'text') {
        // Display as text names
        armorData.exoticPerks.forEach((perk, index) => {
          console.log(`[${slotName}] Adding exotic perk text: "${perk.name}"`);
          const perkText = document.createElement('span');
          perkText.className = 'exotic-perk-text';
          // Remove "Spirit of " prefix for cleaner display
          const cleanName = perk.name.replace(/^Spirit of\s+/i, '');
          perkText.textContent = cleanName;
          perkText.title = `${perk.name}\n${perk.description}`;
          exoticPerksContainer.appendChild(perkText);
          
          // Add separator between perks (except for last one)
          if (index < armorData.exoticPerks.length - 1) {
            const separator = document.createElement('span');
            separator.className = 'exotic-perk-separator';
            separator.textContent = '•';
            exoticPerksContainer.appendChild(separator);
          }
        });
      } else {
        // Display as icons (original behavior)
        armorData.exoticPerks.forEach(perk => {
          if (perk.iconUrl) {
            console.log(`[${slotName}] Adding exotic perk icon: "${perk.name}" with icon: ${perk.iconUrl}`);
            const perkIcon = document.createElement('div');
            perkIcon.className = 'exotic-perk-icon';
            perkIcon.style.backgroundImage = `url('${perk.iconUrl}')`;
            perkIcon.title = `${perk.name}\n${perk.description}`;
            exoticPerksContainer.appendChild(perkIcon);
          } else {
            console.warn(`[${slotName}] Exotic perk "${perk.name}" has no icon URL`);
          }
        });
      }
    } else {
      console.log(`[${slotName}] No exotic perks found`);
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
    // The Final Shape: Stats now go 0-200 (max Tier 20)
    const percentage = Math.min((value / 200) * 100, 100);
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

// Update DIM link display
// Variable to track rotating message state
let dimLinkRotationInterval = null;

function updateDIMLink(dimLinkUrl) {
  const dimLinkElement = document.getElementById('dimLink');
  const footerSeparator = document.querySelector('.footer-separator');
  const footerElement = document.querySelector('.widget-footer');
  
  // Check if footer should be shown at all
  const showFooter = fieldData.showFooter !== 'false';
  if (!showFooter) {
    if (footerElement) footerElement.style.display = 'none';
    return;
  } else {
    if (footerElement) footerElement.style.display = 'flex';
  }
  
  // Check if DIM link feature is enabled
  const showDIMLink = fieldData.showDIMLink !== 'false';
  
  if (!showDIMLink || !dimLinkUrl) {
    // Hide the DIM link and separator
    if (dimLinkElement) dimLinkElement.style.display = 'none';
    if (footerSeparator) footerSeparator.style.display = 'none';
    // Clear any existing rotation interval
    if (dimLinkRotationInterval) {
      clearInterval(dimLinkRotationInterval);
      dimLinkRotationInterval = null;
    }
    return;
  }
  
  // Show and update the DIM link
  if (dimLinkElement) {
    dimLinkElement.href = dimLinkUrl;
    dimLinkElement.style.display = 'inline';
    
    // Log the URL we received for debugging
    console.log('[DIM Link] Received URL:', dimLinkUrl);
    
    // Display shortened URLs properly
    let displayText = dimLinkUrl; // Default to showing full URL
    
    // Check for TinyURL shortened URLs
    if (dimLinkUrl.includes('tinyurl.com/')) {
      const tinyMatch = dimLinkUrl.match(/tinyurl\.com\/([^/?]+)/);
      if (tinyMatch) {
        displayText = `tinyurl.com/${tinyMatch[1]}`;
      }
    }
    // Check for bit.ly shortened URLs
    else if (dimLinkUrl.includes('bit.ly/')) {
      const bitlyMatch = dimLinkUrl.match(/bit\.ly\/([^/?]+)/);
      if (bitlyMatch) {
        displayText = `bit.ly/${bitlyMatch[1]}`;
      }
    }
    // Check for dim.gg shortened URLs
    else if (dimLinkUrl.includes('dim.gg/')) {
      const dimGgMatch = dimLinkUrl.match(/dim\.gg\/([^/]+)/);
      if (dimGgMatch) {
        displayText = `dim.gg/${dimGgMatch[1]}`;
      }
    }
    // For long app.destinyitemmanager.com URLs, extract just the important part
    else if (dimLinkUrl.includes('app.destinyitemmanager.com')) {
      // Just show "DIM Loadout" for very long URLs
      displayText = 'DIM Loadout';
    }
    
    console.log('[DIM Link] Displaying as:', displayText);
    
    // Clear any existing interval
    if (dimLinkRotationInterval) {
      clearInterval(dimLinkRotationInterval);
    }
    
    // Check if rotating messages are enabled
    const enableRotation = fieldData.dimLinkRotating !== 'false';
    const customMessage = fieldData.dimLinkMessage || 'Copy this link to your browser';
    
    if (enableRotation) {
      // Set up rotating messages with fade transition
      const messages = [
        customMessage,
        displayText
      ];
      let currentIndex = 0;
      
      // Set initial text with fade-in
      dimLinkElement.textContent = messages[currentIndex];
      dimLinkElement.style.transition = 'opacity 0.6s ease-in-out';
      dimLinkElement.style.opacity = '1';
      
      // Rotate messages every 5 seconds with fade effect
      dimLinkRotationInterval = setInterval(() => {
        // Fade out
        dimLinkElement.style.opacity = '0';
        
        // Wait for fade out, then change text and fade in
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % messages.length;
          dimLinkElement.textContent = messages[currentIndex];
          dimLinkElement.style.opacity = '1';
        }, 600); // Match the transition duration
      }, 5000);
    } else {
      // Just show the link without rotation
      dimLinkElement.textContent = displayText;
      dimLinkElement.style.transition = 'none';
      dimLinkElement.style.opacity = '1';
    }
  }
  
  if (footerSeparator) {
    footerSeparator.style.display = 'inline';
  }
}

// Cleanup on widget unload
window.addEventListener('beforeunload', function() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (maintenanceCheckInterval) {
    clearInterval(maintenanceCheckInterval);
  }
});
