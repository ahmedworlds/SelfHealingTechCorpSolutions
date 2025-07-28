console.log("File: routes/faq_alpha.js");

const express = require('express');
const fs = require('fs-extra');
const { generateFAQHTML } = require('../functions/generate_faq_alpha');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/faq_alpha', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>FAQ General - Common Questions</h2>
                    <p class="text-muted">Find answers to frequently asked questions</p>
                </div>
            </div>
            ${generateFAQHTML()}
        `;
        
        res.send(renderTemplate('FAQ General - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
