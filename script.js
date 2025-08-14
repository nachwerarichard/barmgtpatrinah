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
    const isJoshua = currentUserRole === 'Joshua';
    const isBarStaff = isMartha || isJoshua;

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
        if (sectionId === 'inventory' && (isJoshua || isMartha)) {
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
        else if (currentUserRole === 'Martha') {
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
        } else if (currentUserRole === 'Martha') {
            showSection('inventory'); // Martha now starts with inventory
        } else if (currentUserRole === 'Joshua') {
            showSection('inventory'); // Joshua starts with inventory
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
 * @param {string} sectionId The ID of the section to show.
 */
function showSection(sectionId) {
    // Define which sections are allowed for each role
    const allowedSections = {
        'Nachwera Richard': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        'Nelson': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        'Florence': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        'Martha': ['inventory', 'sales', 'expenses', 'cash-management'], // Martha can now view Inventory
        'Joshua': ['inventory', 'sales'] // Joshua can view these
    };

    // --- Role-based Access Check ---
    if (currentUserRole && !allowedSections[currentUserRole]?.includes(sectionId)) {
        showMessage('Access Denied: You do not have permission to view this section.');
        // Redirect to a default allowed section if trying to access unauthorized
        const fullAccessRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (fullAccessRoles.includes(currentUserRole)) {
            showSection('inventory'); // Admin default
        } else if (currentUserRole === 'Martha') {
            showSection('inventory'); // Martha default
        } else if (currentUserRole === 'Joshua') {
            showSection('inventory'); // Joshua default
        }
        return; // Prevent further execution for unauthorized access
    }

    // --- Show/Hide Sections ---
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
        fetchInventory();
    } else if (sectionId === 'sales') {
        // For Martha/Joshua, we now fetch data, but the render function will hide edit/delete buttons
        fetchSales();
    } else if (sectionId === 'expenses') {
        // For Martha/Joshua, we now fetch data, but the render function will hide edit/delete buttons
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

// --- Login/Logout ---

async function login() {
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
            updateUIForUserRole(); // Update UI based on new role

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
async function fetchInventory() {
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
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);

        url += `?${params.toString()}`;

        const response = await authenticatedFetch(url);
        if (!response) return;

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

    } catch (error) {
        console.error('Error fetching inventory:', error);
        showMessage('Failed to fetch inventory: ' + error.message);
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



function renderInventoryTable(inventory) {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return; // Exit if tbody not found

    tbody.innerHTML = '';
    if (inventory.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7;
        cell.textContent = 'No inventory items found.';
        cell.style.textAlign = 'center';
        return;
    }

    inventory.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell().textContent = item.item;
        row.insertCell().textContent = item.opening;
        row.insertCell().textContent = item.purchases;
        row.insertCell().textContent = item.sales;
        row.insertCell().textContent = item.spoilage;
        row.insertCell().textContent = item.closing;
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        // Only Nachwera Richard, Nelson, Florence can edit inventory
        // Martha can view but not edit
        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => populateInventoryForm(item);
            actionsCell.appendChild(editButton);
            
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
            const allowedToAddInventory = ['Nachwera Richard', 'Nelson', 'Florence', 'Martha', 'Joshua'];
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


function populateInventoryForm(item) {
    // Only allow populating for editing if the user has permission to edit
    const allowedToEditInventory = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!allowedToEditInventory.includes(currentUserRole)) {
        showMessage('Permission Denied: You cannot edit inventory items.');
        return;
    }

    const idInput = document.getElementById('inventory-id');
    const itemInput = document.getElementById('item');
    const openingInput = document.getElementById('opening');
    const purchasesInput = document.getElementById('purchases');
    const inventorySalesInput = document.getElementById('inventory-sales');
    const spoilageInput = document.getElementById('spoilage');

    if (idInput) idInput.value = item._id;
    if (itemInput) itemInput.value = item.item;
    if (openingInput) openingInput.value = item.opening;
    if (purchasesInput) purchasesInput.value = item.purchases;
    if (inventorySalesInput) inventorySalesInput.value = item.sales;
    if (spoilageInput) spoilageInput.value = item.spoilage;
}

// --- Sales Functions ---
async function fetchSales() {
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
        if (!response) return;

        const result = await response.json();
        renderSalesTable(result.data);
        renderSalesPagination(result.page, result.pages);
    } catch (error) {
        console.error('Error fetching sales:', error);
        showMessage('Failed to fetch sales: ' + error.message);
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

    const hideProfitColumns = ['Martha', 'Joshua'].includes(currentUserRole);
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
            editButton.className = 'edit';
            editButton.onclick = () => populateSaleForm(sale);
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
    // Roles allowed to record sales
    const allowedToRecordSales = ['Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence'];
    if (!allowedToRecordSales.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record sales.');
        return;
    }

    const idInput = document.getElementById('sale-id');
    const itemInput = document.getElementById('sale-item');
    const numberInput = document.getElementById('sale-number');
    const bpInput = document.getElementById('sale-bp');
    const spInput = document.getElementById('sale-sp');
    const salesDateFilterInput = document.getElementById('sales-date-filter'); // Assuming this is used for the sale date

    if (!idInput || !itemInput || !numberInput || !bpInput || !spInput || !salesDateFilterInput) {
        showMessage('Sales form elements are missing.');
        return;
    }

    const id = idInput.value;
    const item = itemInput.value;
    const number = parseInt(numberInput.value);
    const bp = parseFloat(bpInput.value);
    const sp = parseFloat(spInput.value);
    const date = salesDateFilterInput.value; // Use the value from the date filter as the sale date

    // Basic validation
    if (!item || isNaN(number) || isNaN(bp) || isNaN(sp) || !date) {
        showMessage('Please fill in all sales fields correctly with valid numbers and date.');
        return;
    }
    if (number <= 0 || bp <= 0 || sp <= 0) {
        showMessage('Number, Buying Price, and Selling Price must be positive values.');
        return;
    }

    // --- Calculate Profit and Percentage Profit Here ---
    const totalBuyingPrice = bp * number;
    const totalSellingPrice = sp * number;
    const profit = totalSellingPrice - totalBuyingPrice;
    let percentageProfit = 0;
    if (totalBuyingPrice !== 0) { // Avoid division by zero
        percentageProfit = (profit / totalBuyingPrice) * 100;
    }
    // --- End Calculation ---

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
        let response;
        if (id) { // Edit operation (Nachwera Richard, Nelson, Florence only)
            const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
            if (!adminRoles.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit sales.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/sales/${id}`, {
                method: 'PUT',
                body: JSON.stringify(saleData)
            });
        } else { // New entry creation (all allowed roles)
            response = await authenticatedFetch(`${API_BASE_URL}/sales`, {
                method: 'POST',
                body: JSON.stringify(saleData)
            });
        }
        if (response) {
            await response.json(); // Consume response body
            showMessage('Sale recorded successfully!');
            const saleForm = document.getElementById('sale-form');
            if (saleForm) saleForm.reset();
            if (idInput) idInput.value = ''; // Clear ID after submission
            // Re-set the date filter to today after successful submission for convenience
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            if (salesDateFilterInput) salesDateFilterInput.value = `${yyyy}-${mm}-${dd}`;
            fetchSales(); // Re-fetch to update table after successful operation
        }
    } catch (error) {
        console.error('Error saving sale entry:', error);
        showMessage('Failed to save sale entry: ' + error.message);
    }
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
    if (salesDateFilterInput && sale.date) {
        salesDateFilterInput.value = new Date(sale.date).toISOString().split('T')[0];
    }
}

const BUYING_PRICES ={
"rest greek salad": 5000,
"rest potato salad": 5200,
"rest mushroom soup": 5400,
"rest tomato soup": 4400,
"rest chicken clear soup": 5100,
"rest chicken stew": 14100,
"rest chicken stir fry": 11200,
"rest chicken curry": 14700,
"rest grilled whole chicken": 34300,
"rest beef stew": 12600,
"rest beef stir fry": 11100,
"rest pan fried goat or beef or liver": 12900,
"rest beef steak": 12400,
"rest panfried pork": 12900,
"rest pork ribs": 13500,
"rest pork chops": 13300,
"rest fish curry": 12900,
"rest vegetable curry": 10200,
"rest beef samosa": 3100,
"rest chicken wing": 12200,
"rest french fries": 4500,
"rest chips masala": 6200,
"rest pan fried fish fillet": 12700,
"rest deep fried whole fish": 20900,
"rest fish finger": 10800,
"rest chicken burger patty": 9600,
"rest beef burgar": 10500,
"rest vegetable burgar": 10700,
"rest beef sandwich": 8200,
"rest chicken sandwich": 8700,
"rest tomato sandwich": 7400,
"rest vegetable sandwich": 7700,
"rest club sandwich": 13100,
"rest african tea": 3900,
"rest african coffee": 5000,
"rest english tea": 4800,
"rest african spiced tea": 4900,
"rest lemon tea": 3900,
"rest milk plane": 4000,
"rest black tea": 2700,
"rest black coffee": 2800,
"rest dhawa tea": 3800,
"rest passion juice(l)": 3300,
"rest pineapple juice": 3000,
"rest water melon juice": 3000,
"rest lemon juice": 2800,
"rest cocotail juice": 4400,
"rest fruit platter": 4000,
"rest fruit salad": 6200,
"rest spagetti napolitan": 6900,
"rest spagetti bolognaise": 8100,
"rest margarita pizza": 7600,
"rest chicken pizza": 13600,
"rest beef pizza": 11600,
"rest hawaii pizza": 12400,
    "bar mountain dew": 771,
    "bar mirinda fruity ": 771,
    "bar mirinda fanta": 771,
    "bar novida": 771,
    "bar pepsi": 771,
    "bar mirinda apple":771,
    "bar cocacola":771,
    "bar stoney":771,
    "bar fanta":771,
    "bar cocacola":771,
    "bar fanta":771,
    "bar nile":3335,
    "bar club":2925,
    "bar guiness stout":2800,
    "bar guiness smooth":2800,
    "bar uganda waragi":7000,
    "bar gilbey's":7800,
    "bar tusker lite":2860,
    "bar tusker lager":2860,
    "bar water":1000,
    "bar castle lite":2860
};

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
    const allowedToRecordExpenses = ['Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence'];
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
    const allowedToRecordCash = ['Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence'];
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
    const isMarthaOrJoshua = ['Martha', 'Joshua'].includes(currentUserRole);

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
