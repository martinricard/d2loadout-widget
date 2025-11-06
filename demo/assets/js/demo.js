/*
 * D2 Loadout Widget - Professional Demo
 * Studio Notice Me Senpai
 */

// Configuration
let BUNGIE_ID = 'Marty#2689';
const API_BASE = 'https://d2loadout-widget.onrender.com';

// State
let currentView = 'all';
let widgetData = null;

// Initialize demo
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Demo] Initializing D2 Loadout Widget Demo');
    
    // Setup event listeners
    setupBungieIdControl();
    setupViewControls();
    setupCommandButtons();
    setupToggleControls();
    setupRefreshButton();
    
    // Load initial data
    fetchLoadout();
    
    // Auto-refresh every minute
    setInterval(fetchLoadout, 60000);
});

// Setup Bungie ID input control
function setupBungieIdControl() {
    const input = document.getElementById('bungieIdInput');
    const updateBtn = document.getElementById('updateBungieId');
    
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            const newId = input.value.trim();
            if (newId) {
                BUNGIE_ID = newId;
                console.log('[Demo] Updated Bungie ID to:', BUNGIE_ID);
                fetchLoadout();
            }
        });
    }
    
    // Allow Enter key to update
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateBtn.click();
            }
        });
    }
}

// Setup view control buttons
function setupViewControls() {
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            viewButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get view mode
            const view = btn.getAttribute('data-view');
            currentView = view;
            
            // Apply view
            applyView(view);
        });
    });
}

// Setup command buttons (simulate chat commands)
function setupCommandButtons() {
    const commandButtons = document.querySelectorAll('[data-command]');
    commandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.getAttribute('data-command');
            console.log('[Demo] Simulating command:', command);
            
            // Map commands to views
            const commandMap = {
                '!loadout': 'all',
                '!weapons': 'weapons',
                '!armor': 'armor',
                '!stats': 'stats',
                '!subclass': 'subclass',
                '!artifact': 'artifact'
            };
            
            const view = commandMap[command];
            if (view) {
                // Update view buttons to match
                const viewButtons = document.querySelectorAll('[data-view]');
                viewButtons.forEach(b => {
                    if (b.getAttribute('data-view') === view) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                
                // Apply the view
                currentView = view;
                applyView(view);
                
                // Visual feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            }
        });
    });
}

// Setup toggle controls
function setupToggleControls() {
    document.getElementById('showWeapons').addEventListener('change', (e) => {
        toggleSection('weaponsSection', e.target.checked);
    });
    
    document.getElementById('showArmor').addEventListener('change', (e) => {
        toggleSection('armorSection', e.target.checked);
    });
    
    document.getElementById('showStats').addEventListener('change', (e) => {
        toggleSection('statsSection', e.target.checked);
    });
    
    document.getElementById('showSubclass').addEventListener('change', (e) => {
        toggleSection('subclassSection', e.target.checked);
    });
    
    document.getElementById('showArtifact').addEventListener('change', (e) => {
        toggleSection('artifactSection', e.target.checked);
    });
    
    document.getElementById('showPerks').addEventListener('change', (e) => {
        const perks = document.querySelectorAll('.weapon-perks');
        perks.forEach(perk => {
            perk.style.display = e.target.checked ? 'flex' : 'none';
        });
    });
}

// Setup refresh button
function setupRefreshButton() {
    document.getElementById('refreshData').addEventListener('click', () => {
        fetchLoadout();
    });
}

// Toggle section visibility
function toggleSection(sectionId, visible) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('hidden', !visible);
    }
}

// Apply view mode
function applyView(view) {
    const sections = {
        weapons: document.getElementById('weaponsSection'),
        armor: document.getElementById('armorSection'),
        stats: document.getElementById('statsSection'),
        subclass: document.getElementById('subclassSection'),
        artifact: document.getElementById('artifactSection')
    };
    
    // Hide all sections first
    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    
    // Show relevant sections based on view
    switch(view) {
        case 'all':
            Object.values(sections).forEach(section => {
                if (section) section.classList.remove('hidden');
            });
            break;
        case 'weapons':
            if (sections.weapons) sections.weapons.classList.remove('hidden');
            break;
        case 'armor':
            if (sections.armor) sections.armor.classList.remove('hidden');
            break;
        case 'stats':
            if (sections.stats) sections.stats.classList.remove('hidden');
            break;
        case 'subclass':
            if (sections.subclass) sections.subclass.classList.remove('hidden');
            break;
        case 'artifact':
            if (sections.artifact) sections.artifact.classList.remove('hidden');
            break;
    }
}

// Fetch loadout data
async function fetchLoadout() {
    updateStatus('loading', 'Loading...');
    
    try {
        console.log('[Demo] Fetching loadout for:', BUNGIE_ID);
        
        const response = await fetch(`${API_BASE}/api/loadout/${encodeURIComponent(BUNGIE_ID)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        widgetData = data;
        renderLoadout(data);
        updateStatus('connected', 'Connected');
        updateLastUpdate();
        
        console.log('[Demo] Loadout loaded successfully');
        
    } catch (error) {
        console.error('[Demo] Failed to fetch loadout:', error);
        updateStatus('error', 'Connection Failed');
        
        // Show error in widget (no popup, no fake data)
        const widgetContainer = document.querySelector('.widget-container');
        if (widgetContainer) {
            widgetContainer.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #ff4444; margin-bottom: 16px;">Failed to Load Loadout</h2>
                    <p style="color: #ffffff; margin-bottom: 24px;">
                        Could not connect to the Bungie API. Please check:
                    </p>
                    <ul style="text-align: left; max-width: 400px; margin: 0 auto 24px; color: #cccccc;">
                        <li>Your Bungie ID is correct (e.g., Guardian#1234)</li>
                        <li>The backend server is running</li>
                        <li>You have an internet connection</li>
                    </ul>
                    <p style="color: #888888; font-size: 12px;">
                        Error: ${error.message}
                    </p>
                </div>
            `;
        }
    }
}

// Render loadout data
function renderLoadout(data) {
    // Update Bungie ID display in Live Data panel
    const bungieIdDisplay = document.querySelector('.panel-section .info-item .info-value');
    if (bungieIdDisplay) {
        bungieIdDisplay.textContent = data.displayName ? `${data.displayName}#${data.membershipId.slice(-4)}` : BUNGIE_ID;
    }
    
    // Render character header
    renderCharacterHeader(data.character);
    
    // Get loadout data (API returns it nested under 'loadout')
    const loadout = data.loadout || data;
    
    // Render weapons
    if (loadout.weapons) {
        renderWeapons(loadout.weapons);
    }
    
    // Render armor
    if (loadout.armor) {
        renderArmor(loadout.armor);
    }
    
    // Render stats
    if (loadout.stats) {
        renderStats(loadout.stats);
    }
    
    // Render subclass
    if (loadout.subclass) {
        renderSubclass(loadout.subclass);
    }
    
    // Render artifact
    if (loadout.artifactMods) {
        renderArtifact(loadout.artifactMods);
    } else if (data.artifact && data.artifact.mods) {
        renderArtifact(data.artifact.mods);
    }
}

// Render character header
function renderCharacterHeader(character) {
    const header = document.querySelector('.character-header');
    if (!header) return;
    
    // Update emblem background (API returns emblemBackgroundPath)
    const emblemBg = character.emblemBackgroundPath || character.emblemBackground;
    if (emblemBg) {
        header.style.backgroundImage = `url(${emblemBg})`;
    }
    
    // Update emblem icon (API returns emblemPath)
    const emblem = header.querySelector('.character-emblem');
    const emblemIcon = character.emblemPath || character.emblem;
    if (emblem && emblemIcon) {
        emblem.style.backgroundImage = `url(${emblemIcon})`;
    }
    
    // Update character name (API returns class, not className)
    const nameElement = header.querySelector('.character-name');
    if (nameElement) {
        nameElement.textContent = character.class || character.className || 'Guardian';
        nameElement.classList.remove('loading');
    }
    
    // Update character details
    const classElement = header.querySelector('.character-class');
    if (classElement) {
        classElement.textContent = character.race || 'Unknown';
    }
    
    const lightElement = header.querySelector('.character-light span:last-child');
    if (lightElement) {
        lightElement.textContent = character.light || '0';
    }
}

// Render weapons
function renderWeapons(weapons) {
    const grid = document.getElementById('weaponGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // API returns weapons as object {kinetic, energy, power}, convert to array
    const weaponArray = [];
    if (weapons.kinetic) weaponArray.push(weapons.kinetic);
    if (weapons.energy) weaponArray.push(weapons.energy);
    if (weapons.power) weaponArray.push(weapons.power);
    
    weaponArray.forEach(weapon => {
        if (!weapon) return;
        
        const slot = document.createElement('div');
        slot.className = `weapon-slot${weapon.isExotic ? ' exotic' : ''}`;
        
        slot.innerHTML = `
            <div class="weapon-icon" style="background-image: url(${weapon.iconUrl || weapon.icon})"></div>
            <div class="weapon-info">
                <div class="weapon-name">${weapon.name}</div>
                <div class="weapon-type">${weapon.itemType || weapon.type}</div>
            </div>
            <div class="weapon-power">${weapon.primaryStat?.value || weapon.power || '0'}</div>
        `;
        
        grid.appendChild(slot);
    });
}

// Render armor
function renderArmor(armor) {
    const grid = document.getElementById('armorGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // API returns armor as object {helmet, arms, chest, legs, classItem}, convert to array
    const armorArray = [];
    if (armor.helmet) armorArray.push(armor.helmet);
    if (armor.arms) armorArray.push(armor.arms);
    if (armor.chest) armorArray.push(armor.chest);
    if (armor.legs) armorArray.push(armor.legs);
    if (armor.classItem) armorArray.push(armor.classItem);
    
    armorArray.forEach(piece => {
        if (!piece) return;
        
        const slot = document.createElement('div');
        slot.className = `armor-slot${piece.isExotic ? ' exotic' : ''}`;
        
        slot.innerHTML = `
            <div class="armor-icon" style="background-image: url(${piece.iconUrl || piece.icon})"></div>
            <div class="armor-info">
                <div class="armor-name">${piece.name}</div>
                <div class="armor-type">${piece.itemType || piece.type}</div>
            </div>
            <div class="armor-power">${piece.primaryStat?.value || piece.power || '0'}</div>
        `;
        
        grid.appendChild(slot);
    });
}

// Render stats
function renderStats(stats) {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const statOrder = ['Mobility', 'Resilience', 'Recovery', 'Discipline', 'Intellect', 'Strength'];
    
    statOrder.forEach(statName => {
        const stat = stats.find(s => s.name === statName);
        if (!stat) return;
        
        const row = document.createElement('div');
        row.className = 'stat-row';
        
        row.innerHTML = `
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">
                ${stat.icon ? `<div class="stat-icon" style="background-image: url(${stat.icon})"></div>` : ''}
                <div class="stat-name">${stat.name}</div>
            </div>
        `;
        
        grid.appendChild(row);
    });
}

// Render subclass
function renderSubclass(subclass) {
    // Update subclass icon
    const icon = document.querySelector('.subclass-icon');
    if (icon && subclass.icon) {
        icon.style.backgroundImage = `url(${subclass.icon})`;
    }
    
    // Update subclass name
    const name = document.querySelector('.subclass-name');
    if (name) {
        name.textContent = subclass.name || 'Subclass';
    }
    
    // Render aspects
    if (subclass.aspects) {
        renderAspects(subclass.aspects);
    }
    
    // Render fragments
    if (subclass.fragments) {
        renderFragments(subclass.fragments);
    }
}

// Render aspects
function renderAspects(aspects) {
    const grid = document.getElementById('aspectsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    aspects.forEach(aspect => {
        const item = document.createElement('div');
        item.className = 'aspect-item';
        item.style.backgroundImage = `url(${aspect.icon})`;
        item.title = aspect.name;
        
        grid.appendChild(item);
    });
}

// Render fragments
function renderFragments(fragments) {
    const grid = document.getElementById('fragmentsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    fragments.forEach(fragment => {
        const item = document.createElement('div');
        item.className = 'fragment-item';
        item.style.backgroundImage = `url(${fragment.icon})`;
        item.title = fragment.name;
        
        grid.appendChild(item);
    });
}

// Render artifact
function renderArtifact(mods) {
    const grid = document.getElementById('artifactModsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    mods.forEach(mod => {
        const item = document.createElement('div');
        item.className = 'artifact-mod';
        
        item.innerHTML = `
            <div class="artifact-mod-icon" style="background-image: url(${mod.icon})"></div>
        `;
        item.title = mod.name;
        
        grid.appendChild(item);
    });
}

// Update connection status
function updateStatus(status, text) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = text;
        statusElement.className = `info-value status ${status}`;
    }
}

// Update last update time
function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) {
        lastUpdate.textContent = timeString;
    }
    
    const footerUpdate = document.getElementById('lastUpdatedFooter');
    if (footerUpdate) {
        footerUpdate.textContent = `Last updated: ${timeString}`;
    }
}

// Show error message (only to console, no popup)
function showError(message) {
    console.error('[Demo] Error:', message);
}
