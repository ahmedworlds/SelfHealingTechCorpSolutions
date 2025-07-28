# Self-Healing Web Application

A Node.js web application that demonstrates self-healing capabilities using Generative AI for runtime error resolution. Built for MSc research on automated error detection and correction.

## Features

- **Company Portfolio Website**: 9 pages with intentionally injected errors
- **AI-Powered Self-Healing**: Automatic error detection, patch generation, and validation
- **Real-time Monitoring**: Continuous error log monitoring and processing
- **Comprehensive Testing**: Automated test validation for generated patches
- **Research Analytics**: Detailed logging of patch success rates and recovery times

## Project Structure

```
├── app.js                 # Main application server
├── config.json           # Configuration settings
├── package.json          # Dependencies and scripts
├── run_tests.js          # Test runner
├── routes/               # Route handlers (9 error pages)
├── functions/            # Core logic functions (with injected errors)
├── templates/            # HTML templates
├── public/               # Static assets (CSS, JS)
├── healing/              # Self-healing module
├── tests/                # Test files
├── logs/                 # Error and patch logs
└── backups/              # File backups
```

## Error Types Implemented

1. **Portfolio Pages**:
   - ReferenceError (undefined variable)
   - TypeError (method on null/undefined)
   - SyntaxError (invalid JSON parsing)

2. **Team Pages**:
   - UndefinedProperty (accessing non-existent property)
   - InvalidFunctionCall (calling non-existent method)
   - ArrayIndexError (accessing invalid array index)

3. **FAQ Pages**:
   - DivisionByZero (mathematical error)
   - EvalMisuse (dangerous eval usage)
   - ReferenceError (undefined variable access)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Edit `config.json` and add your AI provider API keys:
```json
{
  "aiProvider": "gemini",
  "geminiApiKey": "YOUR_GEMINI_API_KEY_HERE",
  "openRouterApiKey": "YOUR_OPENROUTER_API_KEY_HERE"
}
```

### 3. Start the Application
```bash
npm start
```

The application will run on `http://localhost:3000`

## Usage

### Testing Error Pages
1. Navigate to `http://localhost:3000`
2. Use the navigation menu to visit different error pages:
   - Portfolio A, B, C (ReferenceError, TypeError, SyntaxError)
   - Team Alpha, Beta, Gamma (UndefinedProperty, InvalidFunctionCall, ArrayIndexError)
   - FAQ General, Technical, Support (DivisionByZero, EvalMisuse, ReferenceError)

### Self-Healing Process
1. Visit any error page to trigger the error
2. The error is logged to `logs/errors.log`
3. The monitoring system detects the error
4. AI generates a patch using the configured provider
5. The patch is tested and applied if valid
6. Results are logged to `logs/patch.json`

### Running Tests Manually
```bash
npm test
```

## Configuration Options

- `aiProvider`: "gemini" or "openrouter"
- `healingEnabled`: Enable/disable self-healing
- `monitoringInterval`: How often to check for errors (ms)
- `logLevel`: Logging verbosity
- `port`: Server port

## Research Data

### Error Logs
- Location: `logs/errors.log`
- Contains: Timestamp, error details, stack traces

### Patch Results
- Location: `logs/patch.json`
- Contains: Recovery times, success rates, test results

### Test Results
- Location: `logs/test_results.json`
- Contains: Test execution results and validation data

## Development

### Adding New Error Types
1. Create route handler in `routes/`
2. Create function with error in `functions/`
3. Create corresponding test in `tests/`
4. Update navigation in `base_template.html`

### Monitoring Configuration
- Modify `healing/monitor.js` for custom monitoring logic
- Adjust `healing/patcher.js` for different AI providers

## Research Metrics

The system tracks:
- **Recovery Time**: Time from error detection to successful patch
- **Success Rate**: Percentage of successfully applied patches
- **Error Types**: Distribution of different error categories
- **Test Validation**: Patch validation through automated testing

## Troubleshooting

### Common Issues
1. **API Key Errors**: Ensure valid API keys in `config.json`
2. **Port Conflicts**: Change port in `config.json`
3. **Permission Errors**: Ensure write permissions for `logs/` and `backups/`

### Debugging
- Set `logLevel: "debug"` in `config.json`
- Check `logs/errors.log` for detailed error information
- Use `npm run dev` for development with auto-restart

## License

MIT License - For MSc Research Use
