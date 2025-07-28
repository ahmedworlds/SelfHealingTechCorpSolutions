console.log("File: routes/team_gamma.js");

const express = require('express');
const fs = require('fs-extra');
const { generateTeamHTML } = require('../functions/generate_team_gamma');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/team_gamma', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>Team Gamma - Operations</h2>
                    <p class="text-muted">Our operations and support team members</p>
                </div>
            </div>
            ${generateTeamHTML()}
        `;
        
        res.send(renderTemplate('Team Gamma - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
