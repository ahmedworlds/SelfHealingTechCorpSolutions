// File: routes/admin.js
// Admin Control Panel routes for research analytics and configuration

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const DataProcessor = require('../admin/data_processor');
const RestorationManager = require('../admin/restoration_manager');
const RestorationReports = require('../admin/restoration_reports');

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

// Admin dashboard home
router.get('/admin', async (req, res) => {
    const dataProcessor = new DataProcessor();
    const summaryStats = await dataProcessor.generateSummaryStats();
    
    const content = `
        ${getAdminNav()}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h1 class="mb-4">
                        <i class="bi bi-speedometer2"></i> Research Dashboard
                    </h1>
                </div>
            </div>
            
            <!-- Summary Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-white bg-primary">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">Total Patches</h5>
                                    <h2 class="mb-0">${summaryStats.totalPatches}</h2>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-tools" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-success">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">Success Rate</h5>
                                    <h2 class="mb-0">${summaryStats.overallSuccessRate}%</h2>
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
                                    <h5 class="card-title">Avg Recovery</h5>
                                    <h2 class="mb-0">${summaryStats.avgRecoveryTime}ms</h2>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-stopwatch" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-white bg-secondary">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">Data Range</h5>
                                    <p class="mb-0 small">${summaryStats.dateRange}</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-calendar-range" style="font-size: 2rem;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-graph-up"></i> Performance Analytics
                            </h5>
                            <p class="card-text">View AI provider comparison, success rates, and recovery time analysis.</p>
                            <a href="/admin/reports/performance" class="btn btn-primary">View Report</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-diagram-3"></i> Error Patterns
                            </h5>
                            <p class="card-text">Analyze error complexity, peak times, and retry patterns.</p>
                            <a href="/admin/reports/patterns" class="btn btn-primary">View Report</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-heart-pulse"></i> System Health
                            </h5>
                            <p class="card-text">Monitor system performance, API usage, and healing efficiency.</p>
                            <a href="/admin/reports/system" class="btn btn-primary">View Report</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    res.send(renderTemplate('Admin Dashboard - Research Control Panel', content));
});

// Admin restoration tool
router.get('/admin/restore', async (req, res) => {
    try {
        const restorationManager = new RestorationManager();
        
        // Get file status and statistics
        const fileStatus = await restorationManager.getFileStatus();
        const stats = await restorationManager.getRestorationStats();
        const validation = await restorationManager.validateRestoreDirectory();
        
        const content = `
            ${getAdminNav()}
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="mb-4">
                            <i class="bi bi-arrow-clockwise"></i> Function Restoration Tool
                        </h1>
                        <p class="lead">Restore error-injected function files from the permanent backup in <code>/restore</code> folder.</p>
                    </div>
                </div>
                
                <!-- Statistics Cards -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-white bg-info">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="card-title">Total Files</h6>
                                        <h3 class="mb-0">${stats.totalFiles}</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-files" style="font-size: 1.5rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-success">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="card-title">Up to Date</h6>
                                        <h3 class="mb-0">${stats.upToDate}</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-check-circle" style="font-size: 1.5rem;"></i>
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
                                        <h6 class="card-title">Need Restore</h6>
                                        <h3 class="mb-0">${stats.needsRestore}</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-exclamation-triangle" style="font-size: 1.5rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-danger">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="card-title">Missing</h6>
                                        <h3 class="mb-0">${stats.missing}</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-x-circle" style="font-size: 1.5rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Validation Status -->
                ${!validation.restoreDirExists || validation.errors.length > 0 ? `
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <h5><i class="bi bi-exclamation-triangle"></i> Validation Issues</h5>
                            ${!validation.restoreDirExists ? '<p>Restore directory not found!</p>' : ''}
                            ${validation.errors.length > 0 ? `
                                <p>File validation errors:</p>
                                <ul>
                                    ${validation.errors.map(error => `<li>${error}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Bulk Actions -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-lightning-fill"></i> Bulk Actions
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="d-flex gap-2 flex-wrap">
                                    <button class="btn btn-success" onclick="restoreAllFiles()" ${!validation.restoreDirExists ? 'disabled' : ''}>
                                        <i class="bi bi-download"></i> Restore All Functions
                                    </button>
                                    <button class="btn btn-warning" onclick="restoreModifiedOnly()">
                                        <i class="bi bi-arrow-clockwise"></i> Restore Modified Only
                                    </button>
                                    <button class="btn btn-info" onclick="checkAllFiles()">
                                        <i class="bi bi-search"></i> Re-scan Files
                                    </button>
                                    <button class="btn btn-secondary" onclick="showRestorationLog()">
                                        <i class="bi bi-clock-history"></i> View Log
                                    </button>
                                </div>
                                <div id="bulkStatus" class="mt-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- File Status Table -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-file-earmark-code"></i> Function Files Status
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <input type="checkbox" id="selectAll" onchange="toggleAllCheckboxes()">
                                                </th>
                                                <th>Function File</th>
                                                <th>Status</th>
                                                <th>Size Comparison</th>
                                                <th>Last Modified</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${fileStatus.map(file => `
                                                <tr id="row-${file.filename}" class="${file.needsRestore ? 'table-warning' : ''}">
                                                    <td>
                                                        <input type="checkbox" class="file-checkbox" 
                                                               value="${file.filename}" 
                                                               ${file.needsRestore ? 'checked' : ''}>
                                                    </td>
                                                    <td>
                                                        <code>${file.filename}</code>
                                                    </td>
                                                    <td>
                                                        ${file.hasCurrentFile ? 
                                                            (file.needsRestore ? 
                                                                '<span class="badge bg-warning"><i class="bi bi-exclamation-triangle"></i> Modified</span>' : 
                                                                '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Up to date</span>'
                                                            ) : 
                                                            '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Missing</span>'
                                                        }
                                                    </td>
                                                    <td>
                                                        <small>
                                                            Current: ${file.hasCurrentFile ? file.currentSize + ' bytes' : 'N/A'}<br>
                                                            Restore: ${file.restoreSize} bytes
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <small>
                                                            Current: ${file.currentDate}<br>
                                                            Restore: ${file.restoreDate}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <button class="btn btn-sm btn-primary" 
                                                                onclick="restoreFile('${file.filename}')"
                                                                ${!validation.restoreDirExists ? 'disabled' : ''}>
                                                            <i class="bi bi-download"></i> Restore
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Restoration Log Modal -->
                <div class="modal fade" id="logModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-clock-history"></i> Restoration Log
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div id="logContent">Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced JavaScript for restoration functionality -->
                <script>
                async function restoreFile(filename) {
                    try {
                        const response = await fetch('/admin/restore/file', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ filename })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            showAlert('success', \`Successfully restored \${filename}\`);
                            setTimeout(() => location.reload(), 1500);
                        } else {
                            showAlert('danger', \`Failed to restore \${filename}: \${result.error}\`);
                        }
                    } catch (error) {
                        showAlert('danger', \`Error restoring \${filename}: \${error.message}\`);
                    }
                }
                
                async function restoreAllFiles() {
                    const confirmed = confirm('Are you sure you want to restore ALL function files? This will overwrite all current function files with the backup versions.');
                    if (!confirmed) return;
                    
                    showLoading('Restoring all files...');
                    
                    try {
                        const response = await fetch('/admin/restore/all', {
                            method: 'POST'
                        });
                        
                        const result = await response.json();
                        hideLoading();
                        
                        if (result.success) {
                            showAlert('success', \`Successfully restored \${result.filesRestored} files\`);
                            setTimeout(() => location.reload(), 2000);
                        } else {
                            showAlert('danger', \`Restore completed with issues: \${result.message}\`);
                        }
                    } catch (error) {
                        hideLoading();
                        showAlert('danger', \`Error during bulk restore: \${error.message}\`);
                    }
                }
                
                async function restoreModifiedOnly() {
                    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
                    const filenames = Array.from(checkboxes).map(cb => cb.value);
                    
                    if (filenames.length === 0) {
                        showAlert('warning', 'No files selected for restoration.');
                        return;
                    }
                    
                    const confirmed = confirm(\`Are you sure you want to restore \${filenames.length} selected files?\`);
                    if (!confirmed) return;
                    
                    showLoading(\`Restoring \${filenames.length} selected files...\`);
                    
                    try {
                        const response = await fetch('/admin/restore/selected', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ filenames })
                        });
                        
                        const result = await response.json();
                        hideLoading();
                        
                        if (result.success) {
                            showAlert('success', \`Successfully restored \${result.filesRestored} files\`);
                            setTimeout(() => location.reload(), 2000);
                        } else {
                            showAlert('warning', \`Restore completed with issues: \${result.message}\`);
                        }
                    } catch (error) {
                        hideLoading();
                        showAlert('danger', \`Error during selective restore: \${error.message}\`);
                    }
                }
                
                function checkAllFiles() {
                    location.reload();
                }
                
                async function showRestorationLog() {
                    try {
                        const response = await fetch('/admin/restore/log');
                        const log = await response.json();
                        
                        const logContent = document.getElementById('logContent');
                        
                        if (log.entries && log.entries.length > 0) {
                            logContent.innerHTML = \`
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                                <th>Target</th>
                                                <th>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            \${log.entries.map(entry => \`
                                                <tr class="\${entry.status === 'SUCCESS' ? 'table-success' : 'table-danger'}">
                                                    <td><small>\${new Date(entry.timestamp).toLocaleString()}</small></td>
                                                    <td><span class="badge bg-secondary">\${entry.type}</span></td>
                                                    <td>
                                                        <span class="badge \${entry.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}">
                                                            \${entry.status}
                                                        </span>
                                                    </td>
                                                    <td><code>\${entry.target}</code></td>
                                                    <td><small>\${entry.details}</small></td>
                                                </tr>
                                            \`).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            \`;
                        } else {
                            logContent.innerHTML = '<p class="text-muted">No restoration log entries found.</p>';
                        }
                        
                        const modal = new bootstrap.Modal(document.getElementById('logModal'));
                        modal.show();
                        
                    } catch (error) {
                        showAlert('danger', \`Error loading restoration log: \${error.message}\`);
                    }
                }
                
                function toggleAllCheckboxes() {
                    const selectAll = document.getElementById('selectAll');
                    const checkboxes = document.querySelectorAll('.file-checkbox');
                    checkboxes.forEach(cb => cb.checked = selectAll.checked);
                }
                
                function showAlert(type, message) {
                    const alertDiv = document.createElement('div');
                    alertDiv.className = \`alert alert-\${type} alert-dismissible fade show\`;
                    alertDiv.innerHTML = \`
                        \${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    \`;
                    
                    const container = document.querySelector('.container');
                    container.insertBefore(alertDiv, container.firstChild);
                    
                    // Auto-hide after 5 seconds
                    setTimeout(() => {
                        if (alertDiv.parentNode) {
                            alertDiv.remove();
                        }
                    }, 5000);
                }
                
                function showLoading(message) {
                    const loadingDiv = document.createElement('div');
                    loadingDiv.id = 'loadingOverlay';
                    loadingDiv.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
                    loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    loadingDiv.style.zIndex = '9999';
                    loadingDiv.innerHTML = \`
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="spinner-border text-primary mb-3" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mb-0">\${message}</p>
                            </div>
                        </div>
                    \`;
                    
                    document.body.appendChild(loadingDiv);
                }
                
                function hideLoading() {
                    const loadingDiv = document.getElementById('loadingOverlay');
                    if (loadingDiv) {
                        loadingDiv.remove();
                    }
                }
                
                // Auto-refresh every 30 seconds if there are pending restorations
                if (${stats.needsRestore} > 0) {
                    setTimeout(() => {
                        location.reload();
                    }, 30000);
                }
                </script>
            </div>
        `;
        
        res.send(renderTemplate('Function Restoration - Admin Control Panel', content));
        
    } catch (error) {
        console.error('Error in restore route:', error);
        res.status(500).send('Error loading restoration tool');
    }
});

// Admin restoration reports
router.get('/admin/reports/restoration', async (req, res) => {
    try {
        const restorationReports = new RestorationReports();
        const report = await restorationReports.generateRestorationReport();
        
        const content = `
            ${getAdminNav()}
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="mb-4">
                            <i class="bi bi-file-earmark-bar-graph"></i> Restoration Analytics
                        </h1>
                        <p class="lead">Comprehensive analysis of function restoration activities and system health.</p>
                    </div>
                </div>
                
                <!-- Health Overview -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-heart-pulse"></i> System Health Score
                                </h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="progress mb-3" style="height: 30px;">
                                    <div class="progress-bar ${report.healthAnalysis.healthScore >= 80 ? 'bg-success' : 
                                        report.healthAnalysis.healthScore >= 50 ? 'bg-warning' : 'bg-danger'}" 
                                         style="width: ${report.healthAnalysis.healthScore}%">
                                        ${report.healthAnalysis.healthScore}%
                                    </div>
                                </div>
                                <h3 class="mb-0">${report.healthAnalysis.healthScore}/100</h3>
                                <p class="text-muted">Overall File Health</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-graph-up"></i> Success Rate
                                </h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="progress mb-3" style="height: 30px;">
                                    <div class="progress-bar bg-info" 
                                         style="width: ${report.logSummary.successRate}%">
                                        ${report.logSummary.successRate}%
                                    </div>
                                </div>
                                <h3 class="mb-0">${report.logSummary.successRate}%</h3>
                                <p class="text-muted">Restoration Success Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Statistics Cards -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-white bg-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="card-title">Total Files</h6>
                                        <h2 class="mb-0">${report.stats.totalFiles}</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-files" style="font-size: 2rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-success">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="card-title">Healthy</h6>
                                        <h2 class="mb-0">${report.healthAnalysis.fileCategories.healthy.length}</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-check-circle" style="font-size: 2rem;"></i>
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
                                        <h6 class="card-title">Need Attention</h6>
                                        <h2 class="mb-0">${report.healthAnalysis.fileCategories.needsAttention.length}</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-danger">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="card-title">Critical</h6>
                                        <h2 class="mb-0">${report.healthAnalysis.fileCategories.critical.length}</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-x-circle" style="font-size: 2rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recommendations -->
                ${report.recommendations.length > 0 ? `
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-lightbulb"></i> System Recommendations
                                </h5>
                            </div>
                            <div class="card-body">
                                ${report.recommendations.map(rec => `
                                    <div class="alert alert-${rec.priority === 'critical' ? 'danger' : 
                                        rec.priority === 'high' ? 'warning' : 
                                        rec.priority === 'medium' ? 'info' : 'secondary'} mb-2">
                                        <strong>${rec.priority.toUpperCase()}:</strong> ${rec.message}
                                        <small class="text-muted d-block">Category: ${rec.type}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Activity Patterns -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-clock"></i> Activity by Hour
                                </h5>
                            </div>
                            <div class="card-body">
                                <canvas id="hourlyChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-pie-chart"></i> Operations by Type
                                </h5>
                            </div>
                            <div class="card-body">
                                <canvas id="typeChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-activity"></i> Recent Restoration Activity
                                </h5>
                            </div>
                            <div class="card-body">
                                ${report.logSummary.recentActivity.length > 0 ? `
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Target</th>
                                                    <th>Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${report.logSummary.recentActivity.map(entry => `
                                                    <tr class="${entry.status === 'SUCCESS' ? 'table-success' : 'table-danger'}">
                                                        <td><small>${new Date(entry.timestamp).toLocaleString()}</small></td>
                                                        <td><span class="badge bg-secondary">${entry.type}</span></td>
                                                        <td>
                                                            <span class="badge ${entry.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}">
                                                                ${entry.status}
                                                            </span>
                                                        </td>
                                                        <td><code>${entry.target}</code></td>
                                                        <td><small>${entry.details}</small></td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                ` : '<p class="text-muted">No recent restoration activity found.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Export Options -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-download"></i> Export Data
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-primary" onclick="exportData('json')">
                                        <i class="bi bi-filetype-json"></i> Export JSON
                                    </button>
                                    <button class="btn btn-outline-success" onclick="exportData('csv')">
                                        <i class="bi bi-filetype-csv"></i> Export CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Chart.js Scripts -->
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script>
                // Hourly Activity Chart
                const hourlyData = ${JSON.stringify(report.patterns.byHour)};
                const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
                new Chart(hourlyCtx, {
                    type: 'bar',
                    data: {
                        labels: Array.from({length: 24}, (_, i) => i + ':00'),
                        datasets: [{
                            label: 'Restoration Operations',
                            data: hourlyData,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
                
                // Type Distribution Chart
                const typeData = ${JSON.stringify(report.patterns.byType)};
                const typeCtx = document.getElementById('typeChart').getContext('2d');
                new Chart(typeCtx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(typeData),
                        datasets: [{
                            data: Object.values(typeData),
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 205, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 205, 86, 1)',
                                'rgba(75, 192, 192, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
                
                // Export functionality
                async function exportData(format) {
                    try {
                        const response = await fetch(\`/admin/reports/restoration/export?format=\${format}\`);
                        const blob = await response.blob();
                        
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = \`restoration_report_\${new Date().toISOString().split('T')[0]}.\${format}\`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        
                    } catch (error) {
                        alert('Error exporting data: ' + error.message);
                    }
                }
                </script>
            </div>
        `;
        
        res.send(renderTemplate('Restoration Analytics - Admin Control Panel', content));
        
    } catch (error) {
        console.error('Error in restoration reports route:', error);
        res.status(500).send('Error loading restoration reports');
    }
});

// Export restoration data
router.get('/admin/reports/restoration/export', async (req, res) => {
    try {
        const format = req.query.format || 'json';
        const restorationReports = new RestorationReports();
        const data = await restorationReports.exportRestorationData(format);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=restoration_report.csv');
            res.send(data.fileStatus); // Send main CSV data
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=restoration_report.json');
            res.json(data);
        }
        
    } catch (error) {
        console.error('Error exporting restoration data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// API endpoint to restore a single file
router.post('/admin/restore/file', async (req, res) => {
    const { filename } = req.body;
    
    try {
        const restorationManager = new RestorationManager();
        const result = await restorationManager.restoreFile(filename);
        res.json(result);
    } catch (error) {
        console.error('Error restoring file:', error);
        res.json({ success: false, error: error.message });
    }
});

// API endpoint to restore all files
router.post('/admin/restore/all', async (req, res) => {
    try {
        const restorationManager = new RestorationManager();
        const result = await restorationManager.restoreAllFiles();
        res.json(result);
    } catch (error) {
        console.error('Error in bulk restore:', error);
        res.json({ success: false, error: error.message });
    }
});

// API endpoint to restore selected files
router.post('/admin/restore/selected', async (req, res) => {
    const { filenames } = req.body;
    
    try {
        const restorationManager = new RestorationManager();
        const result = await restorationManager.restoreSelectedFiles(filenames);
        res.json(result);
    } catch (error) {
        console.error('Error in selective restore:', error);
        res.json({ success: false, error: error.message });
    }
});

// API endpoint to get restoration log
router.get('/admin/restore/log', async (req, res) => {
    try {
        const restorationManager = new RestorationManager();
        const entries = await restorationManager.getRestorationLog();
        res.json({ success: true, entries });
    } catch (error) {
        console.error('Error getting restoration log:', error);
        res.json({ success: false, error: error.message, entries: [] });
    }
});

module.exports = router;
