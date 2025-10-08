// --- MODIFIED CODE START ---

// 1. Define the privileged users and the default sections
const PRIVILEGED_USERS = ['Nachwera Richard', 'Nelson', 'Florence'];
const DEFAULT_SECTION_PRIVILEGED = {
    section: 'inventory-add',
    parentNav: 'nav-inventory',
    submenuId: 'inventory-submenu'
};
const DEFAULT_SECTION_OTHERS = {
    section: 'sale-new',
    parentNav: 'nav-sales',
    submenuId: 'sales-submenu' // Assuming 'sale-new' is under a 'sales-submenu'
};

let currentUserRole = null; // Variable to store the current user's role/name

// Login/logout placeholders
function login(username) { // MODIFIED: Added username parameter
    currentUserRole = username; // Store the username
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-container').classList.remove('hidden');
    document.getElementById('current-user-display').textContent = username || 'Admin User'; // Use the provided username
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

// Toggle submenu accordion style (No change needed here)
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
            // Find and reset the arrow for the closed submenu's button
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
            // Change arrow to UP 👆
            if (arrow) {
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            }
        } else {
            navButton.classList.remove('active');
            // Change arrow back to DOWN 👇
            if (arrow) {
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
        }
    }
}

// Show a specific sub-section in the main area (No change needed here)
// parentNavId is optional; if provided, it will highlight the parent main button
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
        // highlight the main button that corresponds to the parent nav id
        const mainBtn = document.querySelector(`[data-target="${parentNavId.replace('nav-','') + '-submenu'}"], #${parentNavId}`);
        // fallback: find by nav id as provided
        const fallback = document.getElementById(parentNavId);
        if (mainBtn) mainBtn.classList.add('active');
        else if (fallback) fallback.classList.add('active');
    } else {
        // remove highlight from main buttons if no parent provided (e.g., audit logs)
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
function initSidebarState() { // MODIFIED: Logic added to check user role
    let defaultView;
    const isPrivileged = PRIVILEGED_USERS.includes(currentUserRole);

    if (isPrivileged) {
        defaultView = DEFAULT_SECTION_PRIVILEGED;
        console.log(`User ${currentUserRole} logged in. Defaulting to: ${defaultView.section}`);
    } else {
        defaultView = DEFAULT_SECTION_OTHERS;
        console.log(`User ${currentUserRole} logged in. Defaulting to: ${defaultView.section}`);
    }

    // Show the determined default section
    showSubSection(defaultView.section, defaultView.parentNav);

    // Pre-open the corresponding submenu
    document.getElementById(defaultView.submenuId)?.classList.add('open');
    // Mark main button active
    document.querySelector(`[data-target="${defaultView.submenuId}"]`)?.classList.add('active');
    // Mark sub-item active
    document.querySelector(`[data-show="${defaultView.section}"]`)?.classList.add('active');
}

// Ensure close button of modal works (No change needed here)
document.addEventListener('DOMContentLoaded', () => {
    // If already logged-in state desired in dev, call initSidebarState() here.
    // but we keep default login screen until login() called.
    const closeBtn = document.querySelector('#edit-inventory-modal .close-button');
    if (closeBtn) closeBtn.addEventListener('click', () => document.getElementById('edit-inventory-modal').classList.add('hidden'));
});

// --- Placeholder functions (No change needed here) ---
function fetchInventory() { console.log('Fetching inventory...'); }
function fetchSales() { console.log('Fetching sales...'); }
function fetchExpenses() { console.log('Fetching expenses...'); }
function fetchCashJournal() { console.log('Fetching cash journal...'); }
function generateReports() { console.log('Generating reports...'); }
function exportTableToExcel(tableId, filename) {
    console.log(`Exporting table ${tableId} to ${filename}.xlsx`);
    // Keep your SheetJS integration or implementation here.
}

// --- EXAMPLE USAGE (For testing purposes) ---
// To test, call login() with a user name:
// login('Nachwera Richard'); // Should show 'inventory-add'
// login('John Doe'); // Should show 'sale-new'
// login('Nelson'); // Should show 'inventory-add'
// login('Florence'); // Should show 'inventory-add'

// NOTE: You will need to make sure your HTML uses the IDs:
// 'sale-new' for the sale section,
// 'nav-sales' for the sales main nav ID (or data-target for sales-submenu),
// 'sales-submenu' for the sales submenu ID.
// --- MODIFIED CODE END ---
