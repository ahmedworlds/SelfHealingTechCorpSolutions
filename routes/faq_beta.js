console.log("File: routes/faq_beta.js");

const express = require('express');
const fs = require('fs-extra');
const { generateFAQHTML } = require('../functions/generate_faq_beta');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/faq_beta', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>FAQ Technical - Technical Support</h2>
                    <p class="text-muted">Technical questions and troubleshooting guides</p>
                </div>
            </div>
            ${generateFAQHTML()}
        `;
        
        res.send(renderTemplate('FAQ Technical - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
