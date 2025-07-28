// File: routes/admin_patterns.js
// Error patterns analytics page (placeholder)

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const DataProcessor = require('../admin/data_processor');

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

// Error patterns page
router.get('/admin/reports/patterns', async (req, res) => {
    const dataProcessor = new DataProcessor();
    const patchData = await dataProcessor.loadPatchData();
    const patches = patchData.patches || [];
    
    const complexityData = dataProcessor.extractComplexityScoring(patches);
    const peakTimeData = dataProcessor.extractPeakErrorTimes(patches);
    const retryData = dataProcessor.extractRetryPatterns(patches);
    
    const content = `
        ${getAdminNav()}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">
                        <i class="bi bi-diagram-3"></i> Error Patterns Analysis
                    </h1>
                    <p class="lead">Analyze error complexity, timing patterns, and retry behaviors</p>
                </div>
            </div>
            
            <!-- Error Complexity Scoring -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-layers"></i> Error Complexity Analysis
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Error Type</th>
                                            <th class="text-center">Avg Recovery Time</th>
                                            <th class="text-center">Success Rate</th>
                                            <th class="text-center">Complexity Score</th>
                                            <th class="text-center">Sample Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.keys(complexityData).map(errorType => {
                                            const data = complexityData[errorType];
                                            const complexityClass = data.complexity === 'Very High' ? 'danger' :
                                                                   data.complexity === 'High' ? 'warning' :
                                                                   data.complexity === 'Medium' ? 'info' :
                                                                   data.complexity === 'Low' ? 'primary' : 'success';
                                            return `
                                                <tr>
                                                    <td><strong>${errorType}</strong></td>
                                                    <td class="text-center">${data.avgRecoveryTime}ms</td>
                                                    <td class="text-center">${data.successRate}%</td>
                                                    <td class="text-center">
                                                        <span class="badge bg-${complexityClass}">${data.complexity}</span>
                                                    </td>
                                                    <td class="text-center">${data.sampleSize}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Peak Error Times -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-clock"></i> Peak Error Times (Hourly)
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="hourlyErrorChart" style="height: 300px;"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-calendar3"></i> Peak Error Days
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="dailyErrorChart" style="height: 300px;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Retry Patterns -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-arrow-repeat"></i> Retry Pattern Analysis
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-primary">${retryData.multipleAttempts}</h4>
                                        <small>Errors with Multiple Attempts</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-success">${retryData.successOnRetry}</h4>
                                        <small>Successful on Retry</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-info">${retryData.totalRetries}</h4>
                                        <small>Total Retry Attempts</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-warning">${retryData.successOnRetry > 0 ? ((retryData.successOnRetry / retryData.multipleAttempts) * 100).toFixed(1) : 0}%</h4>
                                        <small>Retry Success Rate</small>
                                    </div>
                                </div>
                            </div>
                            
                            ${retryData.patterns.length > 0 ? `
                                <h6>Detailed Retry Patterns</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Error Signature</th>
                                                <th class="text-center">Attempts</th>
                                                <th class="text-center">Successes</th>
                                                <th class="text-center">Success Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${retryData.patterns.slice(0, 10).map(pattern => `
                                                <tr>
                                                    <td><small>${pattern.signature}</small></td>
                                                    <td class="text-center">${pattern.attempts}</td>
                                                    <td class="text-center">${pattern.successes}</td>
                                                    <td class="text-center">
                                                        <span class="badge ${pattern.successRate >= 50 ? 'bg-success' : 'bg-danger'}">${pattern.successRate}%</span>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : '<p class="text-muted">No retry patterns detected yet.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Google Charts -->
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawCharts);
            
            function drawCharts() {
                drawHourlyChart();
                drawDailyChart();
            }
            
            function drawHourlyChart() {
                var data = google.visualization.arrayToDataTable([
                    ['Hour', 'Errors'],
                    ${Object.keys(peakTimeData.hourly).map(hour => `['${hour}:00', ${peakTimeData.hourly[hour]}]`).join(',')}
                ]);
                
                var options = {
                    title: 'Error Distribution by Hour',
                    chartArea: {width: '80%', height: '70%'},
                    hAxis: { title: 'Hour of Day' },
                    vAxis: { title: 'Number of Errors' },
                    colors: ['#dc3545']
                };
                
                var chart = new google.visualization.ColumnChart(document.getElementById('hourlyErrorChart'));
                chart.draw(data, options);
            }
            
            function drawDailyChart() {
                var data = google.visualization.arrayToDataTable([
                    ['Day', 'Errors'],
                    ${Object.keys(peakTimeData.daily).map(day => `['${day}', ${peakTimeData.daily[day]}]`).join(',')}
                ]);
                
                var options = {
                    title: 'Error Distribution by Day',
                    chartArea: {width: '80%', height: '70%'},
                    colors: ['#0dcaf0']
                };
                
                var chart = new google.visualization.PieChart(document.getElementById('dailyErrorChart'));
                chart.draw(data, options);
            }
        </script>
    `;
    
    res.send(renderTemplate('Error Patterns - Admin Panel', content));
});

// System health page
router.get('/admin/reports/system', async (req, res) => {
    const dataProcessor = new DataProcessor();
    const patchData = await dataProcessor.loadPatchData();
    const patches = patchData.patches || [];
    const config = require('../config.json');
    
    // Calculate system metrics
    const now = new Date();
    const last24Hours = patches.filter(p => new Date(p.timestamp) > new Date(now - 24 * 60 * 60 * 1000));
    const lastHour = patches.filter(p => new Date(p.timestamp) > new Date(now - 60 * 60 * 1000));
    
    // API usage by provider
    const apiUsage = {};
    Object.keys(config.aiProviders).forEach(provider => {
        const providerPatches = patches.filter(p => p.aiProvider === provider);
        apiUsage[provider] = {
            total: providerPatches.length,
            last24h: providerPatches.filter(p => new Date(p.timestamp) > new Date(now - 24 * 60 * 60 * 1000)).length,
            lastHour: providerPatches.filter(p => new Date(p.timestamp) > new Date(now - 60 * 60 * 1000)).length,
            successRate: providerPatches.length > 0 ? ((providerPatches.filter(p => p.patchStatus === 'success').length / providerPatches.length) * 100).toFixed(1) : 0
        };
    });
    
    // Healing system performance
    const healingPerformance = {
        totalHeals: patches.length,
        successfulHeals: patches.filter(p => p.patchStatus === 'success').length,
        avgRecoveryTime: patches.length > 0 ? Math.round(patches.reduce((sum, p) => sum + (p.recoveryTimeMs || 0), 0) / patches.length) : 0,
        fastestHeal: patches.length > 0 ? Math.min(...patches.map(p => p.recoveryTimeMs || 0)) : 0,
        slowestHeal: patches.length > 0 ? Math.max(...patches.map(p => p.recoveryTimeMs || 0)) : 0,
        last24hActivity: last24Hours.length,
        currentHourActivity: lastHour.length
    };
    
    // Rate limiting status
    const rateLimitStatus = {
        maxPerMinute: config.apiUsageLimit.maxCallsPerMinute,
        maxPerHour: config.apiUsageLimit.maxCallsPerHour,
        maxPerDay: config.apiUsageLimit.maxCallsPerDay,
        currentMinute: lastHour.filter(p => new Date(p.timestamp) > new Date(now - 60 * 1000)).length,
        currentHour: lastHour.length,
        currentDay: last24Hours.length
    };
    
    const content = `
        ${getAdminNav()}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">
                        <i class="bi bi-heart-pulse"></i> System Health Monitor
                    </h1>
                    <p class="lead">API usage statistics, rate limiting status, and healing system performance</p>
                </div>
            </div>
            
            <!-- System Status Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-white bg-success">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">System Status</h6>
                                    <h4 class="mb-0">Online</h4>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-check-circle" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-info">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">24h Activity</h6>
                                    <h4 class="mb-0">${healingPerformance.last24hActivity}</h4>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-activity" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-warning">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Avg Recovery</h6>
                                    <h4 class="mb-0">${healingPerformance.avgRecoveryTime}ms</h4>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-stopwatch" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-primary">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Success Rate</h6>
                                    <h4 class="mb-0">${healingPerformance.totalHeals > 0 ? ((healingPerformance.successfulHeals / healingPerformance.totalHeals) * 100).toFixed(1) : 0}%</h4>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-trophy" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- API Usage Statistics -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-cloud-arrow-up"></i> API Usage by Provider
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>AI Provider</th>
                                            <th class="text-center">Total Calls</th>
                                            <th class="text-center">Last 24h</th>
                                            <th class="text-center">Last Hour</th>
                                            <th class="text-center">Success Rate</th>
                                            <th class="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.keys(apiUsage).map(provider => {
                                            const usage = apiUsage[provider];
                                            const statusClass = usage.successRate >= 80 ? 'success' : usage.successRate >= 60 ? 'warning' : 'danger';
                                            return `
                                                <tr>
                                                    <td><strong>${config.aiProviders[provider]}</strong></td>
                                                    <td class="text-center">${usage.total}</td>
                                                    <td class="text-center">${usage.last24h}</td>
                                                    <td class="text-center">${usage.lastHour}</td>
                                                    <td class="text-center">${usage.successRate}%</td>
                                                    <td class="text-center">
                                                        <span class="badge bg-${statusClass}">
                                                            ${usage.successRate >= 80 ? 'Healthy' : usage.successRate >= 60 ? 'Warning' : 'Critical'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Rate Limiting Status -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-speedometer2"></i> Rate Limiting Status
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span>Per Minute Usage</span>
                                    <span>${rateLimitStatus.currentMinute}/${rateLimitStatus.maxPerMinute}</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar ${rateLimitStatus.currentMinute >= rateLimitStatus.maxPerMinute ? 'bg-danger' : rateLimitStatus.currentMinute >= rateLimitStatus.maxPerMinute * 0.8 ? 'bg-warning' : 'bg-success'}" 
                                         style="width: ${Math.min((rateLimitStatus.currentMinute / rateLimitStatus.maxPerMinute) * 100, 100)}%"></div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span>Per Hour Usage</span>
                                    <span>${rateLimitStatus.currentHour}/${rateLimitStatus.maxPerHour}</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar ${rateLimitStatus.currentHour >= rateLimitStatus.maxPerHour ? 'bg-danger' : rateLimitStatus.currentHour >= rateLimitStatus.maxPerHour * 0.8 ? 'bg-warning' : 'bg-success'}" 
                                         style="width: ${Math.min((rateLimitStatus.currentHour / rateLimitStatus.maxPerHour) * 100, 100)}%"></div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span>Per Day Usage</span>
                                    <span>${rateLimitStatus.currentDay}/${rateLimitStatus.maxPerDay}</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar ${rateLimitStatus.currentDay >= rateLimitStatus.maxPerDay ? 'bg-danger' : rateLimitStatus.currentDay >= rateLimitStatus.maxPerDay * 0.8 ? 'bg-warning' : 'bg-success'}" 
                                         style="width: ${Math.min((rateLimitStatus.currentDay / rateLimitStatus.maxPerDay) * 100, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-gear"></i> Healing System Performance
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6 mb-3">
                                    <div class="border rounded p-2">
                                        <h4 class="text-primary">${healingPerformance.totalHeals}</h4>
                                        <small>Total Heals</small>
                                    </div>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="border rounded p-2">
                                        <h4 class="text-success">${healingPerformance.successfulHeals}</h4>
                                        <small>Successful</small>
                                    </div>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="border rounded p-2">
                                        <h4 class="text-info">${healingPerformance.fastestHeal}ms</h4>
                                        <small>Fastest Heal</small>
                                    </div>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="border rounded p-2">
                                        <h4 class="text-warning">${healingPerformance.slowestHeal}ms</h4>
                                        <small>Slowest Heal</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- System Configuration -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-sliders"></i> Current System Configuration
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <h6>Healing Settings</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Healing Enabled:</strong> <span class="badge ${config.healingEnabled ? 'bg-success' : 'bg-danger'}">${config.healingEnabled ? 'Yes' : 'No'}</span></li>
                                        <li><strong>AI Calls:</strong> <span class="badge ${config.callAI ? 'bg-success' : 'bg-danger'}">${config.callAI ? 'Enabled' : 'Disabled'}</span></li>
                                        <li><strong>Active Provider:</strong> <span class="badge bg-primary">${config.aiProviders[config.aiProvider]}</span></li>
                                    </ul>
                                </div>
                                <div class="col-md-4">
                                    <h6>Rate Limits</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Per Minute:</strong> ${config.apiUsageLimit.maxCallsPerMinute}</li>
                                        <li><strong>Per Hour:</strong> ${config.apiUsageLimit.maxCallsPerHour}</li>
                                        <li><strong>Per Day:</strong> ${config.apiUsageLimit.maxCallsPerDay}</li>
                                    </ul>
                                </div>
                                <div class="col-md-4">
                                    <h6>Error Types Monitored</h6>
                                    <p class="mb-0"><span class="badge bg-secondary">${Object.keys(config.code_errorTypes).length} types</span></p>
                                    <small class="text-muted">${Object.values(config.code_errorTypes).slice(0, 3).join(', ')}${Object.keys(config.code_errorTypes).length > 3 ? '...' : ''}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    res.send(renderTemplate('System Health - Admin Panel', content));
});

// Configuration page (placeholder)
router.get('/admin/config', async (req, res) => {
    const content = `
        ${getAdminNav()}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">
                        <i class="bi bi-sliders"></i> Configuration Management
                    </h1>
                    <div class="alert alert-info">
                        <h5><i class="bi bi-info-circle"></i> Coming Soon</h5>
                        <p class="mb-0">This page will allow configuration of AI providers, healing settings, and research parameters.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    res.send(renderTemplate('Configuration - Admin Panel', content));
});

// Research sessions page (placeholder)
router.get('/admin/sessions', async (req, res) => {
    const content = `
        ${getAdminNav()}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">
                        <i class="bi bi-clock-history"></i> Research Sessions
                    </h1>
                    <div class="alert alert-info">
                        <h5><i class="bi bi-info-circle"></i> Coming Soon</h5>
                        <p class="mb-0">This page will provide research session management and historical analysis tools.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    res.send(renderTemplate('Research Sessions - Admin Panel', content));
});

module.exports = router;
