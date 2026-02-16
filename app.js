p · JS
// Global data storage
let fullData = [];
let filteredData = [];

// Parse CSV
async function loadCSV() {
    const response = await fetch('multas.csv');
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    // Skip header
    fullData = lines.slice(1).map((line, index) => {
        const parts = parseCSVLine(line);
        return {
            id: parts[0],
            facility: parts[1],
            company: parts[2],
            category: parts[3],
            region: parts[4],
            fine: parseFine(parts[5]),
            fineFormatted: parts[5],
            date: parts[6]
        };
    });
    
    filteredData = [...fullData];
    renderTable();
    renderCharts();
}

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Parse fine amount to number
function parseFine(fineStr) {
    return parseInt(fineStr.replace(/[$,]/g, ''));
}

// Format number as Chilean peso
function formatPeso(amount) {
    return '$' + amount.toLocaleString('es-CL');
}

// Render table
function renderTable() {
    const tbody = document.getElementById('dataTable');
    tbody.innerHTML = '';
    
    filteredData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.facility}</td>
            <td>${row.company}</td>
            <td>${row.category}</td>
            <td>${row.region}</td>
            <td class="amount">${formatPeso(row.fine)}</td>
            <td>${row.date}</td>
        `;
        tbody.appendChild(tr);
    });
    
    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('totalRecords').textContent = filteredData.length;
    const totalFines = filteredData.reduce((sum, row) => sum + row.fine, 0);
    document.getElementById('totalFines').textContent = formatPeso(totalFines);
}

// Filter functionality
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    
    filteredData = fullData.filter(row => {
        const matchesSearch = searchText === '' || 
            row.company.toLowerCase().includes(searchText) ||
            row.facility.toLowerCase().includes(searchText);
        const matchesCategory = categoryFilter === '' || row.category === categoryFilter;
        const matchesRegion = regionFilter === '' || row.region === regionFilter;
        
        return matchesSearch && matchesCategory && matchesRegion;
    });
    
    renderTable();
    renderCharts();
}

// Populate filter dropdowns
function populateFilters() {
    const categories = [...new Set(fullData.map(row => row.category))].sort();
    const regions = [...new Set(fullData.map(row => row.region))].sort();
    
    const categorySelect = document.getElementById('categoryFilter');
    const regionSelect = document.getElementById('regionFilter');
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
    
    regions.forEach(reg => {
        const option = document.createElement('option');
        option.value = reg;
        option.textContent = reg;
        regionSelect.appendChild(option);
    });
}

// Sort table
let sortColumn = null;
let sortAscending = true;

function sortTable(column) {
    if (sortColumn === column) {
        sortAscending = !sortAscending;
    } else {
        sortColumn = column;
        sortAscending = true;
    }
    
    filteredData.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (column === 'fine') {
            return sortAscending ? aVal - bVal : bVal - aVal;
        }
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (sortAscending) {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    renderTable();
}

// Render charts
function renderCharts() {
    renderCategoryChart();
    renderTimelineChart();
    renderRegionChart();
    renderTopCompaniesChart();
}

// Chart 1: Fines by Category
function renderCategoryChart() {
    const categoryTotals = {};
    
    filteredData.forEach(row => {
        if (!categoryTotals[row.category]) {
            categoryTotals[row.category] = 0;
        }
        categoryTotals[row.category] += row.fine;
    });
    
    const sorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = sorted[0][1];
    const barHeight = 30;
    const spacing = 10;
    const leftMargin = 200;
    const rightMargin = 150;
    
    sorted.forEach((item, index) => {
        const [category, total] = item;
        const barWidth = ((width - leftMargin - rightMargin) * total) / maxValue;
        const y = index * (barHeight + spacing);
        
        // Draw bar
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(leftMargin, y, barWidth, barHeight);
        
        // Draw category label
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(category, leftMargin - 10, y + barHeight / 2 + 4);
        
        // Draw value
        ctx.textAlign = 'left';
        ctx.fillText(formatPeso(total), leftMargin + barWidth + 10, y + barHeight / 2 + 4);
    });
}

// Chart 2: Timeline
function renderTimelineChart() {
    const yearTotals = {};
    
    filteredData.forEach(row => {
        const year = row.date.split('-')[0];
        if (!yearTotals[year]) {
            yearTotals[year] = 0;
        }
        yearTotals[year] += row.fine;
    });
    
    const sorted = Object.entries(yearTotals).sort();
    
    const canvas = document.getElementById('timelineChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...sorted.map(item => item[1]));
    const bottomMargin = 40;
    const topMargin = 20;
    const leftMargin = 60;
    const rightMargin = 20;
    
    const chartHeight = height - bottomMargin - topMargin;
    const barWidth = (width - leftMargin - rightMargin) / sorted.length - 10;
    
    sorted.forEach((item, index) => {
        const [year, total] = item;
        const barHeight = (chartHeight * total) / maxValue;
        const x = leftMargin + index * (barWidth + 10);
        const y = height - bottomMargin - barHeight;
        
        // Draw bar
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw year label
        ctx.fillStyle = '#1f2937';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(year, x + barWidth / 2, height - 10);
    });
    
    // Y-axis label
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Total Multas', 0, 0);
    ctx.restore();
}

// Chart 3: Regional distribution
function renderRegionChart() {
    const regionTotals = {};
    
    filteredData.forEach(row => {
        if (!regionTotals[row.region]) {
            regionTotals[row.region] = 0;
        }
        regionTotals[row.region] += row.fine;
    });
    
    const sorted = Object.entries(regionTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const canvas = document.getElementById('regionChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = sorted[0][1];
    const barHeight = 25;
    const spacing = 8;
    const leftMargin = 280;
    const rightMargin = 150;
    
    sorted.forEach((item, index) => {
        const [region, total] = item;
        const barWidth = ((width - leftMargin - rightMargin) * total) / maxValue;
        const y = index * (barHeight + spacing);
        
        // Draw bar
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(leftMargin, y, barWidth, barHeight);
        
        // Draw region label
        ctx.fillStyle = '#1f2937';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(region.substring(0, 35), leftMargin - 10, y + barHeight / 2 + 4);
        
        // Draw value
        ctx.textAlign = 'left';
        ctx.fillText(formatPeso(total), leftMargin + barWidth + 10, y + barHeight / 2 + 4);
    });
}

// Chart 4: Top companies
function renderTopCompaniesChart() {
    const companyTotals = {};
    
    filteredData.forEach(row => {
        if (!companyTotals[row.company]) {
            companyTotals[row.company] = 0;
        }
        companyTotals[row.company] += row.fine;
    });
    
    const sorted = Object.entries(companyTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const canvas = document.getElementById('topCompaniesChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = sorted[0][1];
    const barHeight = 25;
    const spacing = 8;
    const leftMargin = 250;
    const rightMargin = 150;
    
    sorted.forEach((item, index) => {
        const [company, total] = item;
        const barWidth = ((width - leftMargin - rightMargin) * total) / maxValue;
        const y = index * (barHeight + spacing);
        
        // Draw bar
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(leftMargin, y, barWidth, barHeight);
        
        // Draw company label
        ctx.fillStyle = '#1f2937';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'right';
        const shortName = company.length > 32 ? company.substring(0, 32) + '...' : company;
        ctx.fillText(shortName, leftMargin - 10, y + barHeight / 2 + 4);
        
        // Draw value
        ctx.textAlign = 'left';
        ctx.fillText(formatPeso(total), leftMargin + barWidth + 10, y + barHeight / 2 + 4);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCSV().then(() => {
        populateFilters();
    });
    
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('regionFilter').addEventListener('change', applyFilters);
});