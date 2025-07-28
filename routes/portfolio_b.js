console.log("File: routes/portfolio_b.js");

const express = require('express');
const fs = require('fs-extra');
const { generatePortfolioHTML } = require('../functions/generate_portfolio_b');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/portfolio_b', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>Portfolio B - Featured Projects</h2>
                    <p class="text-muted">Highlighting our most successful implementations</p>
                </div>
            </div>
            ${generatePortfolioHTML()}
        `;
        
        res.send(renderTemplate('Portfolio B - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
