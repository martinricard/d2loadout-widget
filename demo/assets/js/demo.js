/*
 * D2 Loadout Widget - Professional Demo
 * Studio Notice Me Senpai
 */

// Configuration
const BUNGIE_ID = 'Marty#2689';
const API_BASE = 'https://d2-loadout-widget-backend.onrender.com';

// State
let currentView = 'all';
let widgetData = null;

// Initialize demo
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Demo] Initializing D2 Loadout Widget Demo');
    
    // Setup event listeners
    setupViewControls();
    setupToggleControls();
    setupRefreshButton();
    
    // Load initial data
    fetchLoadout();
    
    // Auto-refresh every minute
    setInterval(fetchLoadout, 60000);
});

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
        
        const response = await fetch(`${API_BASE}/api/loadout?bungieId=${encodeURIComponent(BUNGIE_ID)}`);
        
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
        console.log('[Demo] Loading demo data as fallback...');
        
        // Load demo data as fallback
        widgetData = getDemoData();
        renderLoadout(widgetData);
        updateStatus('connected', 'Demo Data');
        updateLastUpdate();
    }
}

// Render loadout data
function renderLoadout(data) {
    // Render character header
    renderCharacterHeader(data.character);
    
    // Render weapons
    if (data.weapons) {
        renderWeapons(data.weapons);
    }
    
    // Render armor
    if (data.armor) {
        renderArmor(data.armor);
    }
    
    // Render stats
    if (data.stats) {
        renderStats(data.stats);
    }
    
    // Render subclass
    if (data.subclass) {
        renderSubclass(data.subclass);
    }
    
    // Render artifact
    if (data.artifact && data.artifact.mods) {
        renderArtifact(data.artifact.mods);
    }
}

// Render character header
function renderCharacterHeader(character) {
    const header = document.querySelector('.character-header');
    if (!header) return;
    
    // Update emblem background
    if (character.emblemBackground) {
        header.style.backgroundImage = `url(${character.emblemBackground})`;
    }
    
    // Update emblem icon
    const emblem = header.querySelector('.character-emblem');
    if (emblem && character.emblem) {
        emblem.style.backgroundImage = `url(${character.emblem})`;
    }
    
    // Update character name
    const nameElement = header.querySelector('.character-name');
    if (nameElement) {
        nameElement.textContent = character.className || 'Guardian';
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
    
    weapons.forEach(weapon => {
        const slot = document.createElement('div');
        slot.className = `weapon-slot${weapon.isExotic ? ' exotic' : ''}`;
        
        slot.innerHTML = `
            <div class="weapon-icon" style="background-image: url(${weapon.icon})"></div>
            <div class="weapon-info">
                <div class="weapon-name">${weapon.name}</div>
                <div class="weapon-type">${weapon.type}</div>
            </div>
            <div class="weapon-power">${weapon.power}</div>
        `;
        
        grid.appendChild(slot);
    });
}

// Render armor
function renderArmor(armor) {
    const grid = document.getElementById('armorGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    armor.forEach(piece => {
        const slot = document.createElement('div');
        slot.className = `armor-slot${piece.isExotic ? ' exotic' : ''}`;
        
        slot.innerHTML = `
            <div class="armor-icon" style="background-image: url(${piece.icon})"></div>
            <div class="armor-info">
                <div class="armor-name">${piece.name}</div>
                <div class="armor-type">${piece.type}</div>
            </div>
            <div class="armor-power">${piece.power}</div>
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

// Show error message
function showError(message) {
    console.error('[Demo] Error:', message);
    alert(`Error loading loadout:\n\n${message}\n\nPlease check the console for more details.`);
}

// Get demo data (fallback when API is unavailable)
function getDemoData() {
    return {
        character: {
            className: 'Warlock',
            race: 'Awoken',
            light: 2010,
            emblem: 'https://www.bungie.net/common/destiny2_content/icons/8f0e5387a0cd5ee8f739c20a0c6c4583.jpg',
            emblemBackground: 'https://www.bungie.net/common/destiny2_content/icons/b1844bcef82c87e5f2c0fc1c12e5be49.jpg'
        },
        weapons: [
            {
                name: 'The Last Word',
                type: 'Hand Cannon',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/c78aa07e0fdf8b69f898917f1f2c9c1b.jpg',
                power: 2010,
                isExotic: true
            },
            {
                name: 'Beloved',
                type: 'Sniper Rifle',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/e2c2369e1fa67ce882f8138b4c20aca5.jpg',
                power: 2008,
                isExotic: false
            },
            {
                name: 'The Lament',
                type: 'Sword',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/d20e33dca475bf2bc67c4a0ff3de7b4f.jpg',
                power: 2009,
                isExotic: true
            }
        ],
        armor: [
            {
                name: 'Crown of Tempests',
                type: 'Helmet',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/87d2b21e071ca5e93fbac1a8e8f8c2b0.jpg',
                power: 2008,
                isExotic: true
            },
            {
                name: 'Celestial Gauntlets',
                type: 'Gauntlets',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/8f7f70e14c1e7a7f6a3c2ed87f6c1b4d.jpg',
                power: 2007,
                isExotic: false
            },
            {
                name: 'Celestial Robes',
                type: 'Chest Armor',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/c9e7f2e5a8d1c6b4f3e2d1c0b9a8f7e6.jpg',
                power: 2006,
                isExotic: false
            },
            {
                name: 'Celestial Boots',
                type: 'Leg Armor',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/d1f2e3c4b5a6978869788a9b0c1d2e3f.jpg',
                power: 2005,
                isExotic: false
            },
            {
                name: 'Celestial Bond',
                type: 'Warlock Bond',
                icon: 'https://www.bungie.net/common/destiny2_content/icons/e2d3c4b5a69788978869798a0b1c2d3e.jpg',
                power: 2004,
                isExotic: false
            }
        ],
        stats: [
            { name: 'Mobility', value: 42, icon: 'https://www.bungie.net/common/destiny2_content/icons/c7e9e03ba8b7bfc4d68b6c6e4b08a1f4.png' },
            { name: 'Resilience', value: 78, icon: 'https://www.bungie.net/common/destiny2_content/icons/b2a8e7c6d5f4a3b2c1d0e9f8a7b6c5d4.png' },
            { name: 'Recovery', value: 100, icon: 'https://www.bungie.net/common/destiny2_content/icons/f9e8d7c6b5a4938291807f6e5d4c3b2a.png' },
            { name: 'Discipline', value: 64, icon: 'https://www.bungie.net/common/destiny2_content/icons/d8c7b6a59483726150493827161504b3.png' },
            { name: 'Intellect', value: 52, icon: 'https://www.bungie.net/common/destiny2_content/icons/e0f1a2b3c4d5e6f708192a3b4c5d6e7f.png' },
            { name: 'Strength', value: 48, icon: 'https://www.bungie.net/common/destiny2_content/icons/c1b2a39483726150493827161504938d.png' }
        ],
        subclass: {
            name: 'Stormcaller',
            icon: 'https://www.bungie.net/common/destiny2_content/icons/6078e6fb78e6b099c8b5f3f9c7e9e03b.jpg',
            aspects: [
                { name: 'Electrostatic Mind', icon: 'https://www.bungie.net/common/destiny2_content/icons/a1b2c3d4e5f6071829304142536475869.png' },
                { name: 'Arc Soul', icon: 'https://www.bungie.net/common/destiny2_content/icons/b2c3d4e5f607182930414253647586970.png' }
            ],
            fragments: [
                { name: 'Spark of Shock', icon: 'https://www.bungie.net/common/destiny2_content/icons/c3d4e5f60718293041425364758697081.png' },
                { name: 'Spark of Ions', icon: 'https://www.bungie.net/common/destiny2_content/icons/d4e5f6071829304142536475869708192.png' },
                { name: 'Spark of Magnitude', icon: 'https://www.bungie.net/common/destiny2_content/icons/e5f607182930414253647586970819203.png' },
                { name: 'Spark of Beacons', icon: 'https://www.bungie.net/common/destiny2_content/icons/f60718293041425364758697081920314.png' }
            ]
        },
        artifact: {
            mods: [
                { name: 'Anti-Barrier Scout Rifle', icon: 'https://www.bungie.net/common/destiny2_content/icons/07182930414253647586970819203142.png' },
                { name: 'Overload Hand Cannon', icon: 'https://www.bungie.net/common/destiny2_content/icons/18293041425364758697081920314253.png' },
                { name: 'Unstoppable Pulse Rifle', icon: 'https://www.bungie.net/common/destiny2_content/icons/29304142536475869708192031425364.png' },
                { name: 'Focusing Strike', icon: 'https://www.bungie.net/common/destiny2_content/icons/30414253647586970819203142536475.png' },
                { name: 'Authorized Mods: Solar', icon: 'https://www.bungie.net/common/destiny2_content/icons/41425364758697081920314253647586.png' }
            ]
        }
    };
}
