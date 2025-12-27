const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class LLMService {
    constructor(geminiApiKey, perplexityApiKey) {
        this.geminiApiKey = geminiApiKey;
        this.perplexityApiKey = perplexityApiKey;

        // Initialize Gemini if key provided
        if (geminiApiKey) {
            this.gemini = new GoogleGenerativeAI(geminiApiKey);
            this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        }
    }

    async enhanceWithGemini(originalContent, referenceText) {
        if (!this.geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = `You are a professional content writer. Rewrite the following article to match the quality and style of top-ranking content.

IMPORTANT RULES:
- Do NOT use inline citation numbers like [1], [2], etc.
- Write naturally without any bracketed references in the text
- Create original, comprehensive content inspired by the references
- If you want to cite sources, add a "Sources:" section at the very end with actual URLs

Original Article:
${originalContent}

Reference Content (for style and depth):
${referenceText}

Rewrite the article to be comprehensive, well-structured, and engaging. Make it at least as detailed as the references.`;

        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    async enhanceWithPerplexity(originalContent, referenceText) {
        if (!this.perplexityApiKey) {
            throw new Error('Perplexity API key not configured');
        }

        const prompt = `You are a professional content writer. Rewrite the following article to match the quality and style of top-ranking content.

IMPORTANT RULES:
- Do NOT use inline citation numbers like [1], [2], etc.
- Write naturally without any bracketed references in the text
- Create original, comprehensive content inspired by the references
- If you want to cite sources, add a "Sources:" section at the very end with actual URLs

Original Article:
${originalContent}

Reference Content (for style and depth):
${referenceText}

Rewrite the article to be comprehensive, well-structured, and engaging. Make it at least as detailed as the references.`;

        const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional content writer who creates high-quality, comprehensive articles.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.perplexityApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;
    }

    async enhanceContent(originalContent, referenceText) {
        // Try Gemini first
        if (this.geminiApiKey) {
            try {
                console.log('LLM: Attempting enhancement via Gemini...');
                const result = await this.enhanceWithGemini(originalContent, referenceText);
                console.log('LLM: ✅ Enhanced successfully with Gemini');
                return result;
            } catch (error) {
                console.warn('LLM: ⚠️ Gemini failed:', error.message);

                // If Gemini fails due to rate limit or any error, try Perplexity
                if (this.perplexityApiKey) {
                    console.log('LLM: Falling back to Perplexity...');
                    try {
                        const result = await this.enhanceWithPerplexity(originalContent, referenceText);
                        console.log('LLM: ✅ Enhanced successfully with Perplexity');
                        return result;
                    } catch (perplexityError) {
                        console.error('LLM: ❌ Perplexity also failed:', perplexityError.message);
                        throw new Error(`Both LLM providers failed. Gemini: ${error.message}, Perplexity: ${perplexityError.message}`);
                    }
                } else {
                    throw error; // No fallback available
                }
            }
        }

        // If no Gemini key, try Perplexity directly
        if (this.perplexityApiKey) {
            console.log('LLM: Using Perplexity (no Gemini key configured)...');
            const result = await this.enhanceWithPerplexity(originalContent, referenceText);
            console.log('LLM: ✅ Enhanced successfully with Perplexity');
            return result;
        }

        throw new Error('No LLM API keys configured');
    }
}

module.exports = LLMService;
