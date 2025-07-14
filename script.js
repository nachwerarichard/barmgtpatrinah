// --- Global Variables ---
const API_BASE_URL = 'https://patrinahhotelmgtsys.onrender.com';
let authToken = localStorage.getItem('authToken') || '';
let currentUsername = localStorage.getItem('username') || '';
let currentUserRole = localStorage.getItem('userRole') || '';
let currentPage = 1;
const itemsPerPage = 5;
let currentSalesPage = 1;
const salesPerPage = 5;
let currentExpensesPage = 1;
const expensesPerPage = 5;
let currentAuditPage = 1;
const auditLogsPerPage = 5;

// IMPORTANT: The HARDCODED_USERS array is now removed from the frontend JS.
// User authentication and role assignment will be handled by the backend.

// --- Custom Message Box Implementation (replaces alert/confirm) ---
// This provides a custom modal for user feedback instead of browser alerts.
function setupMessageBox() {
    const body = document.body;
    let messageBox = document.getElementById('customMessageBox');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'customMessageBox';
        messageBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 hidden';
        messageBox.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <p id="messageText" class="mb-4 text-lg font-semibold"></p>
                <div id="messageButtons" class="flex justify-center space-x-4">
                    <button id="messageOkBtn" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">OK</button>
                    <button id="messageCancelBtn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 hidden">Cancel</button>
                </div>
            </div>
        `;
        body.appendChild(messageBox);
    }
}

let messageCallback = null;

function showMessage(message, type = 'alert', callback = null) {
    setupMessageBox(); // Ensure the message box is in the DOM
    const messageBox = document.getElementById('customMessageBox');
    const messageText = document.getElementById('messageText');
    const messageOkBtn = document.getElementById('messageOkBtn');
    const messageCancelBtn = document.getElementById('messageCancelBtn');

    messageText.textContent = message;
    messageCancelBtn.classList.add('hidden'); // Hide cancel by default
    messageOkBtn.textContent = 'OK'; // Default text for OK button

    messageCallback = callback;

    messageOkBtn.onclick = () => {
        messageBox.classList.add('hidden');
        if (messageCallback) {
            messageCallback(true); // For alert, just call with true
            messageCallback = null;
        }
    };

    if (type === 'confirm') {
        messageCancelBtn.classList.remove('hidden');
        messageOkBtn.textContent = 'Yes'; // Change text for confirm
        messageCancelBtn.onclick = () => {
            messageBox.classList.add('hidden');
            if (messageCallback) {
                messageCallback(false); // Call with false if cancelled
                messageCallback = null;
            }
        };
    }

    messageBox.classList.remove('hidden');
}

// Helper to use showMessage as a promise for async/await
function showConfirm(message) {
    return new Promise(resolve => {
        showMessage(message, 'confirm', resolve);
    });
}

// --- Utility Functions ---

/**
 * Applies specific UI restrictions for 'bar_staff' role in Sales and Expenses sections.
 * Hides headings, filters, and tables, showing only the forms.
 * @param {string} sectionId The ID of the currently active section.
 */
function applyBarStaffUIRestrictions(sectionId) {
    if (currentUserRole === 'bar_staff') {
        // Sales section specific elements
        const salesHeading = document.querySelector('#sales-section .sales-records-heading');
        const salesFilter = document.querySelector('#sales-section .sales-filter-controls');
        const salesTable = document.getElementById('sales-table');
        const salesPagination = document.getElementById('sales-pagination');

        // Expenses section specific elements
        const expensesHeading = document.querySelector('#expenses-section .expenses-records-heading');
        const expensesFilter = document.querySelector('#expenses-section .expenses-filter-controls');
        const expensesTable = document.getElementById('expenses-table');
        const expensesPagination = document.getElementById('expenses-pagination');

        if (sectionId === 'sales') {
            if (salesHeading) salesHeading.style.display = 'none';
            if (salesFilter) salesFilter.style.display = 'none';
            if (salesTable) salesTable.style.display = 'none';
            if (salesPagination) salesPagination.style.display = 'none';
        } else {
            // Ensure these are visible if not in sales section (e.g., if admin switches to sales)
            if (salesHeading) salesHeading.style.display = 'block';
            if (salesFilter) salesFilter.style.display = 'flex'; // Use flex for filter controls
            if (salesTable) salesTable.style.display = 'table';
            if (salesPagination) salesPagination.style.display = 'flex';
        }

        if (sectionId === 'expenses') {
            if (expensesHeading) expensesHeading.style.display = 'none';
            if (expensesFilter) expensesFilter.style.display = 'none';
            if (expensesTable) expensesTable.style.display = 'none';
            if (expensesPagination) expensesPagination.style.display = 'none';
        } else {
            // Ensure these are visible if not in expenses section
            if (expensesHeading) expensesHeading.style.display = 'block';
            if (expensesFilter) expensesFilter.style.display = 'flex'; // Use flex for filter controls
            if (expensesTable) expensesTable.style.display = 'table';
            if (expensesPagination) expensesPagination.style.display = 'flex';
        }
    } else {
        // For admin or other roles, ensure all elements are visible in sales/expenses sections
        const salesHeading = document.querySelector('#sales-section .sales-records-heading');
        const salesFilter = document.querySelector('#sales-section .sales-filter-controls');
        const salesTable = document.getElementById('sales-table');
        const salesPagination = document.getElementById('sales-pagination');
        if (salesHeading) salesHeading.style.display = 'block';
        if (salesFilter) salesFilter.style.display = 'flex';
        if (salesTable) salesTable.style.display = 'table';
        if (salesPagination) salesPagination.style.display = 'flex';

        const expensesHeading = document.querySelector('#expenses-section .expenses-records-heading');
        const expensesFilter = document.querySelector('#expenses-section .expenses-filter-controls');
        const expensesTable = document.getElementById('expenses-table');
        const expensesPagination = document.getElementById('expenses-pagination');
        if (expensesHeading) expensesHeading.style.display = 'block';
        if (expensesFilter) expensesFilter.style.display = 'flex';
        if (expensesTable) expensesTable.style.display = 'table';
        if (expensesPagination) expensesPagination.style.display = 'flex';
    }
}


/**
 * Updates the display of the current logged-in user and manages navigation button visibility.
 * Ensures the login form is hidden on success and sets nav button visibility based on role.
 */
function updateUIForUserRole() {
    const userDisplay = document.getElementById('current-user-display');
    const mainContent = document.getElementById('main-content'); // This is inside #main-container
    const loginSection = document.getElementById('login-section');
    const mainContainer = document.getElementById('main-container'); // Get reference to the main container
    const navButtons = document.querySelectorAll('nav button');

    console.log('updateUIForUserRole called. AuthToken present:', !!authToken); // Debugging log
    console.log('Current Username:', currentUsername);
    console.log('Current User Role:', currentUserRole);

    if (authToken && currentUserRole) {
        userDisplay.textContent = `${currentUserRole} (${currentUsername})`;

        // --- Hide Login Section, Show Main Container ---
        loginSection.style.display = 'none';
        console.log('loginSection.style.display set to:', loginSection.style.display);

        mainContainer.style.display = 'block';
        console.log('mainContainer.style.display set to:', mainContainer.style.display);
        mainContent.style.display = 'block';

        // --- Manage Navigation Button Visibility based on role ---
        navButtons.forEach(button => {
            button.style.display = 'none'; // Hide all buttons by default
        });

        if (currentUserRole === 'admin') {
            // Admins see all buttons
            navButtons.forEach(button => {
                button.style.display = 'inline-block';
            });
        } else if (currentUserRole === 'bar_staff') {
            // Bar staff ONLY see Sales and Expenses
            document.getElementById('nav-sales').style.display = 'inline-block';
            document.getElementById('nav-expenses').style.display = 'inline-block';
        } else {
            // For other roles (e.g., 'guest'), hide all nav buttons
        }

        // Show default section based on role
        if (currentUserRole === 'admin') {
            showSection('inventory'); // Admins start with inventory
        } else if (currentUserRole === 'bar_staff') {
            showSection('sales'); // Bar staff start with sales
        } else {
            // For other roles, maybe show a welcome message or restrict further
            showSection('welcome'); // Assuming a welcome section exists for guests
        }

    } else {
        // Not logged in: Show login section, hide main container
        userDisplay.textContent = '';
        mainContent.style.display = 'none'; // Ensure main content is hidden
        mainContainer.style.display = 'none'; // Hide the main container
        console.log('mainContainer.style.display set to:', mainContainer.style.display);

        loginSection.style.display = 'block';
        console.log('loginSection.style.display set to:', loginSection.style.display);
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
        'admin': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        'bar_staff': ['sales', 'expenses'],
        // Assuming 'guest' or other roles can only see 'welcome'
        'guest': ['welcome'],
        'Nachwera Richard': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'], // Admin-like
        'Wanambi Nelson': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],   // Admin-like
        'Nabudde Florence': ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'], // Admin-like
        'Woniala Joshua': ['sales', 'expenses'], // Bar staff-like
        'Martha': ['sales', 'expenses']          // Bar staff-like
    };

    // --- Role-based Access Check ---
    if (currentUserRole && !allowedSections[currentUserRole]?.includes(sectionId)) {
        showMessage('Access Denied: You do not have permission to view this section.');
        // Redirect to a default allowed section if trying to access unauthorized
        if (allowedSections[currentUserRole] && allowedSections[currentUserRole].length > 0) {
            showSection(allowedSections[currentUserRole][0]); // Redirect to first allowed section for their role
        } else {
            showSection('welcome'); // Fallback for roles with no allowed sections or unknown role
        }
        return; // Prevent further execution for unauthorized access
    }

    // --- Show/Hide Sections ---
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // Explicitly hide
    });
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block'; // Explicitly show
    }


    // --- Apply Bar Staff UI Restrictions (Headings, Filters, Tables) ---
    // This function needs to be updated to check for specific user names if their roles are custom strings
    // For now, it checks if the role is literally 'bar_staff'.
    // If 'Nachwera Richard' has role 'Nachwera Richard', they won't be treated as 'bar_staff' by this function.
    // Let's modify this to check for admin-like or bar_staff-like behavior
    const isBarStaffLike = ['bar_staff', 'Woniala Joshua', 'Martha'].includes(currentUserRole);

    if (isBarStaffLike) {
        // Sales section specific elements
        const salesHeading = document.querySelector('#sales-section .sales-records-heading');
        const salesFilter = document.querySelector('#sales-section .sales-filter-controls');
        const salesTable = document.getElementById('sales-table');
        const salesPagination = document.getElementById('sales-pagination');

        // Expenses section specific elements
        const expensesHeading = document.querySelector('#expenses-section .expenses-records-heading');
        const expensesFilter = document.querySelector('#expenses-section .expenses-filter-controls');
        const expensesTable = document.getElementById('expenses-table');
        const expensesPagination = document.getElementById('expenses-pagination');

        if (sectionId === 'sales') {
            if (salesHeading) salesHeading.style.display = 'none';
            if (salesFilter) salesFilter.style.display = 'none';
            if (salesTable) salesTable.style.display = 'none';
            if (salesPagination) salesPagination.style.display = 'none';
        } else {
            if (salesHeading) salesHeading.style.display = 'block';
            if (salesFilter) salesFilter.style.display = 'flex';
            if (salesTable) salesTable.style.display = 'table';
            if (salesPagination) salesPagination.style.display = 'flex';
        }

        if (sectionId === 'expenses') {
            if (expensesHeading) expensesHeading.style.display = 'none';
            if (expensesFilter) expensesFilter.style.display = 'none';
            if (expensesTable) expensesTable.style.display = 'none';
            if (expensesPagination) expensesPagination.style.display = 'none';
        } else {
            if (expensesHeading) expensesHeading.style.display = 'block';
            if (expensesFilter) expensesFilter.style.display = 'flex';
            if (expensesTable) expensesTable.style.display = 'table';
            if (expensesPagination) expensesPagination.style.display = 'flex';
        }
    } else {
        // For admin-like or other roles, ensure all elements are visible in sales/expenses sections
        const salesHeading = document.querySelector('#sales-section .sales-records-heading');
        const salesFilter = document.querySelector('#sales-section .sales-filter-controls');
        const salesTable = document.getElementById('sales-table');
        const salesPagination = document.getElementById('sales-pagination');
        if (salesHeading) salesHeading.style.display = 'block';
        if (salesFilter) salesFilter.style.display = 'flex';
        if (salesTable) salesTable.style.display = 'table';
        if (salesPagination) salesPagination.style.display = 'flex';

        const expensesHeading = document.querySelector('#expenses-section .expenses-records-heading');
        const expensesFilter = document.querySelector('#expenses-section .expenses-filter-controls');
        const expensesTable = document.getElementById('expenses-table');
        const expensesPagination = document.getElementById('expenses-pagination');
        if (expensesHeading) expensesHeading.style.display = 'block';
        if (expensesFilter) expensesFilter.style.display = 'flex';
        if (expensesTable) expensesTable.style.display = 'table';
        if (expensesPagination) expensesPagination.style.display = 'flex';
    }


    // --- Fetch Data based on Section and Role ---
    if (sectionId === 'inventory') {
        fetchInventory();
    } else if (sectionId === 'sales') {
        if (isBarStaffLike) { // Use the new check
            document.querySelector('#sales-table tbody').innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-4">Use the form above to record a new sale.</td></tr>';
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            document.getElementById('sales-date-filter').value = `${yyyy}-${mm}-${dd}`;
        } else {
            fetchSales();
        }
    } else if (sectionId === 'expenses') {
        if (isBarStaffLike) { // Use the new check
            document.querySelector('#expenses-table tbody').innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-4">Use the form above to record a new expense.</td></tr>';
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            document.getElementById('expenses-date-filter').value = `${yyyy}-${mm}-${dd}`;
        } else {
            fetchExpenses();
        }
    } else if (sectionId === 'cash-management') {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayString = `${yyyy}-${mm}-${dd}`;
        document.getElementById('cash-date').value = todayString;
        document.getElementById('cash-filter-date').value = todayString;
        fetchCashJournal();
    } else if (sectionId === 'reports') {
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
        showMessage('You are not logged in. Please log in first.');
        logout();
        return null;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Basic ${authToken}`, // Assuming backend validates this Basic Auth header
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, options);

        if (response.status === 401 || response.status === 403) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse error JSON:', jsonError);
            }
            showMessage(`Access Denied: ${errorData.error || 'Invalid credentials or insufficient permissions.'}`);
            logout(); // Force logout on auth/authz failure
            return null;
        }
        if (!response.ok && response.status !== 204) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse error JSON:', jsonError);
            }
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
            // Backend returns { username, role }
            // Frontend will use Basic Auth token derived from credentials
            authToken = btoa(`${username}:${password}`);
            currentUsername = data.username;
            currentUserRole = data.role; // This is the crucial part: getting the role from backend

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', currentUsername);
            localStorage.setItem('userRole', currentUserRole);

            loginMessage.textContent = '';
            console.log('Login successful, calling updateUIForUserRole...');
            updateUIForUserRole(); // Update UI based on new role
            showMessage(`Welcome, ${currentUsername}! You are logged in as ${currentUserRole}.`);

        } else {
            const errorData = await response.json();
            loginMessage.textContent = errorData.error || 'Invalid username or password.';
            authToken = '';
            currentUsername = '';
            currentUserRole = '';
            localStorage.clear();
            console.log('Login failed.');
            updateUIForUserRole(); // Ensure UI resets to login form
            showMessage('Login failed: ' + (errorData.error || 'Invalid credentials.'));
        }
    } catch (error) {
        console.error('Login error:', error);
        loginMessage.textContent = 'Network error or server unavailable.';
        authToken = '';
        currentUsername = '';
        currentUserRole = '';
        localStorage.clear();
        updateUIForUserRole();
        showMessage('Login error: Could not connect to the server.');
    }
}

async function logout() {
    try {
        // Optionally notify backend of logout for audit logging
        // await authenticatedFetch(`${API_BASE_URL}/logout`, { method: 'POST' });
        // For this demo, we'll skip the backend call on logout to avoid errors if API is not running
    } catch (error) {
        console.warn('Error notifying backend of logout (might be offline):', error);
        // Continue with logout even if backend notification fails
    }

    authToken = '';
    currentUsername = '';
    currentUserRole = '';
    localStorage.clear(); // Clear all stored user data
    updateUIForUserRole(); // Reset UI to login state
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-message').textContent = '';
    showMessage('You have been logged out.');
}

// --- Inventory Functions ---
async function fetchInventory() {
    // Determine if the current user has admin-like privileges for inventory
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        // This check is already in showSection, but good to have here for direct calls
        showMessage('Permission Denied: Only administrators can view/manage inventory.');
        return;
    }

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
    container.className = 'flex justify-center space-x-2 mt-4'; // Tailwind for pagination

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-md ${i === current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
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
        cell.className = 'text-center text-gray-500 py-4';
        cell.textContent = 'No inventory items found.';
        return;
    }

    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);

    inventory.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell().textContent = item.item;
        row.insertCell().textContent = item.opening;
        row.insertCell().textContent = item.purchases;
        row.insertCell().textContent = item.sales;
        row.insertCell().textContent = item.spoilage;
        row.insertCell().textContent = item.closing;
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions flex space-x-2';

        if (isAdminLike) { // Admin-like roles can edit/delete
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600';
            editButton.onclick = () => populateInventoryForm(item);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600';
            deleteButton.onclick = () => deleteInventory(item._id);
            actionsCell.appendChild(deleteButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}

async function submitInventoryForm(event) {
    event.preventDefault();
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can add/update inventory.');
        return;
    }
    const id = document.getElementById('inventory-id').value;
    const item = document.getElementById('item').value;
    const opening = parseInt(document.getElementById('opening').value);
    const purchases = parseInt(document.getElementById('purchases').value);
    const sales = parseInt(document.getElementById('inventory-sales').value);
    const spoilage = parseInt(document.getElementById('spoilage').value);

    // Basic validation
    if (!item || isNaN(opening) || isNaN(purchases) || isNaN(sales) || isNaN(spoilage)) {
        showMessage('Please fill all inventory fields with valid numbers.');
        return;
    }

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
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can delete inventory.');
        return;
    }
    const confirmed = await showConfirm('Are you sure you want to delete this inventory item?');
    if (!confirmed) return;

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
    container.className = 'flex justify-center space-x-2 mt-4'; // Tailwind for pagination

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-md ${i === current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
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
    const isBarStaffLike = ['bar_staff', 'Woniala Joshua', 'Martha'].includes(currentUserRole);

    // Only render table if not bar_staff-like, as per new requirement
    if (isBarStaffLike) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-4">Use the form above to record a new sale.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    if (sales.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.className = 'text-center text-gray-500 py-4';
        cell.textContent = 'No sales records found for this date. Try adjusting the filter.';
        return;
    }

    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);

    sales.forEach(sale => {
        const row = tbody.insertRow();
        row.insertCell().textContent = sale.item;
        row.insertCell().textContent = sale.number;
        row.insertCell().textContent = sale.bp;
        row.insertCell().textContent = sale.sp;
        row.insertCell().textContent = new Date(sale.date).toLocaleDateString();
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions flex space-x-2';

        if (isAdminLike) { // Admin-like roles can edit/delete
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600';
            editButton.onclick = () => populateSaleForm(sale);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600';
            deleteButton.onclick = () => deleteSale(sale._id);
            actionsCell.appendChild(deleteButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}

async function submitSaleForm(event) {
    event.preventDefault();
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    const isBarStaffLike = ['bar_staff', 'Woniala Joshua', 'Martha'].includes(currentUserRole);

    if (!isAdminLike && !isBarStaffLike) { // Only admin-like or bar_staff-like can record sales
        showMessage('Permission Denied: You do not have permission to record sales.');
        return;
    }
    const id = document.getElementById('sale-id').value;
    const item = document.getElementById('sale-item').value;
    const number = parseInt(document.getElementById('sale-number').value);
    const bp = parseFloat(document.getElementById('sale-bp').value);
    const sp = parseFloat(document.getElementById('sale-sp').value);

    // Basic validation
    if (!item || isNaN(number) || isNaN(bp) || isNaN(sp)) {
        showMessage('Please fill all sales fields with valid numbers.');
        return;
    }

    const saleData = { item, number, bp, sp };

    try {
        let response;
        if (id) { // Edit operation (Admin-like only)
            if (!isAdminLike) {
                showMessage('Permission Denied: Only administrators can edit sales.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/sales/${id}`, {
                method: 'PUT',
                body: JSON.stringify(saleData)
            });
        } else { // New sale creation (Admin-like or Bar Staff-like)
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
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can delete sales.');
        return;
    }
    const confirmed = await showConfirm('Are you sure you want to delete this sale record?');
    if (!confirmed) return;

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
    container.className = 'flex justify-center space-x-2 mt-4'; // Tailwind for pagination

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-md ${i === current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
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
    const isBarStaffLike = ['bar_staff', 'Woniala Joshua', 'Martha'].includes(currentUserRole);

    // Only render table if not bar_staff-like, as per new requirement
    if (isBarStaffLike) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-4">Use the form above to record a new expense.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    if (expenses.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7;
        cell.className = 'text-center text-gray-500 py-4';
        cell.textContent = 'No expense records found for this date. Try adjusting the filter.';
        return;
    }

    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);

    expenses.forEach(expense => {
        const row = tbody.insertRow();
        row.insertCell().textContent = expense.description;
        row.insertCell().textContent = expense.amount;
        row.insertCell().textContent = new Date(expense.date).toLocaleDateString();
        row.insertCell().textContent = expense.receiptId || 'N/A';
        row.insertCell().textContent = expense.source || 'N/A';
        row.insertCell().textContent = expense.responsible || 'N/A';
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions flex space-x-2';

        if (isAdminLike) { // Admin-like roles can edit/delete
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600';
            editButton.onclick = () => populateExpenseForm(expense);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600';
            deleteButton.onclick = () => deleteExpense(expense._id);
            actionsCell.appendChild(deleteButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}

async function submitExpenseForm(event) {
    event.preventDefault();
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    const isBarStaffLike = ['bar_staff', 'Woniala Joshua', 'Martha'].includes(currentUserRole);

    if (!isAdminLike && !isBarStaffLike) { // Only admin-like or bar_staff-like can record expenses
        showMessage('Permission Denied: You do not have permission to record expenses.');
        return;
    }
    const id = document.getElementById('expense-id').value;
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const receiptId = document.getElementById('expense-receiptId').value;
    const source = document.getElementById('expense-source').value;
    const responsible = document.getElementById('expense-responsible').value;

    // Basic validation
    if (!description || isNaN(amount)) {
        showMessage('Please fill description and amount fields with valid data.');
        return;
    }

    const expenseData = { description, amount, receiptId, source, responsible };

    try {
        let response;
        if (id) { // Edit operation (Admin-like only)
            if (!isAdminLike) {
                showMessage('Permission Denied: Only administrators can edit expenses.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(expenseData)
            });
        } else { // New expense creation (Admin-like or Bar Staff-like)
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
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can delete expenses.');
        return;
    }
    const confirmed = await showConfirm('Are you sure you want to delete this expense record?');
    if (!confirmed) return;

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
}

// --- Cash Management Functions ---
async function fetchCashJournal() {
    // Determine if the current user has admin-like privileges for cash management
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can view/manage cash journal.');
        return;
    }

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
        cell.className = 'text-center text-gray-500 py-4';
        cell.textContent = 'No cash records found for the selected filters.';
        return;
    }

    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);

    records.forEach(record => {
        const row = tbody.insertRow();
        row.insertCell().textContent = new Date(record.date).toLocaleDateString();
        row.insertCell().textContent = record.cashAtHand.toFixed(2);
        row.insertCell().textContent = record.cashBanked.toFixed(2);
        row.insertCell().textContent = record.bankReceiptId;
        row.insertCell().textContent = record.responsiblePerson;
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions flex space-x-2';

        if (isAdminLike) { // Admin-like roles can edit/delete
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600';
            editButton.onclick = () => populateCashJournalForm(record);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600';
            deleteButton.onclick = () => deleteCashJournal(record._id);
            actionsCell.appendChild(deleteButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });
}

async function submitCashJournalForm(event) {
    event.preventDefault();
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    const isBarStaffLike = ['bar_staff', 'Woniala Joshua', 'Martha'].includes(currentUserRole);

    if (!isAdminLike && !isBarStaffLike) { // Only admin-like or bar_staff-like can record cash entries
        showMessage('Permission Denied: You do not have permission to record cash entries.');
        return;
    }
    const id = document.getElementById('cash-journal-id').value;
    const cashAtHand = parseFloat(document.getElementById('cash-at-hand').value);
    const cashBanked = parseFloat(document.getElementById('cash-banked').value);
    const bankReceiptId = document.getElementById('bank-receipt-id').value;
    const responsiblePerson = document.getElementById('responsible-person').value;
    const date = document.getElementById('cash-date').value;

    // Basic validation
    if (isNaN(cashAtHand) || isNaN(cashBanked) || !responsiblePerson || !date) {
        showMessage('Please fill all cash journal fields with valid data.');
        return;
    }

    const cashData = { cashAtHand, cashBanked, bankReceiptId, responsiblePerson, date };

    try {
        let response;
        if (id) { // Edit operation (Admin-like only)
            if (!isAdminLike) {
                showMessage('Permission Denied: Only administrators can edit cash entries.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/cash-journal/${id}`, {
                method: 'PUT',
                body: JSON.stringify(cashData)
            });
        } else { // New entry creation (Admin-like or Bar Staff-like)
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
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can delete cash entries.');
        return;
    }
    const confirmed = await showConfirm('Are you sure you want to delete this cash journal entry?');
    if (!confirmed) return;

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
}

// --- Reports Functions ---
function getDepartmentFromText(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith('bar-') || lowerText.includes('bar ')) return 'Bar';
    if (lowerText.startsWith('rest-') || lowerText.includes('restaurant')) return 'Restaurant';
    if (lowerText.startsWith('conf-') || lowerText.includes('conference')) return 'Conference';
    if (lowerText.startsWith('grdn-') || lowerText.includes('garden')) return 'Gardens';
    if (lowerText.startsWith('accomm-') || lowerText.includes('accommodation') || lowerText.includes('room')) return 'Accommodation';
    return 'Other'; // Default to 'Other' if no match
}

async function generateReports() {
    // Determine if the current user has admin-like privileges for reports
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can generate reports.');
        return;
    }

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
        overallBalanceElement.className = overallBalance >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'; // Tailwind classes

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
                balanceCell.className = deptBalance >= 0 ? 'text-green-600' : 'text-red-600'; // Tailwind classes
            });
        }

    } catch (error) {
        console.error('Error generating reports:', error);
        showMessage('Failed to generate reports: ' + error.message);
    }
}


// --- Audit Logs Functions ---
async function fetchAuditLogs() {
    // Determine if the current user has admin-like privileges for audit logs
    const isAdminLike = ['admin', 'Nachwera Richard', 'Wanambi Nelson', 'Nabudde Florence'].includes(currentUserRole);
    if (!isAdminLike) {
        showMessage('Permission Denied: Only administrators can view audit logs.');
        return;
    }

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
    container.innerHTML = '';
    container.className = 'flex justify-center space-x-2 mt-4'; // Tailwind for pagination

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-md ${i === current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        btn.disabled = i === current;
        btn.onclick = () => {
            currentAuditPage = i;
            fetchAuditLogs();
        };
        container.appendChild(btn);
    }
}


function renderAuditLogsTable(logs) {
    const tbody = document.querySelector('#audit-logs-table tbody');
    tbody.innerHTML = '';
    if (logs.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.className = 'text-center text-gray-500 py-4';
        cell.textContent = 'No audit logs found.';
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
    // Setup custom message box
    setupMessageBox();

    // Check authentication status on page load
    // Initialize currentUserRole from localStorage first
    const storedAuthToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedAuthToken && storedUsername && storedUserRole) {
        authToken = storedAuthToken;
        currentUsername = storedUsername;
        currentUserRole = storedUserRole;
    } else {
        // If no stored session, ensure login form is shown
        authToken = '';
        currentUsername = '';
        currentUserRole = '';
        localStorage.clear();
    }
    updateUIForUserRole();

    // Attach form submission handlers
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('inventory-form').addEventListener('submit', submitInventoryForm);
    document.getElementById('sale-form').addEventListener('submit', submitSaleForm);
    document.getElementById('expense-form').addEventListener('submit', submitExpenseForm);
    document.getElementById('cash-journal-form').addEventListener('submit', submitCashJournalForm);

    // Attach navigation button handlers
    document.getElementById('nav-inventory').addEventListener('click', () => showSection('inventory'));
    document.getElementById('nav-sales').addEventListener('click', () => showSection('sales'));
    document.getElementById('nav-expenses').addEventListener('click', () => showSection('expenses'));
    document.getElementById('nav-cash-management').addEventListener('click', () => showSection('cash-management'));
    document.getElementById('nav-reports').addEventListener('click', () => showSection('reports'));
    document.getElementById('nav-audit-logs').addEventListener('click', () => showSection('audit-logs'));

    // Attach filter/report generation handlers
    document.getElementById('apply-inventory-filter').addEventListener('click', fetchInventory);
    document.getElementById('apply-sales-filter').addEventListener('click', fetchSales);
    document.getElementById('apply-expenses-filter').addEventListener('click', fetchExpenses);
    document.getElementById('apply-cash-filter').addEventListener('click', fetchCashJournal);
    document.getElementById('generate-report-btn').addEventListener('click', generateReports);


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
});
