const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// RQ1: Requirements Validation Analysis - Gemini Only
router.get('/admin/research/rq1-gemini', (req, res) => {
    try {
        const dataPath = path.join(__dirname, '..', 'healing_attempts.json');
        let healingData = [];
        
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            healingData = JSON.parse(rawData);
        }

        // Filter for Gemini attempts only
        const geminiData = healingData.filter(attempt => 
            attempt.aiModel && attempt.aiModel.toLowerCase().includes('gemini')
        );

        const requirements = analyzeGeminiRequirements(geminiData);
        const content = generateRQ1GeminiContent(requirements);
        const scripts = generateRQ1GeminiScripts(requirements);
        
        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RQ1: Requirements Validation - Gemini Only</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #fff; }
        .container { background: rgba(255, 255, 255, 0.95); border-radius: 15px; padding: 30px; margin: 20px auto; color: #333; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
        .chart-container { position: relative; height: 400px; margin: 20px 0; }
        .stats-card { background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; border-radius: 10px; padding: 20px; margin: 10px 0; }
        .gemini-gradient { background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); }
    </style>
</head>
<body>
    <div class="container">
        ${fs.readFileSync(path.join(__dirname, '..', 'templates', 'research_nav.html'), 'utf8')}
        <h1 class="text-center mb-4"><i class="bi bi-google"></i> RQ1: Requirements Validation - Gemini Only</h1>
        ${content}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    ${scripts}
</body>
</html>`;
        
        res.send(template);
        
    } catch (error) {
        console.error('Error in RQ1 Gemini requirements analysis:', error);
        res.status(500).send('<div class="alert alert-danger">Error loading Gemini requirements analysis data.</div>');
    }
});

function generateRQ1GeminiContent(requirements) {
    return `
        <div class="alert alert-info mb-4">
            <i class="bi bi-google"></i> This analysis focuses exclusively on Google Gemini model performance for requirements validation.
        </div>

        <div class="row mb-4">
            <div class="col-md-3"><div class="stats-card text-center"><h3>${requirements.totalAttempts}</h3><p>Gemini Attempts</p></div></div>
            <div class="col-md-3"><div class="stats-card text-center"><h3>${requirements.successRate}%</h3><p>Success Rate</p></div></div>
            <div class="col-md-3"><div class="stats-card text-center"><h3>${requirements.errorTypes}</h3><p>Error Types Handled</p></div></div>
            <div class="col-md-3"><div class="stats-card text-center"><h3>${requirements.avgResponseTime}ms</h3><p>Avg Response Time</p></div></div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header gemini-gradient text-white"><h5><i class="bi bi-pie-chart"></i> Gemini Success/Failure Rate</h5></div>
                    <div class="card-body"><div class="chart-container"><canvas id="geminiSuccessChart"></canvas></div></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header gemini-gradient text-white"><h5><i class="bi bi-bar-chart"></i> Error Types Handled by Gemini</h5></div>
                    <div class="card-body"><div class="chart-container"><canvas id="geminiErrorChart"></canvas></div></div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header gemini-gradient text-white"><h5><i class="bi bi-clock"></i> Response Time Distribution</h5></div>
                    <div class="card-body"><div class="chart-container"><canvas id="responseTimeChart"></canvas></div></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header gemini-gradient text-white"><h5><i class="bi bi-table"></i> Requirements Compliance</h5></div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <thead><tr><th>Requirement</th><th>Status</th><th>Score</th></tr></thead>
                            <tbody>
                                ${requirements.compliance.map(comp => `
                                    <tr>
                                        <td>${comp.requirement}</td>
                                        <td><span class="badge ${comp.met ? 'bg-success' : 'bg-warning'}">${comp.met ? 'Met' : 'Partial'}</span></td>
                                        <td><div class="progress"><div class="progress-bar gemini-gradient" style="width: ${comp.score}%">${comp.score}%</div></div></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header gemini-gradient text-white"><h5><i class="bi bi-list-ul"></i> Detailed Gemini Attempts</h5></div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead class="table-dark">
                                <tr><th>Timestamp</th><th>Error Type</th><th>Status</th><th>Response Time</th><th>Solution</th></tr>
                            </thead>
                            <tbody>
                                ${requirements.attempts.map(attempt => `
                                    <tr>
                                        <td>${new Date(attempt.timestamp).toLocaleString()}</td>
                                        <td><span class="badge bg-secondary">${attempt.errorType}</span></td>
                                        <td><span class="badge ${attempt.success ? 'bg-success' : 'bg-danger'}">${attempt.success ? 'Success' : 'Failed'}</span></td>
                                        <td>${attempt.responseTime}ms</td>
                                        <td class="text-truncate" style="max-width: 200px;" title="${attempt.solution}">${attempt.solution}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateRQ1GeminiScripts(requirements) {
    return `
        <script>
            // Success/Failure Pie Chart
            const successCtx = document.getElementById('geminiSuccessChart').getContext('2d');
            new Chart(successCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Successful', 'Failed'],
                    datasets: [{
                        data: [${requirements.successCount}, ${requirements.failureCount}],
                        backgroundColor: ['#34a853', '#ea4335']
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });

            // Error Types Bar Chart
            const errorCtx = document.getElementById('geminiErrorChart').getContext('2d');
            new Chart(errorCtx, {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(requirements.errorDistribution.map(e => e.type))},
                    datasets: [{
                        label: 'Occurrences',
                        data: ${JSON.stringify(requirements.errorDistribution.map(e => e.count))},
                        backgroundColor: '#4285f4'
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });

            // Response Time Distribution
            const timeCtx = document.getElementById('responseTimeChart').getContext('2d');
            new Chart(timeCtx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(requirements.attempts.map((_, i) => `Attempt ${i + 1}`))},
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: ${JSON.stringify(requirements.attempts.map(a => a.responseTime))},
                        borderColor: '#34a853',
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        fill: true
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        </script>
    `;
}

function analyzeGeminiRequirements(geminiData) {
    const totalAttempts = geminiData.length;
    const successfulHealing = geminiData.filter(attempt => attempt.success).length;
    
    // Error distribution
    const errorTypes = {};
    geminiData.forEach(attempt => {
        const errorType = attempt.errorType || 'Unknown';
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    const errorDistribution = Object.keys(errorTypes).map(type => ({
        type: type,
        count: errorTypes[type]
    }));

    // Average response time
    const avgResponseTime = geminiData.length > 0 ? 
        Math.round(geminiData.reduce((sum, attempt) => sum + (attempt.responseTime || 0), 0) / geminiData.length) : 0;

    // Requirements compliance analysis
    const compliance = [
        {
            requirement: 'Error Detection',
            met: (successfulHealing / totalAttempts) >= 0.6,
            score: Math.round((successfulHealing / totalAttempts) * 100)
        },
        {
            requirement: 'Response Time < 10s',
            met: avgResponseTime < 10000,
            score: avgResponseTime < 10000 ? 100 : Math.max(0, 100 - (avgResponseTime - 10000) / 1000)
        },
        {
            requirement: 'Error Coverage',
            met: Object.keys(errorTypes).length >= 3,
            score: Math.min(Object.keys(errorTypes).length * 25, 100)
        }
    ];

    return {
        totalAttempts,
        successRate: totalAttempts > 0 ? ((successfulHealing / totalAttempts) * 100).toFixed(1) : 0,
        successCount: successfulHealing,
        failureCount: totalAttempts - successfulHealing,
        errorTypes: Object.keys(errorTypes).length,
        avgResponseTime,
        errorDistribution,
        compliance,
        attempts: geminiData
    };
}

module.exports = router;