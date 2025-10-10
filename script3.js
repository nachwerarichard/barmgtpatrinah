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




/**
 * 1. Global function to show a modal by removing the 'hidden' class.
 * This function makes the modal visible.
 * @param {string} modalId - The ID of the modal element ('edit-sale-modal').
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Remove the 'hidden' class to display the modal (Tailwind approach)
        modal.classList.remove('hidden');
    }
}



function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}


/**
 * 2. Function to populate the 'Edit Sale' form fields.
 * This function fills the form with the data from the 'sale' object.
 * @param {object} sale - The sale record object to be edited.
 */


/**
 * Populates the edit sale form with data from a selected sale record
 * and displays the edit modal.
 *
 * @param {object} sale - The sale object containing the data to be edited.
 * Assumes 'sale.date' is a timestamp or date string.
 */
function populateSaleForm(sale) {
    // 1. Get references to the form elements
    const modal = document.getElementById('edit-sale-modal');
    const idInput = document.getElementById('sale-id');
    const itemInput = document.getElementById('sale-item');
    const dateInput = document.getElementById('sales-date-filter');
    const numberInput = document.getElementById('sale-number');
    const bpInput = document.getElementById('sale-bp');
    const spInput = document.getElementById('sale-sp');

    // 2. Populate the form fields with the sale data
    
    // The 'sale-id' is assumed to be a unique identifier for the database record.
    // If your sale objects have a unique ID property (e.g., '_id' or 'id'), use it here.
    // For this example, I'll assume it's 'sale.id'. Adjust if your property name is different.
    if (sale.id) {
        idInput.value = sale.id;
    } else {
        // Handle case where an ID might not exist, perhaps set a temporary value or alert
        console.warn("Sale object is missing an 'id' property. Edit may not save correctly.");
        idInput.value = ''; // Clear or set a default
    }
    
    itemInput.value = sale.item;
    numberInput.value = sale.number;
    
    // For prices, use 'toFixed(2)' to ensure they populate with a standard decimal format
    // for the number input fields, though they are stored as numbers in the object.
    bpInput.value = sale.bp.toFixed(2);
    spInput.value = sale.sp.toFixed(2);
    
    // Convert the date timestamp or string into the 'YYYY-MM-DD' format required by the <input type="date">
    const saleDate = new Date(sale.date);
    const year = saleDate.getFullYear();
    // getMonth() is 0-indexed, so add 1. padStart ensures two digits (e.g., '01', '12').
    const month = String(saleDate.getMonth() + 1).padStart(2, '0');
    const day = String(saleDate.getDate()).padStart(2, '0');
    
    dateInput.value = `${year}-${month}-${day}`;

    // 3. Display the modal
    modal.classList.remove('hidden');
    
    // Optional: Focus on the first editable field for a better user experience
    itemInput.focus();
}

/**
 * A utility function to hide the modal. This is called by the 'Cancel' button.
 * You should ensure this function exists in your main script.
 *
 * @param {string} modalId - The ID of the modal to close.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// NOTE: You will also need to implement the event listener and logic for 
// the 'edit-sale-form' submission to save the changes to your backend/data structure.
