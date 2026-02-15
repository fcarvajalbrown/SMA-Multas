// Format number as Chilean CLP
function formatCLP(value) {
    return '$' + Math.round(value).toLocaleString('es-CL');
}

// Format number with Chilean thousand separators
function formatNumber(value) {
    return value.toLocaleString('es-CL', {maximumFractionDigits: 1});
}

// Calculate and display key metrics
function updateMetrics() {
    console.log('updateMetrics called');
    console.log('finesData:', window.finesData);
    
    if (!window.finesData || window.finesData.length === 0) {
        console.error('No data available!');
        return;
    }
    
    const data = window.finesData;
    
    const totalCLP = data.reduce((sum, r) => sum + r.multa_clp, 0);
    const totalUTA = data.reduce((sum, r) => sum + r.multa_uta, 0);
    const uniqueCompanies = new Set(data.map(r => r.razon_social)).size;
    const maxFine = Math.max(...data.map(r => r.multa_clp));
    
    console.log('Metrics calculated:', {totalCLP, totalUTA, uniqueCompanies, maxFine});
    
    document.getElementById('total-clp').textContent = formatCLP(totalCLP);
    document.getElementById('total-uta').textContent = formatNumber(totalUTA);
    document.getElementById('total-companies').textContent = uniqueCompanies;
    document.getElementById('max-fine').textContent = formatCLP(maxFine);
}

// Chart 1: Fines by Category
function createCategoryChart() {
    console.log('createCategoryChart called');
    
    if (!window.finesData || window.finesData.length === 0) {
        console.error('No data for category chart');
        return;
    }
    
    const categoryData = {};
    window.finesData.forEach(record => {
        const cat = record.categoria;
        categoryData[cat] = (categoryData[cat] || 0) + record.multa_clp;
    });
    
    const sorted = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const ctx = document.getElementById('categoryChart');
    if (!ctx) {
        console.error('categoryChart canvas not found');
        return;
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Total Multas (CLP)',
                data: sorted.map(x => x[1]),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCLP(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCLP(value);
                        }
                    }
                }
            }
        }
    });
    console.log('Category chart created');
}

// Chart 2: Fines by Region
function createRegionChart() {
    console.log('createRegionChart called');
    
    if (!window.finesData || window.finesData.length === 0) {
        console.error('No data for region chart');
        return;
    }
    
    const regionData = {};
    window.finesData.forEach(record => {
        const region = record.region;
        regionData[region] = (regionData[region] || 0) + record.multa_clp;
    });
    
    const sorted = Object.entries(regionData)
        .sort((a, b) => b[1] - a[1]);
    
    const ctx = document.getElementById('regionChart');
    if (!ctx) {
        console.error('regionChart canvas not found');
        return;
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Total Multas (CLP)',
                data: sorted.map(x => x[1]),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCLP(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCLP(value);
                        }
                    }
                }
            }
        }
    });
    console.log('Region chart created');
}

// Chart 3: Top 10 Companies
function createCompaniesChart() {
    console.log('createCompaniesChart called');
    
    if (!window.finesData || window.finesData.length === 0) {
        console.error('No data for companies chart');
        return;
    }
    
    const companyData = {};
    window.finesData.forEach(record => {
        const company = record.razon_social;
        companyData[company] = (companyData[company] || 0) + record.multa_clp;
    });
    
    const sorted = Object.entries(companyData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const ctx = document.getElementById('companiesChart');
    if (!ctx) {
        console.error('companiesChart canvas not found');
        return;
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Total Multas (CLP)',
                data: sorted.map(x => x[1]),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCLP(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCLP(value);
                        }
                    }
                }
            }
        }
    });
    console.log('Companies chart created');
}

// Chart 4: Distribution of Fine Sizes
function createDistributionChart() {
    console.log('createDistributionChart called');
    
    if (!window.finesData || window.finesData.length === 0) {
        console.error('No data for distribution chart');
        return;
    }
    
    const fines = window.finesData.map(r => r.multa_clp);
    const bins = [0, 10e6, 50e6, 100e6, 500e6, 1e9, 5e9, Infinity];
    const binLabels = ['<10M', '10M-50M', '50M-100M', '100M-500M', '500M-1B', '1B-5B', '>5B'];
    const counts = Array(bins.length - 1).fill(0);
    
    fines.forEach(fine => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (fine >= bins[i] && fine < bins[i + 1]) {
                counts[i]++;
                break;
            }
        }
    });
    
    const ctx = document.getElementById('distributionChart');
    if (!ctx) {
        console.error('distributionChart canvas not found');
        return;
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Cantidad de Multas',
                data: counts,
                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });
    console.log('Distribution chart created');
}

// Table search functionality
function setupTableSearch() {
    console.log('setupTableSearch called');
    
    const searchInput = document.getElementById('searchInput');
    const table = document.getElementById('dataTable');
    
    if (!searchInput || !table) {
        console.error('Search input or table not found');
        return;
    }
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    console.log('Table search setup complete');
}

// Table sorting functionality
function setupTableSort() {
    console.log('setupTableSort called');
    
    const table = document.getElementById('dataTable');
    if (!table) {
        console.error('Table not found for sorting');
        return;
    }
    
    const headers = table.querySelectorAll('th[data-sort]');
    
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const isAsc = this.classList.contains('sort-asc');
            
            // Remove sort classes from all headers
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            
            // Add appropriate class to clicked header
            this.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
            
            const colIndex = Array.from(this.parentElement.children).indexOf(this);
            
            rows.sort((a, b) => {
                let aVal, bVal;
                const aCells = a.querySelectorAll('td');
                const bCells = b.querySelectorAll('td');
                
                const sortKey = this.dataset.sort;
                
                if (sortKey === 'multa_uta' || sortKey === 'multa_clp') {
                    aVal = parseFloat(aCells[colIndex].dataset.value || 0);
                    bVal = parseFloat(bCells[colIndex].dataset.value || 0);
                } else if (sortKey === 'fecha_termino') {
                    aVal = new Date(aCells[colIndex].dataset.value);
                    bVal = new Date(bCells[colIndex].dataset.value);
                } else {
                    aVal = aCells[colIndex].textContent.toLowerCase();
                    bVal = bCells[colIndex].textContent.toLowerCase();
                }
                
                if (aVal < bVal) return isAsc ? 1 : -1;
                if (aVal > bVal) return isAsc ? -1 : 1;
                return 0;
            });
            
            rows.forEach(row => tbody.appendChild(row));
        });
    });
    console.log('Table sort setup complete');
}

// Format table numbers on page load
function formatTableNumbers() {
    console.log('formatTableNumbers called');
    
    const table = document.getElementById('dataTable');
    if (!table) {
        console.error('Table not found');
        return;
    }
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;
        
        // Format UTA column (index 3)
        const utaCell = cells[3];
        if (utaCell.dataset.value) {
            const utaValue = parseFloat(utaCell.dataset.value);
            utaCell.textContent = formatNumber(utaValue);
        }
        
        // Format CLP column (index 4) 
        const clpCell = cells[4];
        if (clpCell.dataset.value) {
            const clpValue = parseFloat(clpCell.dataset.value);
            clpCell.textContent = formatCLP(clpValue);
        }
    });
    console.log('Table numbers formatted');
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    console.log('finesData available:', typeof window.finesData !== 'undefined');
    console.log('finesData length:', window.finesData ? window.finesData.length : 0);
    
    try {
        formatTableNumbers();
        updateMetrics();
        createCategoryChart();
        createRegionChart();
        createCompaniesChart();
        createDistributionChart();
        setupTableSearch();
        setupTableSort();
        console.log('All initialization complete!');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});