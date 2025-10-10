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
 * Global function to show a modal by removing the 'hidden' class.
 * @param {string} modalId - The ID of the modal element.
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Remove the 'hidden' class to show the modal (Tailwind approach)
        modal.classList.remove('hidden');
    }
}

/**
 * Global function to hide a modal by adding the 'hidden' class.
 * This is the function referenced by your Cancel button in the HTML.
 * @param {string} modalId - The ID of the modal element.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Add the 'hidden' class to hide the modal (Tailwind approach)
        modal.classList.add('hidden');
    }
}

// New function to handle the modal display and population for sales
function openSaleEditModal(sale) {
    // Check if the current user has permission to edit sales
    const adminRoles = ['Nachwera Richard', 'Nelson', 'Florence'];
    if (!adminRoles.includes(currentUserRole)) {
        // Assuming you have a global showMessage function
        if (typeof showMessage === 'function') {
            showMessage('Permission Denied: You cannot edit sale records.');
        } else {
            console.warn('Permission Denied: You cannot edit sale records.');
        }
        return;
    }

    // Basic validation
    if (!sale || !sale._id) {
        if (typeof showMessage === 'function') {
            showMessage('Error: Sale record data is missing or invalid.');
        } else {
            console.error('Error: Sale record data is missing or invalid.');
        }
        return;
    }

    // Populate the form fields with the sale data
    populateSaleForm(sale);

    // Show the modal
    showModal('edit-sale-modal');
}

// Function to populate the form fields
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
    // Use toFixed(2) when setting values to number inputs to ensure correct precision
    if (bpInput) bpInput.value = sale.bp.toFixed(2);
    if (spInput) spInput.value = sale.sp.toFixed(2);

    // Convert date to 'YYYY-MM-DD' format required for HTML date input
    if (salesDateFilterInput && sale.date) {
        const dateObj = new Date(sale.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        salesDateFilterInput.value = `${year}-${month}-${day}`;
    }
}

// --- RENDER SALES TABLE (Modified Section) ---

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

    const hideProfitColumns = ['Martha', 'Mercy', 'Joshua'].includes(currentUserRole);
    let totalSellingPriceSum = 0;
    const departmentTotals = {
        bar: 0,
        rest: 0,
        others: 0
    };

    sales.forEach(sale => {
        // ... (Profit calculation logic remains the same)
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
            editButton.className = 'edit bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs';

            // --- CRITICAL MODIFICATION: Use the new openSaleEditModal function ---
            editButton.onclick = () => openSaleEditModal(sale);
            // ---------------------------------------------------------------------

            actionsCell.appendChild(editButton);
        } else {
            actionsCell.textContent = 'View Only';
        }
    });

    // ... (Total and Grand Total rendering logic remains the same)
    // Insert an empty row for spacing before the totals
    tbody.insertRow();

    // Create a new row for each departmental total
    for (const department in departmentTotals) {
        if (departmentTotals[department] > 0) {
            const totalRow = tbody.insertRow();
            const totalCell = totalRow.insertCell();
            totalCell.colSpan = 4;
            let departmentName;
            if (department === 'rest') {
                departmentName = 'Restaurant';
            } else {
                departmentName = department.charAt(0).toUpperCase() + department.slice(1);
            }
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

// --- Event Listener for Modal Background Click (for completeness) ---
window.addEventListener('click', function(event) {
    const modal = document.getElementById('edit-sale-modal');
    // Check if the click occurred directly on the modal background (not the content)
    if (event.target === modal) {
        closeModal('edit-sale-modal');
    }
});
