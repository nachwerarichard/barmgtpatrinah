// --- MODIFIED CODE START ---

// 1. Define the privileged users and the default sections
const PRIVILEGED_USERS = ['Nachwera Richard', 'Nelson', 'Florence'];

// Updated constants to use the form IDs and their assumed parent navigation
const DEFAULT_SECTION_PRIVILEGED = {
    // New default for privileged users (Nachwera, Nelson, Florence)
    section: 'inventory-form', // <-- Use the inventory form ID
    parentNav: 'nav-inventory',
    submenuId: 'inventory-submenu'
};
const DEFAULT_SECTION_OTHERS = {
    // New default for all other users
    section: 'sale-form', // <-- Use the sale form ID
    parentNav: 'nav-sales',
    submenuId: 'sales-submenu' 
};

let currentUserRole = null; // Variable to store the current user's role/name

// Login/logout placeholders
// NOTE: You'll need to modify your login process to pass the actual username here.
function login(username) { 
    currentUserRole = username; // Store the username
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-container').classList.remove('hidden');
    document.getElementById('current-user-display').textContent = username || 'Admin User';
    // Initialise sidebar state after login
    initSidebarState();
}

function logout() {
    currentUserRole = null; // Clear the user on logout
    document.getElementById('main-container').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
}

// Mobile menu toggle
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
});

// Toggle submenu accordion style (No change needed)
function toggleSubmenu(submenuId, navButtonId) {
    // 1. Get the target submenu and button
    const submenu = document.getElementById(submenuId);
    const navButton = document.querySelector(`[data-target="${submenuId}"]`);

    // 2. Find all main nav buttons and submenus
    const allSubmenus = document.querySelectorAll('.submenu');
    const allNavButtons = document.querySelectorAll('.nav-main');

    // 3. Close other submenus and reset their arrows
    allSubmenus.forEach(s => {
        if (s.id !== submenuId) {
            s.classList.remove('open');
            const relatedBtn = document.querySelector(`[data-target="${s.id}"]`);
            const relatedArrow = relatedBtn?.querySelector('.arrow-icon');
            if (relatedArrow) {
                relatedArrow.classList.remove('fa-chevron-up');
                relatedArrow.classList.add('fa-chevron-down');
            }
        }
    });

    // 4. Reset highlight for all main nav buttons
    allNavButtons.forEach(btn => btn.classList.remove('active'));

    // 5. Open/close target submenu
    submenu.classList.toggle('open');

    // 6. Toggle the target nav button's highlight and arrow icon
    if (navButton) {
        const arrow = navButton.querySelector('.arrow-icon');

        if (submenu.classList.contains('open')) {
            navButton.classList.add('active');
            if (arrow) {
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            }
        } else {
            navButton.classList.remove('active');
            if (arrow) {
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
        }
    }
}

// Show a specific sub-section in the main area (No change needed)
function showSubSection(sectionId, parentNavId = null, isSingle = false) {
    // hide all sub sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // show the requested section
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    // clear active on all sub-items
    document.querySelectorAll('.sub-item').forEach(si => si.classList.remove('active'));

    // set active for the clicked sub-item (find by data-show)
    const clicked = Array.from(document.querySelectorAll('.sub-item')).find(el => el.getAttribute('data-show') === sectionId);
    if (clicked) clicked.classList.add('active');

    // highlight parent main nav button (if parentNavId provided)
    document.querySelectorAll('.nav-main').forEach(btn => btn.classList.remove('active'));
    if (parentNavId) {
        const mainBtn = document.querySelector(`[data-target="${parentNavId.replace('nav-','') + '-submenu'}"], #${parentNavId}`);
        const fallback = document.getElementById(parentNavId);
        if (mainBtn) mainBtn.classList.add('active');
        else if (fallback) fallback.classList.add('active');
    } else {
        document.querySelectorAll('.nav-main').forEach(btn => btn.classList.remove('active'));
    }

    // If the clicked was inside a submenu, ensure that submenu is open
    const submenuForSection = Array.from(document.querySelectorAll('.submenu')).find(s => s.querySelector(`[data-show="${sectionId}"]`));
    if (submenuForSection) {
        // open it and close others
        document.querySelectorAll('.submenu').forEach(s => {
            if (s === submenuForSection) s.classList.add('open'); else s.classList.remove('open');
        });
    } else {
        // if section doesn't belong to a submenu (audit logs), close all submenus
        document.querySelectorAll('.submenu').forEach(s => s.classList.remove('open'));
    }

    // mobile: close sidebar after selection
    if (window.innerWidth < 1024) document.getElementById('sidebar').classList.add('-translate-x-full');
}

// Initialize default open section & styles
function initSidebarState() {
    let defaultView;
    // Check if the current user is in the privileged list
    const isPrivileged = PRIVILEGED_USERS.includes(currentUserRole);

    if (isPrivileged) {
        defaultView = DEFAULT_SECTION_PRIVILEGED;
        console.log(`User ${currentUserRole} logged in. Defaulting to: ${defaultView.section} (Inventory Form)`);
    } else {
        defaultView = DEFAULT_SECTION_OTHERS;
        console.log(`User ${currentUserRole} logged in. Defaulting to: ${defaultView.section} (Sale Form)`);
    }

    // Show the determined default section ('inventory-form' or 'sale-form')
    showSubSection(defaultView.section, defaultView.parentNav);

    // Pre-open the corresponding submenu and set active states
    document.getElementById(defaultView.submenuId)?.classList.add('open');
    document.querySelector(`[data-target="${defaultView.submenuId}"]`)?.classList.add('active');
    document.querySelector(`[data-show="${defaultView.section}"]`)?.classList.add('active');
}

// Ensure close button of modal works (No change needed)
document.addEventListener('DOMContentLoaded', () => {
    // The original code called initSidebarState() here if needed.
    const closeBtn = document.querySelector('#edit-inventory-modal .close-button');
    if (closeBtn) closeBtn.addEventListener('click', () => document.getElementById('edit-inventory-modal').classList.add('hidden'));
});

// --- Placeholder functions (No change needed) ---
function fetchInventory() { console.log('Fetching inventory...'); }
function fetchSales() { console.log('Fetching sales...'); }
function fetchExpenses() { console.log('Fetching expenses...'); }
function fetchCashJournal() { console.log('Fetching cash journal...'); }
function generateReports() { console.log('Generating reports...'); }
function exportTableToExcel(tableId, filename) {
    console.log(`Exporting table ${tableId} to ${filename}.xlsx`);
    // Keep your SheetJS integration or implementation here.
}

// --- MODIFIED CODE END ---
