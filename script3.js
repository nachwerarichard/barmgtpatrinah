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


function populateSaleForm(sale) {
    console.log('START: Attempting to populate form with data:', sale);

    const modal = document.getElementById('edit-sale-modal');
    if (!modal) {
        console.error("🔴 ERROR: Modal 'edit-sale-modal' not found.");
        return; 
    }
    
    // 🚨 CRITICAL FIX: Use the NEW unique IDs from the modal
    const idInput     = document.getElementById('edit-sale-id');
    const itemInput   = document.getElementById('edit-sale-item');
    const numberInput = document.getElementById('edit-sale-number');
    const bpInput     = document.getElementById('edit-sale-bp');
    const spInput     = document.getElementById('edit-sale-sp');

    if (!sale || typeof sale !== 'object') {
        console.error("Invalid or missing sale object passed.", sale);
        return;
    }

    // Populate Fields
    
    // Set ID (The unique key from your console output was '_id')
    idInput.value = sale._id || sale.id || '';
    
    // Populate simple fields
    itemInput.value = sale.item;
    numberInput.value = sale.number;
    
    // Populate price fields with safety checks (to prevent the toFixed error)
    // Your console log confirmed sale.bp and sale.sp exist.
    bpInput.value = sale.bp ? Number(sale.bp).toFixed(2) : '';
    spInput.value = sale.sp ? Number(sale.sp).toFixed(2) : '';
    
    // Display the modal
    modal.classList.remove('hidden');
    
    itemInput.focus();
    console.log('END: populateSaleForm complete. Data should be visible now.');
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// NOTE: You will also need to implement the event listener and logic for 
// the 'edit-sale-form' submission to save the changes to your backend/data structure.


/**
 * Handles the submission of the edit sale form within the modal.
 * @param {Event} event The form submission event.
 */
async function submitEditSaleForm(event) {
    event.preventDefault(); // Prevent the default form submission

    const idInput = document.getElementById('edit-sale-id');
    const itemInput = document.getElementById('edit-sale-item');
    const numberInput = document.getElementById('edit-sale-number');
    const bpInput = document.getElementById('edit-sale-bp');
    const spInput = document.getElementById('edit-sale-sp');
    const saveButton = document.querySelector('#edit-sale-form button[type="submit"]');

    const originalButtonText = saveButton.innerHTML;

    if (!idInput || !itemInput || !numberInput || !bpInput || !spInput) {
        showMessage('Edit form elements are missing.');
        return;
    }

    const id = idInput.value;
    const item = itemInput.value;
    const number = parseInt(numberInput.value);
    const bp = parseFloat(bpInput.value);
    const sp = parseFloat(spInput.value);

    // Basic validation
    if (!id || !item || isNaN(number) || isNaN(bp) || isNaN(sp) || number <= 0 || bp <= 0 || sp <= 0) {
        showMessage('Please ensure all edit fields are filled correctly with valid positive numbers.');
        return;
    }

    // Check for admin role before attempting to edit
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        showMessage('Permission Denied: Only administrators can edit sales.');
        return;
    }

    // Recalculate profit and percentage profit
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
        // The date is typically not editable in a modal like this, but if it were, 
        // you would retrieve it from a hidden input or the original sale object.
        // Assuming the date remains the same for the edit:
        // You might need to fetch the original date if your API requires it.
        // For now, omitting date assumes the backend preserves it for a PUT request.
    };

    try {
        saveButton.innerHTML = 'Saving...';
        saveButton.disabled = true;

        const response = await authenticatedFetch(`${API_BASE_URL}/sales/${id}`, {
            method: 'PUT',
            body: JSON.stringify(saleData)
        });

        if (response.ok) {
            await response.json();
            showMessage('Sale Updated! ✅');
            saveButton.innerHTML = 'Updated! ✅';

            // Wait for 1 second, then close modal and re-fetch data
            setTimeout(() => {
                closeModal('edit-sale-modal'); 
                fetchSales(); // Re-fetch sales data to update the table
            }, 1000); 

        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error occurred during update.');
        }
    } catch (error) {
        showMessage(`Error updating sale: ${error.message}`);
        saveButton.innerHTML = originalButtonText;
        saveButton.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-sale-form');
    if (editForm) {
        // Attach the new submission handler to the modal form
        editForm.addEventListener('submit', submitEditSaleForm);
    }
    
    // Assuming you have a function to handle the main sales form
    const saleForm = document.getElementById('sale-form');
    if (saleForm) {
        saleForm.addEventListener('submit', submitSaleForm);
    }
    
    // You would also need to define the closeModal function if it's not already defined
    // function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
});


function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}




