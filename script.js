// --- Global Constants and Variables ---
const API_BASE_URL = 'http://localhost:3000/api'; // <--- IMPORTANT: Replace with your actual API base URL
let currentUserRole = ''; // This should be set upon successful login, e.g., 'Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence', or 'Guest'
let currentUsername = ''; // This should be set upon successful login

// Pagination defaults (adjust as needed)
let currentInventoryPage = 1;
const inventoryPerPage = 10;
let currentSalesPage = 1;
const salesPerPage = 10;
let currentExpensesPage = 1;
const expensesPerPage = 10;
let currentAuditPage = 1;
const auditLogsPerPage = 10;

// Centralized Role Definitions for better maintainability
const ADMIN_ROLES = ['Nachwera Richard', 'Nelson', 'Florence'];
const SALES_ENTRY_ROLES = ['Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence'];
const EXPENSE_ENTRY_ROLES = ['Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence'];
const CASH_ENTRY_ROLES = ['Nachwera Richard', 'Martha', 'Joshua', 'Nelson', 'Florence'];
const PROFIT_VIEW_ROLES = ['Nachwera Richard', 'Nelson', 'Florence']; // Roles that CAN see profit
const JOSHUA_ROLE = 'Joshua'; // Specific role for Joshua

// --- Utility Functions (Placeholders - Replace with your actual implementations) ---
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message-area'); // Assuming an element with this ID for messages
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = isError ? 'message error' : 'message success';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        console.log("Message:", message);
    }
}

async function authenticatedFetch(url, options = {}) {
    // This is a placeholder. Your actual implementation should:
    // 1. Get the JWT token from localStorage/sessionStorage.
    // 2. Add an 'Authorization' header with 'Bearer <token>'.
    // 3. Handle token expiration and refresh if necessary.
    // 4. Handle network errors and HTTP status codes (e.g., 401 Unauthorized).
    const token = localStorage.getItem('jwt_token'); // Or wherever you store it
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            showMessage('Session expired or unauthorized. Please log in again.', true);
            logout(); // Assuming logout redirects to login
            return null; // Important to return null or throw to stop execution
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error("Authenticated fetch error:", error);
        showMessage('Network or server error: ' + error.message, true);
        return null; // Return null to indicate failure
    }
}

function updateUIForUserRole() {
    // Placeholder: This function should dynamically update the UI based on `currentUserRole`
    // You'd typically call this after login and on page load.
    // Ensure `currentUserRole` is correctly set from login response.

    console.log("Updating UI for user role:", currentUserRole);

    // Get all navigation elements
    const navInventory = document.getElementById('nav-inventory');
    const navSales = document.getElementById('nav-sales');
    const navExpenses = document.getElementById('nav-expenses');
    const navCashManagement = document.getElementById('nav-cash-management');
    const navReports = document.getElementById('nav-reports');
    const navAuditLogs = document.getElementById('nav-audit-logs');
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section'); // Assuming a main dashboard
    const logoutButton = document.getElementById('logout-button');

    // Hide all sections and navigation by default
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    if (navInventory) navInventory.style.display = 'none';
    if (navSales) navSales.style.display = 'none';
    if (navExpenses) navExpenses.style.display = 'none';
    if (navCashManagement) navCashManagement.style.display = 'none';
    if (navReports) navReports.style.display = 'none';
    if (navAuditLogs) navAuditLogs.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'none';
    if (loginSection) loginSection.style.display = 'block'; // Show login by default

    if (currentUserRole) {
        // User is logged in
        if (loginSection) loginSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block'; // Show dashboard
        if (logoutButton) logoutButton.style.display = 'inline-block';

        // Show common navs
        if (navInventory) navInventory.style.display = 'block';
        if (navSales) navSales.style.display = 'block';

        // Specific restrictions for Joshua
        if (currentUserRole === JOSHUA_ROLE) {
            // Joshua should ONLY see Inventory and Sales
            if (navExpenses) navExpenses.style.display = 'none';
            if (navCashManagement) navCashManagement.style.display = 'none';
            if (navReports) navReports.style.display = 'none';
            if (navAuditLogs) navAuditLogs.style.display = 'none';
        } else {
            // Other roles (including Martha and Admins) see more
            if (navExpenses) navExpenses.style.display = 'block';
            if (navCashManagement) navCashManagement.style.display = 'block';
            if (navReports) navReports.style.display = 'block'; // Assuming non-Joshuas can see reports
            if (navAuditLogs) navAuditLogs.style.display = 'block'; // Assuming non-Joshuas can see audit logs
        }
        // Initially show the inventory section or a default one
        showSection('inventory'); // Assuming 'inventory' is the default landing page
    } else {
        // Not logged in, show login page
        showSection('login');
    }
}


function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }

    // Trigger data fetches when a section is shown
    if (sectionId === 'inventory') {
        fetchInventory();
    } else if (sectionId === 'sales') {
        fetchSales();
    } else if (sectionId === 'expenses') {
        fetchExpenses();
    } else if (sectionId === 'cash-management') {
        fetchCashJournal();
    } else if (sectionId === 'reports') {
        // When reports section is shown, generate a default report (e.g., for last 30 days)
        generateReports();
    } else if (sectionId === 'audit-logs') {
        fetchAuditLogs();
    }
}

async function login() {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    if (!usernameInput || !passwordInput) {
        showMessage('Login form elements missing.', true);
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        showMessage('Please enter both username and password.', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwt_token', data.token);
            currentUserRole = data.user.role; // Assuming your backend returns user role
            currentUsername = data.user.username; // Assuming your backend returns username
            showMessage('Login successful!', false);
            updateUIForUserRole(); // Update UI after successful login
        } else {
            showMessage(data.message || 'Login failed.', true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred during login: ' + error.message, true);
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    currentUserRole = ''; // Clear current user role
    currentUsername = ''; // Clear current username
    showMessage('Logged out successfully.');
    updateUIForUserRole(); // Reset UI to logged-out state (show login form)
}

// --- Inventory Functions (Placeholder - Implement your actual logic) ---
async function fetchInventory() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/inventory?page=${currentInventoryPage}&limit=${inventoryPerPage}`);
        if (!response) return;
        const result = await response.json();
        // renderInventoryTable(result.data); // Implement this
        // renderInventoryPagination(result.page, result.pages); // Implement this
        console.log("Fetched Inventory:", result.data); // For debugging
    } catch (error) {
        console.error('Error fetching inventory:', error);
        showMessage('Failed to fetch inventory: ' + error.message, true);
    }
}

async function submitInventoryForm(event) {
    event.preventDefault();
    showMessage('Inventory form submission logic not implemented.', true);
}

function populateInventoryForm(item) {
    showMessage('Inventory form population logic not implemented.', true);
}


// --- Sales Functions ---

// The BUYING_PRICES object (corrected for duplicates)
const BUYING_PRICES = {
    "rest greek salad": 9000,
    "rest toasted salad": 7500,
    "rest potato salad": 6700,
    "rest mushroom soup": 9200,
    "rest tomato soup": 8500,
    "rest pumpkin soup": 8500,
    "rest chicken clear soup": 7400,
    "rest chicken stew": 15000,
    "rest chicken stir fry": 13200,
    "rest chicken cubes": 12900,
    "rest grilled whole chicken": 27200,
    "rest chicken drum stick": 17500,
    "rest beef stew": 10100,
    "rest beef curry": 10500,
    "rest navarine goat": 11200,
    "rest goat muchomo": 11800,
    "rest steak": 11600,
    "rest panfried pork": 11000,
    "rest pork ribs": 10300,
    "rest pork chops": 11100,
    "rest fish curry": 11800,
    "rest vegetable curry": 9600,
    "rest beef samosa": 19200,
    "rest chicken spring rolls": 22300,
    "rest chicken wing": 12600,
    "rest french fries": 5800,
    "rest chips masala": 7000, // Corrected typo
    "rest pan fried fish fillet": 18100,
    "rest deep fried whole fish": 19800,
    "rest stir fried beef": 20000,
    "rest stir fried ox liver": 6900,
    "rest fish finger": 9200,
    "rest chicken party (burgar)": 8500,
    "rest beef burgar": 14400,
    "rest vegetable burgar": 10400,
    "rest beef sandwich": 12200,
    "rest chicken sandwich": 7400,
    "rest tomato sandwich": 5600,
    "rest vegetable sandwich": 7900,
    "rest club sandwich": 12700,
    "rest african tea": 4300,
    "rest african coffee": 4100,
    "rest english tea": 5200,
    "rest african spiced tea": 5000,
    "rest lemon tea": 2900,
    "rest milk plane": 4000,
    "rest black tea": 3300,
    "rest black coffee": 3400,
    "rest dhawa tea": 5300,
    "rest passion juice(l)": 4400,
    "rest pineapple juice": 3100,
    "rest water melon juice": 3000,
    "rest lemon juice": 2400,
    "rest cocotail juice": 4500,
    "rest pineapple (dessert)": 2700,
    "rest fruit salad": 3400,
    "rest fruit platta": 2200,
    "rest spagetti napolitan": 8000,
    "rest spagetti bolognaise": 7700,
    "rest margarita pizza": 7700,
    "rest chicken polo pizza": 9400,
    "rest strombolli pizza": 10600,
    "rest hawaii pizza": 8000,
    "bar Mountain dew": 771,
    "bar mirinda fruity": 771,
    "bar Mirinda fanta": 771,
    "bar Novida": 771,
    "bar pepsi": 771,
    "bar mirinda apple": 771,
    "bar cocacola can": 771, // Renamed to make unique
    "bar cocacola pet": 771, // Renamed to make unique
    "bar stoney": 771,
    "bar fanta orange": 771, // Renamed to make unique
    "bar fanta pineapple": 771, // Renamed to make unique
    "bar Nile Special": 3335, // Renamed to be more specific
    "bar Club Pilsner": 2925, // Renamed to be more specific
    "bar Guinness Foreign Extra": 2800, // Renamed to be more specific
    "bar Guinness Rich & Smooth": 2800, // Renamed to be more specific
    "bar Uganda waragi (small)": 7000, // Renamed to be more specific
    "bar Gilbey's (small)": 7800, // Renamed to be more specific
    "bar Tusker Lite": 2860, // Renamed to be more specific
    "bar water (500ml)": 1000, // Renamed to be more specific
    "bar Castle Lite": 2860
};

// The SELLING_PRICES object (corrected for duplicates)
const SELLING_PRICES = {
    "rest greek salad": 9000,
    "rest toasted salad": 7500,
    "rest potato salad": 6700,
    "rest mushroom soup": 9200,
    "rest tomato soup": 8500,
    "rest pumpkin soup": 8500,
    "rest chicken clear soup": 7400,
    "rest chicken stew": 15000,
    "rest chicken stir fry": 13200,
    "rest chicken cubes": 12900,
    "rest grilled whole chicken": 27200,
    "rest chicken drum stick": 17500,
    "rest beef stew": 10100,
    "rest beef curry": 10500,
    "rest navarine goat": 11200,
    "rest goat muchomo": 11800,
    "rest steak": 11600,
    "rest panfried pork": 11000,
    "rest pork ribs": 10300,
    "rest pork chops": 11100,
    "rest fish curry": 11800,
    "rest vegetable curry": 9600,
    "rest beef samosa": 19200,
    "rest chicken spring rolls": 22300,
    "rest chicken wing": 12600,
    "rest french fries": 5800,
    "rest chips masala": 7000, // Corrected typo
    "rest pan fried fish fillet": 18100,
    "rest deep fried whole fish": 19800,
    "rest stir fried beef": 20000,
    "rest stir fried ox liver": 6900,
    "rest fish finger": 9200,
    "rest chicken party (burgar)": 8500,
    "rest beef burgar": 14400,
    "rest vegetable burgar": 10400,
    "rest beef sandwich": 12200,
    "rest chicken sandwich": 7400,
    "rest tomato sandwich": 5600,
    "rest vegetable sandwich": 7900,
    "rest club sandwich": 12700,
    "rest african tea": 4300,
    "rest african coffee": 4100,
    "rest english tea": 5200,
    "rest african spiced tea": 5000,
    "rest lemon tea": 2900,
    "rest milk plane": 4000,
    "rest black tea": 3300,
    "rest black coffee": 3400,
    "rest dhawa tea": 5300,
    "rest passion juice(l)": 4400,
    "rest pineapple juice": 3100,
    "rest water melon juice": 3000,
    "rest lemon juice": 2400,
    "rest cocotail juice": 4500,
    "rest pineapple (dessert)": 2700,
    "rest fruit salad": 3400,
    "rest fruit platta": 2200,
    "rest spagetti napolitan": 8000,
    "rest spagetti bolognaise": 7700,
    "rest margarita pizza": 7700,
    "rest chicken polo pizza": 9400,
    "rest strombolli pizza": 10600,
    "rest hawaii pizza": 8000,
    "bar Mountain dew": 2000,
    "bar mirinda fruity": 2000,
    "bar Mirinda fanta": 2000,
    "bar Novida": 2000,
    "bar pepsi": 2000,
    "bar mirinda apple": 2000,
    "bar cocacola can": 2000, // Renamed to make unique
    "bar cocacola pet": 2000, // Renamed to make unique
    "bar stoney": 2000,
    "bar fanta orange": 2000, // Renamed to make unique
    "bar fanta pineapple": 2000, // Renamed to make unique
    "bar Nile Special": 5000,
    "bar Club Pilsner": 5000,
    "bar Guinness Foreign Extra": 5000, // Renamed to be more specific
    "bar Uganda Waragi (small)": 13000, // Renamed to be more specific
    "bar Gilbey's (small)": 15000, // Renamed to be more specific
    "bar Tusker Lite": 5000,
    "bar water (500ml)": 5000,
    "bar Castle Lite": 5000
};


/**
 * Automatically populates the buying price based on the selected item.
 */
function populateBuyingPrice() {
    const itemInput = document.getElementById('sale-item');
    const bpInput = document.getElementById('sale-bp');

    if (itemInput && bpInput) {
        // Apply .toLowerCase() for case-insensitive matching, consistent with selling price
        const item = itemInput.value.toLowerCase().trim();
        const buyingPrice = BUYING_PRICES[item];

        if (buyingPrice !== undefined) {
            bpInput.value = buyingPrice;
        } else {
            bpInput.value = '';
        }
    }
}

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
            // Optionally clear the SP field if the item doesn't have a predefined price
            spInput.value = '';
        }
    }
}

/**
 * Populates the datalist with items from BUYING_PRICES.
 */
function populateDatalist() {
    const datalist = document.getElementById('item-suggestions');
    if (datalist) {
        // Clear existing options
        datalist.innerHTML = '';
        for (const item in BUYING_PRICES) {
            const option = document.createElement('option');
            option.value = item;
            datalist.appendChild(option);
        }
    }
}

// Function to fetch sales data
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
        renderSalesTable(result.data); // Render the table with fetched data
        renderSalesPagination(result.page, result.pages); // Render pagination controls
    } catch (error) {
        console.error('Error fetching sales:', error);
        showMessage('Failed to fetch sales: ' + error.message, true);
    }
}

// Function to render the sales table (MODIFIED for profit visibility)
function renderSalesTable(sales) {
    const tbody = document.querySelector('#sales-table tbody');
    const thead = document.querySelector('#sales-table thead tr');
    if (!tbody || !thead) return;

    tbody.innerHTML = ''; // Clear existing rows

    // Adjust table headers based on user role (for profit columns)
    // First, reset headers to default (without profit) then add if allowed
    thead.innerHTML = `
        <th>ID</th>
        <th>Item</th>
        <th>Number</th>
        <th>Buying Price</th>
        <th>Selling Price</th>
        <th>Date</th>
        <th>Actions</th>
    `;

    // Only add Profit and Percentage Profit headers if the current user role is allowed
    const canViewProfit = PROFIT_VIEW_ROLES.includes(currentUserRole);

    if (canViewProfit) {
        const profitHeader = document.createElement('th');
        profitHeader.textContent = 'Profit';
        thead.insertBefore(profitHeader, thead.querySelector('th:last-child')); // Insert before Actions

        const percentageProfitHeader = document.createElement('th');
        percentageProfitHeader.textContent = '% Profit';
        thead.insertBefore(percentageProfitHeader, thead.querySelector('th:last-child')); // Insert before Actions
    }


    if (sales.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        // Adjust colspan based on whether profit columns are visible
        cell.colSpan = canViewProfit ? 9 : 7; // 7 base + 2 for profit
        cell.textContent = 'No sales records found for this date. Try adjusting the filter.';
        cell.style.textAlign = 'center';
        return;
    }

    sales.forEach(sale => {
        const row = tbody.insertRow();
        row.insertCell().textContent = sale._id ? sale._id.substring(0, 8) + '...' : 'N/A'; // Displaying truncated ID
        row.insertCell().textContent = sale.item;
        row.insertCell().textContent = sale.number;
        row.insertCell().textContent = sale.bp.toFixed(2);
        row.insertCell().textContent = sale.sp.toFixed(2);
        row.insertCell().textContent = new Date(sale.date).toLocaleDateString();

        // Conditionally add profit cells
        if (canViewProfit) {
            const profitCell = row.insertCell();
            profitCell.textContent = sale.profit ? sale.profit.toFixed(2) : '0.00';
            profitCell.className = sale.profit >= 0 ? 'positive' : 'negative';

            const percentageProfitCell = row.insertCell();
            percentageProfitCell.textContent = sale.percentageprofit ? sale.percentageprofit.toFixed(2) + '%' : '0.00%';
            percentageProfitCell.className = sale.profit >= 0 ? 'positive' : 'negative';
        }

        const actionsCell = row.insertCell();
        actionsCell.className = 'actions';

        const adminRoles = ADMIN_ROLES; // Use the global constant for admin roles
        // Only administrators can edit sales
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
}

// Function to render pagination for sales (no change needed here)
function renderSalesPagination(current, totalPages) {
    const container = document.getElementById('sales-pagination');
    if (!container) return;
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


async function submitSaleForm(event) {
    event.preventDefault();
    // Roles allowed to record sales (using global constant)
    if (!SALES_ENTRY_ROLES.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record sales.', true);
        return;
    }

    const idInput = document.getElementById('sale-id');
    const itemInput = document.getElementById('sale-item');
    const numberInput = document.getElementById('sale-number');
    const bpInput = document.getElementById('sale-bp');
    const spInput = document.getElementById('sale-sp');
    const salesDateFilterInput = document.getElementById('sales-date-filter'); // Assuming this is used for the sale date

    if (!idInput || !itemInput || !numberInput || !bpInput || !spInput || !salesDateFilterInput) {
        showMessage('Sales form elements are missing.', true);
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
        showMessage('Please fill in all sales fields correctly with valid numbers and date.', true);
        return;
    }
    if (number <= 0 || bp <= 0 || sp <= 0) {
        showMessage('Number, Buying Price, and Selling Price must be positive values.', true);
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
            if (!ADMIN_ROLES.includes(currentUserRole)) { // Use global constant
                showMessage('Permission Denied: Only administrators can edit sales.', true);
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
            showMessage('Sale recorded successfully!', false);
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
        showMessage('Failed to save sale entry: ' + error.message, true);
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
    // Note: Profit and Percentage Profit are calculated on submission, not populated back to form
}


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
        showMessage('Failed to fetch expenses: ' + error.message, true);
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

        // Only administrators can edit expenses (using global constant)
        if (ADMIN_ROLES.includes(currentUserRole)) {
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
    // Roles allowed to record expenses (using global constant)
    if (!EXPENSE_ENTRY_ROles.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record expenses.', true);
        return;
    }

    const idInput = document.getElementById('expense-id');
    const descriptionInput = document.getElementById('expense-description');
    const amountInput = document.getElementById('expense-amount');
    const receiptIdInput = document.getElementById('expense-receiptId');
    const sourceInput = document.getElementById('expense-source');
    const expenseDateInput = document.getElementById('expenses-date-filter'); // Using this as the date input

    if (!idInput || !descriptionInput || !amountInput || !receiptIdInput || !sourceInput || !expenseDateInput) {
        showMessage('Expense form elements are missing.', true);
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
        showMessage('Please fill in all expense fields correctly.', true);
        return;
    }

    const expenseData = { description, amount, receiptId, source, date, recordedBy };

    try {
        let response;
        if (id) {
            if (!ADMIN_ROLES.includes(currentUserRole)) { // Use global constant
                showMessage('Permission Denied: Only administrators can edit expenses.', true);
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
            showMessage('Expense recorded successfully!', false);
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
        showMessage('Failed to save expense: ' + error.message, true);
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
        showMessage('Failed to fetch cash journal: ' + error.message, true);
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

        // Only Nachwera Richard, Nelson, Florence can edit cash entries (using global constant)
        if (ADMIN_ROLES.includes(currentUserRole)) {
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
    // Roles allowed to record cash entries (using global constant)
    if (!CASH_ENTRY_ROLES.includes(currentUserRole)) {
        showMessage('Permission Denied: You do not have permission to record cash entries.', true);
        return;
    }
    const idInput = document.getElementById('cash-journal-id');
    const cashAtHandInput = document.getElementById('cash-at-hand');
    const cashBankedInput = document.getElementById('cash-banked');
    const bankReceiptIdInput = document.getElementById('bank-receipt-id');
    const cashDateInput = document.getElementById('cash-date');

    if (!idInput || !cashAtHandInput || !cashBankedInput || !bankReceiptIdInput || !cashDateInput) {
        showMessage('Cash journal form elements are missing.', true);
        return;
    }

    const id = idInput.value;
    const cashAtHand = parseFloat(cashAtHandInput.value);
    const cashBanked = parseFloat(cashBankedInput.value);
    const bankReceiptId = bankReceiptIdInput.value;
    const date = cashDateInput.value;

    // Basic validation
    if (isNaN(cashAtHand) || isNaN(cashBanked) || !bankReceiptId || !date) {
        showMessage('Please fill in all cash entry fields correctly.', true);
        return;
    }

    const cashData = { cashAtHand, cashBanked, bankReceiptId, date };

    try {
        let response;
        if (id) { // Edit operation (Nachwera Richard, Nelson, Florence only)
            if (!ADMIN_ROLES.includes(currentUserRole)) { // Use global constant
                showMessage('Permission Denied: Only administrators can edit cash entries.', true);
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
            showMessage('Cash entry saved successfully!', false);
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
        showMessage('Failed to save cash entry: ' + error.message, true);
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
function getDepartmentFromText(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith('bar') || lowerText.includes('bar ')) return 'Bar';
    if (lowerText.startsWith('rest') || lowerText.includes('restaurant')) return 'Restaurant';
    if (lowerText.startsWith('conf') || lowerText.includes('conference')) return 'Conference';
    if (lowerText.startsWith('grdn') || lowerText.includes('garden')) return 'Gardens';
    if (lowerText.startsWith('accomm') || lowerText.includes('accommodation') || lowerText.includes('room')) return 'Accommodation';
    return 'Bar'; // Default department if not matched
}

async function generateReports() {
    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');

    if (!startDateInput || !endDateInput) {
        showMessage('Report date inputs not found.', true);
        return;
    }

    const startDateString = startDateInput.value;
    const endDateString = endDateInput.value;

    if (!startDateString || !endDateString) {
        showMessage('Please select both start and end dates for the report.', true);
        return;
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    let allExpenses = [];
    let allSales = [];

    const tbody = document.getElementById('department-report-tbody');
    if (!tbody) {
        console.error('Department report tbody not found.');
        return;
    }
    tbody.innerHTML = ''; // Clear any existing rows

    try {
        // Fetch sales
        const salesResponse = await authenticatedFetch(`${API_BASE_URL}/sales`); // Consider adding date filters to this API call for efficiency
        if (salesResponse) {
            const salesData = await salesResponse.json();
            if (Array.isArray(salesData.data)) {
                allSales = salesData.data.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= startDate && saleDate <= endDate;
                });
            } else {
                console.warn('API /sales did not return an array for data property:', salesData);
                allSales = [];
            }
        }

        // Fetch expenses
        const expensesResponse = await authenticatedFetch(`${API_BASE_URL}/expenses`); // Consider adding date filters to this API call for efficiency
        if (expensesResponse) {
            const expensesData = await expensesResponse.json();
            if (Array.isArray(expensesData.data)) {
                allExpenses = expensesData.data.filter(e => {
                    const expenseDate = new Date(e.date);
                    return expenseDate >= startDate && expenseDate <= endDate;
                });
            } else {
                console.warn('API /expenses did not return an array for data property:', expensesData);
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
        showMessage('Failed to generate reports: ' + error.message, true);
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
        showMessage('Failed to fetch audit logs: ' + error.message, true);
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
        showMessage(`Table with ID "${tableID}" not found for export.`, true);
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

    // Specific modification for Sales Table: hide Profit and Percentage Profit if currentUserRole is not allowed
    if (tableID === 'sales-table' && !PROFIT_VIEW_ROLES.includes(currentUserRole)) {
        // Find the column indices for 'Profit' and '% Profit' in the cloned table's header
        const headers = Array.from(clonedTable.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const profitIndex = headers.indexOf('Profit');
        const percentageProfitIndex = headers.indexOf('% Profit');

        // Remove the headers if they exist
        if (profitIndex !== -1) {
            clonedTable.querySelector('thead tr').removeChild(clonedTable.querySelector('thead tr').children[profitIndex]);
        }
        if (percentageProfitIndex !== -1) {
            // Adjust index if profit column was already removed
            const adjustedPercentageProfitIndex = (profitIndex !== -1 && percentageProfitIndex > profitIndex) ? percentageProfitIndex - 1 : percentageProfitIndex;
            if (adjustedPercentageProfitIndex !== -1) {
                clonedTable.querySelector('thead tr').removeChild(clonedTable.querySelector('thead tr').children[adjustedPercentageProfitIndex]);
            }
        }

        // Remove the corresponding cells from each row in the tbody
        clonedTable.querySelectorAll('tbody tr').forEach(row => {
            const cells = Array.from(row.children);
            if (percentageProfitIndex !== -1 && cells[percentageProfitIndex]) {
                const adjustedPercentageProfitIndex = (profitIndex !== -1 && percentageProfitIndex > profitIndex) ? percentageProfitIndex - 1 : percentageProfitIndex;
                if (cells[adjustedPercentageProfitIndex]) {
                     cells[adjustedPercentageProfitIndex].remove();
                }
            }
            if (profitIndex !== -1 && cells[profitIndex]) {
                cells[profitIndex].remove();
            }
        });
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
    // Set initial current user role for testing/initial state.
    // In a real app, this would be determined after successful login.
    // For local testing, you might uncomment one of these:
    // currentUserRole = 'Nachwera Richard'; // Admin
    // currentUserRole = 'Martha';            // Can record sales/expenses/cash, but not view profit
    // currentUserRole = 'Joshua';            // Can record sales/inventory, but not view profit or other navs
    // currentUserRole = 'Guest';             // Not allowed to do much

    // Check authentication status and update UI on page load
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

    // Event listener for Sales Export button
    const salesExportButton = document.getElementById('export-sales-excel');
    if (salesExportButton) {
        salesExportButton.addEventListener('click', () => exportTableToExcel('sales-table', 'Sales_Data'));
    }

    // Event listener for Expenses Export button
    const expensesExportButton = document.getElementById('export-expenses-excel');
    if (expensesExportButton) {
        expensesExportButton.addEventListener('click', () => exportTableToExcel('expenses-table', 'Expenses_Data'));
    }

    // Event listener for Cash Journal Export button
    const cashExportButton = document.getElementById('export-cash-journal-excel');
    if (cashExportButton) {
        cashExportButton.addEventListener('click', () => exportTableToExcel('cash-journal-table', 'Cash_Journal_Data'));
    }

    // Event listener for Reports Export button
    const reportsExportButton = document.getElementById('export-reports-excel');
    if (reportsExportButton) {
        reportsExportButton.addEventListener('click', () => exportTableToExcel('department-report-table', 'Department_Reports'));
    }

    // Event listener for Audit Logs Export button
    const auditLogsExportButton = document.getElementById('export-audit-logs-excel');
    if (auditLogsExportButton) {
        auditLogsExportButton.addEventListener('click', () => exportTableToExcel('audit-logs-table', 'Audit_Logs'));
    }
});
