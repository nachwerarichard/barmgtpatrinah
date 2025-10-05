    // New function to handle the modal display and population
// New function to handle the modal display and population
function openEditModal(item) {
    // Check permission
    const allowedToEditInventory = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!allowedToEditInventory.includes(currentUserRole)) {
        showMessage('Permission Denied: You cannot edit inventory items.');
        return;
    }

    // --- ADDED VALIDATION HERE ---
    if (!item || !item._id) {
        showMessage('Error: Inventory item data is missing or invalid.');
        return;
    }

    // Get the modal and form elements
    const modal = document.getElementById('edit-inventory-modal');
    const idInput = document.getElementById('edit-inventory-id');
    const itemInput = document.getElementById('edit-item');
    const openingInput = document.getElementById('edit-opening');
    const purchasesInput = document.getElementById('edit-purchases');
    const salesInput = document.getElementById('edit-inventory-sales');
    const spoilageInput = document.getElementById('edit-spoilage');

    // Populate the form with the item's data
    idInput.value = item._id;
    itemInput.value = item.item;
    openingInput.value = item.opening;
    purchasesInput.value = item.purchases;
    salesInput.value = item.sales;
    spoilageInput.value = item.spoilage;

    // Show the modal
    modal.style.display = 'flex'; // Use 'flex' here if that's what your CSS expects for centering
}
        
// New function to handle the form submission for the modal
async function submitEditForm(event) {
  event.preventDefault();

  const idInput = document.getElementById('edit-inventory-id');
  const itemInput = document.getElementById('edit-item');
  const openingInput = document.getElementById('edit-opening');
  const purchasesInput = document.getElementById('edit-purchases');
  const salesInput = document.getElementById('edit-inventory-sales');
  const spoilageInput = document.getElementById('edit-spoilage');

  // Basic validation
  if (!idInput.value || isNaN(openingInput.value) || isNaN(purchasesInput.value) || isNaN(salesInput.value) || isNaN(spoilageInput.value)) {
    showMessage('Please fill in all fields correctly with valid numbers.');
    return;
  }
  
  const inventoryData = {
    item: itemInput.value,
    opening: parseInt(openingInput.value),
    purchases: parseInt(purchasesInput.value),
    sales: parseInt(salesInput.value),
    spoilage: parseInt(spoilageInput.value)
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/inventory/${idInput.value}`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData)
    });

    if (response) {
      await response.json();
      showMessage('Inventory item updated successfully!');
      document.getElementById('edit-inventory-modal').style.display = 'none';
      fetchInventory(); // Refresh the table
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
    showMessage('Failed to update inventory item: ' + error.message);
  }
}

// Add an event listener to the new edit form
document.getElementById('edit-inventory-form').addEventListener('submit', submitEditForm);
        

function closeEditModal() {
  document.getElementById('edit-inventory-modal').style.display = 'none';
}

// Attach the close function to the close button
document.querySelector('#edit-inventory-modal .close-button').addEventListener('click', closeEditModal);

// Attach the close function to a click on the modal background
window.addEventListener('click', function(event) {
  const modal = document.getElementById('edit-inventory-modal');
  if (event.target === modal) {
    closeEditModal();
  }
});


    
        // New function to handle the modal display and population
// New function to handle the modal display and population
function openEditModal(item) {
    // Check permission
    const allowedToEditInventory = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!allowedToEditInventory.includes(currentUserRole)) {
        showMessage('Permission Denied: You cannot edit inventory items.');
        return;
    }

    // --- ADDED VALIDATION HERE ---
    if (!item || !item._id) {
        showMessage('Error: Inventory item data is missing or invalid.');
        return;
    }

    // Get the modal and form elements
    const modal = document.getElementById('edit-inventory-modal');
    const idInput = document.getElementById('edit-inventory-id');
    const itemInput = document.getElementById('edit-item');
    const openingInput = document.getElementById('edit-opening');
    const purchasesInput = document.getElementById('edit-purchases');
    const salesInput = document.getElementById('edit-inventory-sales');
    const spoilageInput = document.getElementById('edit-spoilage');

    // Populate the form with the item's data
    idInput.value = item._id;
    itemInput.value = item.item;
    openingInput.value = item.opening;
    purchasesInput.value = item.purchases;
    salesInput.value = item.sales;
    spoilageInput.value = item.spoilage;

    // Show the modal
    modal.style.display = 'flex'; // Use 'flex' here if that's what your CSS expects for centering
}
        
// New function to handle the form submission for the modal
async function submitEditForm(event) {
  event.preventDefault();

  const idInput = document.getElementById('edit-inventory-id');
  const itemInput = document.getElementById('edit-item');
  const openingInput = document.getElementById('edit-opening');
  const purchasesInput = document.getElementById('edit-purchases');
  const salesInput = document.getElementById('edit-inventory-sales');
  const spoilageInput = document.getElementById('edit-spoilage');

  // Basic validation
  if (!idInput.value || isNaN(openingInput.value) || isNaN(purchasesInput.value) || isNaN(salesInput.value) || isNaN(spoilageInput.value)) {
    showMessage('Please fill in all fields correctly with valid numbers.');
    return;
  }
  
  const inventoryData = {
    item: itemInput.value,
    opening: parseInt(openingInput.value),
    purchases: parseInt(purchasesInput.value),
    sales: parseInt(salesInput.value),
    spoilage: parseInt(spoilageInput.value)
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/inventory/${idInput.value}`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData)
    });

    if (response) {
      await response.json();
      showMessage('Inventory item updated successfully!');
      document.getElementById('edit-inventory-modal').style.display = 'none';
      fetchInventory(); // Refresh the table
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
    showMessage('Failed to update inventory item: ' + error.message);
  }
}

// Add an event listener to the new edit form
document.getElementById('edit-inventory-form').addEventListener('submit', submitEditForm);
        
        
    

    
function closeEditModal() {
  document.getElementById('edit-inventory-modal').style.display = 'none';
}

// Attach the close function to the close button
document.querySelector('#edit-inventory-modal .close-button').addEventListener('click', closeEditModal);

// Attach the close function to a click on the modal background
window.addEventListener('click', function(event) {
  const modal = document.getElementById('edit-inventory-modal');
  if (event.target === modal) {
    closeEditModal();
  }
});
    

<script>
    // Login/logout placeholders
    function login() {
      document.getElementById('login-section').classList.add('hidden');
      document.getElementById('main-container').classList.remove('hidden');
      document.getElementById('current-user-display').textContent = 'Admin User';
      // Initialise sidebar state after login
      initSidebarState();
    }
    function logout() {
      document.getElementById('main-container').classList.add('hidden');
      document.getElementById('login-section').classList.remove('hidden');
    }

    // Mobile menu toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('-translate-x-full');
    });

    // Toggle submenu accordion style
    function toggleSubmenu(submenuId, navButtonId) {
      // close other submenus
      document.querySelectorAll('.submenu').forEach(s => {
        if (s.id !== submenuId) s.classList.remove('open');
      });
      // open/close target
      const submenu = document.getElementById(submenuId);
      submenu.classList.toggle('open');

      // highlight main nav button when opened; remove highlight for others
      document.querySelectorAll('.nav-main').forEach(btn => btn.classList.remove('active'));
      const navButton = document.querySelector(`[data-target="${submenuId}"]`);
      if (submenu.classList.contains('open') && navButton) navButton.classList.add('active');
      else if (navButton) navButton.classList.remove('active');
    }

    // Show a specific sub-section in the main area
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
        const mainBtn = document.querySelector(`[data-target="${parentNavId.replace('nav-','')+'-submenu'}"], #${parentNavId}`);
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
    function initSidebarState() {
      // show inventory-add by default
      showSubSection('inventory-add', 'nav-inventory');

      // pre-open inventory submenu
      document.getElementById('inventory-submenu').classList.add('open');
      // mark main button active
      document.querySelector(`[data-target="inventory-submenu"]`)?.classList.add('active');
      // mark sub-item active
      document.querySelector(`[data-show="inventory-add"]`)?.classList.add('active');
    }

    // Ensure close button of modal works
    document.addEventListener('DOMContentLoaded', () => {
      // If already logged-in state desired in dev, call initSidebarState() here.
      // but we keep default login screen until login() called.
      const closeBtn = document.querySelector('#edit-inventory-modal .close-button');
      if (closeBtn) closeBtn.addEventListener('click', () => document.getElementById('edit-inventory-modal').classList.add('hidden'));
    });

    // --- Placeholder functions (you already had these) ---
    function fetchInventory() { console.log('Fetching inventory...'); }
    function fetchSales() { console.log('Fetching sales...'); }
    function fetchExpenses() { console.log('Fetching expenses...'); }
    function fetchCashJournal() { console.log('Fetching cash journal...'); }
    function generateReports() { console.log('Generating reports...'); }
    function exportTableToExcel(tableId, filename) {
      console.log(`Exporting table ${tableId} to ${filename}.xlsx`);
      // Keep your SheetJS integration or implementation here.
    }
  
