const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// RQ2: Technical Implementation Analysis - All Models
router.get('/admin/research/rq2-all', (req, res) => {
    try {
        const dataPath = path.join(__dirname, '..', 'healing_attempts.json');
        let healingData = [];
        
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            healingData = JSON.parse(rawData);
        }

        const content = `
            <div class="container">
                <h1 class="text-center mb-4">RQ2: Technical Implementation Analysis - All Models</h1>
                
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Evaluating technical implementation effectiveness using Simple, Integrated, Controlled, Modular principles.
                </div>

                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-white bg-primary">
                            <div class="card-body text-center">
                                <h3>${healingData.length}</h3>
                                <p>Total Implementations</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-success">
                            <div class="card-body text-center">
                                <h3>${new Set(healingData.map(a => a.aiModel)).size}</h3>
                                <p>AI Models Used</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-warning">
                            <div class="card-body text-center">
                                <h3>${healingData.length > 0 ? ((healingData.filter(a => a.success).length / healingData.length) * 100).toFixed(1) : 0}%</h3>
                                <p>Implementation Success</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-info">
                            <div class="card-body text-center">
                                <h3>${new Set(healingData.map(a => a.errorType)).size}</h3>
                                <p>Error Types Handled</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-table"></i> Implementation Analysis Details</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>AI Model</th>
                                        <th>Attempts</th>
                                        <th>Success Rate</th>
                                        <th>Avg Response Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(healingData.reduce((acc, attempt) => {
                                        const model = attempt.aiModel || 'Unknown';
                                        if (!acc[model]) acc[model] = { total: 0, successful: 0, totalTime: 0 };
                                        acc[model].total++;
                                        if (attempt.success) acc[model].successful++;
                                        acc[model].totalTime += (attempt.responseTime || 2000);
                                        return acc;
                                    }, {})).map(([model, stats]) => `
                                        <tr>
                                            <td>${model}</td>
                                            <td>${stats.total}</td>
                                            <td>
                                                <span class="badge ${(stats.successful / stats.total) >= 0.7 ? 'bg-success' : 'bg-warning'}">
                                                    ${((stats.successful / stats.total) * 100).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td>${Math.round(stats.totalTime / stats.total)}ms</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-4">
                    <a href="/research" class="btn btn-secondary">
                        <i class="bi bi-arrow-left"></i> Back to Research Dashboard
                    </a>
                </div>
            </div>
        `;
        
        // Use basic template
        const template = fs.readFileSync('templates/base_template.html', 'utf8');
        const html = template
            .replace('{{title}}', 'RQ2: Technical Implementation Analysis - All Models')
            .replace('{{content}}', content);
        
        res.send(html);
        
    } catch (error) {
        console.error('Error in RQ2 implementation analysis:', error);
        res.status(500).send('<h1>Error loading data</h1>');
    }
});

module.exports = router;