console.log("File: routes/team_beta.js");

const express = require('express');
const fs = require('fs-extra');
const { generateTeamHTML } = require('../functions/generate_team_beta');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/team_beta', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>Team Beta - Development</h2>
                    <p class="text-muted">Our talented development and engineering team</p>
                </div>
            </div>
            ${generateTeamHTML()}
        `;
        
        res.send(renderTemplate('Team Beta - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
