        
        const authScreen = document.getElementById('auth-screen');
        const dashboardContent = document.getElementById('dashboard-content');
        const authError = document.getElementById('auth-error');
        
        const lowStockList = document.getElementById('low-stock-list');
        const chartLoadingStatus = document.getElementById('chart-loading-status');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const applyFilterButton = document.getElementById('apply-filter-button');
        const periodDisplay = document.getElementById('period-display');
        
        let chartInstance = null;
        
        // --- Utility Functions ---

        function showMessage(title, message, isError = true) {
            const modal = document.getElementById('message-modal');
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-title').classList.toggle('text-red-400', isError);
            document.getElementById('modal-title').classList.toggle('text-green-400', !isError);
            document.getElementById('modal-content').textContent = message;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }

        function getDateString(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function setDefaultDateRange() {
            const today = new Date();
            const sevenDaysAgo = new Date();
            // Go back 6 days to include today, making it 7 days total.
            sevenDaysAgo.setDate(today.getDate() - 6); 

            endDateInput.value = getDateString(today);
            startDateInput.value = getDateString(sevenDaysAgo);
        }


        async function apiFetch(endpoint) {
            if (!authToken) {
                showMessage('Authentication Error', 'You are not logged in.', true);
                return null;
            }

            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    headers: {
                        'Authorization': `Basic ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    // Force logout on auth failure
                    handleLogout();
                    showMessage('Session Expired', 'Your session has expired. Please log in again.', true);
                    return null;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                return response.json();

            } catch (error) {
                console.error('API Fetch Error:', error);
                showMessage('Network Error', `Could not fetch data: ${error.message}. Check the backend server status or the date range.`, true);
                return null;
            }
        }

        // --- Auth Logic ---

        function updateUI(isAuthenticated) {
            if (isAuthenticated) {
                authScreen.classList.add('hidden');
                dashboardContent.classList.remove('hidden');
                dashboardContent.classList.add('block');
                const username = atob(authToken).split(':')[0];
                document.getElementById('user-info').textContent = `Logged in as: ${username}`;
                setDefaultDateRange(); // Set default range on login
                loadDashboardData();
            } else {
                authScreen.classList.remove('hidden');
                dashboardContent.classList.add('hidden');
            }
        }

        async function handleLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';
            authError.classList.add('hidden');

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    authToken = data.token;
                    localStorage.setItem('authToken', authToken);
                    updateUI(true);
                } else {
                    authError.textContent = data.error || 'Login failed. Please check your credentials.';
                    authError.classList.remove('hidden');
                }
            } catch (error) {
                authError.textContent = 'Could not connect to the server.';
                authError.classList.remove('hidden');
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        }

        function handleLogout() {
            authToken = null;
            localStorage.removeItem('authToken');
            updateUI(false);
        }
        
        // --- Dashboard Rendering ---

        function renderFinancialChart(data) {
            chartLoadingStatus.classList.add('hidden');
            
            const labels = data.map(d => d._id);
            const revenues = data.map(d => d.totalRevenue);
            const profits = data.map(d => d.totalProfit);
            const expenses = data.map(d => d.totalExpenses);

            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = document.getElementById('financialChart').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'bar', // Default type is bar, line types are defined in datasets
                data: {
                    labels: labels,
                    datasets: [
                        {
                            // Gross Profit is a line for clarity on margin
                            type: 'line',
                            label: 'Gross Profit',
                            data: profits,
                            backgroundColor: 'rgba(52, 211, 153, 0.9)', // green-400
                            borderColor: 'rgb(52, 211, 153)',
                            pointRadius: 5,
                            pointBackgroundColor: 'rgb(52, 211, 153)',
                            tension: 0.4,
                            fill: false,
                            borderWidth: 3,
                            yAxisID: 'y'
                        },
                        {
                            // Revenue is a bar
                            type: 'bar',
                            label: 'Total Revenue',
                            data: revenues,
                            backgroundColor: 'rgba(99, 102, 241, 0.8)', // indigo-500
                            borderColor: 'rgb(99, 102, 241)',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                         {
                            // Expenses is a bar
                            type: 'bar',
                            label: 'Total Expenses',
                            data: expenses,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
                            borderColor: 'rgb(239, 68, 68)',
                            borderWidth: 1,
                            yAxisID: 'y'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    // IMPORTANT: Stacked is set to false to show Revenue and Expense bars side-by-side
                    scales: {
                        x: {
                            stacked: false, 
                            title: { display: true, text: 'Date (EAT)', color: '#9CA3AF' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#D1D5DB' }
                        },
                        y: {
                            stacked: false, // Ensures bars are not stacked vertically
                            beginAtZero: true,
                            title: { display: true, text: 'Amount (USD)', color: '#9CA3AF' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { 
                                color: '#D1D5DB',
                                callback: function(value) {
                                    return formatCurrency(value); // Format ticks as currency
                                } 
                            }
                        }
                    },
                    plugins: {
                        legend: { labels: { color: '#D1D5DB' } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }

        function renderKpis(financialSummary, lowStockSummary) {
            document.getElementById('kpi-revenue').textContent = formatCurrency(financialSummary.totalRevenue);
            document.getElementById('kpi-profit').textContent = formatCurrency(financialSummary.totalProfit);
            document.getElementById('kpi-expenses').textContent = formatCurrency(financialSummary.totalExpenses);
            document.getElementById('kpi-low-stock').textContent = lowStockSummary.count;
            document.getElementById('low-stock-count').textContent = lowStockSummary.count;
            
            periodDisplay.textContent = financialSummary.periodDescription;
            
            // Highlight KPI based on Net Profit
            const netProfit = financialSummary.netProfit;
            const profitKpiCard = document.getElementById('kpi-profit').closest('.kpi-card');
            // Remove previous borders and apply new ones based on net profit
            profitKpiCard.classList.remove('border-green-500', 'border-red-500', 'border-yellow-500');
            if (netProfit > 0) {
                 profitKpiCard.classList.add('border-green-500');
            } else if (netProfit < 0) {
                 profitKpiCard.classList.add('border-red-500');
            } else {
                 profitKpiCard.classList.add('border-yellow-500');
            }
        }

        function renderLowStockTable(items) {
            lowStockList.innerHTML = ''; // Clear existing content

            if (items.length === 0) {
                lowStockList.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-gray-500">No low stock items. Inventory looks good!</td></tr>';
                return;
            }

            items.forEach(item => {
                const row = document.createElement('tr');
                row.classList.add('hover:bg-gray-700', 'transition', 'duration-150');
                row.innerHTML = `
                    <td class="py-3 text-sm font-medium text-white">${item.item}</td>
                    <td class="py-3 text-sm text-right font-bold text-red-400">${item.closingStock} units</td>
                `;
                lowStockList.appendChild(row);
            });
        }
        
        // Main function to load data
        async function loadDashboardData() {
            // Check for custom range input
            const start = startDateInput.value;
            const end = endDateInput.value;
            
            let financialEndpoint = '/reports/financial-summary';
            if (start && end) {
                financialEndpoint += `?start=${start}&end=${end}`;
            }

            // Show loading status
            chartLoadingStatus.classList.remove('hidden');
            chartLoadingStatus.textContent = 'Loading financial data...';
            
            // 1. Fetch Financial Summary
            const financialDataPromise = apiFetch(financialEndpoint);
            
            // 2. Fetch Low Stock Items (This is always for the current status)
            const lowStockDataPromise = apiFetch('/reports/low-stock-items');

            const [financialData, lowStockData] = await Promise.all([financialDataPromise, lowStockDataPromise]);

            if (financialData) {
                renderKpis(financialData, lowStockData || { count: 0 });
                renderFinancialChart(financialData.chartData);
            } else {
                 chartLoadingStatus.textContent = 'Failed to load financial data. Check console for details.';
            }

            if (lowStockData) {
                renderLowStockTable(lowStockData.items);
            }
        }

        // --- Event Listeners and Initialization ---
        loginButton.addEventListener('click', handleLogin);
        logoutButton.addEventListener('click', handleLogout);
        applyFilterButton.addEventListener('click', loadDashboardData);

        document.addEventListener('DOMContentLoaded', () => {
            if (authToken) {
                updateUI(true);
            } else {
                updateUI(false);
            }
        });
    
