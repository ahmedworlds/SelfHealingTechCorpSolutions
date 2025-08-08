console.log( 'File: healing/openrouter_api.js' );


const https = require('https');
const { URL } = require('url');



function callOpenRouterAI(model, question, callback) {
    const config = require('../config.json');
    const AI_API_KEY = 'sk';
    const AI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const AI_API_MODEL = 'deepseek/deepseek-r1-0528:free';

    const prompt = question + `
Just write the answer, Wrap your response in the following tags:
### CONTENT_START ###
CONTENT_HERE
### CONTENT_END ###`;

    const body = JSON.stringify({
        model: AI_API_MODEL,
        messages: [{ role: 'user', content: prompt }]
    });

    const { hostname, pathname } = new URL(AI_API_URL);
    const req = https.request({
        hostname,
        path: pathname,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AI_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                if (result.choices && result.choices[0] && result.choices[0].message) {
                    callback(result.choices[0].message.content);
                } else {
                    console.error('Unexpected OpenRouter API response structure:', data);
                    callback(null);
                }
            } catch (e) {
                console.error('Error parsing OpenRouter API response:', e.message);
                callback(null);
            }
        });
    });

    req.on('error', (err) => {
        console.error('OpenRouter API request error:', err.message);
        callback(null);
    });
    req.write(body);
    req.end();
}



// console.log('Loading OpenRouter AI API module...');
// callOpenRouterAI("What is the capital of France?", res  => console.log(res));



module.exports = { callOpenRouterAI };
