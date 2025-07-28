console.log("File: healing/patcher.js");


const fs = require('fs-extra');
const config = require('../config.json');
const { callGeminiAI } = require('./gemini_api');
const { callOpenRouterAI } = require('./openrouter_api');
const { callLMStudioAI } = require('./lmstudio_api');
const { runTests } = require('./test_runner');
const { createBackup, createPrompt, extractCode, detectAIProvider } = require('./utils');




class PatchGenerator {
    async generatePatch(errorInfo) {
        try {
            console.log(`Step 1: Starting healing - ${new Date().toISOString()}`);
            console.log(`Generating patch for ${errorInfo.errorType} in ${errorInfo.filename}`);
            
            const fileContent = await fs.readFile(errorInfo.filename, 'utf8');
            console.log(`Step 2: Creating backup - ${new Date().toISOString()}`);
            const backupPath = await createBackup(errorInfo.filename);
            console.log(`Step 3: Calling AI provider for analysis... - ${new Date().toISOString()}`);
            const fixedCode = await this.callAI(errorInfo, fileContent);
            
            if (!fixedCode) {
                console.log(`Step 4: ❌ AI FAILED - No response received - ${new Date().toISOString()}`);
                console.log(`Step 8: ❌ HEALING FAILED - Failed to generate patch from AI - ${new Date().toISOString()}`);
                return { success: false, error: 'Failed to generate patch from AI', backupCreated: true };
            }
            
            console.log(`Step 5: Applying patch to file... - ${new Date().toISOString()}`);
            await fs.writeFile(errorInfo.filename, fixedCode);
            console.log(`Step 6: Running tests... - ${new Date().toISOString()}`);
            const testResults = await runTests(errorInfo.filename);
            
            const result = {
                success: testResults.passed,
                testResults,
                backupCreated: true,
                patchApplied: true,
                backupPath
            };
            
            if (!testResults.passed) {
                console.log(`Step 7: ❌ TESTING FAILED: ${testResults.error || 'Tests did not pass'} - ${new Date().toISOString()}`);
                await fs.copy(backupPath, errorInfo.filename);
                result.patchApplied = false;
                result.error = 'Patch failed tests, backup restored';
                console.log(`Step 8: ❌ HEALING FAILED: Patch failed tests, backup restored - ${new Date().toISOString()}`);
            } else {
                console.log(`Step 7: ✅ TESTING SUCCEEDED - ${new Date().toISOString()}`);
                console.log(`Step 8: ✅ HEALING SUCCEEDED - ${new Date().toISOString()}`);
            }
            
            return result;
            
        } catch (error) {
            console.log(`Step 8: ❌ HEALING FAILED: ${error.message} - ${new Date().toISOString()}`);
            console.error('Error generating patch:', error);
            return { success: false, error: error.message, backupCreated: false };
        }
    }




    async callAI(errorInfo, fileContent) {
        const prompt = createPrompt(errorInfo, fileContent);
        
        // Create fallback order: Gemini first (100% success rate), then config.json order
        const providerKeys = Object.keys(config.aiProviders);
        const fallbackOrder = ['gemini_2flash'];
        
        // Add remaining providers from config.json order (excluding gemini if already added)
        providerKeys.forEach(provider => {
            if (!fallbackOrder.includes(provider)) {
                fallbackOrder.push(provider);
            }
        });
        
        console.log(`Making API call for ${errorInfo.errorType}...`);
        console.log(`Fallback order: ${fallbackOrder.join(' → ')}`);
        
        // Try each provider in fallback order
        for (let i = 0; i < fallbackOrder.length; i++) {
            const currentProvider = fallbackOrder[i];
            
            // Skip if provider doesn't exist in config
            if (!config.aiProviders[currentProvider]) {
                console.log(`Provider ${currentProvider} not found in config, skipping...`);
                continue;
            }
            
            console.log(`Attempting provider ${i + 1}/${fallbackOrder.length}: ${currentProvider}`);
            console.log(`Calling AI with prompt:\n${prompt}\n`);
            
            const response = await this.tryProvider(currentProvider, prompt);
            
            if (response) {
                console.log(`Step 4: ✅ AI response received from ${currentProvider} - ${new Date().toISOString()}`);
                console.log(`Received response:\n${response}`);
                
                // Update config.aiProvider to the successful provider for logging consistency
                const originalProvider = config.aiProvider;
                config.aiProvider = currentProvider;
                
                const extractedCode = extractCode(response);
                
                // Restore original provider after logging
                config.aiProvider = originalProvider;
                
                return extractedCode;
            } else {
                console.log(`Step 4: ❌ AI FAILED - No response from ${currentProvider} API - ${new Date().toISOString()}`);
                console.error(`Failed to get response from ${currentProvider} API`);
                
                if (i < fallbackOrder.length - 1) {
                    console.log(`Trying next provider...`);
                } else {
                    console.log(`All providers exhausted. Healing failed.`);
                }
            }
        }
        
        return null;
    }

    async tryProvider(providerKey, prompt) {
        return new Promise((resolve) => {
            const callback = (response) => {
                resolve(response);
            };
            
            if(config.callAI) {
                const providerInfo = detectAIProvider(providerKey);
                const modelName = config.aiProviders[providerKey];
                
                if (providerInfo.type === 'lmstudio') {
                    callLMStudioAI(modelName, prompt, callback);
                } else if (providerInfo.type === 'gemini') {
                    callGeminiAI(modelName, prompt, callback);
                } else if (providerInfo.type === 'openrouter') {
                    callOpenRouterAI(modelName, prompt, callback);
                } else {
                    console.error(`Unknown provider type: ${providerInfo.type}`);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }



}



async function generatePatch(errorInfo) {
    const patcher = new PatchGenerator();
    return await patcher.generatePatch(errorInfo);
}

module.exports = { generatePatch, PatchGenerator };
