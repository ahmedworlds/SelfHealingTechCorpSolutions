const fs = require('fs');
const path = require('path');

class PatchConverter {
    constructor() {
        this.inputJsonPath = path.join(__dirname, '..', 'logs', 'patch.json');
        this.outputCsvPath = path.join(__dirname, 'data_patch.csv');
        this.inputCsvPath = path.join(__dirname, 'full_patch.csv');
        this.outputJsonPath = path.join(__dirname, 'full_patch.json');
    }

    // Simple flatten - just handle the nested testResults
    flattenPatch(patch) {
        return {
            timestamp: patch.timestamp,
            filename: patch.filename,
            errorType: patch.errorType,
            errorMessage: patch.errorMessage,
            lineNumber: patch.lineNumber,
            recoveryTimeMs: patch.recoveryTimeMs,
            patchStatus: patch.patchStatus,
            'testResults.passed': patch.testResults?.passed,
            'testResults.message': patch.testResults?.message,
            'testResults.tests.0.passed': patch.testResults?.tests?.[0]?.passed,
            'testResults.tests.0.message': patch.testResults?.tests?.[0]?.message,
            'testResults.tests.0.function': patch.testResults?.tests?.[0]?.function,
            aiProvider: patch.aiProvider,
            backupCreated: patch.backupCreated,
            patchApplied: patch.patchApplied,
            errorDetails: patch.errorDetails
        };
    }

    // Simple reconstruct - rebuild the nested structure
    reconstructPatch(flatPatch) {
        return {
            timestamp: flatPatch.timestamp,
            filename: flatPatch.filename,
            errorType: flatPatch.errorType,
            errorMessage: flatPatch.errorMessage,
            lineNumber: this.parseNumber(flatPatch.lineNumber),
            recoveryTimeMs: this.parseNumber(flatPatch.recoveryTimeMs),
            patchStatus: flatPatch.patchStatus,
            testResults: {
                passed: this.parseBoolean(flatPatch['testResults.passed']),
                message: flatPatch['testResults.message'],
                tests: [{
                    passed: this.parseBoolean(flatPatch['testResults.tests.0.passed']),
                    message: flatPatch['testResults.tests.0.message'],
                    function: flatPatch['testResults.tests.0.function']
                }]
            },
            aiProvider: flatPatch.aiProvider,
            backupCreated: this.parseBoolean(flatPatch.backupCreated),
            patchApplied: this.parseBoolean(flatPatch.patchApplied),
            errorDetails: flatPatch.errorDetails === 'null' || flatPatch.errorDetails === '' ? null : flatPatch.errorDetails
        };
    }

    // Simple type conversions
    parseNumber(value) {
        return value === '' || value == null ? null : Number(value);
    }

    parseBoolean(value) {
        if (value === '' || value == null) return null;
        return value === 'true' || value === true;
    }

    // Convert JSON to CSV
    async jsonToCsv() {
        try {
            console.log('Reading patch.json...');
            const jsonData = JSON.parse(fs.readFileSync(this.inputJsonPath, 'utf8'));
            
            if (!jsonData.patches || !Array.isArray(jsonData.patches)) {
                throw new Error('Invalid patch.json format: missing patches array');
            }

            console.log(`Processing ${jsonData.patches.length} patches...`);
            
            // Flatten all patches
            const flattenedPatches = jsonData.patches.map(patch => this.flattenPatch(patch));
            
            // Get columns from first patch (they're all the same structure)
            const columns = Object.keys(flattenedPatches[0]);
            
            console.log(`Generated ${columns.length} columns`);
            
            // Create CSV content
            let csvContent = columns.join(',') + '\n';
            
            flattenedPatches.forEach(patch => {
                const row = columns.map(col => {
                    let value = patch[col];
                    if (value == null) value = '';
                    // Escape commas and quotes in CSV
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                csvContent += row.join(',') + '\n';
            });
            
            // Write CSV file
            fs.writeFileSync(this.outputCsvPath, csvContent);
            
            console.log(`✅ Successfully converted to ${this.outputCsvPath}`);
            console.log(`📊 Processed ${jsonData.patches.length} records with ${columns.length} columns`);
            
        } catch (error) {
            console.error('❌ Error converting JSON to CSV:', error.message);
        }
    }

    // Convert CSV to JSON
    async csvToJson() {
        try {
            console.log('Reading CSV file...');
            const csvContent = fs.readFileSync(this.inputCsvPath, 'utf8');
            const lines = csvContent.trim().split('\n');
            
            if (lines.length < 2) {
                throw new Error('CSV file must have at least header and one data row');
            }
            
            const headers = lines[0].split(',');
            console.log(`Processing ${lines.length - 1} records with ${headers.length} columns...`);
            
            const patches = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVRow(lines[i]);
                
                if (values.length !== headers.length) {
                    console.warn(`⚠️  Row ${i} has ${values.length} values but ${headers.length} headers expected`);
                    continue;
                }
                
                const flatData = {};
                headers.forEach((header, index) => {
                    flatData[header] = values[index];
                });
                
                const reconstructedPatch = this.reconstructPatch(flatData);
                patches.push(reconstructedPatch);
            }
            
            const jsonData = { patches };
            
            // Write JSON file
            fs.writeFileSync(this.outputJsonPath, JSON.stringify(jsonData, null, 2));
            
            console.log(`✅ Successfully converted to ${this.outputJsonPath}`);
            console.log(`📊 Reconstructed ${patches.length} patch records`);
            
        } catch (error) {
            console.error('❌ Error converting CSV to JSON:', error.message);
        }
    }

    // Parse CSV row handling quoted values
    parseCSVRow(row) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
                if (inQuotes && row[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current); // Add last value
        return values;
    }
}

// Command line interface
function main() {
    const converter = new PatchConverter();
    const command = process.argv[2];
    
    console.log('🔧 Patch Converter - JSON ↔ CSV');
    console.log('================================');
    
    switch (command) {
        case 'json-to-csv':
            console.log('📄 Converting JSON to CSV...\n');
            converter.jsonToCsv();
            break;
            
        case 'csv-to-json':
            console.log('📊 Converting CSV to JSON...\n');
            converter.csvToJson();
            break;
            
        default:
            console.log('Usage:');
            console.log('  node temp/patch_converter.js json-to-csv');
            console.log('  node temp/patch_converter.js csv-to-json');
            console.log('');
            console.log('Files:');
            console.log('  Input:  logs/patch.json → Output: temp/data_patch.csv');
            console.log('  Input:  temp/full_patch.csv → Output: temp/full_patch.json');
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { PatchConverter };
