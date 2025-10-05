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
        
        
    </script>

    <script>
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
    

