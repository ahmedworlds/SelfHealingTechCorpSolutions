

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

// --- Example Usage ---
callGeminiAI(model, "What is the capital of France?", (response) => {
    if (response) {
        console.log("Gemini AI Response:", response);
    } else {
        console.log("Failed to get a response from Gemini AI.");
    }
});







// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: "AIzaSyCsU-__bskbfyErXCRBmeSRlFOnpWGf1bk" });

// async function callGeminiAI() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: "What is the capital of France? Just write the answer, Wrap your response in the following tags:\n### CONTENT_START ###\nCONTENT_HERE\n### CONTENT_END ###",
//   });
//   console.log(response.text);
// }

// callGeminiAI();
