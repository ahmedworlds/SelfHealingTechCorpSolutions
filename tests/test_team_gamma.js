console.log("File: tests/test_team_gamma.js");

// Test for team_gamma function
const path = require('path');

async function runTests() {
    try {
        // Test the function directly
        delete require.cache[require.resolve('../functions/generate_team_gamma.js')];
        const { generateTeamHTML } = require('../functions/generate_team_gamma.js');
        
        const result = generateTeamHTML();
        
        // Check if HTML is generated and contains expected content
        if (typeof result === 'string' && result.includes('card') && result.includes('team')) {
            return {
                passed: true,
                message: 'Team HTML generated successfully',
                function: 'generateTeamHTML'
            };
        } else {
            return {
                passed: false,
                message: 'Team HTML generation failed or incomplete',
                function: 'generateTeamHTML'
            };
        }
        
    } catch (error) {
        return {
            passed: false,
            message: `Error in team function: ${error.message}`,
            function: 'generateTeamHTML',
            error: error.name
        };
    }
}

module.exports = { runTests };
