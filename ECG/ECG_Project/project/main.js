let csvData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 50;
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initUpload();
    initFilters();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const sectionTitle = document.getElementById('section-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');

            const titles = {
                'overview': 'Overview',
                'explorer': 'Data Explorer',
                'visualization': 'Visualization',
                'analysis': 'Analysis'
            };
            sectionTitle.textContent = titles[targetSection];
        });
    });
}

function initUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('csvFileInput');

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    csvData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        csvData.push(row);
    }

    filteredData = [...csvData];
    console.log('CSV Data Sample:', csvData.slice(0, 3));
    console.log('Headers:', headers);
    updateDashboard();
}

function updateDashboard() {
    updateOverview();
    updateDataExplorer();
    updateVisualization();
    updateAnalysis();
}

function updateOverview() {
    const classColumn = Object.keys(csvData[0]).find(key => {
        const lower = key.toLowerCase();
        return lower.includes('class') || lower.includes('target') || lower === 'label' || lower === 'type';
    });

    let normalCount = 0;
    let arrhythmiaCount = 0;
    let stressCount = 0;

    csvData.forEach(row => {
        const value = String(row[classColumn] || '').trim().toLowerCase();

        if (value === 'normal' || value === '0') {
            normalCount++;
        } else if (value === 'arrhythmia' || value === '1') {
            arrhythmiaCount++;
        } else if (value === 'stress' || value === '2') {
            stressCount++;
        }
    });

    document.getElementById('totalClasses').textContent = csvData.length;
    document.getElementById('normalCount').textContent = normalCount;
    document.getElementById('arrhythmiaCount').textContent = arrhythmiaCount;
    document.getElementById('stressCount').textContent = stressCount;

    createPieChart(normalCount, arrhythmiaCount, stressCount);
    updateDataQuality();
}

function createPieChart(normal, arrhythmia, stress) {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');

    if (charts.pie) {
        charts.pie.destroy();
    }

    charts.pie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Normal', 'Arrhythmia', 'Stress'],
            datasets: [{
                data: [normal, arrhythmia, stress],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a0aec0' }
                }
            }
        }
    });
}

function updateDataQuality() {
    const headers = Object.keys(csvData[0]);
    let missingValues = 0;
    let duplicates = 0;

    csvData.forEach(row => {
        headers.forEach(header => {
            if (!row[header] || row[header] === '') missingValues++;
        });
    });

    const uniqueRows = new Set(csvData.map(row => JSON.stringify(row)));
    duplicates = csvData.length - uniqueRows.size;

    const qualityCheck = document.getElementById('qualityCheck');
    qualityCheck.innerHTML = `
        <div class="quality-item">
            <span class="quality-label">Total Records</span>
            <span class="quality-value good">${csvData.length}</span>
        </div>
        <div class="quality-item">
            <span class="quality-label">Missing Values</span>
            <span class="quality-value ${missingValues === 0 ? 'good' : 'warning'}">${missingValues}</span>
        </div>
        <div class="quality-item">
            <span class="quality-label">Duplicate Rows</span>
            <span class="quality-value ${duplicates === 0 ? 'good' : 'warning'}">${duplicates}</span>
        </div>
        <div class="quality-item">
            <span class="quality-label">Columns</span>
            <span class="quality-value good">${headers.length}</span>
        </div>
    `;
}

function updateDataExplorer() {
    const headers = Object.keys(csvData[0]);
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100" class="placeholder-text">No data to display</td></tr>';
        return;
    }

    tableBody.innerHTML = pageData.map(row => {
        return '<tr>' + headers.map(h => `<td>${row[h] || '-'}</td>`).join('') + '</tr>';
    }).join('');

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= Math.min(totalPages, 10); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    pagination.innerHTML = html;
}

window.goToPage = function(page) {
    currentPage = page;
    updateDataExplorer();
}

function initFilters() {
    const searchInput = document.getElementById('searchInput');
    const classFilter = document.getElementById('classFilter');
    const applyRange = document.getElementById('applyRange');

    searchInput.addEventListener('input', applyFilters);
    classFilter.addEventListener('change', applyFilters);
    applyRange.addEventListener('click', applyFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const classFilter = document.getElementById('classFilter').value;
    const hrMin = document.getElementById('hrMin').value;
    const hrMax = document.getElementById('hrMax').value;

    filteredData = csvData.filter(row => {
        const matchesSearch = !searchTerm || Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm)
        );

        const classColumn = Object.keys(row).find(key => {
            const lower = key.toLowerCase();
            return lower.includes('class') || lower.includes('target') || lower === 'label' || lower === 'type';
        });

        let matchesClass = true;
        if (classFilter !== 'all') {
            const value = String(row[classColumn] || '').trim().toLowerCase();
            if (classFilter === 'normal') {
                matchesClass = value === 'normal' || value === '0';
            } else if (classFilter === 'arrhythmia') {
                matchesClass = value === 'arrhythmia' || value === '1';
            } else if (classFilter === 'stress') {
                matchesClass = value === 'stress' || value === '2';
            }
        }

        const hrColumn = Object.keys(row).find(key => {
            const lower = key.toLowerCase();
            return lower.includes('heart') || lower.includes('rate') || lower.includes('hr');
        });
        const hr = parseFloat(row[hrColumn]);
        const matchesRange = (!hrMin || hr >= parseFloat(hrMin)) &&
                            (!hrMax || hr <= parseFloat(hrMax));

        return matchesSearch && matchesClass && matchesRange;
    });

    currentPage = 1;
    updateDataExplorer();
}

function updateVisualization() {
    const hrColumn = Object.keys(csvData[0]).find(key =>
        key.toLowerCase().includes('heart') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('hr')
    );

    const qrsColumn = Object.keys(csvData[0]).find(key =>
        key.toLowerCase().includes('qrs')
    );

    createBarChart(hrColumn);
    createLineChart(hrColumn);
    createScatterChart(hrColumn, qrsColumn);
}

function createBarChart(hrColumn) {
    const canvas = document.getElementById('barChart');
    const ctx = canvas.getContext('2d');

    if (charts.bar) {
        charts.bar.destroy();
    }

    const hrRanges = { '60-80': 0, '80-100': 0, '100-120': 0, '120-140': 0, '140+': 0 };

    csvData.forEach(row => {
        const hr = parseFloat(row[hrColumn]);
        if (hr < 80) hrRanges['60-80']++;
        else if (hr < 100) hrRanges['80-100']++;
        else if (hr < 120) hrRanges['100-120']++;
        else if (hr < 140) hrRanges['120-140']++;
        else hrRanges['140+']++;
    });

    charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(hrRanges),
            datasets: [{
                label: 'Count',
                data: Object.values(hrRanges),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#a0aec0' } }
            },
            scales: {
                x: { ticks: { color: '#a0aec0' }, grid: { color: '#2d3748' } },
                y: { ticks: { color: '#a0aec0' }, grid: { color: '#2d3748' } }
            }
        }
    });
}

function createLineChart(hrColumn) {
    const canvas = document.getElementById('lineChart');
    const ctx = canvas.getContext('2d');

    if (charts.line) {
        charts.line.destroy();
    }

    const hrData = csvData.slice(0, 100).map(row => parseFloat(row[hrColumn]));

    charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hrData.map((_, i) => i + 1),
            datasets: [{
                label: 'Heart Rate',
                data: hrData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#a0aec0' } }
            },
            scales: {
                x: { ticks: { color: '#a0aec0' }, grid: { color: '#2d3748' } },
                y: { ticks: { color: '#a0aec0' }, grid: { color: '#2d3748' } }
            }
        }
    });
}

function createScatterChart(hrColumn, qrsColumn) {
    const canvas = document.getElementById('scatterChart');
    const ctx = canvas.getContext('2d');

    if (charts.scatter) {
        charts.scatter.destroy();
    }

    const scatterData = csvData.slice(0, 200).map(row => ({
        x: parseFloat(row[hrColumn]),
        y: parseFloat(row[qrsColumn])
    })).filter(d => !isNaN(d.x) && !isNaN(d.y));

    charts.scatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'HR vs QRS',
                data: scatterData,
                backgroundColor: '#f59e0b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#a0aec0' } }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Heart Rate', color: '#a0aec0' },
                    ticks: { color: '#a0aec0' },
                    grid: { color: '#2d3748' }
                },
                y: {
                    title: { display: true, text: 'QRS Duration', color: '#a0aec0' },
                    ticks: { color: '#a0aec0' },
                    grid: { color: '#2d3748' }
                }
            }
        }
    });
}

function updateAnalysis() {
    const hrColumn = Object.keys(csvData[0]).find(key =>
        key.toLowerCase().includes('heart') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('hr')
    );

    const hrValues = csvData.map(row => parseFloat(row[hrColumn])).filter(v => !isNaN(v));
    const mean = hrValues.reduce((a, b) => a + b, 0) / hrValues.length;
    const sorted = [...hrValues].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...hrValues);
    const max = Math.max(...hrValues);
    const stdDev = Math.sqrt(hrValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / hrValues.length);

    document.getElementById('statsSummary').innerHTML = `
        <div class="stat-row"><span class="label">Mean:</span><span class="value">${mean.toFixed(2)}</span></div>
        <div class="stat-row"><span class="label">Median:</span><span class="value">${median.toFixed(2)}</span></div>
        <div class="stat-row"><span class="label">Std Dev:</span><span class="value">${stdDev.toFixed(2)}</span></div>
        <div class="stat-row"><span class="label">Min:</span><span class="value">${min.toFixed(2)}</span></div>
        <div class="stat-row"><span class="label">Max:</span><span class="value">${max.toFixed(2)}</span></div>
    `;

    const classColumn = Object.keys(csvData[0]).find(key =>
        key.toLowerCase().includes('class') || key.toLowerCase().includes('target')
    );

    const normalPct = (document.getElementById('normalCount').textContent / csvData.length * 100).toFixed(1);
    const arrhythmiaPct = (document.getElementById('arrhythmiaCount').textContent / csvData.length * 100).toFixed(1);
    const stressPct = (document.getElementById('stressCount').textContent / csvData.length * 100).toFixed(1);

    document.getElementById('classAnalysis').innerHTML = `
        <div class="stat-row"><span class="label">Normal:</span><span class="value">${normalPct}%</span></div>
        <div class="stat-row"><span class="label">Arrhythmia:</span><span class="value">${arrhythmiaPct}%</span></div>
        <div class="stat-row"><span class="label">Stress:</span><span class="value">${stressPct}%</span></div>
        <div class="stat-row"><span class="label">Total Records:</span><span class="value">${csvData.length}</span></div>
    `;

    const normalHR = hrValues.filter((_, i) => csvData[i][classColumn]?.toLowerCase().includes('normal'));
    const normalMean = normalHR.reduce((a, b) => a + b, 0) / normalHR.length;

    document.getElementById('hrInsights').innerHTML = `
        <div class="stat-row"><span class="label">Overall Avg HR:</span><span class="value">${mean.toFixed(2)} bpm</span></div>
        <div class="stat-row"><span class="label">Normal Avg HR:</span><span class="value">${normalMean.toFixed(2)} bpm</span></div>
        <div class="stat-row"><span class="label">HR Range:</span><span class="value">${min.toFixed(0)} - ${max.toFixed(0)} bpm</span></div>
        <div class="stat-row"><span class="label">Variance:</span><span class="value">${(stdDev * stdDev).toFixed(2)}</span></div>
    `;

    document.getElementById('recommendations').innerHTML = `
        <p>Based on the data analysis:</p>
        <div class="stat-row"><span class="label">Dataset Size:</span><span class="value">${csvData.length > 500 ? 'Good' : 'Small'}</span></div>
        <div class="stat-row"><span class="label">Class Balance:</span><span class="value">${Math.abs(normalPct - 33.3) < 10 ? 'Balanced' : 'Imbalanced'}</span></div>
        <div class="stat-row"><span class="label">Data Quality:</span><span class="value">Good</span></div>
    `;
}
