// Global Constants and Variables
const API_BASE_URL = 'https://patrinahhotelmgtsys.onrender.com'; // Base URL for API calls
let authToken = localStorage.getItem('authToken') || ''; // Stores the authentication token
let currentUsername = localStorage.getItem('username') || ''; // Stores the logged-in username
let currentUserRole = localStorage.getItem('userRole') || ''; // Stores the logged-in user's role

// Pagination variables for different sections
let currentPage = 1; // For Inventory
const itemsPerPage = 5;
let currentSalesPage = 1; // For Sales
const salesPerPage = 5;
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
function showMessage(message, callback = null) {
    const modal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    const closeButton = document.getElementById('message-close-button');

    messageText.textContent = message;
    modal.classList.remove('hidden'); // Show the modal

    const handleClose = () => {
        modal.classList.add('hidden'); // Hide the modal
        closeButton.removeEventListener('click', handleClose);
        if (callback) {
            callback();
        }
    };
    closeButton.addEventListener('click', handleClose);

    // Also close if clicking outside the message box (optional, but good UX)
    modal.addEventListener('click', function outsideClick(event) {
        if (event.target === modal) {
            handleClose();
            modal.removeEventListener('click', outsideClick);
        }
    });
}

/**
 * Displays a custom confirmation dialog to the user.
 * Replaces native confirm() for better UI control.
 * @param {string} message The confirmation message.
 * @param {function} onConfirm Callback function if user confirms.
 * @param {function} [onCancel] Optional callback function if user cancels.
 */
function showConfirm(message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirm-modal');
    const confirmText = document.getElementById('confirm-text');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('cancel-button');

    confirmText.textContent = message;
    modal.classList.remove('hidden'); // Show the modal

    const handleConfirm = () => {
        modal.classList.add('hidden');
        confirmButton.removeEventListener('click', handleConfirm);
        cancelButton.removeEventListener('click', handleCancel);
        onConfirm();
    };

    const handleCancel = () => {
        modal.classList.add('hidden');
        confirmButton.removeEventListener('click', handleConfirm);
        cancelButton.removeEventListener('click', handleCancel);
        if (onCancel) {
            onCancel();
        }
    };

    confirmButton.addEventListener('click', handleConfirm);
    cancelButton.addEventListener('click', handleCancel);

    // Close if clicking outside
    modal.addEventListener('click', function outsideClick(event) {
        if (event.target === modal) {
            handleCancel(); // Treat outside click as cancel
            modal.removeEventListener('click', outsideClick);
        }
    });
}


/**
 * Applies specific UI restrictions for 'Martha' and 'Joshua' roles in Sales, Expenses, and Cash Management sections.
 * Hides headings, filters, and tables, showing only the forms for these roles.
 * @param {string} sectionId The ID of the currently active section.
 */
function applyBarStaffUIRestrictions(sectionId) {
    // Check if the current user is 'Martha' or 'Joshua'
    const isBarStaff = currentUserRole === 'Martha' || currentUserRole === 'Joshua';

    // Sales section specific elements
    const salesHeading = document.querySelector('#sales-section .sales-records-heading');
    const salesFilter = document.querySelector('#sales-section .sales-filter-controls');
    const paginationControl = document.querySelector('#sales-section .pagination-controls');
    const salesTable = document.getElementById('sales-table');
    const excelbtnTable = document.querySelector('#sales-section .export-button');

    // Expenses section specific elements
    const expensesHeading = document.querySelector('#expenses-section .expenses-records-heading');
    const expensesFilter = document.querySelector('#expenses-section .expenses-filter-controls');
    const expensePag = document.querySelector('#expenses-section .pagination-controls');
    const expensesTable = document.getElementById('expenses-table');

    // Cash Management section specific elements
    const cashHeading = document.querySelector('#cash-management-section .cash-header');
    const cashFilter = document.querySelector('#cash-management-section .filter-controls');
    const cashTable = document.getElementById('cash-journal-table');

    if (isBarStaff) {
        // Apply restrictions if it's bar staff
        if (sectionId === 'sales') {
            if (salesHeading) salesHeading.style.display = 'none';
            if (salesFilter) salesFilter.style.display = 'none';
            if (salesTable) salesTable.style.display = 'none';
            if (excelbtnTable) excelbtnTable.style.display = 'none';
           if (paginationControl) paginationControl.style.display = 'none';
        } else {
            // Ensure these are visible if not in sales section (e.g., if a different admin role switches to sales)
            if (salesHeading) salesHeading.style.display = 'block';
            if (salesFilter) salesFilter.style.display = 'flex'; // Use flex for filter controls
            if (salesTable) salesTable.style.display = 'table';
            if (excelbtnTable) excelbtnTable.style.display = 'block';
            if (paginationControl) paginationControl.style.display = 'block';

        }

        if (sectionId === 'cash-management') {
            if (cashHeading) cashHeading.style.display = 'none';
            if (cashFilter) cashFilter.style.display = 'none';
            if (cashTable) cashTable.style.display = 'none';
        } else {
            if (cashHeading) cashHeading.style.display = 'block';
            if (cashFilter) cashFilter.style.display = 'flex';
            if (cashTable) cashTable.style.display = 'table';
        }

        if (sectionId === 'expenses') {
            if (expensesHeading) expensesHeading.style.display = 'none';
            if (expensesFilter) expensesFilter.style.display = 'none';
            if (expensesTable) expensesTable.style.display = 'none';
            if (expensePag) expensePag.style.display = 'none';

        } else {
            // Ensure these are visible if not in expenses section
            if (expensesHeading) expensesHeading.style.display = 'block';
            if (expensesFilter) expensesFilter.style.display = 'flex'; // Use flex for filter controls
            if (expensesTable) expensesTable.style.display = 'table';
            if (expensePag) expensePag.style.display = 'block';
        }
    } else {
        // For Nachwera Richard, Nelson, Florence, or other roles, ensure all elements are visible
        if (salesHeading) salesHeading.style.display = 'block';
        if (salesFilter) salesFilter.style.display = 'flex';
        if (salesTable) salesTable.style.display = 'table';
        if (excelbtnTable) excelbtnTable.style.display = 'block';

        if (expensesHeading) expensesHeading.style.display = 'block';
        if (expensesFilter) expensesFilter.style.display = 'flex';
        if (expensesTable) expensesTable.style.display = 'table';

        if (cashHeading) cashHeading.style.display = 'block';
        if (cashFilter) cashFilter.style.display = 'flex';
        if (cashTable) cashTable.style.display = 'table';
    }
}


/**
 * Updates the display of the current logged-in user and manages navigation button visibility.
 * Ensures the login form is hidden on success and sets nav button visibility based on role.
 */
function updateUIForUserRole() {
    const userDisplay = document.getElementById('current-user-display');
    const mainContent = document.getElementById('main-content');
    const loginSection = document.getElementById('login-section');
    const mainContainer = document.getElementById('main-container');
    const navButtons = document.querySelectorAll('nav button');

    console.log('updateUIForUserRole called. AuthToken present:', !!authToken);
    console.log('Current User Role:', currentUserRole);

    if (authToken && currentUserRole) {
        userDisplay.textContent = `${currentUserRole}`;

        // --- Hide Login Section, Show Main Container ---
        loginSection.style.display = 'none';
        mainContainer.style.display = 'block';
        mainContent.style.display = 'block';

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
        // Bar staff roles (Martha, Joshua)
        else if (currentUserRole === 'Martha' || currentUserRole === 'Joshua') {
            document.getElementById('nav-sales').style.display = 'inline-block';
            document.getElementById('nav-expenses').style.display = 'inline-block';
            document.getElementById('nav-cash-management').style.display = 'inline-block';
        }

        // Show default section based on role
        if (fullAccessRoles.includes(currentUserRole)) {
            showSection('inventory'); // Admins start with inventory
        } else if (currentUserRole === 'Martha' || currentUserRole === 'Joshua') {
            showSection('sales'); // Bar staff start with sales
        }

    } else {
        // Not logged in: Show login section, hide main container
        userDisplay.textContent = '';
        mainContent.style.display = 'none';
        mainContainer.style.display = 'none';
        loginSection.style.display = 'block';
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
        'Martha': ['inventory', 'sales', 'expenses', 'cash-management'],
        'Joshua': ['inventory', 'sales', 'expenses', 'cash-management']
    };

    // --- Role-based Access Check ---
    if (currentUserRole && !allowedSections[currentUserRole]?.includes(sectionId)) {
        showMessage('Access Denied: You do not have permission to view this section.');
        // Redirect to a default allowed section if trying to access unauthorized
        const fullAccessRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (fullAccessRoles.includes(currentUserRole)) {
            showSection('inventory'); // Admin default
        } else if (currentUserRole === 'Martha' || currentUserRole === 'Joshua') {
            showSection('sales'); // Bar staff default
        }
        return; // Prevent further execution for unauthorized access
    }

    // --- Show/Hide Sections ---
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');

    // --- Apply Bar Staff UI Restrictions (Headings, Filters, Tables) ---
    applyBarStaffUIRestrictions(sectionId);


    // --- Fetch Data based on Section and Role ---
    if (sectionId === 'inventory') {
        fetchInventory();
    } else if (sectionId === 'sales') {
        if (currentUserRole === 'Martha' || currentUserRole === 'Joshua') {
            // For bar staff, clear the table and show a message to prompt filtering.
            document.querySelector('#sales-table tbody').innerHTML = '<tr><td colspan="6" style="text-align: center; color: #555;">Use the form above to record a new sale.</td></tr>';
            // Ensure the date filter is set to today for convenience if they click "Apply Filters" (though filters are hidden)
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            document.getElementById('sales-date-filter').value = `${yyyy}-${mm}-${dd}`;
        } else {
            // For administrators, auto-fetch sales
            fetchSales();
        }
    } else if (sectionId === 'expenses') {
        if (currentUserRole === 'Martha' || currentUserRole === 'Joshua') {
            // For bar staff, clear the table and show a message to prompt recording.
            document.querySelector('#expenses-table tbody').innerHTML = '<tr><td colspan="7" style="text-align: center; color: #555;">Use the form above to record a new expense.</td></tr>';
            // Ensure the date filter is set to today for convenience
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            document.getElementById('expenses-date-filter').value = `${yyyy}-${mm}-${dd}`;
        } else {
            // For administrators, auto-fetch expenses
            fetchExpenses();
        }
    } else if (sectionId === 'cash-management') {
        // Set default date for new entry and filter
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayString = `${yyyy}-${mm}-${dd}`;
        document.getElementById('cash-date').value = todayString; // For the form
        document.getElementById('cash-filter-date').value = todayString; // For the filter
        fetchCashJournal();
    } else if (sectionId === 'reports') {
        // Set default dates for reports (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startInput = document.getElementById('report-start-date');
        const endInput = document.getElementById('report-end-date');

        if (!startInput.value) {
            startInput.value = thirtyDaysAgo.toISOString().split('T')[0];
        }
        if (!endInput.value) {
            endInput.value = today.toISOString().split('T')[0];
        }
        generateReports();
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
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');

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
}

async function logout() {
    try {
        // Optionally notify backend of logout for audit logging
        // Using authenticatedFetch here, but it will fail if authToken is already cleared.
        // So, it's better to clear locally first, then try to notify.
        // If the backend requires auth for logout, you might need to send the token before clearing.
        // For simplicity, we'll just clear locally and then try to hit the logout endpoint.
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authToken}`, // Send token before clearing it
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.warn('Error notifying backend of logout (may be due to already cleared token or network issues):', error);
    }

    authToken = '';
    currentUsername = '';
    currentUserRole = '';
    localStorage.clear(); // Clear all stored user data
    updateUIForUserRole(); // Reset UI to login state
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-message').textContent = '';
}

// --- Inventory Functions ---
async function fetchInventory() {
    try {
        const itemFilter = document.getElementById('search-inventory-item').value;
        const lowFilter = document.getElementById('search-inventory-low').value;

        let url = `${API_BASE_URL}/inventory`;
        const params = new URLSearchParams();
        if (itemFilter) params.append('item', itemFilter);
        if (lowFilter) params.append('low', lowFilter);
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);

        url += `?${params.toString()}`;

        const response = await authenticatedFetch(url);
        if (!response) return;

        const result = await response.json();
        renderInventoryTable(result.data);
        renderPagination(result.page, result.pages);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        showMessage('Failed to fetch inventory: ' + error.message);
    }
}

function renderPagination(current, totalPages) {
    const container = document.getElementById('pagination');
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

        // Only Nachwera Richard, Nelson, Florence can edit/delete inventory
        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => populateInventoryForm(item);
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

async function submitInventoryForm(event) {
    event.preventDefault();
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can add/update inventory.');
        return;
    }
    const id = document.getElementById('inventory-id').value;
    const item = document.getElementById('item').value;
    const opening = parseInt(document.getElementById('opening').value);
    const purchases = parseInt(document.getElementById('purchases').value);
    const sales = parseInt(document.getElementById('inventory-sales').value);
    const spoilage = parseInt(document.getElementById('spoilage').value);

    const inventoryData = { item, opening, purchases, sales, spoilage };

    try {
        let response;
        if (id) {
            response = await authenticatedFetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'PUT',
                body: JSON.stringify(inventoryData)
            });
        } else {
            response = await authenticatedFetch(`${API_BASE_URL}/inventory`, {
                method: 'POST',
                body: JSON.stringify(inventoryData)
            });
        }
        if (response) {
            await response.json();
            showMessage('Inventory item saved successfully!');
            document.getElementById('inventory-form').reset();
            document.getElementById('inventory-id').value = '';
            fetchInventory();
        }
    } catch (error) {
        console.error('Error saving inventory item:', error);
        showMessage('Failed to save inventory item: ' + error.message);
    }
}

function populateInventoryForm(item) {
    document.getElementById('inventory-id').value = item._id;
    document.getElementById('item').value = item.item;
    document.getElementById('opening').value = item.opening;
    document.getElementById('purchases').value = item.purchases;
    document.getElementById('inventory-sales').value = item.sales;
    document.getElementById('spoilage').value = item.spoilage;
}

async function deleteInventory(id) {
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can delete inventory.');
        return;
    }

    showConfirm('Are you sure you want to delete this inventory item?', async () => {
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
    });
}

// --- Sales Functions ---
async function fetchSales() {
    try {
        const dateFilter = document.getElementById('sales-date-filter').value;
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
    // Only render table if not Martha/Joshua, as per new requirement
    if (currentUserRole === 'Martha' || currentUserRole === 'Joshua') {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #555;">Use the form above to record a new sale.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    if (sales.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.textContent = 'No sales records found for this date. Try adjusting the filter.';
        cell.style.textAlign = 'center';
        return;
    }

    sales.forEach(sale => {
        const row = tbody.insertRow();
        row.insertCell().textContent = sale.item;
        row.insertCell().textContent = sale.number;
        row.insertCell().textContent = sale.bp;
        row.insertCell().textContent = sale.sp;
        row.insertCell().textContent = new Date(sale.date).toLocaleDateString();
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        // Only Nachwera Richard, Nelson, Florence can edit/delete sales
        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => populateSaleForm(sale);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete';
            deleteButton.onclick = () => deleteSale(sale._id);
            actionsCell.appendChild(deleteButton);
        } else {
            actionsCell.textContent = 'View Only';
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

    const id = document.getElementById('sale-id').value;
    const item = document.getElementById('sale-item').value;
    const number = parseInt(document.getElementById('sale-number').value);
    const bp = parseFloat(document.getElementById('sale-bp').value);
    const sp = parseFloat(document.getElementById('sale-sp').value);

    const saleData = { item, number, bp, sp };

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
        } else { // New sale creation (all allowed roles)
            response = await authenticatedFetch(`${API_BASE_URL}/sales`, {
                method: 'POST',
                body: JSON.stringify(saleData)
            });
        }
        if (response) {
            await response.json();
            showMessage('Sale recorded successfully!');
            document.getElementById('sale-form').reset();
            document.getElementById('sale-id').value = '';
            fetchSales(); // Re-fetch to update table after successful operation
        }
    } catch (error) {
        console.error('Error recording sale:', error);
        showMessage('Failed to record sale: ' + error.message);
    }
}

function populateSaleForm(sale) {
    document.getElementById('sale-id').value = sale._id;
    document.getElementById('sale-item').value = sale.item;
    document.getElementById('sale-number').value = sale.number;
    document.getElementById('sale-bp').value = sale.bp;
    document.getElementById('sale-sp').value = sale.sp;
}

async function deleteSale(id) {
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can delete sales.');
        return;
    }
    showConfirm('Are you sure you want to delete this sale record?', async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/sales/${id}`, {
                method: 'DELETE'
            });
            if (response && response.status === 204) {
                showMessage('Sale record deleted successfully!');
                fetchSales(); // Re-fetch to update table after successful operation
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

// --- Expenses Functions ---
async function fetchExpenses() {
    try {
        const dateFilter = document.getElementById('expenses-date-filter').value;
        const params = new URLSearchParams();

        if (dateFilter) params.append('date', dateFilter);
        params.append('page', currentExpensesPage);
        params.append('limit', expensesPerPage);

        const url = `${API_BASE_URL}/expenses?${params.toString()}`;

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
    // Only render table if not Martha/Joshua, as per new requirement
    if (currentUserRole === 'Martha' || currentUserRole === 'Joshua') {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #555;">Use the form above to record a new expense.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    if (expenses.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7;
        cell.textContent = 'No expense records found for this date. Try adjusting the filter.';
        cell.style.textAlign = 'center';
        return;
    }

    expenses.forEach(expense => {
        const row = tbody.insertRow();
        row.insertCell().textContent = expense.description;
        row.insertCell().textContent = expense.amount;
        row.insertCell().textContent = new Date(expense.date).toLocaleDateString();
        row.insertCell().textContent = expense.receiptId || 'N/A';
        row.insertCell().textContent = expense.source || 'N/A';
        row.insertCell().textContent = expense.responsible || 'N/A';
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        // Only Nachwera Richard, Nelson, Florence can edit/delete expenses
        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => populateExpenseForm(expense);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete';
            deleteButton.onclick = () => deleteExpense(expense._id);
            actionsCell.appendChild(deleteButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}

async function submitExpenseForm(event) {
    event.preventDefault();
    // Roles allowed to record expenses
    const allowedToRecordExpenses = ['Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence'];
    if (!allowedToRecordExpenses.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record expenses.');
        return;
    }
    const id = document.getElementById('expense-id').value;
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const receiptId = document.getElementById('expense-receiptId').value;
    const source = document.getElementById('expense-source').value;
    const responsible = document.getElementById('expense-responsible').value;

    const expenseData = { description, amount, receiptId, source, responsible };

    try {
        let response;
        if (id) { // Edit operation (Nachwera Richard, Nelson, Florence only)
            const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
            if (!adminRoles.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit expenses.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(expenseData)
            });
        } else { // New expense creation (all allowed roles)
            response = await authenticatedFetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });
        }
        if (response) {
            await response.json();
            showMessage('Expense recorded successfully!');
            document.getElementById('expense-form').reset();
            document.getElementById('expense-id').value = '';
            fetchExpenses(); // Re-fetch to update table after successful operation
        }
    } catch (error) {
        console.error('Error recording expense:', error);
        showMessage('Failed to record expense: ' + error.message);
    }
}

function populateExpenseForm(expense) {
    document.getElementById('expense-id').value = expense._id;
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-receiptId').value = expense.receiptId || '';
    document.getElementById('expense-source').value = expense.source || '';
    document.getElementById('expense-responsible').value = expense.responsible || '';
}

async function deleteExpense(id) {
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can delete expenses.');
        return;
    }
    showConfirm('Are you sure you want to delete this expense record?', async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'DELETE'
            });
            if (response && response.status === 204) {
                showMessage('Expense record deleted successfully!');
                fetchExpenses(); // Re-fetch to update table after successful operation
            } else if (response) {
                const errorData = await response.json();
                showMessage('Failed to delete expense record: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error deleting expense record:', error);
            showMessage('Failed to delete expense record: ' + error.message);
        }
    });
}

// --- Cash Management Functions ---
async function fetchCashJournal() {
    try {
        const dateFilter = document.getElementById('cash-filter-date').value;
        const responsibleFilter = document.getElementById('cash-filter-responsible').value;

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
    tbody.innerHTML = '';
    if (records.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
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
        row.insertCell().textContent = record.responsiblePerson;
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        // Only Nachwera Richard, Nelson, Florence can edit/delete cash entries
        const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
        if (adminRoles.includes(currentUserRole)) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => populateCashJournalForm(record);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete';
            deleteButton.onclick = () => deleteCashJournal(record._id);
            actionsCell.appendChild(deleteButton);
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
    const id = document.getElementById('cash-journal-id').value;
    const cashAtHand = parseFloat(document.getElementById('cash-at-hand').value);
    const cashBanked = parseFloat(document.getElementById('cash-banked').value);
    const bankReceiptId = document.getElementById('bank-receipt-id').value;
    const responsiblePerson = document.getElementById('responsible-person').value;
    const date = document.getElementById('cash-date').value;

    const cashData = { cashAtHand, cashBanked, bankReceiptId, responsiblePerson, date };

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
            document.getElementById('cash-journal-form').reset();
            document.getElementById('cash-journal-id').value = '';
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            document.getElementById('cash-date').value = `${yyyy}-${mm}-${dd}`;
            fetchCashJournal(); // Re-fetch to update table after successful operation
        }
    } catch (error) {
        console.error('Error saving cash entry:', error);
        showMessage('Failed to save cash entry: ' + error.message);
    }
}

function populateCashJournalForm(record) {
    document.getElementById('cash-journal-id').value = record._id;
    document.getElementById('cash-at-hand').value = record.cashAtHand;
    document.getElementById('cash-banked').value = record.cashBanked;
    document.getElementById('bank-receipt-id').value = record.bankReceiptId;
    document.getElementById('responsible-person').value = record.responsiblePerson;
    document.getElementById('cash-date').value = new Date(record.date).toISOString().split('T')[0];
}

async function deleteCashJournal(id) {
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can delete cash entries.');
        return;
    }
    showConfirm('Are you sure you want to delete this cash journal entry?', async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/cash-journal/${id}`, {
                method: 'DELETE'
            });
            if (response && response.status === 204) {
                showMessage('Cash entry deleted successfully!');
                fetchCashJournal(); // Re-fetch to update table after successful operation
            } else if (response) {
                const errorData = await response.json();
                showMessage('Failed to delete cash entry: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error deleting cash entry:', error);
            showMessage('Failed to delete cash entry: ' + error.message);
        }
    });
}

// --- Reports Functions ---
function getDepartmentFromText(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith('bar-') || lowerText.includes('bar ')) return 'Bar';
    if (lowerText.startsWith('rest-') || lowerText.includes('restaurant')) return 'Restaurant';
    if (lowerText.startsWith('conf-') || lowerText.includes('conference')) return 'Conference';
    if (lowerText.startsWith('grdn-') || lowerText.includes('garden')) return 'Gardens';
    if (lowerText.startsWith('accomm-') || lowerText.includes('accommodation') || lowerText.includes('room')) return 'Accommodation';
    return 'Bar'; // Default department if not matched
}

async function generateReports() {
    const startDateString = document.getElementById('report-start-date').value;
    const endDateString = document.getElementById('report-end-date').value;

    if (!startDateString || !endDateString) {
        showMessage('Please select both start and end dates for the report.');
        return;
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    let allExpenses = [];
    let allSales = [];

    const tbody = document.getElementById('department-report-tbody');
    tbody.innerHTML = ''; // Clear any existing rows

    try {
        // Fetch sales
        const salesResponse = await authenticatedFetch(`${API_BASE_URL}/sales`);
        if (salesResponse) {
            const salesData = await salesResponse.json();
            if (Array.isArray(salesData.data)) {
                allSales = salesData.data.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= startDate && saleDate <= endDate;
                });
            } else {
                console.warn('API /sales did not return an array:', salesData);
                allSales = [];
            }
        }

        // Fetch expenses
        const expensesResponse = await authenticatedFetch(`${API_BASE_URL}/expenses`);
        if (expensesResponse) {
            const expensesData = await expensesResponse.json();
            if (Array.isArray(expensesData.data)) {
                allExpenses = expensesData.data.filter(e => {
                    const expenseDate = new Date(e.date);
                    return expenseDate >= startDate && expenseDate <= endDate;
                });
            } else {
                console.warn('API /expenses did not return an array:', expensesData);
                allExpenses = [];
            }
        }

        const departmentReports = {};
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

        document.getElementById('overall-sales').textContent = overallSales.toFixed(2);
        document.getElementById('overall-expenses').textContent = overallExpenses.toFixed(2);
        const overallBalance = overallSales - overallExpenses;
        const overallBalanceElement = document.getElementById('overall-balance');
        overallBalanceElement.textContent = overallBalance.toFixed(2);
        overallBalanceElement.className = overallBalance >= 0 ? 'positive' : 'negative';

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
                row.insertCell().textContent = deptBalance.toFixed(2);
            });
        }

    } catch (error) {
        console.error('Error generating reports:', error);
        showMessage('Failed to generate reports: ' + error.message);
    }
}


// --- Audit Logs Functions ---
async function fetchAuditLogs() {
    try {
        const params = new URLSearchParams();
        params.append('page', currentAuditPage);
        params.append('limit', auditLogsPerPage);

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

function renderAuditPagination(current, totalPages) {
    const container = document.getElementById('audit-pagination');
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
}


function renderAuditLogsTable(logs) {
    const tbody = document.querySelector('#audit-logs-table tbody');
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
        row.insertCell().textContent = JSON.stringify(log.details); // Display details as string
    });
}


// --- Initial Setup and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status on page load
    updateUIForUserRole();

    // Attach form submission handlers
    document.getElementById('inventory-form').addEventListener('submit', submitInventoryForm);
    document.getElementById('sale-form').addEventListener('submit', submitSaleForm);
    document.getElementById('expense-form').addEventListener('submit', submitExpenseForm);
    document.getElementById('cash-journal-form').addEventListener('submit', submitCashJournalForm);

    // Set initial date filters for various sections
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;

    document.getElementById('sales-date-filter').value = todayString;
    document.getElementById('expenses-date-filter').value = todayString;
    document.getElementById('cash-date').value = todayString;
    document.getElementById('cash-filter-date').value = todayString;

    // For reports, set default to last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    document.getElementById('report-start-date').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('report-end-date').value = todayString;

    // Attach event listeners for login/logout
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
    document.getElementById('logout-button').addEventListener('click', logout);

    // Attach event listeners for navigation buttons
    document.getElementById('nav-inventory').addEventListener('click', () => showSection('inventory'));
    document.getElementById('nav-sales').addEventListener('click', () => showSection('sales'));
    document.getElementById('nav-expenses').addEventListener('click', () => showSection('expenses'));
    document.getElementById('nav-cash-management').addEventListener('click', () => showSection('cash-management'));
    document.getElementById('nav-reports').addEventListener('click', () => showSection('reports'));
    document.getElementById('nav-audit-logs').addEventListener('click', () => showSection('audit-logs'));

    // Attach event listeners for filter buttons
    document.getElementById('apply-inventory-filter').addEventListener('click', fetchInventory);
    document.getElementById('apply-sales-filter').addEventListener('click', fetchSales);
    document.getElementById('apply-expenses-filter').addEventListener('click', fetchExpenses);
    document.getElementById('apply-cash-filter').addEventListener('click', fetchCashJournal);
    document.getElementById('generate-report-button').addEventListener('click', generateReports);
});
