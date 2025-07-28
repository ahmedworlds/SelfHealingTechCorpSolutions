// File: admin/data_processor.js
// Modular data processing functions for admin reports

const fs = require('fs-extra');
const config = require('../config.json');

class DataProcessor {
    constructor() {
        this.aiProviders = config.aiProviders;
        this.errorTypes = Object.values(config.code_errorTypes);
    }

    async loadPatchData() {
        try {
            if (await fs.pathExists('logs/patch.json')) {
                return await fs.readJson('logs/patch.json');
            }
            return { patches: [] };
        } catch (error) {
            console.error('Error loading patch data:', error);
            return { patches: [] };
        }
    }

    // Extract success rate data by error type and AI provider
    extractSuccessRateData(patches) {
        const data = {};
        
        // Initialize structure
        this.errorTypes.forEach(errorType => {
            data[errorType] = {};
            Object.keys(this.aiProviders).forEach(provider => {
                data[errorType][provider] = { success: 0, total: 0, rate: 0 };
            });
        });

        // Process patches
        patches.forEach(patch => {
            const errorType = patch.errorType;
            const provider = patch.aiProvider;
            
            if (data[errorType] && data[errorType][provider]) {
                data[errorType][provider].total++;
                if (patch.patchStatus === 'success') {
                    data[errorType][provider].success++;
                }
            }
        });

        // Calculate rates
        Object.keys(data).forEach(errorType => {
            Object.keys(data[errorType]).forEach(provider => {
                const stats = data[errorType][provider];
                stats.rate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0;
            });
        });

        return data;
    }

    // Extract recovery time data by error type and AI provider
    extractRecoveryTimeData(patches) {
        const data = {};
        
        // Initialize structure
        this.errorTypes.forEach(errorType => {
            data[errorType] = {};
            Object.keys(this.aiProviders).forEach(provider => {
                data[errorType][provider] = { times: [], avg: 0, min: 0, max: 0 };
            });
        });

        // Collect recovery times
        patches.forEach(patch => {
            const errorType = patch.errorType;
            const provider = patch.aiProvider;
            
            if (data[errorType] && data[errorType][provider] && patch.recoveryTimeMs) {
                data[errorType][provider].times.push(patch.recoveryTimeMs);
            }
        });

        // Calculate statistics
        Object.keys(data).forEach(errorType => {
            Object.keys(data[errorType]).forEach(provider => {
                const times = data[errorType][provider].times;
                if (times.length > 0) {
                    data[errorType][provider].avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
                    data[errorType][provider].min = Math.min(...times);
                    data[errorType][provider].max = Math.max(...times);
                } else {
                    data[errorType][provider] = { avg: 0, min: 0, max: 0, times: [] };
                }
            });
        });

        return data;
    }

    // Extract error complexity scoring (recovery time vs error type correlation)
    extractComplexityScoring(patches) {
        const data = {};
        
        this.errorTypes.forEach(errorType => {
            const errorPatches = patches.filter(p => p.errorType === errorType && p.recoveryTimeMs);
            if (errorPatches.length > 0) {
                const avgTime = errorPatches.reduce((sum, p) => sum + p.recoveryTimeMs, 0) / errorPatches.length;
                const successRate = (errorPatches.filter(p => p.patchStatus === 'success').length / errorPatches.length) * 100;
                
                data[errorType] = {
                    avgRecoveryTime: Math.round(avgTime),
                    successRate: successRate.toFixed(1),
                    complexity: this.calculateComplexity(avgTime, successRate),
                    sampleSize: errorPatches.length
                };
            } else {
                data[errorType] = { avgRecoveryTime: 0, successRate: 0, complexity: 'No Data', sampleSize: 0 };
            }
        });

        return data;
    }

    // Extract peak error times
    extractPeakErrorTimes(patches) {
        const hourlyData = {};
        const dailyData = {};
        
        // Initialize hours (0-23) and days
        for (let i = 0; i < 24; i++) {
            hourlyData[i] = 0;
        }
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(day => dailyData[day] = 0);

        patches.forEach(patch => {
            const date = new Date(patch.timestamp);
            const hour = date.getHours();
            const day = days[date.getDay()];
            
            hourlyData[hour]++;
            dailyData[day]++;
        });

        return { hourly: hourlyData, daily: dailyData };
    }

    // Extract retry success patterns
    extractRetryPatterns(patches) {
        const signatures = {};
        
        patches.forEach(patch => {
            const signature = `${patch.filename}:${patch.errorType}:${patch.lineNumber}`;
            
            if (!signatures[signature]) {
                signatures[signature] = { attempts: 0, successes: 0, lastAttempt: patch.timestamp };
            }
            
            signatures[signature].attempts++;
            if (patch.patchStatus === 'success') {
                signatures[signature].successes++;
            }
            signatures[signature].lastAttempt = patch.timestamp;
        });

        // Calculate retry patterns
        const retryData = {
            multipleAttempts: 0,
            successOnRetry: 0,
            totalRetries: 0,
            patterns: []
        };

        Object.keys(signatures).forEach(signature => {
            const data = signatures[signature];
            if (data.attempts > 1) {
                retryData.multipleAttempts++;
                retryData.totalRetries += (data.attempts - 1);
                
                if (data.successes > 0) {
                    retryData.successOnRetry++;
                }
                
                retryData.patterns.push({
                    signature,
                    attempts: data.attempts,
                    successes: data.successes,
                    successRate: ((data.successes / data.attempts) * 100).toFixed(1)
                });
            }
        });

        return retryData;
    }

    // Calculate complexity score based on recovery time and success rate
    calculateComplexity(avgTime, successRate) {
        if (avgTime > 5000 && successRate < 70) return 'Very High';
        if (avgTime > 3000 && successRate < 80) return 'High';
        if (avgTime > 2000 && successRate < 90) return 'Medium';
        if (avgTime > 1000 && successRate < 95) return 'Low';
        return 'Very Low';
    }

    // Generate summary statistics
    async generateSummaryStats() {
        const patchData = await this.loadPatchData();
        const patches = patchData.patches || [];
        
        const total = patches.length;
        const successful = patches.filter(p => p.patchStatus === 'success').length;
        const failed = total - successful;
        const avgRecoveryTime = total > 0 ? Math.round(patches.reduce((sum, p) => sum + (p.recoveryTimeMs || 0), 0) / total) : 0;
        
        return {
            totalPatches: total,
            successfulPatches: successful,
            failedPatches: failed,
            overallSuccessRate: total > 0 ? ((successful / total) * 100).toFixed(1) : 0,
            avgRecoveryTime,
            dateRange: this.getDateRange(patches)
        };
    }

    getDateRange(patches) {
        if (patches.length === 0) return 'No data';
        
        const dates = patches.map(p => new Date(p.timestamp)).sort();
        const start = dates[0].toLocaleDateString();
        const end = dates[dates.length - 1].toLocaleDateString();
        
        return start === end ? start : `${start} - ${end}`;
    }
}

module.exports = DataProcessor;
