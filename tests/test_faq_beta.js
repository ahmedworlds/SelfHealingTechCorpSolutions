console.log("File: tests/test_faq_beta.js");

// Test for faq_beta function
const path = require('path');

async function runTests() {
    try {
        // Test the function directly
        delete require.cache[require.resolve('../functions/generate_faq_beta.js')];
        const { generateFAQHTML } = require('../functions/generate_faq_beta.js');
        
        const result = generateFAQHTML();
        
        // Check if HTML is generated and contains expected content
        if (typeof result === 'string' && result.includes('card') && result.includes('faq')) {
            return {
                passed: true,
                message: 'FAQ HTML generated successfully',
                function: 'generateFAQHTML'
            };
        } else {
            return {
                passed: false,
                message: 'FAQ HTML generation failed or incomplete',
                function: 'generateFAQHTML'
            };
        }
        
    } catch (error) {
        return {
            passed: false,
            message: `Error in FAQ function: ${error.message}`,
            function: 'generateFAQHTML',
            error: error.name
        };
    }
}

module.exports = { runTests };
