const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Template helper function
function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

// Research navigation
function getResearchNav() {
    return fs.readFileSync('templates/research_nav.html', 'utf8');
}

// Research home page
router.get('/research', (req, res) => {
    try {
        // Read healing attempts data for overview stats
        const dataPath = path.join(__dirname, '..', 'healing_attempts.json');
        let healingData = [];
        
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            healingData = JSON.parse(rawData);
        }

        // Generate overview stats
        const overviewStats = generateOverviewStats(healingData);
        
        const content = `
            ${getResearchNav()}
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="mb-4">
                            <i class="bi bi-mortarboard"></i> Research Analysis Dashboard
                        </h1>
                        <p class="lead">Comprehensive self-healing system analysis across three research questions</p>
                    </div>
                </div>
                
                <!-- Overview Statistics -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-white bg-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h5 class="card-title">Total Attempts</h5>
                                        <h2 class="mb-0">${overviewStats.totalAttempts}</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-activity" style="font-size: 2rem;"></i>
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
                                        <h2 class="mb-0">${overviewStats.successRate}%</h2>
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
                                        <h5 class="card-title">AI Models</h5>
                                        <h2 class="mb-0">${overviewStats.aiModels}</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-cpu" style="font-size: 2rem;"></i>
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
                                        <h5 class="card-title">Gemini Share</h5>
                                        <h2 class="mb-0">${overviewStats.geminiShare}%</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="bi bi-gem" style="font-size: 2rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Research Questions Grid -->
                <div class="row">
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0">
                                    <i class="bi bi-check-circle"></i> RQ1: Requirements Validation
                                </h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">Analyze system requirements compliance and validation across all AI models and Gemini specifically.</p>
                                <ul class="list-unstyled">
                                    <li><i class="bi bi-arrow-right text-primary"></i> Error detection capability</li>
                                    <li><i class="bi bi-arrow-right text-primary"></i> Response time requirements</li>
                                    <li><i class="bi bi-arrow-right text-primary"></i> Success rate thresholds</li>
                                    <li><i class="bi bi-arrow-right text-primary"></i> Multi-model support</li>
                                </ul>
                                <div class="row">
                                    <div class="col-6">
                                        <a href="/admin/research/rq1-all" class="btn btn-primary btn-sm w-100">
                                            <i class="bi bi-bar-chart"></i> All Models
                                        </a>
                                    </div>
                                    <div class="col-6">
                                        <a href="/admin/research/rq1-gemini" class="btn btn-outline-primary btn-sm w-100">
                                            <i class="bi bi-gem"></i> Gemini Only
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <div class="card-header bg-success text-white">
                                <h5 class="mb-0">
                                    <i class="bi bi-gear"></i> RQ2: Implementation Analysis
                                </h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">Evaluate technical implementation effectiveness using Simple, Integrated, Controlled, Modular principles.</p>
                                <ul class="list-unstyled">
                                    <li><i class="bi bi-arrow-right text-success"></i> Architecture simplicity</li>
                                    <li><i class="bi bi-arrow-right text-success"></i> System integration</li>
                                    <li><i class="bi bi-arrow-right text-success"></i> Control mechanisms</li>
                                    <li><i class="bi bi-arrow-right text-success"></i> Modular design</li>
                                </ul>
                                <div class="row">
                                    <div class="col-6">
                                        <a href="/admin/research/rq2-all" class="btn btn-success btn-sm w-100">
                                            <i class="bi bi-bar-chart"></i> All Models
                                        </a>
                                    </div>
                                    <div class="col-6">
                                        <a href="/admin/research/rq2-gemini" class="btn btn-outline-success btn-sm w-100">
                                            <i class="bi bi-gem"></i> Gemini Only
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <div class="card-header bg-info text-white">
                                <h5 class="mb-0">
                                    <i class="bi bi-bar-chart-line"></i> RQ3: Effectiveness Measurement
                                </h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">Measure overall system effectiveness through recovery, reliability, performance, and cost-benefit analysis.</p>
                                <ul class="list-unstyled">
                                    <li><i class="bi bi-arrow-right text-info"></i> Recovery effectiveness</li>
                                    <li><i class="bi bi-arrow-right text-info"></i> System reliability</li>
                                    <li><i class="bi bi-arrow-right text-info"></i> Performance metrics</li>
                                    <li><i class="bi bi-arrow-right text-info"></i> Cost-benefit analysis</li>
                                </ul>
                                <div class="row">
                                    <div class="col-6">
                                        <a href="/admin/research/rq3-all" class="btn btn-info btn-sm w-100">
                                            <i class="bi bi-bar-chart"></i> All Models
                                        </a>
                                    </div>
                                    <div class="col-6">
                                        <a href="/admin/research/rq3-gemini" class="btn btn-outline-info btn-sm w-100">
                                            <i class="bi bi-gem"></i> Gemini Only
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Analysis Summary -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="bi bi-graph-up"></i> Quick Analysis Summary
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6>Model Performance Comparison</h6>
                                        <div class="table-responsive">
                                            <table class="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>AI Model</th>
                                                        <th>Attempts</th>
                                                        <th>Success Rate</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${generateModelPerformanceTable(overviewStats.modelStats)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <h6>System Health Overview</h6>
                                        <div class="progress mb-2">
                                            <div class="progress-bar bg-success" role="progressbar" style="width: ${overviewStats.successRate}%">
                                                Success Rate: ${overviewStats.successRate}%
                                            </div>
                                        </div>
                                        <div class="progress mb-2">
                                            <div class="progress-bar bg-info" role="progressbar" style="width: ${overviewStats.geminiShare}%">
                                                Gemini Usage: ${overviewStats.geminiShare}%
                                            </div>
                                        </div>
                                        <small class="text-muted">
                                            Last updated: ${new Date().toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        res.send(renderTemplate('Research Analysis Dashboard', content));
        
    } catch (error) {
        console.error('Error in research home:', error);
        res.status(500).send(renderTemplate('Error', `
            <div class="container">
                <div class="alert alert-danger">
                    <h4>Error Loading Research Dashboard</h4>
                    <p>${error.message}</p>
                </div>
            </div>
        `));
    }
});

function generateOverviewStats(healingData) {
    const totalAttempts = healingData.length;
    const successfulAttempts = healingData.filter(a => a.success).length;
    const successRate = totalAttempts > 0 ? ((successfulAttempts / totalAttempts) * 100).toFixed(1) : 0;
    
    // Model stats
    const modelStats = {};
    healingData.forEach(attempt => {
        const model = attempt.aiModel || 'Unknown';
        if (!modelStats[model]) {
            modelStats[model] = { total: 0, successful: 0 };
        }
        modelStats[model].total++;
        if (attempt.success) modelStats[model].successful++;
    });
    
    // Gemini share
    const geminiAttempts = healingData.filter(a => a.aiModel && a.aiModel.toLowerCase().includes('gemini')).length;
    const geminiShare = totalAttempts > 0 ? ((geminiAttempts / totalAttempts) * 100).toFixed(1) : 0;
    
    return {
        totalAttempts,
        successRate,
        aiModels: Object.keys(modelStats).length,
        geminiShare,
        modelStats
    };
}

function generateModelPerformanceTable(modelStats) {
    return Object.keys(modelStats).map(model => {
        const stats = modelStats[model];
        const successRate = stats.total > 0 ? ((stats.successful / stats.total) * 100).toFixed(1) : 0;
        return `
            <tr>
                <td>${model}</td>
                <td>${stats.total}</td>
                <td>
                    <span class="badge ${successRate >= 70 ? 'bg-success' : 'bg-warning'}">${successRate}%</span>
                </td>
            </tr>
        `;
    }).join('');
}

module.exports = router;
