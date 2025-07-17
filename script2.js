function exportTableToExcel(tableID, filename = '') {
    const dataType = 'application/vnd.ms-excel';
    const tableSelect = document.getElementById(tableID);
    const tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

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



        // Basic JavaScript for section display and menu toggle
        function showSection(sectionId) {
            // Remove 'active' from all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            // Add 'active' to the target section
            document.getElementById(sectionId + '-section').classList.add('active');

            // Update active state for navigation buttons
            document.querySelectorAll('#main-nav button').forEach(button => {
                button.classList.remove('active-nav');
            });
            document.getElementById('nav-' + sectionId).classList.add('active-nav');

            // Close the mobile nav when a section is selected
            if (window.innerWidth <= 768) {
                document.getElementById('header-right').classList.remove('active');
            }
        }

        // Dummy login function (replace with actual authentication)
        /*function login() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginMessage = document.getElementById('login-message');

            if (username === 'admin' && password === 'password') { // Example credentials
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('main-container').style.display = 'block';
                document.getElementById('current-user-display').textContent = `Logged in as: ${username}`;
                showSection('inventory'); // Show inventory section by default and set its nav button active
            } else {
                loginMessage.textContent = 'Invalid username or password.';
            }
        }

        /*function logout() {
            document.getElementById('login-section').style.display = 'flex'; // Changed to flex for centering
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-message').textContent = '';
            // Remove active class from nav buttons on logout
            document.querySelectorAll('#main-nav button').forEach(button => {
                button.classList.remove('active-nav');
            });
        }

        // Toggle mobile navigation
        document.getElementById('menu-toggle').addEventListener('click', function() {
            document.getElementById('header-right').classList.toggle('active');
        });

        // Initialize display and default active section
        document.addEventListener('DOMContentLoaded', () => {
            // Initially hide the main container and show login
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('login-section').style.display = 'flex';
        });

        // Placeholder functions for data fetching and form submission
        function fetchInventory() { console.log('Fetching inventory...'); }
        function fetchSales() { console.log('Fetching sales...'); }
        function fetchExpenses() { console.log('Fetching expenses...'); }
        function fetchCashJournal() { console.log('Fetching cash journal...'); }
        function generateReports() { console.log('Generating reports...'); }
        // ... (You'll have more detailed JavaScript in script.js)
    
   
    
     function exportTableToExcelSheetJS(tableID, filename = 'excel_data') {
            const table = document.getElementById(tableID);
            const ws = XLSX.utils.table_to_sheet(table); // Convert HTML table to worksheet
            const wb = XLSX.utils.book_new(); // Create new workbook
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); // Add worksheet to workbook

            /* Export to XLSX file */
            XLSX.writeFile(wb, filename + '.xlsx');
        }
    
        
    
