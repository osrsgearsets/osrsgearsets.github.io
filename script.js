const GE_API_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const OSRS_WIKI_API_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';  // API for fetching item mappings
const OSRS_REBOXED_URL = 'items-complete.json';  // Path to OSRSReboxed JSON file

// Toggle button functionality
const themeToggleButton = document.getElementById('theme-toggle');

themeToggleButton.addEventListener('click', function () {
    document.body.classList.toggle('brown-theme');
    this.classList.toggle('active'); // Add active class to move the toggle
    
    // Save the user's theme preference in local storage
    if (document.body.classList.contains('brown-theme')) {
        localStorage.setItem('theme', 'brown');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});

// On page load, apply saved theme preference and update the toggle
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'brown') {
        document.body.classList.add('brown-theme');
        themeToggleButton.classList.add('active'); // Reflect the saved state
    }
});

let equippedStats = {
    attack: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 },
    defense: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 },
    strength: 0,
    ranged_strength: 0,
    magic_damage: 0,
    prayer: 0,
    cost: 0  // Track the total cost of equipped items
};

let currentLoadout = {
    head: null,
    cape: null,
    neck: null,
    ammo: null,
    weapon: null,
    shield: null,
    chest: null,
    legs: null,
    gloves: null,
    boots: null,
    ring: null
};

let osrsItemsData = {};  // Dynamically fetched OSRSReboxed item data
let gearData = {};  // Categorized gear data by slot
let wikiItemMappings = {};  // Item mappings from OSRS Wiki

// Add collapsible functionality for attack and defense sections with caret rotation
document.addEventListener("DOMContentLoaded", function() {
    const collapsibles = document.querySelectorAll('.collapsible');

    collapsibles.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            const caret = this.querySelector('.caret');

            if (content.style.display === "block") {
                content.style.display = "none";
                caret.innerHTML = "&#9654;";  // Right arrow
            } else {
                content.style.display = "block";
                caret.innerHTML = "&#9660;";  // Down arrow
            }
        });
    });
});

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('brown-theme');
    
    // Save the user's theme preference in local storage
    if (document.body.classList.contains('brown-theme')) {
        localStorage.setItem('theme', 'brown');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

// On page load, apply saved theme preference
document.addEventListener("DOMContentLoaded", function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'brown') {
        document.body.classList.add('brown-theme');
    }
});

// Fetch item mappings from OSRS Wiki API for real-time prices
function fetchOSRSWikiItemMappings() {
    return fetch(OSRS_WIKI_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched OSRS Wiki Item Mappings:', data);
            wikiItemMappings = data;  // Store the item mappings
        })
        .catch(error => console.error('Error fetching OSRS Wiki item mappings:', error));
}

// Fetch all item data from OSRSReboxed
function fetchOSRSItemsData() {
    return fetch(OSRS_REBOXED_URL)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched OSRS Items Data:', data);
            if (Array.isArray(data)) {
                osrsItemsData = data;
            } else {
                osrsItemsData = Object.values(data);  // Convert object to array if necessary
            }
            gearData = categorizeItemsBySlot(osrsItemsData);  // Categorize items by slot
        })
        .catch(error => console.error('Error fetching OSRSReboxed data:', error));
}

// Initialize gear slots and load the loadout from URL
function initializeAppData() {
    Promise.all([fetchOSRSWikiItemMappings(), fetchOSRSItemsData()])
        .then(() => {
            console.log('Both OSRS Wiki mappings and OSRSReboxed data fetched.');
            initializeGearSlots();
            loadLoadoutFromURL();
        })
        .catch(error => console.error('Error initializing app data:', error));
}

// Initialize the gear slots and add event listeners
function initializeGearSlots() {
    document.getElementById('head-slot').addEventListener('click', () => {
        filterItems('head', document.getElementById('head-search').value);
    });
    document.getElementById('cape-slot').addEventListener('click', () => {
        filterItems('cape', document.getElementById('cape-search').value);
    });
    document.getElementById('neck-slot').addEventListener('click', () => {
        filterItems('neck', document.getElementById('neck-search').value);
    });
    document.getElementById('ammo-slot').addEventListener('click', () => {
        filterItems('ammo', document.getElementById('ammo-search').value);
    });
    document.getElementById('weapon-slot').addEventListener('click', () => {
        filterItems('weapon', document.getElementById('weapon-search').value);
    });
    document.getElementById('shield-slot').addEventListener('click', () => {
        filterItems('shield', document.getElementById('shield-search').value);
    });
    document.getElementById('chest-slot').addEventListener('click', () => {
        filterItems('chest', document.getElementById('chest-search').value);
    });
    document.getElementById('legs-slot').addEventListener('click', () => {
        filterItems('legs', document.getElementById('legs-search').value);
    });
    document.getElementById('gloves-slot').addEventListener('click', () => {
        filterItems('gloves', document.getElementById('gloves-search').value);
    });
    document.getElementById('boots-slot').addEventListener('click', () => {
        filterItems('boots', document.getElementById('boots-search').value);
    });
    document.getElementById('ring-slot').addEventListener('click', () => {
        filterItems('ring', document.getElementById('ring-search').value);
    });
}

// Categorize items by slot based on their equipment data from OSRSReboxed
function categorizeItemsBySlot(items) {
    let categorized = {
        head: [],
        cape: [],
        neck: [],
        ammo: [],
        weapon: [],
        shield: [],
        chest: [],
        legs: [],
        gloves: [],
        boots: [],
        ring: []
    };

    items.forEach(item => {
        if (item.equipment) {
            switch (item.equipment.slot) {
                case 'head': categorized.head.push(item); break;
                case 'cape': categorized.cape.push(item); break;
                case 'neck': categorized.neck.push(item); break;
                case 'ammo': categorized.ammo.push(item); break;
                case 'weapon': categorized.weapon.push(item); break;
                case 'shield': categorized.shield.push(item); break;
                case 'body': categorized.chest.push(item); break;
                case 'legs': categorized.legs.push(item); break;
                case 'hands': categorized.gloves.push(item); break;
                case 'feet': categorized.boots.push(item); break;
                case 'ring': categorized.ring.push(item); break;
            }
        }
    });

    return categorized;
}

// Fetch the price of an item from GE API
function fetchItemPrice(itemId, callback) {
    fetch(`${GE_API_URL}?id=${itemId}`)
        .then(response => response.json())
        .then(data => {
            const price = data.data[itemId]?.high || 0;
            callback(price);
        })
        .catch(error => console.error('Error fetching prices:', error));
}

// Filter and display items based on search input
function filterItems(slot, query) {
    const searchInput = document.getElementById(`${slot}-search`);  // Get the search input field
    const resultsContainer = document.getElementById(`${slot}-results`);  // Get the search results container

    // Ensure the search input field and results container exist
    if (!searchInput || !resultsContainer) {
        console.log(`Search input or results container for slot "${slot}" not found. Skipping filter.`);
        return;  // Exit the function if the search input or results container doesn't exist
    }

    // Clear previous results and hide the results container
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';

    // Ensure the query and gearData exist
    if (!query || !gearData[slot]) {
        console.log(`No valid query or gear data for slot: ${slot}`);
        return;
    }

    console.log(`Filtering items for slot: ${slot} with query: "${query}"`);

    // Filter items based on the search query
    const items = gearData[slot].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

    if (items.length > 0) {
        resultsContainer.style.display = 'block';  // Show results container
        items.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.name;
            div.onclick = () => equipItem(item, slot);  // Equip the item on click
            div.setAttribute('title', item.name);  // Add a tooltip for the full item name
            resultsContainer.appendChild(div);
        });
    } else {
        console.log(`No matching items found for query: "${query}" in slot: ${slot}`);
    }
}

// Equip the selected item and update stats and price, along with its image
function equipItem(item, slot) {
    fetchItemPrice(item.id, (price) => {
        console.log(`Equipping item: ${item.name} in slot: ${slot}`);
        console.log('Full Item Data:', item);  // Log the entire item object
        console.log('Equipment Data:', item.equipment);  // Log the equipment object

        equippedStats.cost += price;
        currentLoadout[slot] = item.id;  // Store the item ID in the loadout

        let itemImageUrl;
        const encodedItemName = encodeURIComponent(item.name.replace(/ /g, '_'));

        if (slot === 'ammo') {
            itemImageUrl = `https://oldschool.runescape.wiki/images/${encodedItemName}_5.png`;  // Use the image for 5 arrows/bolts
        } else {
            itemImageUrl = `https://oldschool.runescape.wiki/images/${encodedItemName}.png`;  // Standard image for other items
        }

        // Update the slot to show the image, name, price, and small X to remove
        const slotElement = document.getElementById(`${slot}-slot`);
        slotElement.innerHTML = `
            <div class="item-container" style="position: relative;">
                <img src="${itemImageUrl}" alt="${item.name}" class="item-image">
                <p class="item-name">${item.name}</p>
                <p class="item-price">${price.toLocaleString()} GP</p>
                <span class="remove-item-x" onclick="removeItem('${slot}', ${item.id})">&times;</span>
            </div>
        `;

        // Log the stats before updating
        console.log('Item Stats Before Updating:', {
            attack_stab: item.equipment?.attack_stab,
            attack_slash: item.equipment?.attack_slash,
            attack_crush: item.equipment?.attack_crush,
            attack_magic: item.equipment?.attack_magic,
            attack_ranged: item.equipment?.attack_ranged,
            defence_stab: item.equipment?.defence_stab,
            defence_slash: item.equipment?.defence_slash,
            defence_crush: item.equipment?.defence_crush,
            defence_magic: item.equipment?.defence_magic,
            defence_ranged: item.equipment?.defence_ranged,
            strength_bonus: item.equipment?.melee_strength,
            ranged_strength: item.equipment?.ranged_strength,
            magic_damage: item.equipment?.magic_damage,
            prayer_bonus: item.equipment?.prayer
        });

        // Update all stats
        equippedStats.attack.stab += item.equipment?.attack_stab || 0;
        equippedStats.attack.slash += item.equipment?.attack_slash || 0;
        equippedStats.attack.crush += item.equipment?.attack_crush || 0;
        equippedStats.attack.magic += item.equipment?.attack_magic || 0;
        equippedStats.attack.ranged += item.equipment?.attack_ranged || 0;

        equippedStats.defense.stab += item.equipment?.defence_stab || 0;
        equippedStats.defense.slash += item.equipment?.defence_slash || 0;
        equippedStats.defense.crush += item.equipment?.defence_crush || 0;
        equippedStats.defense.magic += item.equipment?.defence_magic || 0;
        equippedStats.defense.ranged += item.equipment?.defence_ranged || 0;

        // Log the bonuses being added
        console.log(`Adding Strength Bonus: ${item.equipment?.melee_strength || 0}`);
        console.log(`Adding Ranged Strength Bonus: ${item.equipment?.ranged_strength || 0}`);
        console.log(`Adding Magic Damage Bonus: ${item.equipment?.magic_damage || 0}`);
        console.log(`Adding Prayer Bonus: ${item.equipment?.prayer || 0}`);

        equippedStats.strength += item.equipment?.melee_strength || 0;
        equippedStats.ranged_strength += item.equipment?.ranged_strength || 0;
        equippedStats.magic_damage += item.equipment?.magic_damage || 0;
        equippedStats.prayer += item.equipment?.prayer || 0;

        updateStatsDisplay();
    });
}

// Remove an item from a slot and reset to the original state with placeholder
function removeItem(slot, itemId) {
    const item = findItemById(itemId, slot);

    // Fetch the item's price to subtract it from the total cost
    fetchItemPrice(itemId, (price) => {
        console.log(`Removing item: ${item.name} from slot: ${slot}`);
        console.log('Full Item Data:', item);
        console.log('Equipment Data:', item.equipment);

        equippedStats.cost -= price || 0;

        equippedStats.attack.stab -= item.equipment?.attack_stab || 0;
        equippedStats.attack.slash -= item.equipment?.attack_slash || 0;
        equippedStats.attack.crush -= item.equipment?.attack_crush || 0;
        equippedStats.attack.magic -= item.equipment?.attack_magic || 0;
        equippedStats.attack.ranged -= item.equipment?.attack_ranged || 0;

        equippedStats.defense.stab -= item.equipment?.defence_stab || 0;
        equippedStats.defense.slash -= item.equipment?.defence_slash || 0;
        equippedStats.defense.crush -= item.equipment?.defence_crush || 0;
        equippedStats.defense.magic -= item.equipment?.defence_magic || 0;
        equippedStats.defense.ranged -= item.equipment?.defence_ranged || 0;

        console.log(`Removing Strength Bonus: ${item.equipment?.melee_strength || 0}`);
        console.log(`Removing Ranged Strength Bonus: ${item.equipment?.ranged_strength || 0}`);
        console.log(`Removing Magic Damage Bonus: ${item.equipment?.magic_damage || 0}`);
        console.log(`Removing Prayer Bonus: ${item.equipment?.prayer || 0}`);

        equippedStats.strength -= item.equipment?.melee_strength || 0;
        equippedStats.ranged_strength -= item.equipment?.ranged_strength || 0;
        equippedStats.magic_damage -= item.equipment?.magic_damage || 0;
        equippedStats.prayer -= item.equipment?.prayer || 0;

        // Ensure input field exists before removing event listener
        const searchInput = document.getElementById(`${slot}-search`);
        if (searchInput) {
            searchInput.removeEventListener('input', filterItems);
        }

        // Reset the slot to its original state with placeholder image and search input
        const placeholderText = `Search ${slot} gear...`;
        document.getElementById(`${slot}-slot`).innerHTML = `
            <input type="text" id="${slot}-search" placeholder="${placeholderText}" oninput="filterItems('${slot}', this.value)">
            <div class="search-results" id="${slot}-results"></div>
            <img src="images/${slot}-placeholder.png" alt="${slot} Slot">
        `;

        currentLoadout[slot] = null;

        // Update the total cost and stats display in the sidebar
        updateStatsDisplay();  // Ensure this updates the HTML
    });
}

// Update the UI to display the current stats and total cost
function updateStatsDisplay() {
    //document.getElementById('total-cost').textContent = `Total Cost: ${equippedStats.cost.toLocaleString()} GP`;
    document.getElementById('total-cost').innerHTML =`<img src="images/icons/gp.png" alt="Defense Ranged Icon" class="bonus-icon"> <strong>Total Cost:</strong> <span class="total-cost-color"> ${equippedStats.cost.toLocaleString()} GP</span>`;

    document.getElementById('attack-stab').textContent = equippedStats.attack.stab;
    document.getElementById('attack-slash').textContent = equippedStats.attack.slash;
    document.getElementById('attack-crush').textContent = equippedStats.attack.crush;
    document.getElementById('attack-magic').textContent = equippedStats.attack.magic;
    document.getElementById('attack-ranged').textContent = equippedStats.attack.ranged;

    document.getElementById('defense-stab').textContent = equippedStats.defense.stab;
    document.getElementById('defense-slash').textContent = equippedStats.defense.slash;
    document.getElementById('defense-crush').textContent = equippedStats.defense.crush;
    document.getElementById('defense-magic').textContent = equippedStats.defense.magic;
    document.getElementById('defense-ranged').textContent = equippedStats.defense.ranged;

    document.getElementById('strength').textContent = equippedStats.strength;
    document.getElementById('ranged-strength').textContent = equippedStats.ranged_strength;
    document.getElementById('magic-damage').textContent = equippedStats.magic_damage;
    document.getElementById('prayer').textContent = equippedStats.prayer;
}

// Generate a shareable URL for the current loadout
function generateShareableURL() {
    const queryString = Object.keys(currentLoadout)
        .filter(slot => currentLoadout[slot])  // Only include slots with items
        .map(slot => `${slot}=${currentLoadout[slot]}`)
        .join('&');
    
    const shareURL = `${window.location.origin}${window.location.pathname}?${queryString}`;
    console.log('Shareable URL:', shareURL);

    navigator.clipboard.writeText(shareURL).then(() => {
        alert('Loadout URL copied to clipboard!');
    });
}

// Load items based on URL parameters
function loadLoadoutFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    urlParams.forEach((itemId, slot) => {
        const itemData = findItemById(itemId, slot);
        if (itemData) {
            equipItem(itemData, slot);
        }
    });
}

// Find an item by its ID from the gearData
function findItemById(itemId, slot) {
    return gearData[slot]?.find(item => item.id == itemId);
}

// Initialize the app
initializeAppData();