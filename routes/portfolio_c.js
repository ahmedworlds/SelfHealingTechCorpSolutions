console.log("File: routes/portfolio_c.js");

const express = require('express');
const fs = require('fs-extra');
const { generatePortfolioHTML } = require('../functions/generate_portfolio_c');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/portfolio_c', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>Portfolio C - Innovation Lab</h2>
                    <p class="text-muted">Experimental projects and cutting-edge research</p>
                </div>
            </div>
            ${generatePortfolioHTML()}
        `;
        
        res.send(renderTemplate('Portfolio C - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
