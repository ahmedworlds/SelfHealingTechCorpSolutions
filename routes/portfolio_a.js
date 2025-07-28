console.log("File: routes/portfolio_a.js");

const express = require('express');
const fs = require('fs-extra');
const { generatePortfolioHTML } = require('../functions/generate_portfolio_a');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/portfolio_a', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>Portfolio A - Recent Projects</h2>
                    <p class="text-muted">Showcasing our latest technological innovations</p>
                </div>
            </div>
            ${generatePortfolioHTML()}
        `;
        
        res.send(renderTemplate('Portfolio A - TechCorp Solutions', content));
    } catch (error) {
        console.log('Error caught in route handler:', error.message);
        next(error);
    }
});

module.exports = router;
