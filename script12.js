// --- Initialization Variables ---
const API_BASE_URL = 'https://patrinahhotelmgtsys.onrender.com'; 
let authToken = localStorage.getItem('authToken') || ''; 
let currentUsername = localStorage.getItem('username') || ''; 
let currentUserRole = localStorage.getItem('userRole') || ''; 

// Pagination variables (placeholders)
let currentPage = 1; 
const itemsPerPage = 30;
let currentSalesPage = 1; 
const salesPerPage = 15;
let currentExpensesPage = 1; 
const expensesPerPage = 5;
let currentAuditPage = 1; 
const auditLogsPerPage = 20;

// --- Placeholder functions for data operations (to prevent runtime errors) ---
function fetchInventory() { console.log('Fetching inventory...'); }
function fetchSales() { console.log('Fetching sales...'); }
function fetchExpenses() { console.log('Fetching expenses...'); }
function fetchCashJournal() { console.log('Fetching cash journal...'); }
function generateReports() { console.log('Generating reports...'); }
function fetchAuditLogs() { console.log('Fetching audit logs...'); }
function exportTableToExcel(tableId, filename) { console.log(`Exporting table ${tableId} to ${filename}.xlsx`); }


// --- Core Utility Functions ---

/**
 * Displays a custom alert message to the user.
 * (Requires #message-modal, #message-text, #message-close-button in HTML)
 * @param {string} message The message to display.
 * @param {function} [callback] Optional callback function to execute after the message is dismissed.
 */
function showMessage(message, callback = null) {
    const modal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    const closeButton = document.getElementById('message-close-button');

    if (!modal || !messageText || !closeButton) {
        console.error("Message modal elements not found.");
        console.log("Message:", message);
        if (callback) callback();
        return;
    }

    messageText.textContent = message;
    modal.classList.remove('hidden');

    const handleClose = () => {
        modal.classList.add('hidden');
        closeButton.removeEventListener('click', handleClose);
        modal.removeEventListener('click', outsideClick);
        if (callback) {
            callback();
        }
    };
    closeButton.addEventListener('click', handleClose);

    function outsideClick(event) {
        if (event.target === modal) {
            handleClose();
        }
    }
    modal.addEventListener('click', outsideClick);
}

/**
 * Clears user state, local storage, and updates UI to show the login screen.
 */
function logout() {
    // Clear authentication info
    authToken = '';
    currentUsername = '';
    currentUserRole = '';
    localStorage.clear();

    // UI update
    document.getElementById('main-container').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');

    // Ensure the full update logic runs to hide navigation elements
    updateUIForUserRole();
}

/**
 * Wrapper for fetch API to include authentication token and handle errors.
 */
async function authenticatedFetch(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers 
    };

    const fullOptions = { ...options, headers };

    try {
        const response = await fetch(url, fullOptions);

        if (response.status === 401 || response.status === 403) {
            showMessage('Session expired or unauthorized access. Logging out.', logout);
            return { ok: false, status: response.status }; 
        }

        return response;
    } catch (error) {
        console.error('Authenticated fetch error:', error);
        showMessage('Network error or unable to reach the server.');
        return { ok: false, status: 0 }; 
    }
}

/**
 * Handles the login process by sending credentials to the API.
 */
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');
    loginMessage.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store authentication information
            authToken = data.token;
            currentUsername = username;
            currentUserRole = data.role || 'Bar Staff'; 

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', currentUsername);
            localStorage.setItem('userRole', currentUserRole);

            // Update UI and show the main application
            updateUIForUserRole();
            initSidebarState(); 

            loginMessage.textContent = '';
        } else {
            loginMessage.textContent = data.message || 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Login request failed:', error);
        loginMessage.textContent = 'Network error or service unavailable.';
    }
}


// --- Sidebar and Navigation Functions ---

/**
 * Applies specific UI restrictions for Bar Staff roles.
 * @param {string} mainSectionId The ID of the main section (e.g., 'sales', 'inventory').
 */
function applyBarStaffUIRestrictions(mainSectionId) {
    const isMartha = currentUserRole === 'Martha';
    const isMercy = currentUserRole === 'Mercy';
    const isJoshua = currentUserRole === 'Joshua';
    const isBarStaff = isMartha || isJoshua || isMercy;

    const salesExportBtn = document.querySelector('#sales-list .export-button');

    if (salesExportBtn) salesExportBtn.style.display = '';

    if (isBarStaff) {
        if (mainSectionId === 'sales' && salesExportBtn) {
            salesExportBtn.style.display = 'none';
        }
    } else {
        if (mainSectionId === 'sales' && salesExportBtn) {
            salesExportBtn.style.display = 'block';
        }
    }
}

/**
 * Toggles a submenu (accordion style) and manages navigation highlighting.
 * @param {string} submenuId The ID of the submenu container (e.g., 'inventory-submenu').
 */
function toggleSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    const navButton = document.querySelector(`[data-target="${submenuId}"]`);

    // 1. Close other submenus and reset their arrows
    document.querySelectorAll('.submenu').forEach(s => {
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

    // 2. Toggle target submenu
    submenu.classList.toggle('open');

    // 3. Update main nav button class and arrow
    if (navButton) {
        const arrow = navButton.querySelector('.arrow-icon');
        navButton.classList.toggle('active', submenu.classList.contains('open'));

        if (arrow) {
            if (submenu.classList.contains('open')) {
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            } else {
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
        }
    }

    // 4. Clear active state on all sub-items
    document.querySelectorAll('.sub-item').forEach(si => si.classList.remove('active'));
}

/**
 * Hides all sections and shows the specified sub-section.
 * @param {string} sectionId The ID of the sub-section to show.
 * @param {string} [parentNavId] The ID of the parent navigation button (e.g., 'nav-inventory').
 */
function showSubSection(sectionId, parentNavId = null) {
    const mainSectionId = sectionId.split('-')[0];

    // --- Role-based Access Check ---
    const allowedSections = {
        'Nachwera Richard': ['inventory', 'sales', 'expenses', 'cash', 'reports', 'audit'],
        'Nelson': ['inventory', 'sales', 'expenses', 'cash', 'reports', 'audit'],
        'Florence': ['inventory', 'sales', 'expenses', 'cash', 'reports', 'audit'],
        'Martha': ['inventory', 'sales', 'expenses', 'cash'],
        'Mercy': ['inventory', 'sales', 'expenses', 'cash'],
        'Joshua': ['inventory', 'sales']
    };

    const checkSectionId = mainSectionId.startsWith('cash') ? 'cash' : (mainSectionId === 'audit' ? 'audit' : mainSectionId);

    if (currentUserRole && !allowedSections[currentUserRole]?.includes(checkSectionId)) {
        showMessage('Access Denied: You do not have permission to view this section.');
        
        // Redirect logic to ensure a safe landing page
        const fullAccessRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (fullAccessRoles.includes(currentUserRole)) {
            initSidebarState(); 
        } else if (currentUserRole === 'Martha' || currentUserRole === 'Mercy' || currentUserRole === 'Joshua') {
            showSubSection('sales-new', 'nav-sales'); 
        }
        return;
    }

    // --- Show/Hide Sections ---
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
    } else {
        console.warn(`Section with ID ${sectionId} not found.`);
        return;
    }

    // --- Highlighting Logic ---
    document.querySelectorAll('.sub-item').forEach(si => si.classList.remove('active'));
    document.querySelectorAll('.nav-main').forEach(btn => btn.classList.remove('active'));

    const clicked = document.querySelector(`.sub-item[data-show="${sectionId}"]`);
    if (clicked) clicked.classList.add('active');

    // Highlight parent main nav button
    if (parentNavId) {
        const mainBtn = document.getElementById(parentNavId);
        if (mainBtn) mainBtn.classList.add('active');
    } else {
         const singleBtn = document.getElementById(`nav-${mainSectionId}-logs`) || document.getElementById(`nav-${sectionId}`);
         if (singleBtn) singleBtn.classList.add('active');
    }

    // Ensure the parent submenu is open (only if section is inside a submenu)
    const parentNavButton = document.getElementById(parentNavId);
    const targetSubmenuId = parentNavButton?.getAttribute('data-target');
    const targetSubmenu = targetSubmenuId ? document.getElementById(targetSubmenuId) : null;

    document.querySelectorAll('.submenu').forEach(s => {
        const navButton = document.querySelector(`[data-target="${s.id}"]`);
        const arrow = navButton?.querySelector('.arrow-icon');

        if (s === targetSubmenu) {
            s.classList.add('open');
            if (arrow) {
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            }
        } else {
            s.classList.remove('open');
            if (arrow) {
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
        }
    });


    // --- Data Fetching and Restrictions ---
    applyBarStaffUIRestrictions(checkSectionId);

    // Trigger data fetching for list views
    switch (sectionId) {
        case 'inventory-list': fetchInventory(currentPage, itemsPerPage); break;
        case 'sales-list': fetchSales(currentSalesPage, salesPerPage); break;
        case 'expenses-list': fetchExpenses(currentExpensesPage, expensesPerPage); break;
        case 'cash-management-journal': fetchCashJournal(); break;
        case 'reports-summary': generateReports(); break; 
        case 'audit-logs': fetchAuditLogs(currentAuditPage, auditLogsPerPage); break;
    }

    // mobile: close sidebar after selection
    if (window.innerWidth < 1024) document.getElementById('sidebar').classList.add('-translate-x-full');
}


/**
 * Initializes default open section & styles for the main application view.
 */
function initSidebarState() {
    // Show inventory-add by default, and set its parent nav-inventory as active
    showSubSection('inventory-add', 'nav-inventory');
    
    // Manually ensure the submenu is open and arrow is correct on initial load
    const submenu = document.getElementById('inventory-submenu');
    const navButton = document.querySelector(`[data-target="inventory-submenu"]`);
    const arrow = navButton?.querySelector('.arrow-icon');

    if(submenu) submenu.classList.add('open');
    if(navButton) navButton.classList.add('active');
    if (arrow) {
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-up');
    }
}


/**
 * Updates the UI based on the logged-in user's role, toggling nav visibility.
 */
function updateUIForUserRole() {
    // MAPPING FIX: Confirmed all 6 main nav items for full-access roles.
    const rolePermissions = {
        'Nachwera Richard': ['nav-inventory', 'nav-sales', 'nav-expenses', 'nav-cash-management', 'nav-reports', 'nav-audit-logs'],
        'Nelson': ['nav-inventory', 'nav-sales', 'nav-expenses', 'nav-cash-management', 'nav-reports', 'nav-audit-logs'],
        'Florence': ['nav-inventory', 'nav-sales', 'nav-expenses', 'nav-cash-management', 'nav-reports', 'nav-audit-logs'],
        'Martha': ['nav-inventory', 'nav-sales', 'nav-expenses', 'nav-cash-management'],
        'Mercy': ['nav-inventory', 'nav-sales', 'nav-expenses', 'nav-cash-management'],
        'Joshua': ['nav-inventory', 'nav-sales']
    };

    const userNavs = rolePermissions[currentUserRole] || [];
    const allNavButtons = document.querySelectorAll('.nav-main');

    // 1. Toggle visibility of main navigation buttons
    allNavButtons.forEach(btn => {
        const navId = btn.id;
        if (userNavs.includes(navId)) {
            btn.classList.remove('hidden');
        } else {
            // Hide if not in permissions list
            btn.classList.add('hidden');
        }
    });

    // 2. Update user display
    const userDisplay = document.getElementById('current-user-display');
    if (userDisplay) {
         userDisplay.textContent = currentUserRole ? `(${currentUserRole})` : '';
    }

    // 3. Show main app container if logged in
    if (authToken) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
    } else {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('main-container').classList.add('hidden');
    }
}


// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // If auth token exists (e.g., refreshing an authenticated page), set up the UI
    if (authToken) {
        updateUIForUserRole();
        initSidebarState();
    }

    // Mobile menu toggle (Open)
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('-translate-x-full');
    });

    // Mobile menu toggle (Close button inside sidebar)
    document.getElementById('menu-toggle-close').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('-translate-x-full');
    });
    
    // Set up click listener for the message modal close button
    const messageCloseBtn = document.getElementById('message-close-button');
    if (messageCloseBtn) {
        messageCloseBtn.addEventListener('click', () => {
            document.getElementById('message-modal').classList.add('hidden');
        });
    }

    // Set up click listener for the sales export button
    const salesExportBtn = document.querySelector('#sales-list .export-button');
    if (salesExportBtn) {
        salesExportBtn.addEventListener('click', () => {
            exportTableToExcel('sales-table', 'Patrinah_Sales_Records');
        });
    }

    // Listener for inventory edit modal close button (if it exists)
    const editModal = document.getElementById('edit-inventory-modal');
    if (editModal) {
         const closeBtn = editModal.querySelector('.close-button');
         if (closeBtn) closeBtn.addEventListener('click', () => editModal.classList.add('hidden'));
    }
});


async function logout() {
    try {
        // Optionally notify backend of logout for audit logging
        // Send token before clearing it, to allow backend to process if needed
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        // This catch handles network errors or if the backend doesn't exist
        // or doesn't require auth for logout, which is acceptable.
        console.warn('Error notifying backend of logout (may be due to network issues or no backend endpoint):', error);
    }

    authToken = '';
    currentUsername = '';
    currentUserRole = '';
    localStorage.clear(); // Clear all stored user data
    updateUIForUserRole(); // Reset UI to login state
    if (document.getElementById('username')) document.getElementById('username').value = '';
    if (document.getElementById('password')) document.getElementById('password').value = '';
    if (document.getElementById('login-message')) document.getElementById('login-message').textContent = '';
}

// --- Inventory Functions ---
// Function to update the search button text
function updateSearchButton(text, iconClass) {
    const searchButton = document.querySelector('.filter-controls button[onclick="fetchInventory()"]');
    if (searchButton) {
        // Clear existing content and set new text and icon
        searchButton.innerHTML = `${text} <i class="${iconClass}"></i>`;
    }
}

async function fetchInventory() {
    // 1. Change button text to 'Searching'
    updateSearchButton('Searching', 'fas fa-spinner fa-spin'); // fa-spinner fa-spin provides a loading animation

    try {
        const itemFilterInput = document.getElementById('search-inventory-item');
        const lowFilterInput = document.getElementById('search-inventory-low');
        const dateFilterInput = document.getElementById('search-inventory-date');

        const itemFilter = itemFilterInput ? itemFilterInput.value : '';
        const lowFilter = lowFilterInput ? lowFilterInput.value : '';
        const dateFilter = dateFilterInput ? dateFilterInput.value : '';

        let url = `${API_BASE_URL}/inventory`;
        const params = new URLSearchParams();
        if (itemFilter) params.append('item', itemFilter);
        if (lowFilter) params.append('low', lowFilter);
        if (dateFilter) params.append('date', dateFilter); // Add date to params
        // Only append pagination params if a date filter is NOT present
        if (!dateFilter) {
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);
        }

        url += `?${params.toString()}`;

        const response = await authenticatedFetch(url);
        if (!response) {
            // Restore button on error or non-response
            updateSearchButton('Search', 'fas fa-search');
            return;
        }

        const result = await response.json();

        // Check if the 'date' filter was used
        let inventoryData;
        if (dateFilter) {
            // For the daily report, the data is in the 'report' property
            inventoryData = result.report;
            // Since the daily report is not paginated, we don't render pagination
            renderPagination(1, 1);
        } else {
            // For the standard paginated list, the data is in the 'data' property
            inventoryData = result.data;
            renderPagination(result.page, result.pages);
        }
        
        // Pass the correct data array to the rendering function
        renderInventoryTable(inventoryData);

        // 2. Change button text to 'Done' after successful display
        updateSearchButton('Done', 'fas fa-check');

        // 3. Set a timeout to revert the button text back to 'Search' after 2 seconds
        setTimeout(() => {
            updateSearchButton('Search', 'fas fa-search');
        }, 2000); // 2000 milliseconds = 2 seconds

    } catch (error) {
        console.error('Error fetching inventory:', error);
        showMessage('Failed to fetch inventory: ' + error.message);
        
        // Ensure the button is reverted to 'Search' on error
        updateSearchButton('Search', 'fas fa-search');
    }
}

function renderPagination(current, totalPages) {
    const container = document.getElementById('pagination');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.disabled = i === current;
        btn.onclick = () => {
            currentPage = i;
            fetchInventory();
        };
        container.appendChild(btn);
    }
}

/**
 * Renders the inventory data into a table on the page.
 * It now includes a fix to recalculate the closing stock on the frontend
 * to ensure accuracy, especially when viewing a daily report.
 * @param {Array<Object>} inventory - An array of inventory item objects.
 */

function renderInventoryTable(inventory) {
    console.log('Current User Role:', currentUserRole);
    console.log('Inventory Data:', inventory);

    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Filter to include only items where the 'item' name starts with 'bar' (case-insensitive)
    const filteredInventory = inventory.filter(item =>
        item.item.toLowerCase().startsWith('bar')
    );

    if (filteredInventory.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7;
        cell.textContent = 'No inventory items starting with "bar" were found.';
        cell.style.textAlign = 'center';
        return;
    }

    filteredInventory.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell().textContent = item.item;

        const opening = item.opening || 0;
        const purchases = item.purchases || 0;
        const sales = item.sales || 0;
        const spoilage = item.spoilage || 0;

        // The calculated closing value is now provided by the backend, or is null.
        const closing = item.closing;

        row.insertCell().textContent = opening;
        row.insertCell().textContent = purchases;
        row.insertCell().textContent = sales;
        row.insertCell().textContent = spoilage;

        // Conditionally render closing stock based on the value from the backend
        const closingStockCell = row.insertCell();
        if (closing === null) {
            closingStockCell.textContent = 'N/A';
            closingStockCell.style.fontStyle = 'italic';
            closingStockCell.style.color = 'gray';
        } else {
            closingStockCell.textContent = closing;
        }

        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];

        if (adminRoles.includes(currentUserRole) && item._id) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => openEditModal(item);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete';
                    deleteButton.onclick = () => deleteInventory(item._id);
                    actionsCell.appendChild(deleteButton);

        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}


/**
 * Deletes an inventory item after confirming with the user.
 * @param {string} id The unique ID of the inventory item to delete.
 */
async function deleteInventory(id) {
    // Replace confirm() with a custom modal or just proceed with a check
    // Here we will just add a check to ensure the ID is valid.
    if (!id || typeof id !== 'string' || id.trim() === '') {
        showMessage('Error: Cannot delete item. A valid ID was not provided.');
        console.error('Delete operation aborted: Invalid or missing ID.');
        return;
    }

    // Since we cannot use confirm(), we will proceed with the delete action.
    // In a real application, you would show a custom modal for confirmation.
    // The user's intent to delete is captured by them clicking the delete button.
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/inventory/${id}`, {
            method: 'DELETE'
        });

        if (response && response.status === 204) {
            showMessage('Inventory item deleted successfully!');
            fetchInventory();
        } else if (response) {
            const errorData = await response.json();
            showMessage('Failed to delete inventory item: ' + errorData.error);
        }
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        showMessage('Failed to delete inventory item: ' + error.message);
    }
}


/**
 * Submits the inventory form, handling both new item creation (POST) and
 * existing item updates (PUT).
 * @param {Event} event The form submission event.
 */
async function submitInventoryForm(event) {
    event.preventDefault();

    const idInput = document.getElementById('inventory-id');
    const itemInput = document.getElementById('item');
    const openingInput = document.getElementById('opening');
    const purchasesInput = document.getElementById('purchases');
    const inventorySalesInput = document.getElementById('inventory-sales');
    const spoilageInput = document.getElementById('spoilage');

    // Basic check for form elements
    if (!idInput || !itemInput || !openingInput || !purchasesInput || !inventorySalesInput || !spoilageInput) {
        showMessage('Inventory form elements are missing.');
        return;
    }

    const id = idInput.value;
    const item = itemInput.value;
    const opening = parseInt(openingInput.value);
    const purchases = parseInt(purchasesInput.value);
    const sales = parseInt(inventorySalesInput.value);
    const spoilage = parseInt(spoilageInput.value);

    // Basic validation to ensure fields are filled and are numbers
    if (!item || isNaN(opening) || isNaN(purchases) || isNaN(sales) || isNaN(spoilage)) {
        showMessage('Please fill in all inventory fields correctly with valid numbers.');
        return;
    }

    const inventoryData = { item, opening, purchases, sales, spoilage };

    try {
        let response;
        // The core fix: Check if 'id' is a non-empty string to determine if it's an update.
        if (id && id !== '') {
            // This is an edit operation (PUT)
            const allowedToEditInventory = ['Nachwera Richard', 'Nelson', 'Florence'];
            if (!allowedToEditInventory.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit inventory.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'PUT',
                body: JSON.stringify(inventoryData)
            });
        } else {
            // This is a new item creation (POST)
            const allowedToAddInventory = ['Nachwera Richard', 'Nelson', 'Florence', 'Martha','Mercy', 'Joshua'];
            if (!allowedToAddInventory.includes(currentUserRole)) {
                showMessage('Permission Denied: You do not have permission to add inventory.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/inventory`, {
                method: 'POST',
                body: JSON.stringify(inventoryData)
            });
        }

        // Handle the response regardless of method
        if (response) {
            await response.json(); // Consume the response body
            showMessage('Inventory item saved successfully!');
            const inventoryForm = document.getElementById('inventory-form');
            if (inventoryForm) inventoryForm.reset();
            if (idInput) idInput.value = ''; // Ensure ID is cleared after submission
            fetchInventory();
        }
    } catch (error) {
        console.error('Error saving inventory item:', error);
        showMessage('Failed to save inventory item: ' + error.message);
    }
}



// --- Sales Functions ---
// Helper function to update the sales search button text and icon
function updateSalesSearchButton(text, iconClass) {
    // Select the search button within the sales filter controls
    const searchButton = document.querySelector('.sales-filter-controls button[onclick="fetchSales()"]');
    if (searchButton) {
        // Clear existing content and set new text and icon
        searchButton.innerHTML = `${text} <i class="${iconClass}"></i>`;
    }
}

async function fetchSales() {
    // 1. Change button text to 'Searching'
    updateSalesSearchButton('Searching', 'fas fa-spinner fa-spin'); // Spinning icon for loading

    try {
        const dateFilterInput = document.getElementById('sales-date-filter');
        const dateFilter = dateFilterInput ? dateFilterInput.value : '';

        let url = `${API_BASE_URL}/sales`;
        const params = new URLSearchParams();
        if (dateFilter) params.append('date', dateFilter);
        params.append('page', currentSalesPage);
        params.append('limit', salesPerPage);
        url += `?${params.toString()}`;

        const response = await authenticatedFetch(url);
        if (!response) {
            // Restore button on non-response
            updateSalesSearchButton('Search', 'fas fa-search');
            return;
        }

        const result = await response.json();
        
        // Assuming renderSalesTable and renderSalesPagination are defined elsewhere
        renderSalesTable(result.data); 
        renderSalesPagination(result.page, result.pages);

        // 2. Change button text to 'Done' after successful display
        updateSalesSearchButton('Done', 'fas fa-check');

        // 3. Set a timeout to revert the button text back to 'Search' after 2 seconds
        setTimeout(() => {
            updateSalesSearchButton('Search', 'fas fa-search');
        }, 2000); // 2000 milliseconds = 2 seconds
        
    } catch (error) {
        console.error('Error fetching sales:', error);
        showMessage('Failed to fetch sales: ' + error.message);
        
        // Ensure the button is reverted to 'Search' on error
        updateSalesSearchButton('Search', 'fas fa-search');
    }
}
function renderSalesPagination(current, totalPages) {
    const container = document.getElementById('sales-pagination');
    if (!container) return; // Exit if container not found
    container.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.disabled = i === current;
        btn.onclick = () => {
            currentSalesPage = i;
            fetchSales();
        };
        container.appendChild(btn);
    }
}





/**
 * Utility function to display the modal.
 * It removes the 'hidden' class and adds 'flex' to make it visible and centered.
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Assumes your modal uses flex for centering
    }
}

/**
 * Utility function to close the modal.
 * (Assumed to be called by the Cancel button in your HTML)
 */

/**
 * Populates the Edit Sale form with sale data and then displays the modal.
 */
function populateSaleForm(sale, modalId) { // NOTE: Added modalId parameter
    // ----------------------------------------------------------------------
    // 1. POPULATE FORM FIELDS (Ensure these IDs match your HTML)
    // ----------------------------------------------------------------------
    const idInput = document.getElementById('sale-id');
    const itemInput = document.getElementById('sale-item');
    const numberInput = document.getElementById('sale-number');
    const bpInput = document.getElementById('sale-bp');
    const spInput = document.getElementById('sale-sp');
    const salesDateFilterInput = document.getElementById('sales-date-filter');

    if (idInput) idInput.value = sale._id;
    if (itemInput) itemInput.value = sale.item;
    if (numberInput) numberInput.value = sale.number;
    if (bpInput) bpInput.value = sale.bp;
    if (spInput) spInput.value = sale.sp;

    if (salesDateFilterInput && sale.date) {
        // Formats the date to 'YYYY-MM-DD' for the date input field
        salesDateFilterInput.value = new Date(sale.date).toISOString().split('T')[0];
    }
    
    // ----------------------------------------------------------------------
    // 2. SHOW MODAL
    // ----------------------------------------------------------------------
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Assumes your modal uses flex for centering
    }
}


// ... (Other functions like populateBuyingPrice, populateDatalist, populateSellingPrice remain here) ...

// ---

function renderSalesTable(sales) {
    const tbody = document.querySelector('#sales-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (sales.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 9;
        cell.textContent = 'No sales records found for this date. Try adjusting the filter.';
        cell.style.textAlign = 'center';
        return;
    }

    const hideProfitColumns = ['Martha', 'Mercy','Joshua'].includes(currentUserRole);
    // Initialize a variable to hold the total of all selling prices
    let totalSellingPriceSum = 0;
    // Initialize an object to hold departmental totals
    const departmentTotals = {
        bar: 0,
        rest: 0,
        others: 0
    };

    sales.forEach(sale => {
        if (sale.profit === undefined || sale.percentageprofit === undefined) {
            const totalBuyingPrice = sale.bp * sale.number;
            const totalSellingPrice = sale.sp * sale.number;
            sale.profit = totalSellingPrice - totalBuyingPrice;
            sale.percentageprofit = 0;
            if (totalBuyingPrice !== 0) {
                sale.percentageprofit = (sale.profit / totalBuyingPrice) * 100;
            }
        }

        const row = tbody.insertRow();
        row.insertCell().textContent = sale.item;
        row.insertCell().textContent = sale.number;
        row.insertCell().textContent = sale.bp;
        row.insertCell().textContent = sale.sp;

        const totalSellingPrice = sale.sp * sale.number;
        row.insertCell().textContent = totalSellingPrice.toFixed(2);
        // Add the current sale's total selling price to the sum
        totalSellingPriceSum += totalSellingPrice;

        // Categorize and add to department totals
        if (sale.item.toLowerCase().startsWith('bar')) {
            departmentTotals.bar += totalSellingPrice;
        } else if (sale.item.toLowerCase().startsWith('rest')) {
            departmentTotals.rest += totalSellingPrice;
        } else {
            departmentTotals.others += totalSellingPrice;
        }

        if (hideProfitColumns) {
            row.insertCell().textContent = 'N/A';
            row.insertCell().textContent = 'N/A';
        } else {
            row.insertCell().textContent = Math.round(sale.profit);
            row.insertCell().textContent = Math.round(sale.percentageprofit) + '%';
        }

        row.insertCell().textContent = new Date(sale.date).toLocaleDateString();
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs'; // Added Tailwind classes for styling
            // --- MODIFICATION HERE ---
            editButton.onclick = () => {
                populateSaleForm(sale); // Populate the form
                showModal('edit-sale-modal'); // Show the modal
            };
            // --- END MODIFICATION ---
            actionsCell.appendChild(editButton);


        } else {
            actionsCell.textContent = 'View Only';
        }
    });

    // Insert an empty row for spacing before the totals
    tbody.insertRow();

    // Create a new row for each departmental total
    for (const department in departmentTotals) {
        if (departmentTotals[department] > 0) {
            const totalRow = tbody.insertRow();
            const totalCell = totalRow.insertCell();
            totalCell.colSpan = 4;
            // --- MODIFICATION HERE ---
            let departmentName;
            if (department === 'rest') {
                departmentName = 'Restaurant';
            } else {
                departmentName = department.charAt(0).toUpperCase() + department.slice(1);
            }
            // --- END MODIFICATION ---
            totalCell.textContent = `${departmentName} Total Sales:`;
            totalCell.style.fontWeight = 'bold';
            totalCell.style.textAlign = 'right';

            const totalValueCell = totalRow.insertCell();
            totalValueCell.textContent = departmentTotals[department].toFixed(2);
            totalValueCell.style.fontWeight = 'bold';
        }
    }

    // Insert an empty row for spacing between departmental totals and the grand total
    if (Object.values(departmentTotals).some(total => total > 0)) {
        tbody.insertRow();
    }

    // Create a new row for the grand total selling price at the bottom
    const grandTotalRow = tbody.insertRow();
    const grandTotalCell = grandTotalRow.insertCell();
    grandTotalCell.colSpan = 4;
    grandTotalCell.textContent = 'Grand Total Sales:';
    grandTotalCell.style.fontWeight = 'bold';
    grandTotalCell.style.textAlign = 'right';

    const grandTotalValueCell = grandTotalRow.insertCell();
    grandTotalValueCell.textContent = totalSellingPriceSum.toFixed(2);
    grandTotalValueCell.style.fontWeight = 'bold';
}

function populateSaleForm(sale) {
    const idInput = document.getElementById('sale-id');
    const itemInput = document.getElementById('sale-item');
    const numberInput = document.getElementById('sale-number');
    const bpInput = document.getElementById('sale-bp');
    const spInput = document.getElementById('sale-sp');
    const salesDateFilterInput = document.getElementById('sales-date-filter');

    if (idInput) idInput.value = sale._id;
    if (itemInput) itemInput.value = sale.item;
    if (numberInput) numberInput.value = sale.number;
    if (bpInput) bpInput.value = sale.bp;
    if (spInput) spInput.value = sale.sp;

    // Convert date to 'YYYY-MM-DD' format required for HTML date input
    if (salesDateFilterInput && sale.date) {
        const dateObj = new Date(sale.date);
        const year = dateObj.getFullYear();
        // Month is 0-indexed, so add 1 and pad with '0'
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        salesDateFilterInput.value = `${year}-${month}-${day}`;
    }

    // NOTE: This function no longer explicitly calls showModal, 
    // it's now handled directly in the editButton.onclick event handler in renderSalesTable.
}

// --- NEW HELPER FUNCTIONS ---

/**
 * Displays the modal with the given ID.
 * Assumes the modal has a 'hidden' class for hiding it (as in your HTML).
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Hides the modal with the given ID.
 * This is the function referenced in your HTML's 'Cancel' button.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}



function showConfirm(message, onConfirm, onCancel = null) {
    // For simplicity, using native confirm. For a custom UI, you'd implement a modal similar to showMessage.
    const userConfirmed = window.confirm(message);
    if (userConfirmed) {
        onConfirm();
    } else if (onCancel) {
        onCancel();
    }
}

async function deleteSale(id) {
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can delete sales records.');
        return;
    }

    showConfirm('Are you sure you want to delete this sale record?', async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/sales/${id}`, {
                method: 'DELETE'
            });
            if (response && response.status === 204) {
                showMessage('Sale record deleted successfully!');
                fetchSales();
            } else if (response) {
                const errorData = await response.json();
                showMessage('Failed to delete sale record: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error deleting sale record:', error);
            showMessage('Failed to delete sale record: ' + error.message);
        }
    });
}

async function submitSaleForm(event) {
    event.preventDefault();

    const submitButton = document.querySelector('#sale-form button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    const allowedToRecordSales = ['Nachwera Richard', 'Martha', 'Mercy', 'Joshua', 'Nelson', 'Florence'];
    if (!allowedToRecordSales.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record sales.');
        return;
    }

    const idInput = document.getElementById('sale-id');
    const itemInput = document.getElementById('sale-item');
    const numberInput = document.getElementById('sale-number');
    const bpInput = document.getElementById('sale-bp');
    const spInput = document.getElementById('sale-sp');
    const salesDateFilterInput = document.getElementById('sales-date-filter');

    if (!idInput || !itemInput || !numberInput || !bpInput || !spInput || !salesDateFilterInput) {
        showMessage('Sales form elements are missing.');
        return;
    }

    const id = idInput.value;
    const item = itemInput.value;
    const number = parseInt(numberInput.value);
    const bp = parseFloat(bpInput.value);
    const sp = parseFloat(spInput.value);
    const date = salesDateFilterInput.value;

    if (!item || isNaN(number) || isNaN(bp) || isNaN(sp) || !date) {
        showMessage('Please fill in all sales fields correctly with valid numbers and date.');
        return;
    }
    if (number <= 0 || bp <= 0 || sp <= 0) {
        showMessage('Number, Buying Price, and Selling Price must be positive values.');
        return;
    }

    const totalBuyingPrice = bp * number;
    const totalSellingPrice = sp * number;
    const profit = totalSellingPrice - totalBuyingPrice;
    let percentageProfit = 0;
    if (totalBuyingPrice !== 0) {
        percentageProfit = (profit / totalBuyingPrice) * 100;
    }

    const saleData = {
        item,
        number,
        bp,
        sp,
        profit: profit,
        percentageprofit: percentageProfit,
        date
    };

    try {
        submitButton.innerHTML = 'Processing...';
        submitButton.disabled = true;

        let response;
        let successMessage;

        if (id) {
            const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
            if (!adminRoles.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit sales.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/sales/${id}`, {
                method: 'PUT',
                body: JSON.stringify(saleData)
            });
            successMessage = 'Sales Updated! ✅';
        } else {
            response = await authenticatedFetch(`${API_BASE_URL}/sales`, {
                method: 'POST',
                body: JSON.stringify(saleData)
            });
            successMessage = 'Sale Recorded! ✅';
        }

        if (response.ok) {
            await response.json();
            showMessage(successMessage);
            submitButton.innerHTML = successMessage;

            // Wait for 2 seconds, then reset the form and button
            setTimeout(() => {
                const saleForm = document.getElementById('sale-form');
                if (saleForm) saleForm.reset();
                if (idInput) idInput.value = '';
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                if (salesDateFilterInput) salesDateFilterInput.value = `${yyyy}-${mm}-${dd}`;
                
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                fetchSales(); // Re-fetch data after reset
            }, 2000); // 2000 milliseconds = 2 seconds

        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error occurred.');
        }

    } catch (error) {
        console.error('Error saving sale entry:', error);
        showMessage('Failed to save sale entry: ' + error.message);
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}


/**
 * Automatically populates the buying price based on the selected item.
 */
function populateBuyingPrice() {
    const itemInput = document.getElementById('sale-item');
    const bpInput = document.getElementById('sale-bp');

    if (itemInput && bpInput) {
        // No need to convert to lowercase for exact match from datalist
        const item = itemInput.value.trim();
        const buyingPrice = BUYING_PRICES[item];

        if (buyingPrice !== undefined) {
            bpInput.value = buyingPrice;
        } else {
            bpInput.value = '';
        }
    }
}

/**
 * Populates the datalist with items from BUYING_PRICES.
 */
function populateDatalist() {
    const datalist = document.getElementById('item-suggestions');
    if (datalist) {
        for (const item in BUYING_PRICES) {
            const option = document.createElement('option');
            option.value = item;
            datalist.appendChild(option);
        }
    }
}

// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    populateDatalist(); // Populate the datalist on page load

    const itemInput = document.getElementById('sale-item');
    if (itemInput) {
        itemInput.addEventListener('input', populateBuyingPrice);
    }
});

const SELLING_PRICES ={
"rest greek salad": 15000,
"rest potato salad": 15000,
"rest mushroom soup": 15000,
"rest tomato soup": 10000,
"rest chicken clear soup": 15000,
"rest chicken stew": 28000,
"rest chicken stir fry": 27000,
"rest chicken curry": 28000,
"rest grilled whole chicken": 60000,
"rest beef stew": 25000,
"rest beef stir fry": 25000,
"rest pan fried goat or beef or liver": 25000,
"rest beef steak": 27000,
"rest panfried pork": 27000,
"rest pork ribs": 30000,
"rest pork chops": 30000,
"rest fish curry": 25000,
"rest vegetable curry": 20000,
"rest beef samosa": 5000,
"rest chicken wing": 25000,
"rest french fries": 10000,
"rest chips masala": 13000,
"rest pan fried fish fillet": 25000,
"rest deep fried whole fish": 40000,
"rest fish finger": 18000,
"rest chicken burger patty": 25000,
"rest beef burgar": 25000,
"rest vegetable burgar": 25000,
"rest beef sandwich": 20000,
"rest chicken sandwich": 25000,
"rest tomato sandwich": 20000,
"rest vegetable sandwich": 25000,
"rest club sandwich": 30000,
"rest african tea": 8000,
"rest african coffee": 8000,
"rest english tea": 10000,
"rest african spiced tea": 8000,
"rest lemon tea": 8000,
"rest milk plane": 7000,
"rest black tea": 5000,
"rest black coffee": 6000,
"rest dhawa tea": 12000,
"rest passion juice(l)": 7000,
"rest pineapple juice": 7000,
"rest water melon juice": 7000,
"rest lemon juice": 7000,
"rest cocotail juice": 10000,
"rest fruit platter": 8000,
"rest fruit salad": 12000,
"rest spagetti napolitan": 18000,
"rest spagetti bolognaise": 20000,
"rest margarita pizza": 25000,
"rest chicken pizza": 30000,
"rest beef pizza": 30000,
"rest hawaii pizza": 30000,
    "bar mountain dew": 2000,
    "bar mirinda fruity ": 2000,
    "bar mirinda fanta": 2000,
    "bar novida": 2000,
    "bar pepsi": 2000,
    "bar mirinda apple":2000,
    "bar cocacola":2000,
    "bar stoney":2000,
    "bar fanta":2000,
    "bar cocacola":2000,
    "bar fanta":2000,
    "bar nile":5000,
    "bar club":5000,
    "bar guiness":5000,
    "bar uganda waragi":13000,
    "bar gilbey's":15000,
    "bar tusker lite":5000,
    "bar tusker lager":5000,
    "bar water":2000,
    "bar castle lite":5000
};

/**
 * Automatically populates the selling price based on the selected item.
 */
function populateSellingPrice() {
    const itemInput = document.getElementById('sale-item');
    const spInput = document.getElementById('sale-sp');

    if (itemInput && spInput) {
        const item = itemInput.value.toLowerCase().trim(); // Convert to lowercase and trim for case-insensitive matching
        const sellingPrice = SELLING_PRICES[item];

        if (sellingPrice !== undefined) {
            spInput.value = sellingPrice;
        } else {
            // Optionally clear the BP field if the item doesn't have a predefined price
            // Or you can leave it as is for manual entry
            spInput.value = '';
        }
    }
}

// Add an event listener to the item input field
document.addEventListener('DOMContentLoaded', () => {
    const itemInput = document.getElementById('sale-item');
    if (itemInput) {
        itemInput.addEventListener('input', populateSellingPrice);
    }
});
// --- Expenses Functions ---
async function fetchExpenses() {
    try {
        const dateFilterInput = document.getElementById('expenses-date-filter');
        const dateFilter = dateFilterInput ? dateFilterInput.value : '';

        let url = `${API_BASE_URL}/expenses`;
        const params = new URLSearchParams();
        if (dateFilter) params.append('date', dateFilter);
        params.append('page', currentExpensesPage);
        params.append('limit', expensesPerPage);
        url += `?${params.toString()}`;

        const response = await authenticatedFetch(url);
        if (!response) return;

        const result = await response.json();
        renderExpensesTable(result.data);
        renderExpensesPagination(result.page, result.pages);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        showMessage('Failed to fetch expenses: ' + error.message);
    }
}

function renderExpensesPagination(current, totalPages) {
    const container = document.getElementById('expenses-pagination');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.disabled = i === current;
        btn.onclick = () => {
            currentExpensesPage = i;
            fetchExpenses();
        };
        container.appendChild(btn);
    }
}

function renderExpensesTable(expenses) {
    const tbody = document.querySelector('#expenses-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (expenses.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.textContent = 'No expense records found for this date. Try adjusting the filter.';
        cell.style.textAlign = 'center';
        return;
    }

    expenses.forEach(expense => {
        const row = tbody.insertRow();
        row.insertCell().textContent = expense.description;
        row.insertCell().textContent = expense.amount.toFixed(2);
        row.insertCell().textContent = new Date(expense.date).toLocaleDateString();
        row.insertCell().textContent = expense.receiptId;
        row.insertCell().textContent = expense.source || 'N/A'; // Assuming source might be optional
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        // Only administrators can edit expenses
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => populateExpenseForm(expense);
            actionsCell.appendChild(editButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}

async function submitExpenseForm(event) {
    event.preventDefault();
    const allowedToRecordExpenses = ['Nachwera Richard', 'Martha','Mercy', 'Joshua', 'Nelson', 'Florence'];
    if (!allowedToRecordExpenses.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record expenses.');
        return;
    }

    const idInput = document.getElementById('expense-id');
    const descriptionInput = document.getElementById('expense-description');
    const amountInput = document.getElementById('expense-amount');
    const receiptIdInput = document.getElementById('expense-receiptId');
    const sourceInput = document.getElementById('expense-source');
    const expenseDateInput = document.getElementById('expenses-date-filter'); // Using this as the date input

    if (!idInput || !descriptionInput || !amountInput || !receiptIdInput || !sourceInput || !expenseDateInput) {
        showMessage('Expense form elements are missing.');
        return;
    }

    const id = idInput.value;
    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const receiptId = receiptIdInput.value;
    const source = sourceInput.value;
    const date = expenseDateInput.value;
    const recordedBy = currentUsername; // Automatically record who made the entry

    if (!description || isNaN(amount) || amount <= 0 || !receiptId || !date) {
        showMessage('Please fill in all expense fields correctly.');
        return;
    }

    const expenseData = { description, amount, receiptId, source, date, recordedBy };

    try {
        let response;
        if (id) {
            const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
            if (!adminRoles.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit expenses.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(expenseData)
            });
        } else {
            response = await authenticatedFetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });
        }
        if (response) {
            await response.json();
            showMessage('Expense recorded successfully!');
            const expenseForm = document.getElementById('expense-form');
            if (expenseForm) expenseForm.reset();
            if (idInput) idInput.value = '';
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            if (expenseDateInput) expenseDateInput.value = `${yyyy}-${mm}-${dd}`;
            fetchExpenses();
        }
    } catch (error) {
        console.error('Error saving expense:', error);
        showMessage('Failed to save expense: ' + error.message);
    }
}

function populateExpenseForm(expense) {
    const idInput = document.getElementById('expense-id');
    const descriptionInput = document.getElementById('expense-description');
    const amountInput = document.getElementById('expense-amount');
    const receiptIdInput = document.getElementById('expense-receiptId');
    const sourceInput = document.getElementById('expense-source');
    const expenseDateInput = document.getElementById('expenses-date-filter');

    if (idInput) idInput.value = expense._id;
    if (descriptionInput) descriptionInput.value = expense.description;
    if (amountInput) amountInput.value = expense.amount;
    if (receiptIdInput) receiptIdInput.value = expense.receiptId;
    if (sourceInput) sourceInput.value = expense.source;
    if (expenseDateInput && expense.date) {
        expenseDateInput.value = new Date(expense.date).toISOString().split('T')[0];
    }
}

// --- Cash Management Functions ---
async function fetchCashJournal() {
    try {
        const dateFilterInput = document.getElementById('cash-filter-date');
        const responsibleFilterInput = document.getElementById('cash-filter-responsible');

        const dateFilter = dateFilterInput ? dateFilterInput.value : '';
        const responsibleFilter = responsibleFilterInput ? responsibleFilterInput.value : '';

        let url = `${API_BASE_URL}/cash-journal`;
        const params = new URLSearchParams();
        if (dateFilter) params.append('date', dateFilter);
        if (responsibleFilter) params.append('responsiblePerson', responsibleFilter);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await authenticatedFetch(url);
        if (!response) return;
        const records = await response.json();
        renderCashJournalTable(records);
    } catch (error) {
        console.error('Error fetching cash journal:', error);
        showMessage('Failed to fetch cash journal: ' + error.message);
    }
}

function renderCashJournalTable(records) {
    const tbody = document.querySelector('#cash-journal-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (records.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent = 'No cash records found for the selected filters.';
        cell.style.textAlign = 'center';
        return;
    }

    records.forEach(record => {
        const row = tbody.insertRow();
        row.insertCell().textContent = new Date(record.date).toLocaleDateString();
        row.insertCell().textContent = record.cashAtHand.toFixed(2);
        row.insertCell().textContent = record.cashBanked.toFixed(2);
        row.insertCell().textContent = record.bankReceiptId;
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        // Only Nachwera Richard, Nelson, Florence can edit cash entries
        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => populateCashJournalForm(record);
            actionsCell.appendChild(editButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}

async function submitCashJournalForm(event) {
    event.preventDefault();
    // Roles allowed to record cash entries
    const allowedToRecordCash = ['Nachwera Richard', 'Martha','Mercy', 'Joshua', 'Nelson', 'Florence'];
    if (!allowedToRecordCash.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record cash entries.');
        return;
    }
    const idInput = document.getElementById('cash-journal-id');
    const cashAtHandInput = document.getElementById('cash-at-hand');
    const cashBankedInput = document.getElementById('cash-banked');
    const bankReceiptIdInput = document.getElementById('bank-receipt-id');
    const cashDateInput = document.getElementById('cash-date');

    if (!idInput || !cashAtHandInput || !cashBankedInput || !bankReceiptIdInput || !cashDateInput) {
        showMessage('Cash journal form elements are missing.');
        return;
    }

    const id = idInput.value;
    const cashAtHand = parseFloat(cashAtHandInput.value);
    const cashBanked = parseFloat(cashBankedInput.value);
    const bankReceiptId = bankReceiptIdInput.value;
    const date = cashDateInput.value;

    // Basic validation
    if (isNaN(cashAtHand) || isNaN(cashBanked) || !bankReceiptId || !date) {
        showMessage('Please fill in all cash entry fields correctly.');
        return;
    }

    const cashData = { cashAtHand, cashBanked, bankReceiptId, date };

    try {
        let response;
        if (id) { // Edit operation (Nachwera Richard, Nelson, Florence only)
            const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
            if (!adminRoles.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit cash entries.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/cash-journal/${id}`, {
                method: 'PUT',
                body: JSON.stringify(cashData)
            });
        } else { // New entry creation (all allowed roles)
            response = await authenticatedFetch(`${API_BASE_URL}/cash-journal`, {
                method: 'POST',
                body: JSON.stringify(cashData)
            });
        }
        if (response) {
            await response.json();
            showMessage('Cash entry saved successfully!');
            const cashJournalForm = document.getElementById('cash-journal-form');
            if (cashJournalForm) cashJournalForm.reset();
            if (idInput) idInput.value = '';
            // Re-set default date for new entry form after submission
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            if (cashDateInput) cashDateInput.value = `${yyyy}-${mm}-${dd}`;
            fetchCashJournal(); // Re-fetch to update table after successful operation
        }
    } catch (error) {
        console.error('Error saving cash entry:', error);
        showMessage('Failed to save cash entry: ' + error.message);
    }
}

function populateCashJournalForm(record) {
    const idInput = document.getElementById('cash-journal-id');
    const cashAtHandInput = document.getElementById('cash-at-hand');
    const cashBankedInput = document.getElementById('cash-banked');
    const bankReceiptIdInput = document.getElementById('bank-receipt-id');
    const cashDateInput = document.getElementById('cash-date');

    if (idInput) idInput.value = record._id;
    if (cashAtHandInput) cashAtHandInput.value = record.cashAtHand;
    if (cashBankedInput) cashBankedInput.value = record.cashBanked;
    if (bankReceiptIdInput) bankReceiptIdInput.value = record.bankReceiptId;
    if (cashDateInput && record.date) {
        cashDateInput.value = new Date(record.date).toISOString().split('T')[0];
    }
}

// --- Reports Functions ---
async function generateReports() {
    // Define the department prefixes and the logic to get the department.
    // Use lowercase keys for consistency.
    const departmentPrefixes = {
        'bar': 'Bar',
        'rest': 'Restaurant',
        'conf': 'Conference',
        'gardens': 'Gardens',
        'accommodation': 'Accommodation'
    };

    // A function to get the department from the text.
    function getDepartmentFromText(text) {
        const lowerText = text.toLowerCase();

        // Check if the text includes any of our department prefixes
        for (const prefix in departmentPrefixes) {
            if (lowerText.includes(prefix)) {
                return departmentPrefixes[prefix];
            }
        }
        
        return 'Other'; // Default department if no match is found
    }

    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');

    if (!startDateInput || !endDateInput) {
        showMessage('Report date inputs not found.');
        return;
    }

    const startDateString = startDateInput.value;
    const endDateString = endDateInput.value;

    if (!startDateString || !endDateString) {
        showMessage('Please select both start and end dates for the report.');
        return;
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    
    // Fix: Normalize dates to UTC to avoid timezone issues
    // Set the start date to the beginning of the day (00:00:00) in UTC
    startDate.setUTCHours(0, 0, 0, 0); 
    // Set the end date to the end of the day (23:59:59) in UTC
    endDate.setUTCHours(23, 59, 59, 999);

    console.log('Report Start Date (UTC):', startDate.toUTCString());
    console.log('Report End Date (UTC):', endDate.toUTCString());

    let allExpenses = [];
    let allSales = [];

    const tbody = document.getElementById('department-report-tbody');
    if (!tbody) {
        console.error('Department report tbody not found.');
        return;
    }
    tbody.innerHTML = ''; // Clear any existing rows

    try {
        // Fetch all sales data, handling pagination by incrementing a page number.
        let page = 1;
        let salesDataFetched;
        do {
            const salesResponse = await authenticatedFetch(`${API_BASE_URL}/sales?page=${page}`);
            salesDataFetched = await salesResponse.json();
            if (salesDataFetched && Array.isArray(salesDataFetched.data)) {
                console.log(`Fetched ${salesDataFetched.data.length} sales records from page ${page}`);
                allSales = allSales.concat(salesDataFetched.data);
                page++;
            } else {
                salesDataFetched = null; // Exit the loop if data is not an array or response is bad
            }
        } while (salesDataFetched && salesDataFetched.data.length > 0);
        
        console.log('Total sales fetched from all pages:', allSales.length);

        // Filter sales by date after all data has been fetched
        allSales = allSales.filter(s => {
            const saleDate = new Date(s.date);
            // Use getTime() for robust date comparison with UTC normalized dates
            return saleDate.getTime() >= startDate.getTime() && saleDate.getTime() <= endDate.getTime();
        });
        console.log('Total sales after filtering:', allSales.length);

        // Fetch all expenses data, handling pagination by incrementing a page number.
        page = 1;
        let expensesDataFetched;
        do {
            const expensesResponse = await authenticatedFetch(`${API_BASE_URL}/expenses?page=${page}`);
            expensesDataFetched = await expensesResponse.json();
            if (expensesDataFetched && Array.isArray(expensesDataFetched.data)) {
                console.log(`Fetched ${expensesDataFetched.data.length} expense records from page ${page}`);
                allExpenses = allExpenses.concat(expensesDataFetched.data);
                page++;
            } else {
                expensesDataFetched = null; // Exit the loop if data is not an array or response is bad
            }
        } while (expensesDataFetched && expensesDataFetched.data.length > 0);

        console.log('Total expenses fetched from all pages:', allExpenses.length);

        // Filter expenses by date after all data has been fetched
        allExpenses = allExpenses.filter(e => {
            const expenseDate = new Date(e.date);
            // Use getTime() for robust date comparison with UTC normalized dates
            return expenseDate.getTime() >= startDate.getTime() && expenseDate.getTime() <= endDate.getTime();
        });
        console.log('Total expenses after filtering:', allExpenses.length);

        const departmentReports = {};
        
        // Initialize department reports with zero values to prevent 'undefined' issues
        for (const prefix in departmentPrefixes) {
            departmentReports[departmentPrefixes[prefix]] = { sales: 0, expenses: 0 };
        }
        departmentReports['Other'] = { sales: 0, expenses: 0 };

        let overallSales = 0;
        let overallExpenses = 0;

        allSales.forEach(sale => {
            const department = getDepartmentFromText(sale.item);
            const saleAmount = sale.number * sale.sp;

            overallSales += saleAmount;
            if (!departmentReports[department]) {
                departmentReports[department] = { sales: 0, expenses: 0 };
            }
            departmentReports[department].sales += saleAmount;
        });

        allExpenses.forEach(expense => {
            const department = getDepartmentFromText(expense.description + ' ' + (expense.source || ''));

            overallExpenses += expense.amount;
            if (!departmentReports[department]) {
                departmentReports[department] = { sales: 0, expenses: 0 };
            }
            departmentReports[department].expenses += expense.amount;
        });

        const overallSalesElement = document.getElementById('overall-sales');
        const overallExpensesElement = document.getElementById('overall-expenses');
        const overallBalanceElement = document.getElementById('overall-balance');

        if (overallSalesElement) overallSalesElement.textContent = overallSales.toFixed(2);
        if (overallExpensesElement) overallExpensesElement.textContent = overallExpenses.toFixed(2);
        const overallBalance = overallSales - overallExpenses;
        if (overallBalanceElement) {
            overallBalanceElement.textContent = overallBalance.toFixed(2);
            overallBalanceElement.className = overallBalance >= 0 ? 'positive' : 'negative';
        }


        const sortedDepartments = Object.keys(departmentReports).sort();
        if (sortedDepartments.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'No data found for the selected period or departments.';
            cell.className = 'text-center py-4 text-gray-500';
        } else {
            sortedDepartments.forEach(dept => {
                const data = departmentReports[dept];
                const deptSales = data.sales;
                const deptExpenses = data.expenses;
                const deptBalance = deptSales - deptExpenses;

                const row = tbody.insertRow();
                row.insertCell().textContent = dept;
                row.insertCell().textContent = deptSales.toFixed(2);
                row.insertCell().textContent = deptExpenses.toFixed(2);
                const balanceCell = row.insertCell();
                balanceCell.textContent = deptBalance.toFixed(2);
                balanceCell.className = deptBalance >= 0 ? 'positive' : 'negative'; // Apply class based on balance
            });
        }

    } catch (error) {
        console.error('Error generating reports:', error);
        showMessage('Failed to generate reports: ' + error.message);
    }
}


// --- Audit Logs Functions ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Function to fetch audit logs (modified)
async function fetchAuditLogs() {
    try {
        const params = new URLSearchParams();
        params.append('page', currentAuditPage);
        params.append('limit', auditLogsPerPage);

        const auditSearchInput = document.getElementById('audit-search-input');
        const searchQuery = auditSearchInput ? auditSearchInput.value.trim() : '';
        if (searchQuery) {
            params.append('search', searchQuery); // Add search query parameter
        }

        const response = await authenticatedFetch(`${API_BASE_URL}/audit-logs?${params.toString()}`);
        if (!response) return;

        const result = await response.json();
        renderAuditLogsTable(result.data);
        renderAuditPagination(result.page, result.pages);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        showMessage('Failed to fetch audit logs: ' + error.message);
    }
}

// Function to render pagination (no change needed here)
function renderAuditPagination(current, totalPages) {
    const container = document.getElementById('audit-pagination');
    if (!container) return;
    container.innerHTML = ''; // Clear existing buttons

    // Create "Prev" button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Prev';
    prevButton.disabled = current === 1; // Disable if on the first page
    prevButton.onclick = () => {
        currentAuditPage--; // Decrement page number
        fetchAuditLogs();
    };
    container.appendChild(prevButton);

    // Create "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = current === totalPages; // Disable if on the last page
    nextButton.onclick = () => {
        currentAuditPage++; // Increment page number
        fetchAuditLogs();
    };
    container.appendChild(nextButton);

    // Optional: Add page numbers
    if (totalPages > 0) {
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${current} of ${totalPages}`;
        container.insertBefore(pageInfo, nextButton);
    }
}


// Function to render audit logs table (no change needed here)
function renderAuditLogsTable(logs) {
    const tbody = document.querySelector('#audit-logs-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (logs.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = 'No audit logs found.';
        cell.style.textAlign = 'center';
        return;
    }

    logs.forEach(log => {
        const row = tbody.insertRow();
        row.insertCell().textContent = new Date(log.timestamp).toLocaleString();
        row.insertCell().textContent = log.user;
        row.insertCell().textContent = log.action;
        // Display details as string, consider formatting for better readability
        row.insertCell().textContent = JSON.stringify(log.details);
    });
}

// Function to export tables to Excel
function exportTableToExcel(tableID, filename = '') {
    const dataType = 'application/vnd.ms-excel';
    const tableSelect = document.getElementById(tableID);

    if (!tableSelect) {
        showMessage(`Table with ID "${tableID}" not found for export.`);
        return;
    }

    // Clone the table to avoid modifying the live DOM, and remove action cells
    const clonedTable = tableSelect.cloneNode(true);
    clonedTable.querySelectorAll('.actions').forEach(cell => {
        cell.remove();
    });

    // Remove the 'Actions' header if it exists
    const headerRow = clonedTable.querySelector('thead tr');
    if (headerRow) {
        const actionHeader = headerRow.querySelector('th:last-child');
        if (actionHeader && actionHeader.textContent.trim() === 'Actions') {
            actionHeader.remove();
        }
    }


    const tableHTML = clonedTable.outerHTML.replace(/ /g, '%20');

    // Default filename
    filename = filename ? filename + '.xls' : 'excel_data.xls';

    // Create a download link element
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        // For IE (older versions)
        const blob = new Blob(['\ufeff', tableHTML], { type: dataType });
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // For other browsers
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        downloadLink.download = filename;
        downloadLink.click();
    }

    // Cleanup
    document.body.removeChild(downloadLink);
}


// --- Initial Setup and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status on page load
    updateUIForUserRole();

    // Attach form submission handlers
    const inventoryForm = document.getElementById('inventory-form');
    if (inventoryForm) inventoryForm.addEventListener('submit', submitInventoryForm);

    const saleForm = document.getElementById('sale-form');
    if (saleForm) saleForm.addEventListener('submit', submitSaleForm);

    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) expenseForm.addEventListener('submit', submitExpenseForm);

    const cashJournalForm = document.getElementById('cash-journal-form');
    if (cashJournalForm) cashJournalForm.addEventListener('submit', submitCashJournalForm);

    // Set initial date filters for various sections
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;

    const salesDateFilter = document.getElementById('sales-date-filter');
    if (salesDateFilter) salesDateFilter.value = todayString;

    const expensesDateFilter = document.getElementById('expenses-date-filter');
    if (expensesDateFilter) expensesDateFilter.value = todayString;

    const cashDate = document.getElementById('cash-date');
    if (cashDate) cashDate.value = todayString;

    const cashFilterDate = document.getElementById('cash-filter-date');
    if (cashFilterDate) cashFilterDate.value = todayString;


    // For reports, set default to last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const reportStartDate = document.getElementById('report-start-date');
    if (reportStartDate) reportStartDate.value = thirtyDaysAgo.toISOString().split('T')[0];

    const reportEndDate = document.getElementById('report-end-date');
    if (reportEndDate) reportEndDate.value = todayString;

    // Attach event listeners for login/logout
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login();
        });
    }
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) logoutButton.addEventListener('click', logout);

    // Attach event listeners for navigation buttons
    const navInventory = document.getElementById('nav-inventory');
    if (navInventory) navInventory.addEventListener('click', () => showSection('inventory'));

    const navSales = document.getElementById('nav-sales');
    if (navSales) navSales.addEventListener('click', () => showSection('sales'));

    const navExpenses = document.getElementById('nav-expenses');
    if (navExpenses) navExpenses.addEventListener('click', () => showSection('expenses'));

    const navCashManagement = document.getElementById('nav-cash-management');
    if (navCashManagement) navCashManagement.addEventListener('click', () => showSection('cash-management'));

    const navReports = document.getElementById('nav-reports');
    if (navReports) navReports.addEventListener('click', () => showSection('reports'));

    const navAuditLogs = document.getElementById('nav-audit-logs');
    if (navAuditLogs) navAuditLogs.addEventListener('click', () => showSection('audit-logs'));

    // Attach event listeners for filter buttons
    const applyInventoryFilter = document.getElementById('apply-inventory-filter');
    if (applyInventoryFilter) applyInventoryFilter.addEventListener('click', fetchInventory);

    const applySalesFilter = document.getElementById('apply-sales-filter');
    if (applySalesFilter) applySalesFilter.addEventListener('click', fetchSales);

    const applyExpensesFilter = document.getElementById('apply-expenses-filter');
    if (applyExpensesFilter) applyExpensesFilter.addEventListener('click', fetchExpenses);

    const applyCashFilter = document.getElementById('apply-cash-filter');
    if (applyCashFilter) applyCashFilter.addEventListener('click', fetchCashJournal);

    const generateReportButton = document.getElementById('generate-report-button');
    if (generateReportButton) generateReportButton.addEventListener('click', generateReports);

    // Initialise the audit log search functionality
    const auditSearchInput = document.getElementById('audit-search-input');
    // Debounce the fetchAuditLogs call to avoid too many requests
    const debouncedFetchAuditLogs = debounce(() => {
        currentAuditPage = 1; // Reset to the first page when a new search is initiated
        fetchAuditLogs();
    }, 300); // 300ms debounce delay

    if (auditSearchInput) {
        auditSearchInput.addEventListener('input', debouncedFetchAuditLogs);
    }

    // Determine if the current user is Martha or Joshua
    const isMarthaOrJoshua = ['Martha', 'Mercy','Joshua'].includes(currentUserRole);

    // Conditionally attach event listeners for Export buttons
    const salesExportButton = document.getElementById('export-sales-excel');
    if (salesExportButton) {
        if (isMarthaOrJoshua) {
            salesExportButton.style.display = 'none'; // Hide the button
        } else {
            salesExportButton.style.display = 'inline-block'; // Ensure visible for other roles
            salesExportButton.addEventListener('click', () => exportTableToExcel('sales-table', 'Sales_Data'));
        }
    }

    const expensesExportButton = document.getElementById('export-expenses-excel');
    if (expensesExportButton) {
        if (isMarthaOrJoshua) {
            expensesExportButton.style.display = 'none';
        } else {
            expensesExportButton.style.display = 'inline-block';
            expensesExportButton.addEventListener('click', () => exportTableToExcel('expenses-table', 'Expenses_Data'));
        }
    }

    const cashExportButton = document.getElementById('export-cash-journal-excel');
    if (cashExportButton) {
        if (isMarthaOrJoshua) {
            cashExportButton.style.display = 'none';
        } else {
            cashExportButton.style.display = 'inline-block';
            cashExportButton.addEventListener('click', () => exportTableToExcel('cash-journal-table', 'Cash_Journal_Data'));
        }
    }

    const reportsExportButton = document.getElementById('export-reports-excel');
    if (reportsExportButton) {
        if (isMarthaOrJoshua) {
            reportsExportButton.style.display = 'none';
        } else {
            reportsExportButton.style.display = 'inline-block';
            reportsExportButton.addEventListener('click', () => exportTableToExcel('department-report-table', 'Department_Reports'));
        }
    }

    const auditLogsExportButton = document.getElementById('export-audit-logs-excel');
    if (auditLogsExportButton) {
        if (isMarthaOrJoshua) {
            auditLogsExportButton.style.display = 'none';
        } else {
            auditLogsExportButton.style.display = 'inline-block';
            auditLogsExportButton.addEventListener('click', () => exportTableToExcel('audit-logs-table', 'Audit_Logs'));
        }
    }
});







/**
 * Hides all main content sections and shows the one specified by sectionId.
 * @param {string} sectionId - The ID of the section element to show (e.g., 'inventory', 'sales').
 */
function showSection(sectionId) {

    // 3. Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block'; // Or 'flex', 'grid', depending on your layout
    } else {
        console.error(`Section with ID '${sectionId}' not found.`);
    }
}

