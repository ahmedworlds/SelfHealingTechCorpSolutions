// File: admin/restoration_reports.js
// Admin restoration reports and analytics

const RestorationManager = require('./restoration_manager');
const DataProcessor = require('./data_processor');

class RestorationReports {
    constructor() {
        this.restorationManager = new RestorationManager();
        this.dataProcessor = new DataProcessor();
    }

    /**
     * Generate comprehensive restoration report
     * @returns {Object} Restoration report
     */
    async generateRestorationReport() {
        try {
            const stats = await this.restorationManager.getRestorationStats();
            const fileStatus = await this.restorationManager.getFileStatus();
            const log = await this.restorationManager.getRestorationLog(100);
            const validation = await this.restorationManager.validateRestoreDirectory();

            // Analyze restoration patterns
            const patterns = this.analyzeRestorationPatterns(log);
            
            // File health analysis
            const healthAnalysis = this.analyzeFileHealth(fileStatus);
            
            // System recommendations
            const recommendations = this.generateRecommendations(stats, validation, patterns);

            return {
                timestamp: new Date().toISOString(),
                stats,
                fileStatus,
                patterns,
                healthAnalysis,
                recommendations,
                validation,
                logSummary: {
                    totalEntries: log.length,
                    recentActivity: log.slice(0, 10),
                    successRate: this.calculateSuccessRate(log)
                }
            };
        } catch (error) {
            console.error('Error generating restoration report:', error);
            throw error;
        }
    }

    /**
     * Analyze restoration patterns from log data
     * @param {Array} logEntries - Log entries
     * @returns {Object} Pattern analysis
     */
    analyzeRestorationPatterns(logEntries) {
        const patterns = {
            byType: {},
            byHour: Array(24).fill(0),
            byDay: {},
            frequentTargets: {},
            failurePatterns: []
        };

        logEntries.forEach(entry => {
            // Count by type
            patterns.byType[entry.type] = (patterns.byType[entry.type] || 0) + 1;

            // Count by hour
            const hour = new Date(entry.timestamp).getHours();
            patterns.byHour[hour]++;

            // Count by day
            const day = entry.timestamp.split('T')[0];
            patterns.byDay[day] = (patterns.byDay[day] || 0) + 1;

            // Track frequent targets
            patterns.frequentTargets[entry.target] = (patterns.frequentTargets[entry.target] || 0) + 1;

            // Track failures
            if (entry.status === 'FAILED') {
                patterns.failurePatterns.push({
                    target: entry.target,
                    type: entry.type,
                    details: entry.details,
                    timestamp: entry.timestamp
                });
            }
        });

        // Sort frequent targets
        patterns.frequentTargets = Object.entries(patterns.frequentTargets)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        return patterns;
    }

    /**
     * Analyze file health status
     * @param {Array} fileStatus - File status array
     * @returns {Object} Health analysis
     */
    analyzeFileHealth(fileStatus) {
        const analysis = {
            healthScore: 0,
            issues: [],
            recommendations: [],
            fileCategories: {
                healthy: [],
                needsAttention: [],
                critical: []
            }
        };

        let healthyFiles = 0;

        fileStatus.forEach(file => {
            if (!file.hasCurrentFile) {
                analysis.issues.push(`Missing file: ${file.filename}`);
                analysis.fileCategories.critical.push(file.filename);
            } else if (file.needsRestore) {
                analysis.issues.push(`Modified file: ${file.filename}`);
                analysis.fileCategories.needsAttention.push(file.filename);
            } else {
                healthyFiles++;
                analysis.fileCategories.healthy.push(file.filename);
            }
        });

        // Calculate health score (0-100)
        analysis.healthScore = Math.round((healthyFiles / fileStatus.length) * 100);

        // Generate recommendations based on health
        if (analysis.healthScore < 50) {
            analysis.recommendations.push('Critical: Consider restoring all files immediately');
        } else if (analysis.healthScore < 80) {
            analysis.recommendations.push('Warning: Multiple files need restoration');
        } else if (analysis.healthScore < 100) {
            analysis.recommendations.push('Info: Some files may need restoration');
        } else {
            analysis.recommendations.push('Excellent: All files are up to date');
        }

        return analysis;
    }

    /**
     * Generate system recommendations
     * @param {Object} stats - System statistics
     * @param {Object} validation - Validation results
     * @param {Object} patterns - Pattern analysis
     * @returns {Array} Array of recommendations
     */
    generateRecommendations(stats, validation, patterns) {
        const recommendations = [];

        // Directory validation recommendations
        if (!validation.restoreDirExists) {
            recommendations.push({
                priority: 'critical',
                type: 'system',
                message: 'Restore directory is missing - restoration functionality is disabled'
            });
        }

        if (validation.errors.length > 0) {
            recommendations.push({
                priority: 'high',
                type: 'files',
                message: `${validation.errors.length} restore files have validation errors`
            });
        }

        // File statistics recommendations
        if (stats.missing > 0) {
            recommendations.push({
                priority: 'high',
                type: 'files',
                message: `${stats.missing} function files are missing and should be restored immediately`
            });
        }

        if (stats.needsRestore > stats.totalFiles * 0.5) {
            recommendations.push({
                priority: 'medium',
                type: 'maintenance',
                message: 'More than 50% of files need restoration - consider bulk restore operation'
            });
        }

        // Pattern-based recommendations
        if (patterns.failurePatterns.length > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'monitoring',
                message: `${patterns.failurePatterns.length} restoration failures detected - investigate common causes`
            });
        }

        // Frequency recommendations
        const totalOps = Object.values(patterns.byType).reduce((sum, count) => sum + count, 0);
        if (totalOps > 50) {
            recommendations.push({
                priority: 'low',
                type: 'optimization',
                message: 'High restoration activity detected - consider implementing automated monitoring'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Calculate success rate from log entries
     * @param {Array} logEntries - Log entries
     * @returns {number} Success rate percentage
     */
    calculateSuccessRate(logEntries) {
        if (logEntries.length === 0) return 100;
        
        const successCount = logEntries.filter(entry => entry.status === 'SUCCESS').length;
        return Math.round((successCount / logEntries.length) * 100);
    }

    /**
     * Export restoration data for research
     * @param {string} format - Export format ('json' or 'csv')
     * @returns {Object} Export data
     */
    async exportRestorationData(format = 'json') {
        try {
            const report = await this.generateRestorationReport();
            const exportData = {
                metadata: {
                    exportTime: new Date().toISOString(),
                    format,
                    version: '1.0'
                },
                report
            };

            if (format === 'csv') {
                // Convert to CSV format for research analysis
                return this.convertToCSV(exportData);
            }

            return exportData;
        } catch (error) {
            console.error('Error exporting restoration data:', error);
            throw error;
        }
    }

    /**
     * Convert data to CSV format
     * @param {Object} data - Data to convert
     * @returns {Object} CSV data structure
     */
    convertToCSV(data) {
        const csvData = {
            fileStatus: this.arrayToCSV(data.report.fileStatus),
            logEntries: this.arrayToCSV(data.report.logSummary.recentActivity),
            recommendations: this.arrayToCSV(data.report.recommendations)
        };

        return csvData;
    }

    /**
     * Helper to convert array to CSV string
     * @param {Array} array - Array to convert
     * @returns {string} CSV string
     */
    arrayToCSV(array) {
        if (!array || array.length === 0) return '';
        
        const headers = Object.keys(array[0]);
        const csvRows = [headers.join(',')];
        
        array.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }
}

module.exports = RestorationReports;
