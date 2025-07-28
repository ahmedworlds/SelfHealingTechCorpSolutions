console.log("File: tests/test_portfolio_c.js");

// Test for portfolio_c function
const path = require('path');

async function runTests() {
    try {
        // Test the function directly
        delete require.cache[require.resolve('../functions/generate_portfolio_c.js')];
        const { generatePortfolioHTML } = require('../functions/generate_portfolio_c.js');
        
        const result = generatePortfolioHTML();
        
        // Check if HTML is generated and contains expected content
        if (typeof result === 'string' && result.includes('card') && result.includes('project')) {
            return {
                passed: true,
                message: 'Portfolio HTML generated successfully',
                function: 'generatePortfolioHTML'
            };
        } else {
            return {
                passed: false,
                message: 'Portfolio HTML generation failed or incomplete',
                function: 'generatePortfolioHTML'
            };
        }
        
    } catch (error) {
        return {
            passed: false,
            message: `Error in portfolio function: ${error.message}`,
            function: 'generatePortfolioHTML',
            error: error.name
        };
    }
}

module.exports = { runTests };
