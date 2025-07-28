console.log("File: app.js");

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config.json');

const app = express();
const PORT = config.port || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Template helper function
function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

// Research template helper function
function renderResearchTemplate(title, content, scripts = '') {
    const template = fs.readFileSync('templates/research_template.html', 'utf8');
    const researchNav = fs.readFileSync('templates/research_nav.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content)
        .replace('{{research_nav}}', researchNav)
        .replace('{{scripts}}', scripts);
}

// Home route (clean, no errors)
app.get('/', (req, res) => {
    const content = `
        <div class="hero-section text-center">
            <div class="container">
                <h1 class="display-4">Welcome to TechCorp Solutions</h1>
                <p class="lead">Innovative Technology Solutions for Modern Businesses</p>
                <p class="text-light">Explore our portfolio, meet our team, and find answers to your questions.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Portfolio</h5>
                        <p class="card-text">Discover our latest projects and innovations.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Team</h5>
                        <p class="card-text">Meet our talented professionals.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">FAQ</h5>
                        <p class="card-text">Find answers to common questions.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Research Admin Panel Section -->
        <div class="row mt-5">
            <div class="col-12">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="bi bi-gear-fill"></i> Research Administration
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h6 class="card-title">Self-Healing System Analytics</h6>
                                <p class="card-text">Access comprehensive research analytics, AI provider performance metrics, and system health monitoring for the self-healing web application study.</p>
                                <ul class="list-unstyled">
                                    <li><i class="bi bi-check-circle text-success"></i> AI Provider Performance Comparison</li>
                                    <li><i class="bi bi-check-circle text-success"></i> Error Pattern Analysis</li>
                                    <li><i class="bi bi-check-circle text-success"></i> System Health Monitoring</li>
                                    <li><i class="bi bi-check-circle text-success"></i> Research Data Export</li>
                                </ul>
                            </div>
                            <div class="col-md-4 text-center">
                                <div class="border rounded p-3 mb-3 bg-light">
                                    <h6 class="text-muted">Quick Stats</h6>
                                    <div class="row">
                                        <div class="col-6">
                                            <div class="text-primary h5">9</div>
                                            <small>Error Types</small>
                                        </div>
                                        <div class="col-6">
                                            <div class="text-success h5">3</div>
                                            <small>AI Providers</small>
                                        </div>
                                    </div>
                                </div>
                                <a href="/admin" class="btn btn-primary btn-lg me-2 mb-2">
                                    <i class="bi bi-speedometer2"></i> Access Admin Panel
                                </a>
                                <a href="/research" class="btn btn-success btn-lg mb-2">
                                    <i class="bi bi-graph-up"></i> Research Analysis
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    res.send(renderTemplate('Home - TechCorp Solutions', content));
});

// Import route handlers
const portfolioRoutes = [
    require('./routes/portfolio_a'),
    require('./routes/portfolio_b'),
    require('./routes/portfolio_c')
];

const teamRoutes = [
    require('./routes/team_alpha'),
    require('./routes/team_beta'),
    require('./routes/team_gamma')
];

const faqRoutes = [
    require('./routes/faq_alpha'),
    require('./routes/faq_beta'),
    require('./routes/faq_gamma')
];

// Admin routes
const adminRoutes = [
    require('./routes/admin'),
    require('./routes/admin_performance'),
    require('./routes/admin_sequential'),
    require('./routes/admin_seqcolumn'),
    require('./routes/admin_placeholders') 
];

// Research routes
const researchRoutes = [
    require('./research/research_home'),
    require('./research/rq1_requirements_all'),
    require('./research/rq1_requirements_gemini'),
    require('./research/rq2_implementation_all'),
    require('./research/rq2_implementation_gemini'),
    require('./research/rq3_effectiveness_all'),
    require('./research/rq3_effectiveness_gemini')
];

// Register routes
[...portfolioRoutes, ...teamRoutes, ...faqRoutes, ...adminRoutes, ...researchRoutes].forEach(route => {
    app.use(route);
});

// Global error handling middleware (MUST be after routes)
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const errorLog = {
        timestamp,
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    };
    
    // Log to file
    const logEntry = `${timestamp} - ${err.message}\n${err.stack}\n---\n`;
    fs.appendFileSync('logs/errors.log', logEntry);
    
    console.error('Error detected and logged:', {
        message: err.message,
        type: err.name,
        url: req.url,
        code: err.code,
        no: err.errno,
        timestamp,
        error: err
    });
    
    // Trigger immediate healing
    const { healError } = require('./healing/direct_healer');
    healError(err).catch(healingError => {
        console.error('Healing failed:', healingError);
    });
    
    // Create user-friendly error page
    const errorPageContent = `
        <div class="container mt-4">
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    System Error Detected
                </h4>
                <p class="mb-3">
                    An error has occurred while processing your request. Our self-healing system is automatically working to resolve this issue.
                </p>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <h6>Error Details:</h6>
                        <ul class="list-unstyled">
                            <li><strong>Type:</strong> ${err.name}</li>
                            <li><strong>Message:</strong> ${err.message}</li>
                            <li><strong>Page:</strong> ${req.url}</li>
                            <li><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6>System Status:</h6>
                        <ul class="list-unstyled">
                            <li><span class="badge bg-warning">Error Logged</span></li>
                            <li><span class="badge bg-info">Healing in Progress</span></li>
                            <li><span class="badge bg-success">Auto-Recovery Active</span></li>
                        </ul>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Retry Request
                    </button>
                    <a href="/" class="btn btn-secondary">
                        <i class="bi bi-house"></i> Return Home
                    </a>
                </div>
            </div>
            
            <div class="card mt-4">
                <div class="card-header">
                    <h5><i class="bi bi-gear"></i> Self-Healing System</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        Our AI-powered self-healing system has detected this error and is automatically:
                    </p>
                    <ol>
                        <li>Creating a backup of the affected code</li>
                        <li>Analyzing the error using generative AI</li>
                        <li>Generating and testing a fix</li>
                        <li>Applying the patch if tests pass</li>
                    </ol>
                    <p class="text-muted">
                        <small>This process typically takes 30-60 seconds. Please try refreshing the page in a moment.</small>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Send enhanced error page using template
    res.status(500).send(renderTemplate('System Error - TechCorp Solutions', errorPageContent));
});

// Ensure logs directory exists
fs.ensureDirSync('logs');

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Self-healing system initialized (direct healing mode)');
});

module.exports = { app, renderResearchTemplate };
