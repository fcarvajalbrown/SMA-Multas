// Format number as Chilean CLP
function formatCLP(value) {
    return '$' + Math.round(value).toLocaleString('es-CL');
}

// Format number with Chilean thousand separators
function formatNumber(value) {
    return value.toLocaleString('es-CL', {maximumFractionDigits: 1});
}

// Format table numbers on page load
function formatTableNumbers() {
    const table = document.getElementById('dataTable');
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // Format UTA column (index 3)
        const utaCell = cells[3];
        const utaValue = parseFloat(utaCell.dataset.value);
        utaCell.textContent = formatNumber(utaValue);
        
        // Format CLP column (index 4) 
        const clpCell = cells[4];
        const clpValue = parseFloat(clpCell.dataset.value);
        clpCell.textContent = formatCLP(clpValue);
    });
}

// Calculate and display key metrics
function updateMetrics() {
    const data = window.finesData;
    
    const totalCLP = data.reduce((sum, r) => sum + r.multa_clp, 0);
    const totalUTA = data.reduce((sum, r) => sum + r.multa_uta, 0);
    const uniqueCompanies = new Set(data.map(r => r.razon_social)).size;
    const maxFine = Math.max(...data.map(r => r.multa_clp));
    
    document.getElementById('total-clp').textContent = formatCLP(totalCLP);
    document.getElementById('total-uta').textContent = totalUTA.toLocaleString('es-CL', {maximumFractionDigits: 1});
    document.getElementById('total-companies').textContent = uniqueCompanies;
    document.getElementById('max-fine').textContent = formatCLP(maxFine);
}

// Chart 1: Fines by Category
function createCategoryChart() {
    const categoryData = {};
    window.finesData.forEach(record => {
        const cat = record.categoria;
        categoryData[cat] = (categoryData[cat] || 0) + record.multa_clp;
    });
    
    const sorted = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    new Chart(document.getElementById('categoryChart'), {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Total Multas (CLP)',
                data: sorted.map(x => x[1]),
                backgroundColor: 'rgba(54, 162, 235, 0.8)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatCLP(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => formatCLP(value)
                    }
                }
            }
        }
    });
}

// Chart 2: Fines by Region
function createRegionChart() {
    const regionData = {};
    window.finesData.forEach(record => {
        const region = record.region;
        regionData[region] = (regionData[region] || 0) + record.multa_clp;
    });
    
    const sorted = Object.entries(regionData)
        .sort((a, b) => b[1] - a[1]);
    
    new Chart(document.getElementById('regionChart'), {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Total Multas (CLP)',
                data: sorted.map(x => x[1]),
                backgroundColor: 'rgba(255, 99, 132, 0.8)'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatCLP(ctx.raw)
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: (value) => formatCLP(value)
                    }
                }
            }
        }
    });
}

// Chart 3: Top 10 Companies
function createCompaniesChart() {
    const companyData = {};
    window.finesData.forEach(record => {
        const company = record.razon_social;
        companyData[company] = (companyData[company] || 0) + record.multa_clp;
    });
    
    const sorted = Object.entries(companyData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    new Chart(document.getElementById('companiesChart'), {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Total Multas (CLP)',
                data: sorted.map(x => x[1]),
                backgroundColor: 'rgba(75, 192, 192, 0.8)'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatCLP(ctx.raw)
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: (value) => formatCLP(value)
                    }
                }
            }
        }
    });
}

// Chart 4: Distribution histogram
function createDistributionChart() {
    const fines = window.finesData.map(r => r.multa_clp);
    
    // Create bins
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
    
    new Chart(document.getElementById('distributionChart'), {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Cantidad de Multas',
                data: counts,
                backgroundColor: 'rgba(153, 102, 255, 0.8)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });
}

// Table search functionality
function setupTableSearch() {
    const searchInput = document.getElementById('searchInput');
    const table = document.getElementById('dataTable');
    const rows = table.querySelectorAll('tbody tr');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Table sort functionality
function setupTableSort() {
    const table = document.getElementById('dataTable');
    const headers = table.querySelectorAll('th[data-sort]');
    
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const sortKey = this.dataset.sort;
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            // Determine sort direction
            const isAsc = this.classList.contains('sort-asc');
            
            // Remove sort classes from all headers
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            
            // Add sort class to current header
            this.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
            
            // Sort rows
            rows.sort((a, b) => {
                let aVal, bVal;
                const colIndex = Array.from(this.parentElement.children).indexOf(this);
                const aCells = a.querySelectorAll('td');
                const bCells = b.querySelectorAll('td');
                
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
            
            // Reorder DOM
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    formatTableNumbers();
    updateMetrics();
    createCategoryChart();
    createRegionChart();
    createCompaniesChart();
    createDistributionChart();
    setupTableSearch();
    setupTableSort();
});