console.log("File: healing/gemini_api.js");

const axios = require('axios');

function callLMStudioAI(model, question, callback) {

    const prompt = question + `
4. Just write the full answer in plain text without any additional text or explanations, because the code will be excuted as it is, 
5. Do not omit, skip, summarize, or replace any part of the code with comments or placeholders (e.g., no // ...).
6. You must return the full, complete, and corrected content of the code file.
7. Do not try to fix other issues.
8. Do not write any code additional tags or text formatting or create files, just wrap your answer exactly like this:
### CONTENT_START ###
<PASTE THE FULL FIXED CODE HERE>
### CONTENT_END ###`;

  axios.post('http://localhost:1234/v1/chat/completions', {
    model: model,
    messages: [{ role: 'user', content: prompt }]
  }).then(res => {
    callback(res.data.choices[0].message.content);
  }).catch(err => {
    callback(null);
  });
}


module.exports = { callLMStudioAI };
