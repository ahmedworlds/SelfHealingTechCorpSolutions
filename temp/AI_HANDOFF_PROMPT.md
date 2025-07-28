# AI HANDOFF PROMPT: Self-Healing Web Application with Generative AI

## PROJECT OVERVIEW
Create a complete, modular Node.js web application for MSc research on "Self-Healing Web Application with Generative AI for Runtime Error Resolution." The system must inject errors into specific pages, detect and log them, and use AI (Gemini, OpenRouter, LM Studio) to auto-patch errors with comprehensive research analytics.

## CORE REQUIREMENTS
- **Error Injection**: 9 specific error types across 3 website sections (Portfolio, Team, FAQ)
- **Self-Healing**: Immediate error detection, AI-powered patch generation, automatic testing and deployment
- **Research Analytics**: Comprehensive admin panel for AI provider comparison and performance metrics
- **Modular Architecture**: Easy debugging, testing, and analysis with clear separation of concerns

## COMPLETED APPLICATION STRUCTURE

### 1. MAIN APPLICATION FILES
```
app.js - Express server with error handling middleware, direct healing integration
config.json - Configuration with AI providers, error types, healing settings, API limits
package.json - Dependencies: express, fs-extra, axios, nodemon
```

### 2. ERROR-INJECTED PAGES (9 total)
**Portfolio Section (ReferenceError, TypeError, SyntaxError):**
- `/routes/portfolio_ref_err.js` + `/functions/generate_portfolio_ref_err.js`
- `/routes/portfolio_typ_err.js` + `/functions/generate_portfolio_typ_err.js`
- `/routes/portfolio_syn_err.js` + `/functions/generate_portfolio_syn_err.js`

**Team Section (Undefined Property, Invalid Function, Array Index Error):**
- `/routes/team_und_pro.js` + `/functions/generate_team_und_pro.js`
- `/routes/team_inv_fun.js` + `/functions/generate_team_inv_fun.js`
- `/routes/team_arr_ind.js` + `/functions/generate_team_arr_ind.js`

**FAQ Section (Division by Zero, RangeError, URIError):**
- `/routes/faq_div_zer.js` + `/functions/generate_faq_div_zer.js`
- `/routes/faq_ran_err.js` + `/functions/generate_faq_ran_err.js`
- `/routes/faq_uri_err.js` + `/functions/generate_faq_uri_err.js`

### 3. SELF-HEALING SYSTEM
```
/healing/direct_healer.js - Main healing orchestrator (immediate error response)
/healing/monitor.js - Error detection and logging
/healing/patcher.js - Backup creation, patch generation, testing, deployment
/healing/gemini_api.js - Google Gemini AI integration
/healing/openrouter_api.js - OpenRouter API integration  
/healing/utils.js - Utility functions for file operations
/healing/test_runner.js - Automated testing of generated patches
```

### 4. ADMIN CONTROL PANEL (Research Analytics) - COMPLETE
```
/routes/admin.js - Main dashboard with summary metrics
/routes/admin_performance.js - AI provider comparison with Google Charts  
/routes/admin_placeholders.js - Error patterns and system health pages
/admin/data_processor.js - Modular analytics functions
```

**FULLY IMPLEMENTED ADMIN FEATURES:**
- **Dashboard**: Summary cards with key metrics and quick access
- **Performance Analytics**: AI provider comparison tables and Google Charts
- **Error Patterns**: Complexity analysis, peak times, retry patterns with charts
- **System Health**: API usage, rate limiting, healing performance monitoring
- **Home Page Integration**: Professional research admin access card

### 5. TESTING FRAMEWORK
```
/tests/test_portfolio_ref_err.js (and 8 more test files)
- Each error type has corresponding test file
- Tests verify patch effectiveness and error resolution
```

### 6. UI/UX COMPONENTS
```
/templates/base_template.html - Bootstrap-based template with navigation
/public/styles.css - Custom styling
/public/script.js - Client-side JavaScript
```

### 7. LOGGING & DATA
```
/logs/errors.log - Error logging
/logs/patch.json - Patch attempt results with metrics
/functions/error_references_resolutions.txt - Documentation of all errors and fixes
```

## KEY CONFIGURATION (config.json)
```json
{
    "healingEnabled": true,
    "callAI": true,
    "aiProvider": "openRouter",
    "port": 3000,
    "apiUsageLimit": {
        "maxCallsPerMinute": 2,
        "maxCallsPerHour": 10,
        "maxCallsPerDay": 50
    },
    "aiProviders": {
        "gemini": "Gemini-2.0-flash",
        "openRouter": "OpenRouter deepseek-r1",
        "lmStudio": "LM Studio LLAMA"
    },
    "errorTypes": [
        "ReferenceError", "TypeError", "SyntaxError",
        "Division by Zero", "Undefined Property", "Invalid Function Call",
        "Array Index Error", "RangeError", "URIError"
    ]
}
```

## SPECIFIC ERROR IMPLEMENTATIONS

### Portfolio Section Errors:
1. **ReferenceError** (line 26): `undefinedStatusVariable is not defined`
2. **TypeError** (line 26): `Cannot read properties of null (reading 'toString')`
3. **SyntaxError** (line 15): Missing closing bracket

### Team Section Errors:
4. **Undefined Property** (line 22): `Cannot read property 'name' of undefined`
5. **Invalid Function Call** (line 35): `calculateTeamSize is not a function`
6. **Array Index Error** (line 28): Accessing `teamMembers[999]`

### FAQ Section Errors:
7. **Division by Zero** (line 18): `result = numerator / 0`
8. **RangeError** (line 20): `"test".repeat(-1)`
9. **URIError** (line 25): `decodeURIComponent('%')`

## SELF-HEALING WORKFLOW
1. **Error Detection**: Global middleware catches runtime errors
2. **Immediate Response**: `direct_healer.js` triggers healing process
3. **Backup Creation**: Original file backed up with timestamp
4. **AI Patch Generation**: Multiple AI providers generate fixes
5. **Automated Testing**: Patches tested before deployment
6. **Deployment**: Successful patches applied automatically
7. **Logging**: All attempts logged with metrics for research

## ADMIN PANEL FEATURES
- **Performance Analytics**: AI provider comparison tables and Google Charts
- **Success Rate Analysis**: By error type and AI provider
- **Recovery Time Metrics**: Average, min, max healing times
- **Provider Performance Summary**: Overall statistics per AI provider
- **Modular Data Processing**: Config-driven reporting system

## RESEARCH ANALYTICS CAPABILITIES
- Success rates by error type and AI provider
- Recovery time analysis and trends
- Error complexity scoring
- Peak error time analysis
- Retry pattern detection
- Provider performance comparison
- Export capabilities for research data

## TECHNICAL SPECIFICATIONS
- **Framework**: Express.js with middleware architecture
- **AI Integration**: Multi-provider support (Gemini, OpenRouter, LM Studio)
- **UI**: Bootstrap 5 with Google Charts integration
- **Testing**: Automated test runner for patch validation
- **Logging**: Comprehensive error and patch logging
- **Development**: Nodemon for hot reloading

## DEVELOPMENT COMMANDS
```bash
npm install          # Install dependencies
npm start           # Start production server
npm run dev         # Start with nodemon (development)
npm test            # Run test suite
```

## ACCESS POINTS
- **Main Site**: http://localhost:3000/
- **Admin Panel**: http://localhost:3000/admin
- **Performance Analytics**: http://localhost:3000/admin/reports/performance
- **Error Pages**: /portfolio-ref-err, /team-und-pro, /faq-div-zer, etc.

## SAMPLE DATA STRUCTURE (patch.json)
```json
{
  "patches": [
    {
      "timestamp": "2025-07-04T12:30:15.100Z",
      "filename": "path/to/file.js",
      "errorType": "ReferenceError",
      "errorMessage": "undefinedStatusVariable is not defined",
      "lineNumber": 26,
      "recoveryTimeMs": 1850,
      "patchStatus": "success",
      "testResults": "All tests passed",
      "aiProvider": "gemini",
      "backupCreated": true,
      "patchApplied": true,
      "errorDetails": "Patch successfully applied"
    }
  ]
}
```

## CRITICAL SUCCESS FACTORS
1. **Modular Design**: Each component is self-contained and testable
2. **Config-Driven**: Easy to add new AI providers and error types
3. **Comprehensive Logging**: All healing attempts tracked for research
4. **Immediate Healing**: Direct error response without background polling
5. **Research-Focused**: Admin panel designed for academic analysis
6. **Production-Ready**: Error handling, rate limiting, and backup systems

## NEXT STEPS FOR CONTINUATION
1. ✅ **COMPLETED**: Implement additional admin report pages (Error Patterns, System Health)
2. Add CSV/JSON export functionality for research data
3. Enhance research session management
4. Add more sophisticated error complexity analysis
5. Implement A/B testing for different AI prompting strategies
6. Add real-time monitoring and alerts for system health

This application represents a complete, functional research platform for studying self-healing web applications with generative AI, providing both the error injection mechanism and comprehensive analytics for academic research.
