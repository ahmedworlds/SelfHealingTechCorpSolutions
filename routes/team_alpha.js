console.log("File: routes/team_alpha.js");

const express = require('express');
const fs = require('fs-extra');
const { generateTeamHTML } = require('../functions/generate_team_alpha');
const router = express.Router();

function renderTemplate(title, content) {
    const template = fs.readFileSync('templates/base_template.html', 'utf8');
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

router.get('/team_alpha', (req, res, next) => {
    try {
        const content = `
            <div class="row">
                <div class="col-12">
                    <h2>Team Alpha - Leadership</h2>
                    <p class="text-muted">Meet our executive team and senior leadership</p>
                </div>
            </div>
            ${generateTeamHTML()}
        `;
        
        res.send(renderTemplate('Team Alpha - TechCorp Solutions', content));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
