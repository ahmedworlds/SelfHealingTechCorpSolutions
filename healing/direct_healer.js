console.log("File: healing/direct_healer.js");

const fs = require('fs-extra');
const config = require('../config.json');
const { generatePatch } = require('./patcher');
const { getErrorTypeFromFilename } = require('./utils');

class DirectHealer {
    constructor() {
        this.processedErrors = new Set();
        this.apiCallCount = this.createAPICounter();
    }




    createAPICounter() {
        const now = Date.now();
        return { perMinute: 0, perHour: 0, perDay: 0, lastMinute: now, lastHour: now, lastDay: now };
    }





    async healError(errorInfo) {
        const errorSignature = this.getErrorSignature(errorInfo);
        
        // Simple duplicate prevention for current session
        if (this.processedErrors.has(errorSignature)) {
            console.log('Skipping duplicate error:', errorSignature);
            return;
        }

        // Check API limits
        if (!this.checkAndUpdateAPILimits()) {
            console.log('API usage limit reached. Skipping healing for:', errorSignature);
            return;
        }

        console.log(`Healing error in ${errorInfo.filename}: ${errorInfo.errorType}`);
        
        const startTime = Date.now();
        const patchResult = await generatePatch(errorInfo);
        const recoveryTime = Date.now() - startTime;
        
        this.processedErrors.add(errorSignature);
        await this.logPatchResult(errorInfo, patchResult, recoveryTime);
        
        console.log(`Healing completed for ${errorSignature} in ${recoveryTime}ms`);
    }





    getErrorSignature(errorInfo) {
        return `${errorInfo.filename}:${errorInfo.errorType}:${errorInfo.lineNumber}`;
    }




    parseErrorFromLog(errorEntry) {
        const lines = errorEntry.split('\n').filter(line => line.trim());
        if (lines.length < 2) return null;
        
        const errorMatch = lines[1].match(/(\w+Error?): (.+)/);
        if (!errorMatch) return null;
        
        const fileMatch = lines.slice(2).join('\n').match(/at .+ \((.+):(\d+):(\d+)\)/);
        if (!fileMatch || !fileMatch[1].includes('functions')) return null;
        
        return {
            timestamp: lines[0],
            errorType: getErrorTypeFromFilename(fileMatch[1]),
            errorMessage: errorMatch[2],
            filename: fileMatch[1],
            lineNumber: parseInt(fileMatch[2]),
            stackTrace: lines.slice(2).join('\n')
        };
    }






    async logPatchResult(errorInfo, patchResult, recoveryTime) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            filename: errorInfo.filename,
            errorType: errorInfo.errorType,
            errorMessage: errorInfo.errorMessage,
            lineNumber: errorInfo.lineNumber,
            recoveryTimeMs: recoveryTime,
            patchStatus: patchResult.success ? 'success' : 'failed',
            testResults: patchResult.testResults || null,
            aiProvider: config.aiProvider,
            backupCreated: patchResult.backupCreated || false,
            patchApplied: patchResult.patchApplied || false,
            errorDetails: patchResult.error || null
        };
        
        const existingLogs = await this.readJsonFile('logs/patch.json', { patches: [] });
        existingLogs.patches.push(logEntry);
        await this.writeJsonFile('logs/patch.json', existingLogs);
        console.log('Patch result logged successfully');
    }




    async readJsonFile(filePath, defaultValue) {
        try {
            return await fs.pathExists(filePath) ? await fs.readJson(filePath) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error);
            return defaultValue;
        }
    }




    async writeJsonFile(filePath, data) {
        try {
            await fs.writeJson(filePath, data, { spaces: 2 });
        } catch (error) {
            console.error(`Error writing ${filePath}:`, error);
        }
    }




    checkAndUpdateAPILimits() {
        const now = Date.now();
        const limits = config.apiUsageLimit;
        if (!limits) return true;
        
        this.resetCountersIfNeeded(now);
        
        const checks = [
            { count: this.apiCallCount.perMinute, limit: limits.maxCallsPerMinute, period: 'minute' },
            { count: this.apiCallCount.perHour, limit: limits.maxCallsPerHour, period: 'hour' },
            { count: this.apiCallCount.perDay, limit: limits.maxCallsPerDay, period: 'day' }
        ];
        
        for (const check of checks) {
            if (check.count >= check.limit) {
                console.log(`API limit reached: ${check.count}/${check.limit} calls per ${check.period}`);
                return false;
            }
        }
        
        this.apiCallCount.perMinute++;
        this.apiCallCount.perHour++;
        this.apiCallCount.perDay++;
        
        console.log(`API usage: ${this.apiCallCount.perMinute}/min, ${this.apiCallCount.perHour}/hour, ${this.apiCallCount.perDay}/day`);
        return true;
    }





    resetCountersIfNeeded(now) {
        const timeWindows = [
            { period: 60000, counter: 'perMinute', timestamp: 'lastMinute' },
            { period: 3600000, counter: 'perHour', timestamp: 'lastHour' },
            { period: 86400000, counter: 'perDay', timestamp: 'lastDay' }
        ];
        
        timeWindows.forEach(window => {
            if (now - this.apiCallCount[window.timestamp] > window.period) {
                this.apiCallCount[window.counter] = 0;
                this.apiCallCount[window.timestamp] = now;
            }
        });
    }


    
}

// Create singleton instance
const directHealer = new DirectHealer();

// Export healing function
async function healError(err) {
    if (!config.healingEnabled) return;
    
    try {
        // Extract error info from the error object
        const filename = extractFilenameFromStack(err.stack);
        const errorInfo = {
            timestamp: new Date().toISOString(),
            errorType: getErrorTypeFromFilename(filename),
            errorMessage: err.message,
            filename: filename,
            lineNumber: extractLineNumberFromStack(err.stack),
            stackTrace: err.stack
        };
        
        // Only process functions directory errors
        if (errorInfo.filename && errorInfo.filename.includes('functions')) {
            await directHealer.healError(errorInfo);
        }
    } catch (error) {
        console.error('Error in direct healing:', error);
    }
}

function extractFilenameFromStack(stack) {
    const fileMatch = stack.match(/at .+ \((.+):(\d+):(\d+)\)/);
    return fileMatch ? fileMatch[1] : null;
}

function extractLineNumberFromStack(stack) {
    const fileMatch = stack.match(/at .+ \((.+):(\d+):(\d+)\)/);
    return fileMatch ? parseInt(fileMatch[2]) : null;
}

module.exports = { healError, DirectHealer };
