console.log("File: healing/gemini_api.js");




async function callGeminiAI(model, question, callback) {
    const apiKey = "AIzaSyCsU-__bskbfyErXCRBmeSRlFOnpWGf1bk"; // API key provided by Canvas runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = question + `
Just write the answer in plain text,
do not write any additional tags or text formatting,
don't write javascript tags,
Wrap your response in the following tags:
### CONTENT_START ###
CONTENT_HERE
### CONTENT_END ###`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {}
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
            callback(null);
            return;
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            callback(text);
        } else {
            console.error("Unexpected response format from Gemini API.");
            callback(null);
        }
    } catch (error) {
        console.error("Error calling Gemini AI:", error);
        callback(null);
    }
}



// const https = require('https');

// function callGeminiAI(model, question, callback) {
//     const config = require('../config.json');
//     const AI_API_KEY = config.geminiApiKey;
    
//     const prompt = question + `
// Just write the answer, Wrap your response in the following tags:
// ### CONTENT_START ###
// CONTENT_HERE
// ### CONTENT_END ###`;

//     const body = JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }]
//     });

//     const req = https.request({
//         hostname: 'generativelanguage.googleapis.com',
//         path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_API_KEY}`,
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Content-Length': Buffer.byteLength(body)
//         }
//     }, res => {
//         let data = '';
//         res.on('data', chunk => data += chunk);
//         res.on('end', () => {
//             try {
//                 const result = JSON.parse(data);
//                 if (result.candidates && result.candidates[0] && result.candidates[0].content) {
//                     callback(result.candidates[0].content.parts[0].text);
//                 } else {
//                     console.error('Unexpected Gemini API response structure:', data);
//                     callback(null);
//                 }
//             } catch (e) {
//                 console.error('Error parsing Gemini API response:', e.message);
//                 callback(null);
//             }
//         });
//     });

//     req.on('error', (err) => {
//         console.error('Gemini API request error:', err.message);
//         callback(null);
//     });
//     req.write(body);
//     req.end();
// }

module.exports = { callGeminiAI };
