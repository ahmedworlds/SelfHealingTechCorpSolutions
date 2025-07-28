console.log("File: healing/test_runner.js");


const fs = require('fs-extra');
const path = require('path');

async function runTests(filename) {
    try {
        const testFile = getTestFile(filename);
        
        if (!await fs.pathExists(testFile)) {
            return { passed: false, message: 'No test file found' };
        }
        
        delete require.cache[require.resolve(path.resolve(testFile))];
        const testModule = require(path.resolve(testFile));
        
        if (typeof testModule.runTests === 'function') {
            const result = await testModule.runTests();
            return {
                passed: result.passed,
                message: result.passed ? 'All tests passed' : 'Tests failed',
                tests: [result]
            };
        }
        
        return { passed: false, message: 'No runTests function found' };
        
    } catch (error) {
        return {
            passed: false,
            message: `Test execution failed: ${error.message}`
        };
    }
}

function getTestFile(filename) {
    const baseName = path.basename(filename, '.js');
    const testName = baseName.replace('generate_', 'test_');
    return path.join('tests', `${testName}.js`);
}

module.exports = { runTests };

// Run all tests when this file is executed directly
if (require.main === module) {
    async function runAllTests() {
        console.log('🧪 Running all tests...\n');
        
        const testFiles = [
            'test_portfolio_a.js',
            'test_portfolio_b.js', 
            'test_portfolio_c.js',
            'test_team_alpha.js',
            'test_team_beta.js',
            'test_team_gamma.js',
            'test_faq_alpha.js',
            'test_faq_beta.js',
            'test_faq_gamma.js'
        ];
        
        let totalTests = 0;
        let passedTests = 0;
        
        for (const testFile of testFiles) {
            const testPath = path.join('tests', testFile);
            
            if (await fs.pathExists(testPath)) {
                try {
                    delete require.cache[require.resolve(path.resolve(testPath))];
                    const testModule = require(path.resolve(testPath));
                    
                    if (typeof testModule.runTests === 'function') {
                        const result = await testModule.runTests();
                        totalTests++;
                        
                        if (result.passed) {
                            passedTests++;
                            console.log(`✅ ${testFile}: PASS - ${result.message}`);
                        } else {
                            console.log(`❌ ${testFile}: FAIL - ${result.message}`);
                            if (result.error) {
                                console.log(`   Error: ${result.error}`);
                            }
                        }
                    } else {
                        console.log(`⚠️  ${testFile}: SKIP - No runTests function found`);
                    }
                } catch (error) {
                    totalTests++;
                    console.log(`❌ ${testFile}: ERROR - ${error.message}`);
                }
            } else {
                console.log(`⚠️  ${testFile}: SKIP - File not found`);
            }
        }
        
        console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests && totalTests > 0) {
            console.log('🎉 All tests passed!');
            process.exit(0);
        } else {
            console.log('💥 Some tests failed!');
            process.exit(1);
        }
    }
    
    runAllTests().catch(error => {
        console.error('❌ Test runner failed:', error.message);
        process.exit(1);
    });
}
