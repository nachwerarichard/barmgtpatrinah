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

       
