// File: routes/admin_performance.js
// Performance analytics page for AI provider comparison

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

// Generate admin navigation
function getAdminNav() {
    return fs.readFileSync('templates/admin_nav.html', 'utf8');
}

// Generate Google Charts data for success rates
function generateSuccessRateChartData(successData) {
    const providers = Object.keys(config.aiProviders);
    const errorTypes = Object.values(config.code_errorTypes);
    
    let dataArray = [['Error Type', ...providers]];
    
    errorTypes.forEach(errorType => {
        let row = [errorType];
        providers.forEach(provider => {
            const rate = successData[errorType] && successData[errorType][provider] 
                ? parseFloat(successData[errorType][provider].rate) : 0;
            row.push(rate);
        });
        dataArray.push(row);
    });
    
    return JSON.stringify(dataArray);
}

// Generate Google Charts data for recovery times
function generateRecoveryTimeChartData(recoveryData) {
    const providers = Object.keys(config.aiProviders);
    const errorTypes = Object.values(config.code_errorTypes);
    
    let dataArray = [['Error Type', ...providers]];
    
    errorTypes.forEach(errorType => {
        let row = [errorType];
        providers.forEach(provider => {
            const avgTime = recoveryData[errorType] && recoveryData[errorType][provider] 
                ? recoveryData[errorType][provider].avg : 0;
            row.push(avgTime);
        });
        dataArray.push(row);
    });
    
    return JSON.stringify(dataArray);
}

// Generate table HTML for success rates
function generateSuccessRateTable(successData) {
    const providers = Object.keys(config.aiProviders);
    const errorTypes = config.errorTypes;
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Error Type</th>
                        ${providers.map(provider => `<th class="text-center">${config.aiProviders[provider]}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    errorTypes.forEach(errorType => {
        html += `<tr><td><strong>${errorType}</strong></td>`;
        providers.forEach(provider => {
            const data = successData[errorType] && successData[errorType][provider] 
                ? successData[errorType][provider] : { rate: 0, success: 0, total: 0 };
            
            const badgeClass = data.rate >= 90 ? 'bg-success' : 
                             data.rate >= 70 ? 'bg-warning' : 'bg-danger';
            
            html += `
                <td class="text-center">
                    <span class="badge ${badgeClass}">${data.rate}%</span>
                    <br><small class="text-muted">${data.success}/${data.total}</small>
                </td>
            `;
        });
        html += '</tr>';
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Generate table HTML for recovery times
function generateRecoveryTimeTable(recoveryData) {
    const providers = Object.keys(config.aiProviders);
    const errorTypes = config.errorTypes;
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Error Type</th>
                        ${providers.map(provider => `<th class="text-center">${config.aiProviders[provider]}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    errorTypes.forEach(errorType => {
        html += `<tr><td><strong>${errorType}</strong></td>`;
        providers.forEach(provider => {
            const data = recoveryData[errorType] && recoveryData[errorType][provider] 
                ? recoveryData[errorType][provider] : { avg: 0, min: 0, max: 0, times: [] };
            
            const badgeClass = data.avg <= 2000 ? 'bg-success' : 
                             data.avg <= 4000 ? 'bg-warning' : 'bg-danger';
            
            html += `
                <td class="text-center">
                    <span class="badge ${badgeClass}">${data.avg}ms</span>
                    ${data.times.length > 0 ? `<br><small class="text-muted">${data.min}-${data.max}ms</small>` : ''}
                </td>
            `;
        });
        html += '</tr>';
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Performance analytics page
router.get('/admin/reports/performance', async (req, res) => {
    const dataProcessor = new DataProcessor();
    const patchData = await dataProcessor.loadPatchData();
    const patches = patchData.patches || [];
    
    const successData = dataProcessor.extractSuccessRateData(patches);
    const recoveryData = dataProcessor.extractRecoveryTimeData(patches);
    const summaryStats = await dataProcessor.generateSummaryStats();
    
    const content = `
        ${getAdminNav()}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">
                        <i class="bi bi-graph-up"></i> Performance Analytics
                    </h1>
                    <p class="lead">AI Provider comparison and performance metrics for self-healing effectiveness</p>
                </div>
            </div>
            
            <!-- Summary Stats -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h5 class="card-title">Total Patches</h5>
                            <h3 class="text-primary">${summaryStats.totalPatches}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h5 class="card-title">Overall Success</h5>
                            <h3 class="text-success">${summaryStats.overallSuccessRate}%</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h5 class="card-title">Avg Recovery</h5>
                            <h3 class="text-info">${summaryStats.avgRecoveryTime}ms</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h5 class="card-title">Data Points</h5>
                            <h3 class="text-secondary">${patches.length}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Success Rate Analysis -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-check-circle"></i> Success Rate by Error Type and AI Provider
                            </h5>
                        </div>
                        <div class="card-body">
                            <!-- Chart -->
                            <div id="successRateChart" style="height: 600px;"></div>
                            
                            <!-- Table -->
                            <h6 class="mt-4">Detailed Success Rate Data</h6>
                            ${generateSuccessRateTable(successData)}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recovery Time Analysis -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-stopwatch"></i> Recovery Time by Error Type and AI Provider
                            </h5>
                        </div>
                        <div class="card-body">
                            <!-- Chart -->
                            <div id="recoveryTimeChart" style="height: 600px;"></div>
                            
                            <!-- Table -->
                            <h6 class="mt-4">Detailed Recovery Time Data</h6>
                            ${generateRecoveryTimeTable(recoveryData)}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Provider Comparison Summary -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-trophy"></i> AI Provider Performance Summary
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                ${Object.keys(config.aiProviders).map(provider => {
                                    // Calculate overall metrics for this provider
                                    let totalSuccess = 0, totalAttempts = 0, totalRecoveryTime = 0, recoveryCount = 0;
                                    
                                    config.errorTypes.forEach(errorType => {
                                        if (successData[errorType] && successData[errorType][provider]) {
                                            totalSuccess += successData[errorType][provider].success;
                                            totalAttempts += successData[errorType][provider].total;
                                        }
                                        if (recoveryData[errorType] && recoveryData[errorType][provider] && recoveryData[errorType][provider].times.length > 0) {
                                            totalRecoveryTime += recoveryData[errorType][provider].avg;
                                            recoveryCount++;
                                        }
                                    });
                                    
                                    const overallSuccessRate = totalAttempts > 0 ? ((totalSuccess / totalAttempts) * 100).toFixed(1) : 0;
                                    const avgRecoveryTime = recoveryCount > 0 ? Math.round(totalRecoveryTime / recoveryCount) : 0;
                                    
                                    return `
                                        <div class="col-md-4 mb-3">
                                            <div class="card h-100">
                                                <div class="card-body">
                                                    <h6 class="card-title">${config.aiProviders[provider]}</h6>
                                                    <p class="card-text">
                                                        <strong>Success Rate:</strong> ${overallSuccessRate}%<br>
                                                        <strong>Avg Recovery:</strong> ${avgRecoveryTime}ms<br>
                                                        <strong>Total Patches:</strong> ${totalAttempts}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Google Charts -->
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
            google.charts.load('current', {'packages':['corechart', 'bar']});
            google.charts.setOnLoadCallback(drawCharts);
            
            function drawCharts() {
                drawSuccessRateChart();
                drawRecoveryTimeChart();
            }
            
            function drawSuccessRateChart() {
                var data = google.visualization.arrayToDataTable(${generateSuccessRateChartData(successData)});
                
                var options = {
                    title: 'Success Rate by Error Type and AI Provider (%)',
                    titleTextStyle: {fontSize: 18, bold: true, color: '#333'},
                    chartArea: {width: '75%', height: '75%', top: 60, bottom: 60, left: 200},
                    colors: ['#27ae60', '#3498db', '#9b59b6', '#e74c3c', '#f39c12'],
                    hAxis: {
                        title: 'Success Rate (%)',
                        titleTextStyle: {fontSize: 16, bold: true, color: '#333'},
                        textStyle: {fontSize: 14, bold: true},
                        minValue: 0,
                        maxValue: 100,
                        gridlines: {color: '#e0e0e0', count: 6},
                        baselineColor: '#666'
                    },
                    vAxis: {
                        title: 'Error Types',
                        titleTextStyle: {fontSize: 16, bold: true, color: '#333'},
                        textStyle: {fontSize: 14, bold: true}
                    },
                    legend: { 
                        position: 'top', 
                        alignment: 'center',
                        textStyle: {fontSize: 14, bold: true},
                        maxLines: 3 
                    },
                    bar: { groupWidth: '70%' },
                    backgroundColor: 'white'
                };
                
                var chart = new google.visualization.BarChart(document.getElementById('successRateChart'));
                chart.draw(data, options);
            }
            
            function drawRecoveryTimeChart() {
                var data = google.visualization.arrayToDataTable(${generateRecoveryTimeChartData(recoveryData)});
                
                var options = {
                    title: 'Average Recovery Time by Error Type and AI Provider (ms)',
                    titleTextStyle: {fontSize: 18, bold: true, color: '#333'},
                    chartArea: {width: '75%', height: '75%', top: 60, bottom: 60, left: 200},
                    colors: ['#27ae60', '#3498db', '#9b59b6', '#e74c3c', '#f39c12'],
                    hAxis: {
                        title: 'Recovery Time (ms)',
                        titleTextStyle: {fontSize: 16, bold: true, color: '#333'},
                        textStyle: {fontSize: 14, bold: true},
                        minValue: 0,
                        gridlines: {color: '#e0e0e0', count: 8},
                        baselineColor: '#666'
                    },
                    vAxis: {
                        title: 'Error Types',
                        titleTextStyle: {fontSize: 16, bold: true, color: '#333'},
                        textStyle: {fontSize: 14, bold: true}
                    },
                    legend: { 
                        position: 'top', 
                        alignment: 'center',
                        textStyle: {fontSize: 14, bold: true},
                        maxLines: 3 
                    },
                    bar: { groupWidth: '70%' },
                    backgroundColor: 'white'
                };
                
                var chart = new google.visualization.BarChart(document.getElementById('recoveryTimeChart'));
                chart.draw(data, options);
            }
        </script>
    `;
    
    res.send(renderTemplate('Performance Analytics - Admin Panel', content));
});

module.exports = router;
