// File: routes/admin_seqcolumn.js
// Sequential column analysis page - shows only successful recovery times

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

// Extract success-only data from patches
function extractSuccessData(patches) {
    const successData = {};
    const providers = Object.keys(config.aiProviders);
    
    // Initialize data structure for all error types
    config.errorTypes.forEach(errorType => {
        successData[errorType] = {};
        providers.forEach(provider => {
            successData[errorType][provider] = [];
        });
    });
    
    // Group patches by error type and provider (include both success and failed)
    patches.forEach(patch => {
        const errorType = patch.errorType || 'Unknown';
        const provider = patch.aiProvider || patch.provider || 'unknown';
        const recoveryTime = patch.recoveryTimeMs || patch.recoveryTime || 0;
        const isSuccess = patch.patchStatus === 'success';
        
        // Process all patches for configured error types
        if (config.errorTypes.includes(errorType)) {
            if (!successData[errorType][provider]) {
                successData[errorType][provider] = [];
            }
            // Add recovery time if successful, 0 if failed
            successData[errorType][provider].push(isSuccess ? recoveryTime : 0);
        }
    });
    
    return successData;
}

// Calculate average recovery times for summary
function calculateAverages(successData) {
    const providers = Object.keys(config.aiProviders);
    const averages = {};
    const summaryStats = {};
    
    config.errorTypes.forEach(errorType => {
        averages[errorType] = {};
        summaryStats[errorType] = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            successRate: 0
        };
        
        providers.forEach(provider => {
            const attempts = successData[errorType] && successData[errorType][provider] ? successData[errorType][provider] : [];
            const successfulAttempts = attempts.filter(time => time > 0);
            const failedAttempts = attempts.filter(time => time === 0);
            
            // Calculate average of successful attempts only
            const avgTime = successfulAttempts.length > 0 ? 
                Math.round(successfulAttempts.reduce((sum, time) => sum + time, 0) / successfulAttempts.length) : 0;
            
            averages[errorType][provider] = avgTime;
            
            // Update summary stats
            summaryStats[errorType].totalAttempts += attempts.length;
            summaryStats[errorType].successfulAttempts += successfulAttempts.length;
            summaryStats[errorType].failedAttempts += failedAttempts.length;
        });
        
        // Calculate success rate
        if (summaryStats[errorType].totalAttempts > 0) {
            summaryStats[errorType].successRate = Math.round(
                (summaryStats[errorType].successfulAttempts / summaryStats[errorType].totalAttempts) * 100
            );
        }
    });
    
    return { averages, summaryStats };
}

// Generate Google Charts column data for successful attempts only
function generateColumnData(successData, errorType) {
    const providers = Object.keys(config.aiProviders);
    
    if (!successData[errorType]) {
        return JSON.stringify([['Attempt', ...providers], [1, ...providers.map(() => 0)]]);
    }
    
    // Find maximum number of attempts across all providers
    let maxAttempts = 0;
    providers.forEach(provider => {
        if (successData[errorType][provider]) {
            maxAttempts = Math.max(maxAttempts, successData[errorType][provider].length);
        }
    });
    
    if (maxAttempts === 0) {
        return JSON.stringify([['Attempt', ...providers], [1, ...providers.map(() => 0)]]);
    }
    
    // Build data array
    let dataArray = [['Attempt', ...providers]];
    
    for (let i = 0; i < maxAttempts; i++) {
        let row = [i + 1];  // Attempt number
        providers.forEach(provider => {
            const attempts = successData[errorType][provider] || [];
            const recoveryTime = attempts[i] || 0;  // 0 if no attempt or failed attempt
            row.push(Number(recoveryTime));
        });
        dataArray.push(row);
    }
    
    return JSON.stringify(dataArray);
}

// Generate simple table for successful attempts
function generateSimpleTable(successData, errorType) {
    const providers = Object.keys(config.aiProviders);
    
    if (!successData[errorType]) {
        return '<p class="text-muted">No recovery data available for this error type.</p>';
    }
    
    // Find maximum number of attempts
    let maxAttempts = 0;
    providers.forEach(provider => {
        if (successData[errorType][provider]) {
            maxAttempts = Math.max(maxAttempts, successData[errorType][provider].length);
        }
    });
    
    if (maxAttempts === 0) {
        return '<p class="text-muted">No recoveries recorded for this error type.</p>';
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Attempt #</th>
                        ${providers.map(provider => `<th class="text-center">${provider}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < maxAttempts; i++) {
        html += `<tr><td><strong>${i + 1}</strong></td>`;
        providers.forEach(provider => {
            const attempts = successData[errorType][provider] || [];
            const recoveryTime = attempts[i];
            
            if (recoveryTime && recoveryTime > 0) {
                const badgeClass = recoveryTime <= 2000 ? 'bg-success' : 
                                 recoveryTime <= 4000 ? 'bg-warning' : 'bg-danger';
                html += `
                    <td class="text-center">
                        <span class="badge ${badgeClass}">✅ ${recoveryTime}ms</span>
                    </td>
                `;
            } else if (recoveryTime === 0) {
                html += '<td class="text-center"><span class="badge bg-danger">❌ Failed</span></td>';
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

// Generate chart container HTML
function generateChartContainer(errorType, chartId) {
    return `
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-bar-chart"></i> Successful Recovery Times - ${errorType}
                </h5>
                <small class="text-muted">
                    <i class="bi bi-info-circle"></i> 
                    Success and failed attempts shown. Failed attempts appear as zero-value columns.
                </small>
            </div>
            <div class="card-body">
                <div id="${chartId}" style="height: 500px; width: 100%;"></div>
            </div>
        </div>
    `;
}

// Generate table container HTML
function generateTableContainer(errorType, tableHtml) {
    return `
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-table"></i> Success Data Table - ${errorType}
                </h5>
            </div>
            <div class="card-body">
                ${tableHtml}
            </div>
        </div>
    `;
}

// Generate error type section HTML
function generateErrorTypeSection(errorType, chartId, tableHtml) {
    return `
        <div class="row mb-5">
            <div class="col-12">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h3 class="mb-0">
                            <i class="bi bi-check-circle"></i> ${errorType}
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

// Generate chart drawing functions
function generateChartFunctions(errorTypes, successData) {
    const providers = Object.keys(config.aiProviders);
    
    return errorTypes.map(errorType => {
        const chartId = sanitizeForId(errorType) + 'ColumnChart';
        const functionName = sanitizeForId(errorType).charAt(0).toUpperCase() + sanitizeForId(errorType).slice(1);
        
        return `
            function draw${functionName}ColumnChart() {
                try {
                    var data = google.visualization.arrayToDataTable(${generateColumnData(successData, errorType)});
                    
                    var options = {
                        title: 'Successful Recovery Times by Attempt - ${errorType}',
                        titleTextStyle: {fontSize: 18, bold: true, color: '#333'},
                        legend: { 
                            position: 'top',
                            alignment: 'center',
                            textStyle: {fontSize: 14, bold: true},
                            maxLines: 2
                        },
                        chartArea: {width: '85%', height: '70%', top: 100, bottom: 80, left: 80, right: 50},
                        colors: ['#27ae60', '#3498db', '#9b59b6', '#f39c12'],
                        hAxis: {
                            title: 'Attempt Number',
                            titleTextStyle: {color: '#333', fontSize: 16, bold: true},
                            textStyle: {fontSize: 14, bold: true}
                        },
                        vAxis: {
                            title: 'Recovery Time (ms)',
                            titleTextStyle: {color: '#333', fontSize: 16, bold: true},
                            textStyle: {fontSize: 14, bold: true},
                            minValue: 0
                        },
                        backgroundColor: 'white',
                        bar: {groupWidth: '75%'}
                    };
                    
                    var chart = new google.visualization.ColumnChart(document.getElementById('${chartId}'));
                    chart.draw(data, options);
                    
                    console.log('Successfully drew column chart for ${errorType}');
                } catch (error) {
                    console.error('Error drawing column chart for ${errorType}:', error);
                    var errorContainer = document.getElementById('${chartId}');
                    if (errorContainer) {
                        errorContainer.innerHTML = '<div class="alert alert-danger">Chart Error: ' + error.message + '</div>';
                    }
                }
            }`;
    }).join('');
}

// Generate average chart drawing function
function generateAverageChartFunction(averages) {
    return `
        function drawAverageChart() {
            try {
                var data = google.visualization.arrayToDataTable(${generateAverageChartData(averages)});
                
                var options = {
                    title: 'Average Recovery Times by Error Type',
                    titleTextStyle: {fontSize: 20, bold: true, color: '#333'},
                    legend: { 
                        position: 'top',
                        alignment: 'center',
                        textStyle: {fontSize: 14, bold: true},
                        maxLines: 2
                    },
                    chartArea: {width: '85%', height: '70%', top: 100, bottom: 80, left: 100, right: 50},
                    colors: ['#27ae60', '#3498db', '#9b59b6', '#f39c12'],
                    hAxis: {
                        title: 'Error Types',
                        titleTextStyle: {color: '#333', fontSize: 16, bold: true},
                        textStyle: {fontSize: 12, bold: true}
                    },
                    vAxis: {
                        title: 'Average Recovery Time (ms)',
                        titleTextStyle: {color: '#333', fontSize: 16, bold: true},
                        textStyle: {fontSize: 14, bold: true},
                        minValue: 0
                    },
                    backgroundColor: 'white',
                    bar: {groupWidth: '75%'}
                };
                
                var chart = new google.visualization.ColumnChart(document.getElementById('averageChart'));
                chart.draw(data, options);
                
                console.log('Successfully drew average chart');
            } catch (error) {
                console.error('Error drawing average chart:', error);
                var errorContainer = document.getElementById('averageChart');
                if (errorContainer) {
                    errorContainer.innerHTML = '<div class="alert alert-danger">Chart Error: ' + error.message + '</div>';
                }
            }
        }`;
}

// Generate average chart data
function generateAverageChartData(averages) {
    const providers = Object.keys(config.aiProviders);
    let dataArray = [['Error Type', ...providers]];
    
    config.errorTypes.forEach(errorType => {
        let row = [errorType];
        providers.forEach(provider => {
            const avgTime = averages[errorType] && averages[errorType][provider] ? averages[errorType][provider] : 0;
            row.push(Number(avgTime));
        });
        dataArray.push(row);
    });
    
    return JSON.stringify(dataArray);
}

// Generate summary statistics table
function generateSummaryTable(summaryStats) {
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Error Type</th>
                        <th class="text-center">Total Attempts</th>
                        <th class="text-center">Successful</th>
                        <th class="text-center">Failed</th>
                        <th class="text-center">Success Rate</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    config.errorTypes.forEach(errorType => {
        const stats = summaryStats[errorType];
        const successRateClass = stats.successRate >= 80 ? 'bg-success' : 
                                stats.successRate >= 60 ? 'bg-warning' : 'bg-danger';
        
        html += `
            <tr>
                <td><strong>${errorType}</strong></td>
                <td class="text-center"><span class="badge bg-primary">${stats.totalAttempts}</span></td>
                <td class="text-center"><span class="badge bg-success">${stats.successfulAttempts}</span></td>
                <td class="text-center"><span class="badge bg-danger">${stats.failedAttempts}</span></td>
                <td class="text-center"><span class="badge ${successRateClass}">${stats.successRate}%</span></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Sequential column analysis page
router.get('/admin/reports/seqcolumn', async (req, res) => {
    try {
        const dataProcessor = new DataProcessor();
        const patchData = await dataProcessor.loadPatchData();
        const patches = patchData.patches || [];
        
        const successData = extractSuccessData(patches);
        const errorTypes = config.errorTypes || [];
        
        // Generate all error type sections
        const allSectionsHtml = errorTypes.map(errorType => {
            const chartId = sanitizeForId(errorType) + 'ColumnChart';
            const tableHtml = generateSimpleTable(successData, errorType);
            return generateErrorTypeSection(errorType, chartId, tableHtml);
        }).join('');
        
        // Count successful vs total attempts
        const totalPatches = patches.length;
        const successfulPatches = patches.filter(p => p.patchStatus === 'success').length;
        
        // Calculate averages and summary stats
        const { averages, summaryStats } = calculateAverages(successData);
        
        // Generate summary table
        const summaryTableHtml = generateSummaryTable(summaryStats);
        
        const content = `
            ${getAdminNav()}
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="mb-4">
                            <i class="bi bi-bar-chart-fill"></i> Sequential Column Analysis
                        </h1>
                        <p class="lead">Successful recovery times across sequential healing attempts - clean research data</p>
                    </div>
                </div>
                
                <!-- Summary Statistics -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-success">
                            <div class="card-header bg-success text-white">
                                <h5 class="mb-0">📊 Success Summary</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-3">
                                        <h6>Total Patches:</h6>
                                        <p><span class="badge bg-primary fs-6">${totalPatches}</span></p>
                                    </div>
                                    <div class="col-md-3">
                                        <h6>Successful Patches:</h6>
                                        <p><span class="badge bg-success fs-6">${successfulPatches}</span></p>
                                    </div>
                                    <div class="col-md-3">
                                        <h6>Success Rate:</h6>
                                        <p><span class="badge bg-info fs-6">${totalPatches > 0 ? Math.round((successfulPatches/totalPatches)*100) : 0}%</span></p>
                                    </div>
                                    <div class="col-md-3">
                                        <h6>AI Providers:</h6>
                                        <p>${Object.keys(config.aiProviders).map(p => `<span class="badge bg-secondary me-1">${p}</span>`).join('')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Average Recovery Times Chart -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-info">
                            <div class="card-header bg-info text-white">
                                <h5 class="mb-0">
                                    <i class="bi bi-graph-up"></i> Average Recovery Times by Error Type
                                </h5>
                                <small class="text-white">
                                    <i class="bi bi-info-circle"></i> 
                                    Average recovery times for successful attempts only
                                </small>
                            </div>
                            <div class="card-body">
                                <div id="averageChart" style="height: 400px; width: 100%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Statistics Table -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-warning">
                            <div class="card-header bg-warning text-dark">
                                <h5 class="mb-0">
                                    <i class="bi bi-table"></i> Detailed Statistics Summary
                                </h5>
                            </div>
                            <div class="card-body">
                                ${summaryTableHtml}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Table -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-info">
                            <div class="card-header bg-info text-white">
                                <h5 class="mb-0">📋 Summary Statistics Table</h5>
                            </div>
                            <div class="card-body">
                                ${summaryTableHtml}
                            </div>
                        </div>
                    </div>
                </div>

                ${allSectionsHtml}
            </div>
            
            <!-- Google Charts -->
            <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
            <script type="text/javascript">
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawCharts);
                
                function drawCharts() {
                    ${errorTypes.map(errorType => {
                        const functionName = sanitizeForId(errorType).charAt(0).toUpperCase() + sanitizeForId(errorType).slice(1);
                        return `
                    console.log('Drawing column chart for: ${errorType}');
                    draw${functionName}ColumnChart();`;
                    }).join('\n                    ')}
                    
                    // Draw average chart
                    drawAverageChart();
                }
                
                ${generateChartFunctions(errorTypes, successData)}
                ${generateAverageChartFunction(averages)}
            </script>
        `;
        
        res.send(renderTemplate('Sequential Column Analysis - Admin Panel', content));
        
    } catch (error) {
        console.error('Error in sequential column analysis:', error);
        res.status(500).send('Error loading sequential column analysis');
    }
});

module.exports = router;
