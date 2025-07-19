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

// Centralized Role Definitions
const ADMIN_ROLES = ['Nachwera Richard', 'Nelson', 'Florence'];
const BAR_STAFF_ROLES = ['Martha', 'Joshua'];
const ENTRY_ROLES = [...ADMIN_ROLES, ...BAR_STAFF_ROLES]; // Roles allowed to record sales/expenses/cash entries

// --- Utility Functions ---

/**
 * Displays a native browser alert message to the user.
 * This function replaces any custom modal implementation for messages.
 * @param {string} message The message to display.
 * @param {function} [callback] Optional callback function to execute after the message is dismissed.
 */
function showMessage(message, callback = null) {
    alert(message);
    if (callback) {
        callback();
    }
}

/**
 * Displays a native browser confirmation dialog to the user.
 * This function replaces any custom modal implementation for confirmations.
 * @param {string} message The confirmation message.
 * @param {function} onConfirm Callback function if user confirms (clicks OK).
 * @param {function} [onCancel] Optional callback function if user cancels (clicks Cancel).
 */
function showConfirm(message, onConfirm, onCancel = null) {
    if (window.confirm(message)) {
        onConfirm();
    } else if (onCancel) {
        onCancel();
    }
}

/**
 * Formats a Date object into a 'YYYY-MM-DD' string for input fields.
 * @param {Date} date The date object to format.
 * @returns {string} The formatted date string (e.g., "2023-11-20").
 */
function formatDateToISO(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Applies specific UI restrictions for 'Martha' and 'Joshua' roles in sales, expenses, and cash management sections.
 * Hides relevant headings, filters, and tables, showing only the forms for these roles.
 * @param {string} sectionId The ID of the currently active section.
 */
function applyBarStaffUIRestrictions(sectionId) {
    const isBarStaff = BAR_STAFF_ROLES.includes(currentUserRole);

    // Define elements to toggle visibility for each section
    const elementsToToggle = {
        'sales': {
            heading: '#sales-section .sales-records-heading',
            filter: '#sales-section .sales-filter-controls',
            pagination: '#sales-section .pagination-controls',
            table: '#sales-table',
            exportButton: '#sales-section .export-button'
        },
        'expenses': {
            heading: '#expenses-section .expenses-records-heading',
            filter: '#expenses-section .expenses-filter-controls',
            pagination: '#expenses-section .pagination-controls',
            table: '#expenses-table'
        },
        'cash-management': {
            heading: '#cash-management-section .cash-header',
            filter: '#cash-management-section .filter-controls',
            table: '#cash-journal-table'
        }
    };

    for (const sectionKey in elementsToToggle) {
        const elements = elementsToToggle[sectionKey];
        // Determine the display style: 'none' if it's the current section AND bar staff, else 'block' or 'flex'
        const displayStyle = (sectionKey === sectionId && isBarStaff) ? 'none' : ''; // Use empty string to revert to default

        for (const key in elements) {
            const selector = elements[key];
            const element = document.querySelector(selector);
            if (element) {
                // Special handling for tables to ensure proper display 'table' or 'none'
                if (key === 'table') {
                    element.style.display = (displayStyle === 'none' ? 'none' : 'table');
                } else if (key === 'filter') {
                    // Filters are often flex containers
                    element.style.display = (displayStyle === 'none' ? 'none' : 'flex');
                } else {
                    element.style.display = displayStyle;
                }
            }
        }
    }
}

/**
 * Updates the display of the current logged-in user and manages navigation button visibility.
 * Hides the login form and shows main content upon successful login.
 */
function updateUIForUserRole() {
    const userDisplay = document.getElementById('current-user-display');
    const mobilNavDisplay = document.getElementById('mobil-nav');
    const mainContent = document.getElementById('main-content');
    const loginSection = document.getElementById('login-section');
    const mainContainer = document.getElementById('main-container');
    const navButtons = document.querySelectorAll('nav button');

    if (authToken && currentUserRole) {
        userDisplay.textContent = `User: ${currentUsername} (${currentUserRole})`;
        mobilNavDisplay.textContent = `User: ${currentUsername} (${currentUserRole})`;

        loginSection.style.display = 'none';
        mainContainer.style.display = 'block';
        mainContent.style.display = 'block';

        // Hide all nav buttons first
        navButtons.forEach(button => {
            button.style.display = 'none';
        });

        // Show buttons based on role
        if (ADMIN_ROLES.includes(currentUserRole)) {
            document.getElementById('nav-inventory').style.display = 'inline-block';
            document.getElementById('nav-sales').style.display = 'inline-block';
            document.getElementById('nav-expenses').style.display = 'inline-block';
            document.getElementById('nav-cash-management').style.display = 'inline-block';
            document.getElementById('nav-reports').style.display = 'inline-block';
            document.getElementById('nav-audit-logs').style.display = 'inline-block';
            showSection('inventory'); // Default section for admins
        } else if (BAR_STAFF_ROLES.includes(currentUserRole)) {
            document.getElementById('nav-sales').style.display = 'inline-block';
            document.getElementById('nav-expenses').style.display = 'inline-block';
            document.getElementById('nav-cash-management').style.display = 'inline-block';
            showSection('sales'); // Default section for bar staff
        } else {
            // Fallback for roles not explicitly handled, perhaps just log out or show a minimal UI
            showMessage('Unknown user role. Logging out.');
            logout();
        }
    } else {
        // Not logged in: Show login section, hide main container
        userDisplay.textContent = '';
        mobilNavDisplay.textContent = '';
        mainContent.style.display = 'none';
        mainContainer.style.display = 'none';
        loginSection.style.display = 'block';
    }
}

/**
 * Hides all content sections and displays the specified one.
 * Also handles initial data fetching for the selected section and role-specific UI adjustments.
 * @param {string} sectionId The ID of the section to activate (e.g., 'inventory', 'sales').
 */
function showSection(sectionId) {
    // Define allowed sections per role for robust access control
    const allowedSections = {
        [ADMIN_ROLES[0]]: ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        [ADMIN_ROLES[1]]: ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        [ADMIN_ROLES[2]]: ['inventory', 'sales', 'expenses', 'cash-management', 'reports', 'audit-logs'],
        [BAR_STAFF_ROROLES[0]]: ['sales', 'expenses', 'cash-management'],
        [BAR_STAFF_ROLES[1]]: ['sales', 'expenses', 'cash-management']
    };

    // Check if the current user role is allowed to view the requested section
    if (currentUserRole && !allowedSections[currentUserRole]?.includes(sectionId)) {
        showMessage('Access Denied: You do not have permission to view this section.');
        // Redirect to a default allowed section if unauthorized access is attempted
        if (ADMIN_ROLES.includes(currentUserRole)) {
            showSection('inventory');
        } else if (BAR_STAFF_ROLES.includes(currentUserRole)) {
            showSection('sales');
        }
        return;
    }

    // Deactivate all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Activate the requested section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`Section with ID '${sectionId}-section' not found.`);
        return;
    }

    // Apply specific UI adjustments for bar staff for relevant sections
    applyBarStaffUIRestrictions(sectionId);

    const todayString = formatDateToISO(new Date());

    // Fetch data or set default values based on the active section
    switch (sectionId) {
        case 'inventory':
            fetchInventory();
            break;
        case 'sales':
            // Bar staff see only the form, others see the table
            if (BAR_STAFF_ROLES.includes(currentUserRole)) {
                const salesTbody = document.querySelector('#sales-table tbody');
                if (salesTbody) {
                    salesTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #555;">Use the form above to record a new sale.</td></tr>'; // Adjusted colspan for new columns
                }
                document.getElementById('sales-date-filter').value = todayString;
            } else {
                fetchSales();
            }
            break;
        case 'expenses':
            // Similar logic for expenses
            if (BAR_STAFF_ROLES.includes(currentUserRole)) {
                const expensesTbody = document.querySelector('#expenses-table tbody');
                if (expensesTbody) {
                    expensesTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #555;">Use the form above to record a new expense.</td></tr>';
                }
                document.getElementById('expenses-date-filter').value = todayString;
            } else {
                fetchExpenses();
            }
            break;
        case 'cash-management':
            document.getElementById('cash-date').value = todayString;
            document.getElementById('cash-filter-date').value = todayString;
            fetchCashJournal();
            break;
        case 'reports':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            document.getElementById('report-start-date').value = formatDateToISO(thirtyDaysAgo);
            document.getElementById('report-end-date').value = todayString;
            generateReports();
            break;
        case 'audit-logs':
            fetchAuditLogs();
            break;
    }
}

/**
 * A wrapper around the native `fetch` API that includes authentication headers
 * and handles common HTTP errors (401 Unauthorized, 403 Forbidden).
 * @param {string} url The URL to fetch data from.
 * @param {object} [options={}] Optional fetch configuration (method, headers, body, etc.).
 * @returns {Promise<Response|null>} A Promise that resolves to the `Response` object if successful,
 * or `null` if there's an authentication/permission issue or network error.
 */
async function authenticatedFetch(url, options = {}) {
    if (!authToken) {
        showMessage('You are not logged in. Please log in first.', logout);
        return null;
    }

    // Ensure headers exist and set Content-Type if not already set
    options.headers = {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers // Allow overriding Content-Type if needed
    };

    try {
        const response = await fetch(url, options);

        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({})); // Try parsing, but don't fail if not JSON
            showMessage(`Access Denied: ${errorData.error || 'Invalid credentials or insufficient permissions.'}`, logout);
            return null; // Indicate failure to caller
        }
        // Handle non-2xx responses, except 204 No Content which is okay
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        return response; // Return response for successful operations (including 204)
    } catch (error) {
        console.error('Network or fetch error:', error);
        showMessage('Could not connect to the server or process request: ' + error.message);
        return null;
    }
}

// --- Login/Logout Functions ---
async function login() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        loginMessage.textContent = 'Please enter both username and password.';
        return;
    }

    loginMessage.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            // Store basic authentication token (Base64 encoded "username:password")
            authToken = btoa(`${username}:${password}`);
            currentUsername = data.username;
            currentUserRole = data.role;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', currentUsername);
            localStorage.setItem('userRole', currentUserRole);

            loginMessage.textContent = 'Login successful!';
            updateUIForUserRole(); // Update UI based on new login status
        } else {
            const errorData = await response.json().catch(() => ({}));
            loginMessage.textContent = errorData.error || 'Invalid username or password.';
            logout(); // Clear potentially stale tokens/roles
        }
    } catch (error) {
        console.error('Login error:', error);
        loginMessage.textContent = 'Network error or server unavailable. Please try again.';
        logout(); // Ensure a clean state on network errors
    }
}

async function logout() {
    // Attempt to notify backend of logout. This is a best-effort;
    // client-side state is cleared regardless of backend response.
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.warn('Backend logout notification failed (could be network issue or already logged out):', error);
    }

    // Clear all client-side authentication state
    authToken = '';
    currentUsername = '';
    currentUserRole = '';
    localStorage.clear(); // Clear all items from local storage

    updateUIForUserRole(); // Reset UI to the logged-out state (show login form)
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-message').textContent = '';
}

// --- Inventory Functions ---

/**
 * Fetches inventory items from the API, applying filters and pagination.
 */
async function fetchInventory() {
    try {
        const itemFilter = document.getElementById('search-inventory-item').value.trim();
        const lowFilter = document.getElementById('search-inventory-low').value.trim(); // This is likely for filtering low stock

        const params = new URLSearchParams();
        if (itemFilter) params.append('item', itemFilter);
        if (lowFilter) params.append('low', lowFilter);
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);

        const response = await authenticatedFetch(`${API_BASE_URL}/inventory?${params.toString()}`);
        if (!response) return; // If fetch failed (e.g., auth error), stop

        const result = await response.json();
        renderInventoryTable(result.data);
        renderPagination(result.page, result.pages, 'pagination', currentPage, (page) => {
            currentPage = page; // Update the global page variable for inventory
            fetchInventory(); // Re-fetch inventory for the new page
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        showMessage('Failed to fetch inventory: ' + error.message);
    }
}

/**
 * Renders generic pagination controls for a given container.
 * @param {number} current The current page number.
 * @param {number} totalPages The total number of pages.
 * @param {string} containerId The ID of the HTML element where pagination buttons will be rendered.
 * @param {number} pageVar A reference to the global page variable (e.g., `currentPage`, `currentSalesPage`).
 * @param {function} fetchFunction The function to call when a page button is clicked (e.g., `fetchInventory`).
 */
function renderPagination(current, totalPages, containerId, pageVar, fetchFunction) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Pagination container with ID '${containerId}' not found.`);
        return;
    }
    container.innerHTML = ''; // Clear existing buttons

    // "Previous" button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Prev';
    prevButton.disabled = current === 1;
    prevButton.onclick = () => {
        pageVar--; // Decrement the global page variable
        fetchFunction(); // Call the specific fetch function
    };
    container.appendChild(prevButton);

    // Page information (e.g., "Page 1 of 5")
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${current} of ${totalPages || 1}`; // Show at least "1 of 1" if no pages
    pageInfo.classList.add('page-info');
    container.appendChild(pageInfo);

    // "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = current === totalPages || totalPages === 0; // Disable if on last page or no pages
    nextButton.onclick = () => {
        pageVar++; // Increment the global page variable
        fetchFunction(); // Call the specific fetch function
    };
    container.appendChild(nextButton);
}

/**
 * Renders the inventory data into the inventory table.
 * @param {Array<object>} inventory An array of inventory item objects.
 */
function renderInventoryTable(inventory) {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) {
        console.error('Inventory table body not found.');
        return;
    }
    tbody.innerHTML = ''; // Clear existing rows

    if (inventory.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7; // Ensure colspan matches the number of columns in your HTML table header
        cell.textContent = 'No inventory items found. Try adjusting filters.';
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
        actionsCell.className = 'actions'; // For styling buttons

        if (ADMIN_ROLES.includes(currentUserRole)) {
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
            actionsCell.textContent = 'View Only'; // Non-admins cannot edit/delete
        }
    });
}

/**
 * Handles the submission of the inventory form (add or update).
 * @param {Event} event The form submission event.
 */
async function submitInventoryForm(event) {
    event.preventDefault(); // Prevent default form submission and page reload

    if (!ADMIN_ROLES.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can add/update inventory.');
        return;
    }

    // Get form values
    const id = document.getElementById('inventory-id').value; // Hidden ID field for edit operations
    const item = document.getElementById('item').value.trim();
    const opening = parseInt(document.getElementById('opening').value);
    const purchases = parseInt(document.getElementById('purchases').value);
    const sales = parseInt(document.getElementById('inventory-sales').value);
    const spoilage = parseInt(document.getElementById('spoilage').value);

    // Basic client-side validation
    if (!item || isNaN(opening) || isNaN(purchases) || isNaN(sales) || isNaN(spoilage)) {
        showMessage('Please fill in all inventory fields with valid numbers.');
        return;
    }

    const inventoryData = { item, opening, purchases, sales, spoilage };

    try {
        const method = id ? 'PUT' : 'POST'; // Determine if it's an update or new creation
        const url = id ? `${API_BASE_URL}/inventory/${id}` : `${API_BASE_URL}/inventory`;

        const response = await authenticatedFetch(url, {
            method: method,
            body: JSON.stringify(inventoryData)
        });

        if (response) {
            // Check for 204 No Content for DELETE/PUT, or parse JSON for POST/GET
            if (response.status !== 204) {
                await response.json(); // Consume the response body
            }
            showMessage(`Inventory item ${id ? 'updated' : 'added'} successfully!`);
            document.getElementById('inventory-form').reset(); // Clear the form
            document.getElementById('inventory-id').value = ''; // Clear the hidden ID
            fetchInventory(); // Refresh the inventory table
        }
    } catch (error) {
        console.error('Error saving inventory item:', error);
        showMessage('Failed to save inventory item: ' + error.message);
    }
}

/**
 * Populates the inventory form with data from a selected item for editing.
 * @param {object} item The inventory item object to populate the form with.
 */
function populateInventoryForm(item) {
    document.getElementById('inventory-id').value = item._id;
    document.getElementById('item').value = item.item;
    document.getElementById('opening').value = item.opening;
    document.getElementById('purchases').value = item.purchases;
    document.getElementById('inventory-sales').value = item.sales;
    document.getElementById('spoilage').value = item.spoilage;
}

/**
 * Deletes an inventory item after user confirmation.
 * @param {string} id The ID of the inventory item to delete.
 */
async function deleteInventory(id) {
    if (!ADMIN_ROLES.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can delete inventory.');
        return;
    }

    showConfirm('Are you sure you want to delete this inventory item?', async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'DELETE'
            });
            if (response && response.status === 204) { // 204 No Content is standard for successful DELETE
                showMessage('Inventory item deleted successfully!');
                fetchInventory(); // Refresh the table
            } else if (response) {
                // If it's not 204 but also not an error handled by authenticatedFetch (e.g., 400 Bad Request)
                const errorData = await response.json().catch(() => ({}));
                showMessage('Failed to delete inventory item: ' + (errorData.error || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            showMessage('Failed to delete inventory item: ' + error.message);
        }
    });
}

// --- Sales Functions ---

/**
 * Fetches sales records from the API, applying date filters and pagination.
 */
async function fetchSales() {
    try {
        const dateFilter = document.getElementById('sales-date-filter').value;
        const params = new URLSearchParams();
        if (dateFilter) params.append('date', dateFilter);
        params.append('page', currentSalesPage);
        params.append('limit', salesPerPage);

        const response = await authenticatedFetch(`${API_BASE_URL}/sales?${params.toString()}`);
        if (!response) return;

        const result = await response.json();
        renderSalesTable(result.data);
        renderPagination(result.page, result.pages, 'sales-pagination', currentSalesPage, (page) => {
            currentSalesPage = page; // Update global page variable for sales
            fetchSales(); // Re-fetch sales for the new page
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        showMessage('Failed to fetch sales: ' + error.message);
    }
}

/**
 * Renders the sales data into the sales table, including profit calculations.
 * @param {Array<object>} sales An array of sale record objects.
 */
function renderSalesTable(sales) {
    const tbody = document.querySelector('#sales-table tbody');
    if (!tbody) {
        console.error('Sales table body not found.');
        return;
    }

    // Special message for Martha/Joshua
    if (BAR_STAFF_ROLES.includes(currentUserRole)) {
        // Updated colspan to reflect the new profit columns
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #555;">Use the form above to record a new sale.</td></tr>';
        return;
    }

    tbody.innerHTML = ''; // Clear existing rows

    if (sales.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 8; // Updated colspan for new profit columns
        cell.textContent = 'No sales records found for this date. Try adjusting the filter.';
        cell.style.textAlign = 'center';
        return;
    }

    sales.forEach(sale => {
        const row = tbody.insertRow();
        const saleAmount = sale.number * sale.sp;
        const costAmount = sale.number * sale.bp;
        const profit = saleAmount - costAmount;
        const percentageProfit = (costAmount > 0) ? (profit / costAmount) * 100 : 0; // Avoid division by zero

        row.insertCell().textContent = sale.item;
        row.insertCell().textContent = sale.number;
        row.insertCell().textContent = sale.bp.toFixed(2); // Display with 2 decimal places
        row.insertCell().textContent = sale.sp.toFixed(2); // Display with 2 decimal places
        row.insertCell().textContent = profit.toFixed(2); // New: Profit
        row.insertCell().textContent = percentageProfit.toFixed(2) + '%'; // New: Percentage Profit
        row.insertCell().textContent = new Date(sale.date).toLocaleDateString();
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        if (ADMIN_ROLES.includes(currentUserRole)) {
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

/**
 * Handles the submission of the sales form (add or update).
 * @param {Event} event The form submission event.
 */
async function submitSaleForm(event) {
    event.preventDefault();

    if (!ENTRY_ROLES.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record sales.');
        return;
    }

    const id = document.getElementById('sale-id').value;
    const item = document.getElementById('sale-item').value.trim();
    const number = parseInt(document.getElementById('sale-number').value);
    const bp = parseFloat(document.getElementById('sale-bp').value);
    const sp = parseFloat(document.getElementById('sale-sp').value);

    // Basic validation
    if (!item || isNaN(number) || isNaN(bp) || isNaN(sp) || number <= 0 || bp < 0 || sp < 0) {
        showMessage('Please fill in all sales fields correctly (Number, BP, SP must be positive numbers).');
        return;
    }
    if (sp < bp) {
        showMessage('Selling Price (SP) cannot be less than Buying Price (BP).');
        return;
    }

    const saleData = { item, number, bp, sp };

    try {
        let response;
        if (id) {
            // Edit operation (only for admins)
            if (!ADMIN_ROLES.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit sales.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/sales/${id}`, {
                method: 'PUT',
                body: JSON.stringify(saleData)
            });
        } else {
            // New sale creation (all allowed roles)
            response = await authenticatedFetch(`${API_BASE_URL}/sales`, {
                method: 'POST',
                body: JSON.stringify(saleData)
            });
        }

        if (response) {
            if (response.status !== 204) { // Only try to parse if there's content
                await response.json();
            }
            showMessage(`Sale ${id ? 'updated' : 'recorded'} successfully!`);
            document.getElementById('sale-form').reset();
            document.getElementById('sale-id').value = ''; // Clear hidden ID
            // Refresh the table only if not bar staff (their table is empty by design)
            if (!BAR_STAFF_ROLES.includes(currentUserRole)) {
                fetchSales();
            }
        }
    } catch (error) {
        console.error('Error recording sale:', error);
        showMessage('Failed to record sale: ' + error.message);
    }
}

/**
 * Populates the sales form with data from a selected sale record for editing.
 * @param {object} sale The sale record object.
 */
function populateSaleForm(sale) {
    document.getElementById('sale-id').value = sale._id;
    document.getElementById('sale-item').value = sale.item;
    document.getElementById('sale-number').value = sale.number;
    document.getElementById('sale-bp').value = sale.bp;
    document.getElementById('sale-sp').value = sale.sp;
}

/**
 * Deletes a sale record after user confirmation.
 * @param {string} id The ID of the sale record to delete.
 */
async function deleteSale(id) {
    if (!ADMIN_ROLES.includes(currentUserRole)) {
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
                fetchSales(); // Refresh the table
            } else if (response) {
                const errorData = await response.json().catch(() => ({}));
                showMessage('Failed to delete sale record: ' + (errorData.error || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Error deleting sale record:', error);
            showMessage('Failed to delete sale record: ' + error.message);
        }
    });
}

// --- Expenses Functions ---

/**
 * Fetches expense records from the API, applying date filters and pagination.
 */
async function fetchExpenses() {
    try {
        const dateFilter = document.getElementById('expenses-date-filter').value;
        const params = new URLSearchParams();

        if (dateFilter) params.append('date', dateFilter);
        params.append('page', currentExpensesPage);
        params.append('limit', expensesPerPage);

        const response = await authenticatedFetch(`${API_BASE_URL}/expenses?${params.toString()}`);
        if (!response) return;

        const result = await response.json();
        renderExpensesTable(result.data);
        renderPagination(result.page, result.pages, 'expenses-pagination', currentExpensesPage, (page) => {
            currentExpensesPage = page;
            fetchExpenses();
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        showMessage('Failed to fetch expenses: ' + error.message);
    }
}

/**
 * Renders the expense data into the expenses table.
 * @param {Array<object>} expenses An array of expense record objects.
 */
function renderExpensesTable(expenses) {
    const tbody = document.querySelector('#expenses-table tbody');
    if (!tbody) {
        console.error('Expenses table body not found.');
        return;
    }

    // Special message for Martha/Joshua
    if (BAR_STAFF_ROLES.includes(currentUserRole)) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #555;">Use the form above to record a new expense.</td></tr>';
        return;
    }

    tbody.innerHTML = ''; // Clear existing rows
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
        row.insertCell().textContent = expense.amount.toFixed(2); // Format currency
        row.insertCell().textContent = new Date(expense.date).toLocaleDateString();
        row.insertCell().textContent = expense.receiptId || 'N/A'; // Use 'N/A' for empty values
        row.insertCell().textContent = expense.source || 'N/A';
        row.insertCell().textContent = expense.responsible || 'N/A';
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        if (ADMIN_ROLES.includes(currentUserRole)) {
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

/**
 * Handles the submission of the expense form (add or update).
 * @param {Event} event The form submission event.
 */
async function submitExpenseForm(event) {
    event.preventDefault();

    if (!ENTRY_ROLES.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record expenses.');
        return;
    }

    const id = document.getElementById('expense-id').value;
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const receiptId = document.getElementById('expense-receiptId').value.trim();
    const source = document.getElementById('expense-source').value.trim();
    const responsible = document.getElementById('expense-responsible').value.trim();

    // Basic validation
    if (!description || isNaN(amount) || amount <= 0 || !responsible) {
        showMessage('Please fill in description, a positive amount, and responsible person for the expense.');
        return;
    }

    const expenseData = { description, amount, receiptId, source, responsible };

    try {
        let response;
        if (id) {
            // Edit operation (only for admins)
            if (!ADMIN_ROLES.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit expenses.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(expenseData)
            });
        } else {
            // New expense creation (all allowed roles)
            response = await authenticatedFetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });
        }

        if (response) {
            if (response.status !== 204) {
                await response.json();
            }
            showMessage(`Expense ${id ? 'updated' : 'recorded'} successfully!`);
            document.getElementById('expense-form').reset();
            document.getElementById('expense-id').value = ''; // Clear hidden ID
            if (!BAR_STAFF_ROLES.includes(currentUserRole)) {
                fetchExpenses();
            }
        }
    } catch (error) {
        console.error('Error recording expense:', error);
        showMessage('Failed to record expense: ' + error.message);
    }
}

/**
 * Populates the expense form with data from a selected expense record for editing.
 * @param {object} expense The expense record object.
 */
function populateExpenseForm(expense) {
    document.getElementById('expense-id').value = expense._id;
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-receiptId').value = expense.receiptId || '';
    document.getElementById('expense-source').value = expense.source || '';
    document.getElementById('expense-responsible').value = expense.responsible || '';
}

/**
 * Deletes an expense record after user confirmation.
 * @param {string} id The ID of the expense record to delete.
 */
async function deleteExpense(id) {
    if (!ADMIN_ROLES.includes(currentUserRole)) {
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
                fetchExpenses(); // Refresh the table
            } else if (response) {
                const errorData = await response.json().catch(() => ({}));
                showMessage('Failed to delete expense record: ' + (errorData.error || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Error deleting expense record:', error);
            showMessage('Failed to delete expense record: ' + error.message);
        }
    });
}

// --- Cash Management Functions ---

/**
 * Fetches cash journal entries from the API, applying date and responsible person filters.
 */
async function fetchCashJournal() {
    try {
        const dateFilter = document.getElementById('cash-filter-date').value;
        const responsibleFilter = document.getElementById('cash-filter-responsible').value.trim();

        const params = new URLSearchParams();
        if (dateFilter) params.append('date', dateFilter);
        if (responsibleFilter) params.append('responsiblePerson', responsibleFilter);

        const response = await authenticatedFetch(`${API_BASE_URL}/cash-journal?${params.toString()}`);
        if (!response) return;

        const records = await response.json();
        renderCashJournalTable(records);
    } catch (error) {
        console.error('Error fetching cash journal:', error);
        showMessage('Failed to fetch cash journal: ' + error.message);
    }
}

/**
 * Renders cash journal entries into the cash journal table.
 * @param {Array<object>} records An array of cash journal entry objects.
 */
function renderCashJournalTable(records) {
    const tbody = document.querySelector('#cash-journal-table tbody');
    if (!tbody) {
        console.error('Cash journal table body not found.');
        return;
    }

    // Special message for Martha/Joshua
    if (BAR_STAFF_ROLES.includes(currentUserRole)) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #555;">Use the form above to record a new cash entry.</td></tr>';
        return;
    }

    tbody.innerHTML = ''; // Clear existing rows
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
        row.insertCell().textContent = record.bankReceiptId || 'N/A';
        row.insertCell().textContent = record.responsiblePerson;
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        if (ADMIN_ROLES.includes(currentUserRole)) {
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

/**
 * Handles the submission of the cash journal form (add or update).
 * @param {Event} event The form submission event.
 */
async function submitCashJournalForm(event) {
    event.preventDefault();

    if (!ENTRY_ROLES.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record cash entries.');
        return;
    }

    const id = document.getElementById('cash-journal-id').value;
    const cashAtHand = parseFloat(document.getElementById('cash-at-hand').value);
    const cashBanked = parseFloat(document.getElementById('cash-banked').value);
    const bankReceiptId = document.getElementById('bank-receipt-id').value.trim();
    const responsiblePerson = document.getElementById('responsible-person').value.trim();
    const date = document.getElementById('cash-date').value; // Date should be YYYY-MM-DD from input

    // Basic validation
    if (isNaN(cashAtHand) || isNaN(cashBanked) || cashAtHand < 0 || cashBanked < 0 || !responsiblePerson || !date) {
        showMessage('Please fill in Cash At Hand, Cash Banked, Responsible Person, and Date correctly.');
        return;
    }

    const cashData = { cashAtHand, cashBanked, bankReceiptId, responsiblePerson, date };

    try {
        let response;
        if (id) {
            // Edit operation (only for admins)
            if (!ADMIN_ROLES.includes(currentUserRole)) {
                showMessage('Permission Denied: Only administrators can edit cash entries.');
                return;
            }
            response = await authenticatedFetch(`${API_BASE_URL}/cash-journal/${id}`, {
                method: 'PUT',
                body: JSON.stringify(cashData)
            });
        } else {
            // New entry creation (all allowed roles)
            response = await authenticatedFetch(`${API_BASE_URL}/cash-journal`, {
                method: 'POST',
                body: JSON.stringify(cashData)
            });
        }

        if (response) {
            if (response.status !== 204) {
                await response.json();
            }
            showMessage(`Cash entry ${id ? 'updated' : 'saved'} successfully!`);
            document.getElementById('cash-journal-form').reset();
            document.getElementById('cash-journal-id').value = ''; // Clear hidden ID
            // Set date back to today after successful submission for new entry convenience
            document.getElementById('cash-date').value = formatDateToISO(new Date());
            fetchCashJournal(); // Refresh the table
        }
    } catch (error) {
        console.error('Error saving cash entry:', error);
        showMessage('Failed to save cash entry: ' + error.message);
    }
}

/**
 * Populates the cash journal form with data from a selected entry for editing.
 * @param {object} record The cash journal entry object.
 */
function populateCashJournalForm(record) {
    document.getElementById('cash-journal-id').value = record._id;
    document.getElementById('cash-at-hand').value = record.cashAtHand;
    document.getElementById('cash-banked').value = record.cashBanked;
    document.getElementById('bank-receipt-id').value = record.bankReceiptId || '';
    document.getElementById('responsible-person').value = record.responsiblePerson;
    // Date input expects 'YYYY-MM-DD'
    document.getElementById('cash-date').value = new Date(record.date).toISOString().split('T')[0];
}

/**
 * Deletes a cash journal entry after user confirmation.
 * @param {string} id The ID of the cash journal entry to delete.
 */
async function deleteCashJournal(id) {
    if (!ADMIN_ROLES.includes(currentUserRole)) {
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
                fetchCashJournal(); // Refresh the table
            } else if (response) {
                const errorData = await response.json().catch(() => ({}));
                showMessage('Failed to delete cash entry: ' + (errorData.error || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Error deleting cash entry:', error);
            showMessage('Failed to delete cash entry: ' + error.message);
        }
    });
}

// --- Reports Functions ---

/**
 * Determines the department based on keywords in an item description or source.
 * This is a heuristic and might need fine-tuning based on actual data patterns.
 * @param {string} text The item description or expense source string.
 * @returns {string} The identified department (e.g., 'Bar', 'Restaurant').
 */
function getDepartmentFromText(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith('bar-') || lowerText.includes('bar ')) return 'Bar';
    if (lowerText.startsWith('rest-') || lowerText.includes('restaurant')) return 'Restaurant';
    if (lowerText.startsWith('conf-') || lowerText.includes('conference')) return 'Conference';
    if (lowerText.startsWith('grdn-') || lowerText.includes('garden')) return 'Gardens';
    if (lowerText.startsWith('accomm-') || lowerText.includes('accommodation') || lowerText.includes('room')) return 'Accommodation';
    return 'Other/General'; // Default department if not matched
}

/**
 * Generates and displays sales and expense reports aggregated by department for a selected date range.
 */
async function generateReports() {
    const startDateString = document.getElementById('report-start-date').value;
    const endDateString = document.getElementById('report-end-date').value;

    if (!startDateString || !endDateString) {
        showMessage('Please select both a start and end date for the report.');
        return;
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    endDate.setHours(23, 59, 59, 999); // Set to end of day to include all data for the end date

    let allExpenses = [];
    let allSales = [];

    const tbody = document.getElementById('department-report-tbody');
    if (!tbody) {
        console.error('Department report table body not found.');
        return;
    }
    tbody.innerHTML = ''; // Clear any existing rows

    try {
        // Fetch all sales (assuming API supports fetching all for date range, or client-side filtering)
        // Note: Your current /sales and /expenses endpoints seem to support pagination.
        // For reports, you might need a backend endpoint that aggregates or returns all data for a date range,
        // or iterate through pages if the dataset is large. For now, fetching all and filtering client-side.
        const salesResponse = await authenticatedFetch(`${API_BASE_URL}/sales?limit=10000`); // Fetch a large enough limit
        if (salesResponse) {
            const salesData = await salesResponse.json();
            if (Array.isArray(salesData.data)) {
                // Filter sales by date range client-side
                allSales = salesData.data.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= startDate && saleDate <= endDate;
                });
            } else {
                console.warn('API /sales did not return an array for data:', salesData);
            }
        }

        // Fetch all expenses
        const expensesResponse = await authenticatedFetch(`${API_BASE_URL}/expenses?limit=10000`); // Fetch a large enough limit
        if (expensesResponse) {
            const expensesData = await expensesResponse.json();
            if (Array.isArray(expensesData.data)) {
                // Filter expenses by date range client-side
                allExpenses = expensesData.data.filter(e => {
                    const expenseDate = new Date(e.date);
                    return expenseDate >= startDate && expenseDate <= endDate;
                });
            } else {
                console.warn('API /expenses did not return an array for data:', expensesData);
            }
        }

        const departmentReports = {};
        let overallSales = 0;
        let overallExpenses = 0;

        // Aggregate sales by department
        allSales.forEach(sale => {
            const department = getDepartmentFromText(sale.item);
            const saleAmount = sale.number * sale.sp;

            overallSales += saleAmount;
            if (!departmentReports[department]) {
                departmentReports[department] = { sales: 0, expenses: 0 };
            }
            departmentReports[department].sales += saleAmount;
        });

        // Aggregate expenses by department
        allExpenses.forEach(expense => {
            const department = getDepartmentFromText(expense.description + ' ' + (expense.source || '')); // Use description and source for department mapping

            overallExpenses += expense.amount;
            if (!departmentReports[department]) {
                departmentReports[department] = { sales: 0, expenses: 0 };
            }
            departmentReports[department].expenses += expense.amount;
        });

        // Update overall summary
        document.getElementById('overall-sales').textContent = overallSales.toFixed(2);
        document.getElementById('overall-expenses').textContent = overallExpenses.toFixed(2);
        const overallBalance = overallSales - overallExpenses;
        const overallBalanceElement = document.getElementById('overall-balance');
        overallBalanceElement.textContent = overallBalance.toFixed(2);
        // Apply styling based on balance (positive/negative)
        overallBalanceElement.className = overallBalance >= 0 ? 'positive' : 'negative';

        // Render department-wise report
        const sortedDepartments = Object.keys(departmentReports).sort(); // Sort departments alphabetically
        if (sortedDepartments.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'No data found for the selected period or departments.';
            cell.className = 'text-center py-4 text-gray-500'; // Basic styling for no data message
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

/**
 * Debounce function to limit how often a function is called.
 * Useful for inputs where you don't want to trigger an event on every keystroke.
 * @param {function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {function} The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Fetches audit logs from the API, applying search queries and pagination.
 */
async function fetchAuditLogs() {
    try {
        const params = new URLSearchParams();
        params.append('page', currentAuditPage);
        params.append('limit', auditLogsPerPage);

        const searchQuery = document.getElementById('audit-search-input').value.trim();
        if (searchQuery) {
            params.append('search', searchQuery); // Add search query parameter
        }

        const response = await authenticatedFetch(`${API_BASE_URL}/audit-logs?${params.toString()}`);
        if (!response) return;

        const result = await response.json();
        renderAuditLogsTable(result.data);
        // Using generic renderPagination but passing specific variables for audit logs
        renderPagination(result.page, result.pages, 'audit-pagination', currentAuditPage, (page) => {
            currentAuditPage = page;
            fetchAuditLogs();
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        showMessage('Failed to fetch audit logs: ' + error.message);
    }
}

/**
 * Renders audit log entries into the audit logs table.
 * @param {Array<object>} logs An array of audit log objects.
 */
function renderAuditLogsTable(logs) {
    const tbody = document.querySelector('#audit-logs-table tbody');
    if (!tbody) {
        console.error('Audit logs table body not found.');
        return;
    }
    tbody.innerHTML = ''; // Clear existing rows

    if (logs.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4; // Ensure colspan matches the table header
        cell.textContent = 'No audit logs found for the current filter.';
        cell.style.textAlign = 'center';
        return;
    }

    logs.forEach(log => {
        const row = tbody.insertRow();
        row.insertCell().textContent = new Date(log.timestamp).toLocaleString();
        row.insertCell().textContent = log.user;
        row.insertCell().textContent = log.action;
        // Display details as a string; consider using a more formatted approach for complex objects if needed
        row.insertCell().textContent = JSON.stringify(log.details);
    });
}


// --- Initial Setup and Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status and update UI when the DOM is fully loaded
    updateUIForUserRole();

    // Attach form submission handlers
    // !!! IMPORTANT: Ensure these IDs exist in your HTML !!!
    // If any of these are null, you will get the addEventListener error.
    const inventoryForm = document.getElementById('inventory-form');
    if (inventoryForm) inventoryForm.addEventListener('submit', submitInventoryForm); else console.error("Element #inventory-form not found.");

    const saleForm = document.getElementById('sale-form');
    if (saleForm) saleForm.addEventListener('submit', submitSaleForm); else console.error("Element #sale-form not found.");

    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) expenseForm.addEventListener('submit', submitExpenseForm); else console.error("Element #expense-form not found.");

    const cashJournalForm = document.getElementById('cash-journal-form');
    if (cashJournalForm) cashJournalForm.addEventListener('submit', submitCashJournalForm); else console.error("Element #cash-journal-form not found.");


    // Set initial date filters for various sections
    const today = new Date();
    const todayString = formatDateToISO(today);

    // Set default dates for forms and filters
    const salesDateFilter = document.getElementById('sales-date-filter');
    if (salesDateFilter) salesDateFilter.value = todayString; else console.error("Element #sales-date-filter not found.");

    const expensesDateFilter = document.getElementById('expenses-date-filter');
    if (expensesDateFilter) expensesDateFilter.value = todayString; else console.error("Element #expenses-date-filter not found.");

    const cashDateInput = document.getElementById('cash-date');
    if (cashDateInput) cashDateInput.value = todayString; else console.error("Element #cash-date not found.");

    const cashFilterDate = document.getElementById('cash-filter-date');
    if (cashFilterDate) cashFilterDate.value = todayString; else console.error("Element #cash-filter-date not found.");


    // For reports, set default to last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const reportStartDate = document.getElementById('report-start-date');
    if (reportStartDate) reportStartDate.value = formatDateToISO(thirtyDaysAgo); else console.error("Element #report-start-date not found.");

    const reportEndDate = document.getElementById('report-end-date');
    if (reportEndDate) reportEndDate.value = todayString; else console.error("Element #report-end-date not found.");


    // Attach event listeners for login/logout forms and buttons
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    }); else console.error("Element #login-form not found.");

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) logoutButton.addEventListener('click', logout); else console.error("Element #logout-button not found.");


    // Attach event listeners for main navigation buttons
    const navInventory = document.getElementById('nav-inventory');
    if (navInventory) navInventory.addEventListener('click', () => showSection('inventory')); else console.error("Element #nav-inventory not found.");

    const navSales = document.getElementById('nav-sales');
    if (navSales) navSales.addEventListener('click', () => showSection('sales')); else console.error("Element #nav-sales not found.");

    const navExpenses = document.getElementById('nav-expenses');
    if (navExpenses) navExpenses.addEventListener('click', () => showSection('expenses')); else console.error("Element #nav-expenses not found.");

    const navCashManagement = document.getElementById('nav-cash-management');
    if (navCashManagement) navCashManagement.addEventListener('click', () => showSection('cash-management')); else console.error("Element #nav-cash-management not found.");

    const navReports = document.getElementById('nav-reports');
    if (navReports) navReports.addEventListener('click', () => showSection('reports')); else console.error("Element #nav-reports not found.");

    const navAuditLogs = document.getElementById('nav-audit-logs');
    if (navAuditLogs) navAuditLogs.addEventListener('click', () => showSection('audit-logs')); else console.error("Element #nav-audit-logs not found.");


    // Attach filter event listeners
    const salesDateFilterInput = document.getElementById('sales-date-filter');
    if (salesDateFilterInput) salesDateFilterInput.addEventListener('change', () => { currentSalesPage = 1; fetchSales(); }); else console.error("Element #sales-date-filter for change listener not found.");

    const expensesDateFilterInput = document.getElementById('expenses-date-filter');
    if (expensesDateFilterInput) expensesDateFilterInput.addEventListener('change', () => { currentExpensesPage = 1; fetchExpenses(); }); else console.error("Element #expenses-date-filter for change listener not found.");

    const cashFilterDateInput = document.getElementById('cash-filter-date');
    if (cashFilterDateInput) cashFilterDateInput.addEventListener('change', () => fetchCashJournal()); else console.error("Element #cash-filter-date for change listener not found.");

    const cashFilterResponsibleInput = document.getElementById('cash-filter-responsible');
    if (cashFilterResponsibleInput) cashFilterResponsibleInput.addEventListener('change', () => fetchCashJournal()); else console.error("Element #cash-filter-responsible for change listener not found.");

    const inventorySearchItemInput = document.getElementById('search-inventory-item');
    if (inventorySearchItemInput) inventorySearchItemInput.addEventListener('input', debounce(() => { currentPage = 1; fetchInventory(); }, 300)); else console.error("Element #search-inventory-item not found.");

    const inventorySearchLowInput = document.getElementById('search-inventory-low');
    if (inventorySearchLowInput) inventorySearchLowInput.addEventListener('input', debounce(() => { currentPage = 1; fetchInventory(); }, 300)); else console.error("Element #search-inventory-low not found.");

    const generateReportButton = document.getElementById('generate-report-button');
    if (generateReportButton) generateReportButton.addEventListener('click', generateReports); else console.error("Element #generate-report-button not found.");

    const auditSearchInput = document.getElementById('audit-search-input');
    // Debounce the fetchAuditLogs call to avoid too many requests
    const debouncedFetchAuditLogs = debounce(() => {
        currentAuditPage = 1; // Reset to the first page when a new search is initiated
        fetchAuditLogs();
    }, 300); // 300ms debounce delay

    if (auditSearchInput) auditSearchInput.addEventListener('input', debouncedFetchAuditLogs); else console.error("Element #audit-search-input not found.");

    // Initial fetch of audit logs (if that section is the default view for some roles)
    // This is handled by showSection already.
});
