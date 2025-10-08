const API_BASE_URL = 'https://patrinahhotelmgtsys.onrender.com'; // Base URL for API calls
let authToken = localStorage.getItem('authToken') || ''; // Stores the authentication token
let currentUsername = localStorage.getItem('username') || ''; // Stores the logged-in username
let currentUserRole = localStorage.getItem('userRole') || ''; // Stores the logged-in user's role

// Pagination variables for different sections
let currentPage = 1; // For Inventory
const itemsPerPage = 30;
let currentSalesPage = 1; // For Sales
const salesPerPage = 15;
let currentExpensesPage = 1; // For Expenses
const expensesPerPage = 5;
let currentAuditPage = 1; // For Audit Logs
const auditLogsPerPage = 20;

// --- Utility Functions ---

/**
 * Displays a custom alert message to the user.
 * Replaces native alert() for better UI control in the environment.
 * @param {string} message The message to display.
 * @param {function} [callback] Optional callback function to execute after the message is dismissed.
 */
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('active');

        // Toggle menu icon between hamburger and X
        if (mobileNav.classList.contains('active')) {
            menuToggle.innerHTML = '&times;'; // X
        } else {
            menuToggle.innerHTML = '&#9776;'; // Hamburger
        }
    });
}


function showMessage(message, callback = null) {
    const modal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    const closeButton = document.getElementById('message-close-button');

    // Ensure elements exist before trying to manipulate them
    if (!modal || !messageText || !closeButton) {
        console.error("Message modal elements not found. Falling back to console log.");
        console.log("Message:", message); // Fallback to console log instead of alert
        if (callback) callback();
        return;
    }

    messageText.textContent = message;
    modal.classList.remove('hidden'); // Show the modal

    const handleClose = () => {
        modal.classList.add('hidden'); // Hide the modal
        closeButton.removeEventListener('click', handleClose);
        modal.removeEventListener('click', outsideClick); // Remove outside click listener
        if (callback) {
            callback();
        }
    };
    closeButton.addEventListener('click', handleClose);

    // Also close if clicking outside the message box (optional, but good UX)
    function outsideClick(event) {
        if (event.target === modal) {
            handleClose();
        }
    }
    modal.addEventListener('click', outsideClick);
}

/**
 * Applies specific UI restrictions for 'Martha' and 'Joshua' roles in Sales, Expenses, and Cash Management sections.
 * Hides headings, filters, and tables, showing only the forms for these roles.
 * @param {string} sectionId The ID of the currently active section.
 */
function applyBarStaffUIRestrictions(sectionId) {
    // Check if the current user is 'Martha' or 'Joshua'
    const isMartha = currentUserRole === 'Martha';
    const isMercy = currentUserRole === 'Mercy';
    const isJoshua = currentUserRole === 'Joshua';
    const isBarStaff = isMartha || isJoshua || isMercy;

    // Sales section specific elements
    const salesHeading = document.querySelector('#sales-section .sales-records-heading');
    const salesFilter = document.querySelector('#sales-section .sales-filter-controls');
    const paginationControl = document.querySelector('#sales-section .pagination-controls');
    const salesTable = document.getElementById('sales-table');
    const excelbtnTable = document.querySelector('#sales-section .export-button'); // Sales Export button

    // Expenses section specific elements
    const expensesHeading = document.querySelector('#expenses-section .expenses-records-heading');
    const expensesFilter = document.querySelector('#expenses-section .expenses-filter-controls');
    const expensePag = document.querySelector('#expenses-section .pagination-controls');
    const expensesTable = document.getElementById('expenses-table');

    // Cash Management section specific elements
    const cashHeading = document.querySelector('#cash-management-section .cash-header');
    const cashFilter = document.querySelector('#cash-management-section .filter-controls');
    const cashTable = document.getElementById('cash-journal-table');

    // Inventory section specific elements (for Joshua and Martha)
    const inventoryHeading = document.querySelector('#inventory-section .inventory-records-heading');
    const inventoryFilter = document.querySelector('#inventory-section .inventory-filter-controls');
    const inventoryPagination = document.querySelector('#inventory-section .pagination-controls');
    const inventoryTable = document.getElementById('inventory-table');


    // Reset display for all elements initially to ensure proper visibility when roles change
    [salesHeading, salesFilter, paginationControl, salesTable, excelbtnTable,
     expensesHeading, expensesFilter, expensePag, expensesTable,
     cashHeading, cashFilter, cashTable,
     inventoryHeading, inventoryFilter, inventoryPagination, inventoryTable].forEach(el => {
         if (el) el.style.display = ''; // Reset to default display
     });


    if (isBarStaff) {
        // Sales Section
        if (sectionId === 'sales') {
            if (salesHeading) salesHeading.style.display = 'block';
            if (salesFilter) salesFilter.style.display = 'flex';
            if (salesTable) salesTable.style.display = 'table';
            if (paginationControl) paginationControl.style.display = 'block';
            // Hide sales export button for Martha and Joshua
            if (excelbtnTable) excelbtnTable.style.display = 'none';
        }

        // Expenses Section (Martha & Joshua)
        if (sectionId === 'expenses') {
            if (expensesHeading) expensesHeading.style.display = 'block';
            if (expensesFilter) expensesFilter.style.display = 'flex';
            if (expensesTable) expensesTable.style.display = 'table';
            if (expensePag) expensePag.style.display = 'block';
        }

        // Cash Management Section (Martha & Joshua)
        if (sectionId === 'cash-management') {
            if (cashHeading) cashHeading.style.display = 'block';
            if (cashFilter) cashFilter.style.display = 'flex';
            if (cashTable) cashTable.style.display = 'table';
        }

        // Inventory Section (For Joshua and Martha)
        if (sectionId === 'inventory' && (isJoshua || isMartha || isMercy)) {
            if (inventoryHeading) inventoryHeading.style.display = 'block';
            if (inventoryFilter) inventoryFilter.style.display = 'flex';
            if (inventoryPagination) inventoryPagination.style.display = 'block';
            if (inventoryTable) inventoryTable.style.display = 'table';
        }
    } else {
        // For Nachwera Richard, Nelson, Florence, or other roles, ensure all elements are visible
        if (salesHeading) salesHeading.style.display = 'block';
        if (salesFilter) salesFilter.style.display = 'flex';
        if (salesTable) salesTable.style.display = 'table';
        if (excelbtnTable) excelbtnTable.style.display = 'block'; // Show for full access roles
        if (paginationControl) paginationControl.style.display = 'block';

        if (expensesHeading) expensesHeading.style.display = 'block';
        if (expensesFilter) expensesFilter.style.display = 'flex';
        if (expensesTable) expensesTable.style.display = 'table';
        if (expensePag) expensePag.style.display = 'block';

        if (cashHeading) cashHeading.style.display = 'block';
        if (cashFilter) cashFilter.style.display = 'flex';
        if (cashTable) cashTable.style.display = 'table';

        if (inventoryHeading) inventoryHeading.style.display = 'block';
        if (inventoryFilter) inventoryFilter.style.display = 'flex';
        if (inventoryPagination) inventoryPagination.style.display = 'block';
        if (inventoryTable) inventoryTable.style.display = 'table';
    }
}


/**
 * Updates the display of the current logged-in user and manages navigation button visibility.
 * Ensures the login form is hidden on success and sets nav button visibility based on role.
 */
function updateUIForUserRole() {
    const userDisplay = document.getElementById('current-user-display');
    const useDisplay = document.getElementById('mobil-nav'); // Assuming this is for a mobile nav display
    const mainContent = document.getElementById('main-content');
    const loginSection = document.getElementById('login-section');
    const mainContainer = document.getElementById('main-container');
    const navButtons = document.querySelectorAll('nav button');

    console.log('updateUIForUserRole called. AuthToken present:', !!authToken);
    console.log('Current User Role:', currentUserRole);

    if (authToken && currentUserRole) {
        if (userDisplay) userDisplay.textContent = `${currentUserRole}`;
        if (useDisplay) useDisplay.textContent = `${currentUserRole}`;

        // --- Hide Login Section, Show Main Container ---
        if (loginSection) loginSection.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'block';
        if (mainContent) mainContent.style.display = 'block';


        // --- Manage Navigation Button Visibility based on role ---
        navButtons.forEach(button => {
            button.style.display = 'none'; // Hide all buttons by default
        });

        // Roles with full access (Nachwera Richard, Nelson, Florence)
        const fullAccessRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (fullAccessRoles.includes(currentUserRole)) {
            navButtons.forEach(button => {
                button.style.display = 'inline-block';
            });
        }
        // Martha: Inventory, Sales, Expenses, Cash Management
        else if (currentUserRole === 'Martha' || currentUserRole === 'Mercy') {
            if (document.getElementById('nav-inventory')) document.getElementById('nav-inventory').style.display = 'inline-block'; // Martha can now see Inventory
            if (document.getElementById('nav-sales')) document.getElementById('nav-sales').style.display = 'inline-block';
            if (document.getElementById('nav-expenses')) document.getElementById('nav-expenses').style.display = 'inline-block';
            if (document.getElementById('nav-cash-management')) document.getElementById('nav-cash-management').style.display = 'inline-block';
        }
        // Joshua: Inventory, Sales (No Cash Management, No Expenses)
        else if (currentUserRole === 'Joshua') {
            if (document.getElementById('nav-inventory')) document.getElementById('nav-inventory').style.display = 'inline-block';
            if (document.getElementById('nav-sales')) document.getElementById('nav-sales').style.display = 'inline-block';
            // Explicitly hide Cash Management and Expenses for Joshua
            if (document.getElementById('nav-cash-management')) document.getElementById('nav-cash-management').style.display = 'none';
            if (document.getElementById('nav-expenses')) document.getElementById('nav-expenses').style.display = 'none';
        }


        // Show default section based on role
        if (fullAccessRoles.includes(currentUserRole)) {
            showSection('inventory'); // Admins start with inventory
            initSidebarState(); // Use new sidebar state logic
        } else if (currentUserRole === 'Martha' || currentUserRole === 'Mercy') {
            showSection('inventory'); // Martha now starts with inventory
            initSidebarState(); // Use new sidebar state logic
        } else if (currentUserRole === 'Joshua') {
            showSection('inventory'); // Joshua starts with inventory
            initSidebarState(); // Use new sidebar state logic
        }

    } else {
        // Not logged in: Show login section, hide main container
        if (userDisplay) userDisplay.textContent = '';
        if (mainContent) mainContent.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'none';
        if (loginSection) loginSection.style.display = 'block';

        // Hide all nav buttons if not logged in
        navButtons.forEach(button => {
            button.style.display = 'none';
        });
    }
    console.log('End of updateUIForUserRole.');
}


/**
 * Hides all sections and shows the specified one.
 * Includes role-based access checks and special handling for bar staff sales view.
 * NOTE: This is the main section toggle (e.g., Inventory, Sales, Reports).
 * The sub-section logic is now handled by showSubSection().
 * @param {string} sectionId The ID of the section to show.
 */
function showSection(sectionId) {
    // Define which sections are allowed for each role
    const allowedSections = {
        'Nachwera Richard': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        'Nelson': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        'Florence': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        'Martha': ['inventory', 'sales', 'expenses', 'cash-management'], // Martha can now view Inventory
        'Mercy': ['inventory', 'sales', 'expenses', 'cash-management'], // Mercy can now view Inventory
        'Joshua': ['inventory', 'sales'] // Joshua can view these
    };

    // --- Role-based Access Check ---
    if (currentUserRole && !allowedSections[currentUserRole]?.includes(sectionId)) {
        showMessage('Access Denied: You do not have permission to view this section.');
        // Redirect to a default allowed section if trying to access unauthorized
        const fullAccessRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (fullAccessRoles.includes(currentUserRole)) {
            showSection('inventory'); // Admin default
        } else if (currentUserRole === 'Martha' || currentUserRole === 'Mercy') {
            showSection('sales'); // Martha default
        } else if (currentUserRole === 'Joshua') {
            showSection('sales'); // Joshua default
        }
        return; // Prevent further execution for unauthorized access
    }

    // --- Show/Hide Sections ---
    // Note: showSubSection now handles the 'active' class on .section elements.
    // We will call showSubSection with a default sub-section for each main section.
    // For now, we keep the original logic for compatibility with the nav buttons.
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.warn(`Section with ID ${sectionId}-section not found.`);
        return; // Exit if section doesn't exist
    }

    // --- Apply Bar Staff UI Restrictions (Headings, Filters, Tables) ---
    applyBarStaffUIRestrictions(sectionId);

    // --- Fetch Data based on Section and Role ---
    if (sectionId === 'inventory') {
        // Assume default sub-section is 'inventory-add-section' or 'inventory-records-section'
        // For now, call fetchInventory for the main section.
        fetchInventory();
    } else if (sectionId === 'sales') {
        fetchSales();
    } else if (sectionId === 'expenses') {
        fetchExpenses();
    } else if (sectionId === 'cash-management') {
        // Set default date for new entry and filter
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayString = `${yyyy}-${mm}-${dd}`;
        const cashDate = document.getElementById('cash-date');
        const cashFilterDate = document.getElementById('cash-filter-date');
        if (cashDate) cashDate.value = todayString; // For the form
        if (cashFilterDate) cashFilterDate.value = todayString; // For the filter
        fetchCashJournal();
    } else if (sectionId === 'reports') {
        // Set default dates for reports (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startInput = document.getElementById('report-start-date');
        const endInput = document.getElementById('report-end-date');

        if (startInput && !startInput.value) {
            startInput.value = thirtyDaysAgo.toISOString().split('T')[0];
        }
        if (endInput && !endInput.value) {
            endInput.value = today.toISOString().split('T')[0];
        }
    } else if (sectionId === 'audit-logs') {
        fetchAuditLogs();
    }
}

/**
 * Wrapper for fetch API to include authentication header and handle common errors.
 * @param {string} url The URL to fetch.
 * @param {object} options Fetch options (method, headers, body, etc.).
 * @returns {Promise<Response|null>} The fetch Response object or null if authentication fails.
 */
async function authenticatedFetch(url, options = {}) {
    if (!authToken) {
        showMessage('You are not logged in. Please log in first.', logout);
        return null;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, options);

        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json();
            showMessage(`Access Denied: ${errorData.error || 'Invalid credentials or insufficient permissions.'}`, logout);
            return null;
        }
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error('Network or fetch error:', error);
        showMessage('Could not connect to the server or process request: ' + error.message);
        return null;
    }
}

// -------------------------------------------------------------------
// --- NEW/UPDATED UI AND NAVIGATION LOGIC ---
// -------------------------------------------------------------------

/**
 * Clears authentication data and returns the user to the login screen.
 */
function logout() {
    authToken = '';
    currentUsername = '';
    currentUserRole = '';
    localStorage.clear(); // Clear all stored user data
    
    // Hide main app content and show login form
    const mainContainer = document.getElementById('main-container');
    const loginSection = document.getElementById('login-section');

    if (mainContainer) mainContainer.style.display = 'none';
    if (loginSection) loginSection.style.display = 'block';

    // Reset UI elements
    updateUIForUserRole(); 
    console.log('User logged out.');
}


/**
 * Toggles a submenu (accordion style), ensuring other submenus are closed,
 * and manages the visual state (active class, arrow icon) of the main nav button.
 * @param {string} submenuId The ID of the submenu container (e.g., 'inventory-submenu').
 */
function toggleSubmenu(submenuId) {
    // 1. Get the target submenu
    const submenu = document.getElementById(submenuId);
    if (!submenu) return;

    // 2. Find the main button that triggers this submenu
    const navButton = document.querySelector(`[data-target="${submenuId}"]`);

    // 3. Close other submenus and reset their arrows
    document.querySelectorAll('.submenu').forEach(s => {
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
    
    // 4. Reset highlight for all main nav buttons that are not a single link
    document.querySelectorAll('.nav-main:not([data-target])').forEach(btn => btn.classList.remove('active'));

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


/**
 * Hides all sub-sections and shows the specified one, managing active states for the sidebar.
 * This is intended for use with sub-navigation items within main sections (like Inventory).
 * @param {string} sectionId The ID of the sub-section to show (e.g., 'inventory-add-section').
 * @param {string} parentNavId The ID of the main nav button (e.g., 'nav-inventory').
 */
function showSubSection(sectionId, parentNavId = null) {
    // 1. Hide all main sections and sub-sections (assuming sub-sections have the class .section)
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // 2. Show the requested section
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        // If this is a main section, re-run showSection logic for data fetching/restrictions
        const mainSectionId = sectionId.replace('-section', '').split('-')[0];
        // Ensure the main section data logic runs if this is a main view
        if (mainSectionId === sectionId.replace('-section', '')) {
             showSection(mainSectionId); 
        } else {
            // Apply restrictions even for sub-sections if they contain viewable data elements
             applyBarStaffUIRestrictions(mainSectionId);
        }
    }

    // 3. Clear active state on all sub-items
    document.querySelectorAll('.sub-item').forEach(si => si.classList.remove('active'));

    // 4. Set active state for the clicked sub-item (find by data-show attribute)
    const clicked = Array.from(document.querySelectorAll('.sub-item')).find(el => el.getAttribute('data-show') === sectionId);
    if (clicked) clicked.classList.add('active');

    // 5. Highlight parent main nav button
    document.querySelectorAll('.nav-main').forEach(btn => btn.classList.remove('active'));
    if (parentNavId) {
        // Find the main button by its ID
        const mainBtn = document.getElementById(parentNavId);
        if (mainBtn) {
             mainBtn.classList.add('active');
             // If the main button has an arrow, ensure it points UP
             const arrow = mainBtn.querySelector('.arrow-icon');
             if (arrow) {
                 arrow.classList.remove('fa-chevron-down');
                 arrow.classList.add('fa-chevron-up');
             }
        }
    }

    // 6. Ensure the related submenu is open
    const submenuForSection = Array.from(document.querySelectorAll('.submenu')).find(s => s.querySelector(`[data-show="${sectionId}"]`));
    document.querySelectorAll('.submenu').forEach(s => {
        if (s === submenuForSection) s.classList.add('open'); else s.classList.remove('open');
    });

    // 7. Mobile: close sidebar after selection (assuming sidebar has ID 'sidebar')
    if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('-translate-x-full');
    }
}

/**
 * Sets the initial state of the sidebar after login: opens a default section/submenu.
 */
function initSidebarState() {
    // 1. Determine the user's default section
    let defaultSectionId = 'inventory-records-section';
    let defaultParentNavId = 'nav-inventory';

    // Bar staff default to Sales if they don't have full inventory access 
    // (though in updateUIForUserRole, we default them to 'inventory' now)
    const barStaffRoles = ['Martha', 'Mercy', 'Joshua'];
    if (barStaffRoles.includes(currentUserRole)) {
        defaultSectionId = 'sales-add-section'; // Or their main data entry view
        defaultParentNavId = 'nav-sales'; 
    }

    // 2. Show the default sub-section
    showSubSection(defaultSectionId, defaultParentNavId);

    // 3. Manually open the corresponding submenu (if it exists)
    const submenuId = defaultParentNavId.replace('nav-', '') + '-submenu';
    const submenu = document.getElementById(submenuId);
    if (submenu) submenu.classList.add('open');

    // 4. Ensure the main button is active (this is handled by showSubSection now, but double check)
    document.getElementById(defaultParentNavId)?.classList.add('active');
}


// --- API/Data Placeholder functions (keep the console logs for now) ---
function fetchInventory() { console.log('Fetching inventory...'); }
function fetchSales() { console.log('Fetching sales...'); }
function fetchExpenses() { console.log('Fetching expenses...'); }
function fetchCashJournal() { console.log('Fetching cash journal...'); }
function fetchAuditLogs() { console.log('Fetching audit logs...'); }
function generateReports() { console.log('Generating reports...'); }
function exportTableToExcel(tableId, filename) {
    console.log(`Exporting table ${tableId} to ${filename}.xlsx`);
    // Keep your SheetJS integration or implementation here.
}

// -------------------------------------------------------------------
// --- EVENT LISTENERS ---
// -------------------------------------------------------------------

// Mobile menu toggle listener (assuming a Tailwind CSS setup where -translate-x-full hides it)
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // NOTE: Your original code had an event listener for menu-toggle and mobile-nav
    // This one targets a different setup (sidebar with -translate-x-full).
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // Ensure close button of modal works (from your original snippet)
    const closeBtn = document.querySelector('#edit-inventory-modal .close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('edit-inventory-modal');
            if (modal) modal.classList.add('hidden');
        });
    }
    
    // Initial check on load
    updateUIForUserRole();
});

// --- Login/Logout ---

async function login() {
    // ... (Your existing login logic remains here) ...
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');

    if (!usernameInput || !passwordInput || !loginMessage) {
        console.error("Login form elements not found.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    loginMessage.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            // For hardcoded auth, the token is derived from the plain credentials
            authToken = btoa(`${username}:${password}`);
            currentUsername = data.username;
            currentUserRole = data.role;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', currentUsername);
            localStorage.setItem('userRole', currentUserRole);

            loginMessage.textContent = '';
            console.log('Login successful, calling updateUIForUserRole...');
            
            // Initialise sidebar state after login (called inside updateUIForUserRole now)
            updateUIForUserRole(); 

        } else {
            const errorData = await response.json();
            loginMessage.textContent = errorData.error || 'Invalid username or password.';
            authToken = '';
            currentUsername = '';
            currentUserRole = '';
            localStorage.clear();
            console.log('Login failed.');
            updateUIForUserRole(); // Ensure UI resets to login form
        }
    } catch (error) {
        console.error('Login error:', error);
        loginMessage.textContent = 'Network error or server unavailable.';
        authToken = '';
        currentUsername = '';
        currentUserRole = '';
        localStorage.clear();
        updateUIForUserRole();
    }
    console.log('Attempting login with:', username, password);
}
