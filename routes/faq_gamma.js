console.log("File: routes/faq_gamma.js");

const express = require('express');
const fs = require('fs-extra');
const { generateFAQHTML } = require('../functions/generate_faq_gamma');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/faq_gamma', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>FAQ Support - Customer Support</h2>
                    <p class="text-muted">Support policies and customer service information</p>
                </div>
            </div>
            ${generateFAQHTML()}
        `;
        
        res.send(renderTemplate('FAQ Support - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
