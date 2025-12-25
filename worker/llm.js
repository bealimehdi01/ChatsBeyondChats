const axios = require('axios');

class LLMService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://api.openai.com/v1/chat/completions'; // Example endpoint
    }

    async enhanceContent(originalContent, referenceContent) {
        console.log('LLM: Enhancing content via Gemini...');
        const prompt = `
        You are an expert editor. 
        Original Article: ${originalContent.substring(0, 2000)}...
        
        Reference Material: ${referenceContent.substring(0, 2000)}...
        
        Task: Rewrite the original article to be more comprehensive, using facts from the reference material. Maintain the tone. Return ONLY the new article text.
        `;

        if (!this.apiKey || this.apiKey.includes('YOUR_API_KEY')) {
            console.log('LLM: No API Key provided. Returning mock enhanced content.');
            return `[AI ENHANCED VERSION - MOCK]\n\n${originalContent}\n\n[Added from Reference]:\n${referenceContent.substring(0, 500)}...`;
        }

        try {
            // GEMINI-FLASH-LATEST (Validated via list_models.js)
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${this.apiKey}`;


            const response = await axios.post(url, {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                return response.data.candidates[0].content.parts[0].text;
            }
            return originalContent;
        } catch (error) {
            console.error('LLM API Error:', error.response ? error.response.data : error.message);
            return originalContent; // Fallback
        }
    }
}

module.exports = LLMService;
