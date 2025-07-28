// File: routes/admin_sequential.js
// Sequential attempt analysis page for AI provider comparison

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const DataProcessor = require('../admin/data_processor');
const config = require('../config.json');

// Template helper function
function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

// Sanitize string for safe use as DOM ID and JavaScript identifier
function sanitizeForId(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

// Generate admin navigation
function getAdminNav() {
    return fs.readFileSync('templates/admin_nav.html', 'utf8');
}

// Extract sequential attempt data from patches
function extractSequentialAttemptData(patches) {
    const sequentialData = {};
    const providers = Object.keys(config.aiProviders);
    
    // Initialize data structure for all error types
    config.errorTypes.forEach(errorType => {
        sequentialData[errorType] = {};
        providers.forEach(provider => {
            sequentialData[errorType][provider] = [];
        });
    });
    
    // Group patches by error type and provider, maintaining sequential order
    patches.forEach(patch => {
        const errorType = patch.errorType || 'Unknown';
        const provider = patch.aiProvider || patch.provider || 'unknown';
        const recoveryTime = patch.recoveryTimeMs || patch.recoveryTime || 0;
        const isSuccess = patch.patchStatus === 'success';
        
        // Only process if we have this error type in config
        if (config.errorTypes.includes(errorType)) {
            // Ensure provider exists in our data structure
            if (!sequentialData[errorType][provider]) {
                sequentialData[errorType][provider] = [];
            }
            
            // Add recovery time with success/failure status
            sequentialData[errorType][provider].push({
                time: recoveryTime,
                success: isSuccess
            });
        }
    });
    
    // Note: Only use real patch data from logs, no sample data generation
    return sequentialData;
}

// Generate Google Charts data for sequential attempts
function generateSequentialChartData(sequentialData, errorType) {
    const providers = Object.keys(config.aiProviders);
    
    if (!sequentialData[errorType]) {
        // Return minimal data with one zero row to avoid empty chart error
        const headers = ['Attempt'];
        providers.forEach(p => {
            headers.push(config.aiProviders[p]);
        });
        return JSON.stringify([headers, [1, ...providers.map(() => 0)]]);
    }
    
    // Find the maximum number of attempts across all providers for this error type
    let maxAttempts = 0;
    providers.forEach(provider => {
        if (sequentialData[errorType][provider]) {
            maxAttempts = Math.max(maxAttempts, sequentialData[errorType][provider].length);
        }
    });
    
    if (maxAttempts === 0) {
        // Return minimal data with one zero row to avoid empty chart error
        const headers = ['Attempt'];
        providers.forEach(p => {
            headers.push(config.aiProviders[p]);
        });
        return JSON.stringify([headers, [1, ...providers.map(() => 0)]]);
    }
    
    // Create headers with one column per provider and simple tooltip columns
    let dataArray = [['Attempt']];
    providers.forEach(provider => {
        dataArray[0].push(config.aiProviders[provider]);
        dataArray[0].push({type: 'string', role: 'tooltip'});
    });
    
    for (let i = 0; i < maxAttempts; i++) {
        let row = [i + 1];  // Ensure numeric X-axis
        providers.forEach(provider => {
            const attempts = sequentialData[errorType][provider] || [];
            const attempt = attempts[i];
            
            if (attempt) {
                // Add the time value
                row.push(Number(attempt.time) || 0);
                // Add simple text tooltip (no HTML)
                const status = attempt.success ? 'SUCCESS' : 'FAILED';
                const tooltip = `${config.aiProviders[provider]}: ${status} - ${attempt.time}ms (Attempt #${i + 1})`;
                row.push(tooltip);
            } else {
                // No attempt: add 0 and empty tooltip
                row.push(0);
                row.push('');
            }
        });
        dataArray.push(row);
    }
    
    return JSON.stringify(dataArray);
}

// Generate table for sequential attempts
function generateSequentialTable(sequentialData, errorType) {
    const providers = Object.keys(config.aiProviders);
    
    if (!sequentialData[errorType]) {
        return '<p class="text-muted">No data available for this error type.</p>';
    }
    
    // Find the maximum number of attempts
    let maxAttempts = 0;
    providers.forEach(provider => {
        if (sequentialData[errorType][provider]) {
            maxAttempts = Math.max(maxAttempts, sequentialData[errorType][provider].length);
        }
    });
    
    if (maxAttempts === 0) {
        return '<p class="text-muted">No attempts recorded for this error type.</p>';
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Attempt #</th>
                        ${providers.map(provider => `<th class="text-center">${config.aiProviders[provider]}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < maxAttempts; i++) {
        html += `<tr><td><strong>${i + 1}</strong></td>`;
        providers.forEach(provider => {
            const attempts = sequentialData[errorType][provider] || [];
            const attempt = attempts[i];
            
            if (attempt) {
                const time = attempt.time;
                const isSuccess = attempt.success;
                
                if (isSuccess) {
                    const badgeClass = time <= 2000 ? 'bg-success' : 
                                     time <= 4000 ? 'bg-warning' : 'bg-danger';
                    html += `
                        <td class="text-center">
                            <span class="badge ${badgeClass}">✅ ${time}ms</span>
                        </td>
                    `;
                } else {
                    html += `
                        <td class="text-center">
                            <span class="badge bg-danger text-decoration-line-through">❌ ${time}ms</span>
                        </td>
                    `;
                }
            } else {
                html += '<td class="text-center"><span class="text-muted">-</span></td>';
            }
        });
        html += '</tr>';
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Reusable function to generate chart container HTML
function generateChartContainer(errorType, chartId) {
    return `
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-graph-up-arrow"></i> Recovery Time Progression - ${errorType}
                </h5>
                <small class="text-muted">
                    <i class="bi bi-info-circle"></i> 
                    Hover over points to see success/failure status and recovery time. Each provider has a unique point shape.
                </small>
            </div>
            <div class="card-body">
                <div id="${chartId}" style="height: 600px; width: 100%;"></div>
            </div>
        </div>
    `;
}

// Reusable function to generate table container HTML
function generateTableContainer(errorType, tableHtml) {
    return `
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-table"></i> Detailed Attempt Data - ${errorType}
                </h5>
            </div>
            <div class="card-body">
                ${tableHtml}
            </div>
        </div>
    `;
}

// Reusable function to generate error type section HTML
function generateErrorTypeSection(errorType, chartId, tableHtml) {
    return `
        <div class="row mb-5">
            <div class="col-12">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h3 class="mb-0">
                            <i class="bi bi-bug"></i> ${errorType}
                        </h3>
                    </div>
                    <div class="card-body">
                        ${generateChartContainer(errorType, chartId)}
                        ${generateTableContainer(errorType, tableHtml)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Reusable function to generate chart drawing functions
function generateChartFunctions(errorTypes, sequentialData) {
    return errorTypes.map(errorType => {
        const chartId = sanitizeForId(errorType) + 'Chart';
        const functionName = sanitizeForId(errorType).charAt(0).toUpperCase() + sanitizeForId(errorType).slice(1);
        
        return `
            function draw${functionName}Chart() {
                try {
                    var data = google.visualization.arrayToDataTable(${generateSequentialChartData(sequentialData, errorType)});
                    
                    var options = {
                        title: 'Recovery Time by Attempt Number - ${errorType}',
                        titleTextStyle: {fontSize: 18, bold: true, color: '#333'},
                        curveType: 'none',
                        legend: { 
                            position: 'top',
                            alignment: 'center',
                            textStyle: {fontSize: 14, bold: true},
                            maxLines: 2
                        },
                        chartArea: {width: '85%', height: '70%', top: 100, bottom: 80, left: 100, right: 50},
                        lineWidth: 3,
                        pointSize: 8,
                        series: {
                            0: {color: '#27ae60', pointShape: 'circle'},      // Provider 1
                            1: {color: '#3498db', pointShape: 'square'},      // Provider 2
                            2: {color: '#9b59b6', pointShape: 'diamond'},     // Provider 3
                            3: {color: '#f39c12', pointShape: 'triangle'}     // Provider 4
                        },
                        hAxis: {
                            title: 'Attempt Number',
                            titleTextStyle: {color: '#333', fontSize: 16, bold: true},
                            textStyle: {fontSize: 14, bold: true},
                            gridlines: {color: '#e0e0e0', count: -1},
                            minorGridlines: {color: '#f5f5f5', count: 0},
                            baselineColor: '#666'
                        },
                        vAxis: {
                            title: 'Recovery Time (ms)',
                            titleTextStyle: {color: '#333', fontSize: 16, bold: true},
                            textStyle: {fontSize: 14, bold: true},
                            gridlines: {color: '#e0e0e0', count: 8},
                            minorGridlines: {color: '#f5f5f5', count: 0},
                            minValue: 0,
                            baselineColor: '#666'
                        },
                        backgroundColor: 'white',
                        pointsVisible: true,
                        interpolateNulls: false,
                        focusTarget: 'category',
                        tooltip: {
                            trigger: 'both',
                            isHtml: false
                        }
                    };
                    
                    var chart = new google.visualization.LineChart(document.getElementById('${chartId}'));
                    chart.draw(data, options);
                    
                    console.log('Successfully drew chart for ${errorType}');
                } catch (error) {
                    console.error('Error drawing chart for ${errorType}:', error);
                    var errorContainer = document.getElementById('${chartId}');
                    if (errorContainer) {
                        errorContainer.innerHTML = '<div class="alert alert-danger">Chart Error: ' + error.message + '</div>';
                    }
                }
            }`;
    }).join('');
}

// Generate CSV data from all patches
function generatePatchCSV(patches) {
    // CSV headers
    const headers = [
        'timestamp',
        'errorType', 
        'aiProvider',
        'recoveryTimeMs',
        'patchStatus',
        'filename',
        'errorMessage',
        'lineNumber',
        'testsPassed',
        'testsMessage',
        'backupCreated',
        'patchApplied'
    ];
    
    // Convert patches to CSV rows
    const rows = patches.map(patch => {
        // Extract filename without full path
        const filename = patch.filename ? patch.filename.split('\\').pop() : '';
        
        // Flatten testResults
        const testsPassed = patch.testResults ? patch.testResults.passed : false;
        const testsMessage = patch.testResults ? patch.testResults.message : '';
        
        return [
            patch.timestamp || '',
            patch.errorType || '',
            patch.aiProvider || patch.provider || '',
            patch.recoveryTimeMs || patch.recoveryTime || 0,
            patch.patchStatus || '',
            filename,
            (patch.errorMessage || '').replace(/"/g, '""'), // Escape quotes
            patch.lineNumber || '',
            testsPassed,
            (testsMessage || '').replace(/"/g, '""'), // Escape quotes
            patch.backupCreated || false,
            patch.patchApplied || false
        ];
    });
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

// Sequential analysis page
router.get('/admin/reports/sequential', async (req, res) => {
    const dataProcessor = new DataProcessor();
    const patchData = await dataProcessor.loadPatchData();
    const patches = patchData.patches || [];
    
    const sequentialData = extractSequentialAttemptData(patches);
    const errorTypes = config.errorTypes || [];
    
    // Generate all error type sections using reusable functions
    const allSectionsHtml = errorTypes.map(errorType => {
        const chartId = sanitizeForId(errorType) + 'Chart';
        const tableHtml = generateSequentialTable(sequentialData, errorType);
        return generateErrorTypeSection(errorType, chartId, tableHtml);
    }).join('');
    
    const content = `
        ${getAdminNav()}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">
                        <i class="bi bi-arrow-repeat"></i> Sequential Healing Analysis
                    </h1>
                    <p class="lead">Track recovery time progression across sequential healing attempts for each AI provider and error type</p>
                </div>
            </div>
            
            <!-- Data Inspection Section -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card border-info">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0">📊 Data Inspection</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <h6>Raw Patches Count:</h6>
                                    <p><span class="badge bg-primary fs-6">${patches.length}</span> total patches</p>
                                    
                                    <h6>AI Providers:</h6>
                                    ${Object.keys(config.aiProviders).map(provider => 
                                        `<span class="badge bg-secondary me-1">${config.aiProviders[provider]}</span>`
                                    ).join('')}
                                    
                                    <div class="mt-3">
                                        <a href="/admin/reports/sequential/export-csv" class="btn btn-success btn-sm">
                                            <i class="bi bi-download"></i> Download CSV
                                        </a>
                                        <small class="d-block text-muted mt-1">
                                            Exports all ${patches.length} patches with 12 fields
                                        </small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <h6>Error Types:</h6>
                                    ${config.errorTypes.map(errorType => 
                                        `<span class="badge bg-warning text-dark me-1 mb-1">${errorType}</span>`
                                    ).join('')}
                                </div>
                                <div class="col-md-4">
                                    <h6>Processed Sequential Data:</h6>
                                    <pre style="background: #f8f9fa; padding: 10px; max-height: 200px; overflow-y: auto; font-size: 0.8em;">${JSON.stringify(sequentialData, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="row mb-4">
                <div class="col-12 text-end">
                    <button class="btn btn-outline-primary" onclick="refreshAllCharts()">
                        <i class="bi bi-arrow-clockwise"></i> Refresh All Charts
                    </button>
                </div>
            </div>
                    ${allSectionsHtml}
                </div>
            </div>
        </div>
        
        <!-- Google Charts -->
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
            google.charts.load('current', {'packages':['corechart', 'line']});
            google.charts.setOnLoadCallback(drawCharts);
            
            function drawCharts() {
                // Draw all charts immediately since they're all visible
                ${errorTypes.map(errorType => {
                    const functionName = sanitizeForId(errorType).charAt(0).toUpperCase() + sanitizeForId(errorType).slice(1);
                    return `
                console.log('Drawing chart for: ${errorType}');
                draw${functionName}Chart();`;
                }).join('\n                ')}
            }
            
            ${generateChartFunctions(errorTypes, sequentialData)}
            
            // Manual refresh function for all charts
            function refreshAllCharts() {
                console.log('Manually refreshing all charts...');
                ${errorTypes.map(errorType => {
                    const functionName = sanitizeForId(errorType).charAt(0).toUpperCase() + sanitizeForId(errorType).slice(1);
                    return `draw${functionName}Chart();`;
                }).join('\n                ')}
            }
        </script>
    `;
    
    res.send(renderTemplate('Sequential Analysis - Admin Panel', content));
});

// CSV download route
router.get('/admin/reports/sequential/export-csv', async (req, res) => {
    try {
        const dataProcessor = new DataProcessor();
        const patchData = await dataProcessor.loadPatchData();
        const patches = patchData.patches || [];
        
        const csvContent = generatePatchCSV(patches);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `patch-data-${timestamp}.csv`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
    } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).json({ error: 'Failed to generate CSV export' });
    }
});

module.exports = router;
