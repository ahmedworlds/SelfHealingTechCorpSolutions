// File: admin/restoration_manager.js
// Modular restoration manager for admin panel

const fs = require('fs-extra');
const path = require('path');

class RestorationManager {
    constructor() {
        this.restoreDir = path.join(__dirname, '..', 'restore');
        this.functionsDir = path.join(__dirname, '..', 'functions');
        this.logFile = path.join(__dirname, '..', 'logs', 'restoration.log');
    }

    /**
     * Get status of all restorable files
     * @returns {Array} Array of file status objects
     */
    async getFileStatus() {
        try {
            // Get list of files in restore folder
            const restoreFiles = await fs.readdir(this.restoreDir);
            const functionFiles = restoreFiles.filter(file => file.endsWith('.js'));
            
            // Get current function files for comparison
            const currentFiles = await fs.readdir(this.functionsDir);
            const currentFunctionFiles = currentFiles.filter(file => file.endsWith('.js'));
            
            // Check which files need restoration
            const fileStatus = [];
            for (const file of functionFiles) {
                const status = await this.analyzeFile(file, currentFunctionFiles);
                fileStatus.push(status);
            }
            
            return fileStatus.sort((a, b) => a.filename.localeCompare(b.filename));
        } catch (error) {
            console.error('Error getting file status:', error);
            throw error;
        }
    }

    /**
     * Analyze a single file's restoration status
     * @param {string} filename - Name of the file to analyze
     * @param {Array} currentFunctionFiles - List of current function files
     * @returns {Object} File status object
     */
    async analyzeFile(filename, currentFunctionFiles) {
        const restorePath = path.join(this.restoreDir, filename);
        const currentPath = path.join(this.functionsDir, filename);
        
        const restoreStats = await fs.stat(restorePath);
        const hasCurrentFile = currentFunctionFiles.includes(filename);
        
        let currentStats = null;
        let needsRestore = true;
        let isDifferent = false;
        
        if (hasCurrentFile) {
            currentStats = await fs.stat(currentPath);
            
            // Compare file contents for more accurate comparison
            const restoreContent = await fs.readFile(restorePath, 'utf8');
            const currentContent = await fs.readFile(currentPath, 'utf8');
            
            isDifferent = restoreContent !== currentContent;
            needsRestore = isDifferent;
        }
        
        return {
            filename,
            hasCurrentFile,
            needsRestore,
            isDifferent,
            restoreSize: restoreStats.size,
            currentSize: currentStats ? currentStats.size : 0,
            restoreDate: restoreStats.mtime.toISOString().split('T')[0],
            currentDate: currentStats ? currentStats.mtime.toISOString().split('T')[0] : 'N/A',
            restoreTime: restoreStats.mtime,
            currentTime: currentStats ? currentStats.mtime : null
        };
    }

    /**
     * Restore a single file
     * @param {string} filename - Name of the file to restore
     * @returns {Object} Result object with success status and message
     */
    async restoreFile(filename) {
        try {
            if (!filename || !filename.endsWith('.js')) {
                throw new Error('Invalid filename');
            }
            
            const restoreFile = path.join(this.restoreDir, filename);
            const targetFile = path.join(this.functionsDir, filename);
            
            // Check if restore file exists
            if (!await fs.pathExists(restoreFile)) {
                throw new Error('Restore file not found');
            }
            
            // Create backup of current file if it exists
            // if (await fs.pathExists(targetFile)) {
            //     const backupPath = path.join(this.functionsDir, `${filename}.backup.${Date.now()}`);
            //     await fs.copy(targetFile, backupPath);
            // }
            
            // Copy file from restore to functions
            await fs.copy(restoreFile, targetFile);
            
            // Log the restoration
            await this.logRestoration(filename, 'single', true);
            
            return { 
                success: true, 
                message: `Successfully restored ${filename}`,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error restoring file:', error);
            await this.logRestoration(filename, 'single', false, error.message);
            throw error;
        }
    }

    /**
     * Restore all function files
     * @returns {Object} Result object with success status and count
     */
    async restoreAllFiles() {
        try {
            const restoreFiles = await fs.readdir(this.restoreDir);
            const functionFiles = restoreFiles.filter(file => file.endsWith('.js'));
            
            let filesRestored = 0;
            const errors = [];
            
            for (const file of functionFiles) {
                try {
                    await this.restoreFile(file);
                    filesRestored++;
                } catch (error) {
                    errors.push({ file, error: error.message });
                }
            }
            
            await this.logRestoration('ALL_FILES', 'bulk', errors.length === 0, 
                errors.length > 0 ? `${errors.length} files failed` : `${filesRestored} files restored`);
            
            return { 
                success: errors.length === 0, 
                filesRestored, 
                errors,
                message: `Restored ${filesRestored} files${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error in bulk restore:', error);
            await this.logRestoration('ALL_FILES', 'bulk', false, error.message);
            throw error;
        }
    }

    /**
     * Restore selected files
     * @param {Array} filenames - Array of filenames to restore
     * @returns {Object} Result object with success status and count
     */
    async restoreSelectedFiles(filenames) {
        try {
            if (!Array.isArray(filenames)) {
                throw new Error('Invalid filenames array');
            }
            
            let filesRestored = 0;
            const errors = [];
            
            for (const filename of filenames) {
                if (!filename.endsWith('.js')) continue;
                
                try {
                    await this.restoreFile(filename);
                    filesRestored++;
                } catch (error) {
                    errors.push({ file: filename, error: error.message });
                }
            }
            
            await this.logRestoration(filenames.join(', '), 'selective', errors.length === 0,
                errors.length > 0 ? `${errors.length} files failed` : `${filesRestored} files restored`);
            
            return { 
                success: errors.length === 0, 
                filesRestored, 
                errors,
                message: `Restored ${filesRestored} files${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error in selective restore:', error);
            await this.logRestoration('SELECTED_FILES', 'selective', false, error.message);
            throw error;
        }
    }

    /**
     * Get restoration statistics
     * @returns {Object} Statistics object
     */
    async getRestorationStats() {
        try {
            const fileStatus = await this.getFileStatus();
            
            const stats = {
                totalFiles: fileStatus.length,
                upToDate: fileStatus.filter(f => !f.needsRestore).length,
                needsRestore: fileStatus.filter(f => f.needsRestore).length,
                missing: fileStatus.filter(f => !f.hasCurrentFile).length,
                modified: fileStatus.filter(f => f.hasCurrentFile && f.needsRestore).length,
                lastScanTime: new Date().toISOString()
            };
            
            return stats;
        } catch (error) {
            console.error('Error getting restoration stats:', error);
            throw error;
        }
    }

    /**
     * Validate restore directory and files
     * @returns {Object} Validation result
     */
    async validateRestoreDirectory() {
        try {
            const validation = {
                restoreDirExists: await fs.pathExists(this.restoreDir),
                functionsDirExists: await fs.pathExists(this.functionsDir),
                restoreFiles: [],
                errors: []
            };
            
            if (validation.restoreDirExists) {
                const files = await fs.readdir(this.restoreDir);
                validation.restoreFiles = files.filter(f => f.endsWith('.js'));
                
                // Validate each restore file
                for (const file of validation.restoreFiles) {
                    const filePath = path.join(this.restoreDir, file);
                    try {
                        const content = await fs.readFile(filePath, 'utf8');
                        if (content.length === 0) {
                            validation.errors.push(`${file}: Empty file`);
                        }
                    } catch (error) {
                        validation.errors.push(`${file}: ${error.message}`);
                    }
                }
            }
            
            return validation;
        } catch (error) {
            console.error('Error validating restore directory:', error);
            throw error;
        }
    }

    /**
     * Log restoration activities
     * @param {string} target - Target file(s) or operation
     * @param {string} type - Type of restoration (single, bulk, selective)
     * @param {boolean} success - Whether the operation succeeded
     * @param {string} details - Additional details
     */
    async logRestoration(target, type, success, details = '') {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                target,
                type,
                success,
                details
            };
            
            const logLine = `${logEntry.timestamp} | ${type.toUpperCase()} | ${success ? 'SUCCESS' : 'FAILED'} | ${target} | ${details}\n`;
            
            await fs.ensureFile(this.logFile);
            await fs.appendFile(this.logFile, logLine);
        } catch (error) {
            console.error('Error logging restoration:', error);
        }
    }

    /**
     * Get restoration log entries
     * @param {number} limit - Maximum number of entries to return
     * @returns {Array} Array of log entries
     */
    async getRestorationLog(limit = 50) {
        try {
            if (!await fs.pathExists(this.logFile)) {
                return [];
            }
            
            const content = await fs.readFile(this.logFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);
            
            const entries = lines.slice(-limit).map(line => {
                const parts = line.split(' | ');
                if (parts.length >= 4) {
                    return {
                        timestamp: parts[0],
                        type: parts[1],
                        status: parts[2],
                        target: parts[3],
                        details: parts[4] || ''
                    };
                }
                return null;
            }).filter(entry => entry !== null);
            
            return entries.reverse(); // Most recent first
        } catch (error) {
            console.error('Error reading restoration log:', error);
            return [];
        }
    }
}

module.exports = RestorationManager;
