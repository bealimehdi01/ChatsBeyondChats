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
                        content: 'You are a professional content writer who creates high-quality, comprehensive articles WITHOUT using inline citations or reference numbers.'
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

    // Remove inline citation numbers like [1], [2], [1][2][3], etc.
    removeCitations(text) {
        // Remove patterns like [1], [2], [1][2], [1][2][3], etc.
        return text
            .replace(/\[\d+\](\[\d+\])*/g, '') // Remove consecutive citations like [1][2][3]
            .replace(/\s+/g, ' ') // Normalize spaces
            .replace(/\*\*/g, '') // Remove bold markdown if present
            .trim();
    }

    async enhanceContent(originalContent, referenceText) {
        // Try Gemini first
        if (this.geminiApiKey) {
            try {
                console.log('LLM: Attempting enhancement via Gemini...');
                const result = await this.enhanceWithGemini(originalContent, referenceText);
                const cleaned = this.removeCitations(result);
                console.log('LLM: ✅ Enhanced successfully with Gemini');
                return cleaned;
            } catch (error) {
                console.warn('LLM: ⚠️ Gemini failed:', error.message);

                // If Gemini fails, try Perplexity
                if (this.perplexityApiKey) {
                    console.log('LLM: Falling back to Perplexity...');
                    try {
                        const result = await this.enhanceWithPerplexity(originalContent, referenceText);
                        const cleaned = this.removeCitations(result);
                        console.log('LLM: ✅ Enhanced successfully with Perplexity (citations stripped)');
                        return cleaned;
                    } catch (perplexityError) {
                        console.error('LLM: ❌ Perplexity also failed:', perplexityError.message);
                        throw new Error(`Both LLM providers failed. Gemini: ${error.message}, Perplexity: ${perplexityError.message}`);
                    }
                } else {
                    throw error;
                }
            }
        }

        // If no Gemini key, try Perplexity directly
        if (this.perplexityApiKey) {
            console.log('LLM: Using Perplexity (no Gemini key configured)...');
            const result = await this.enhanceWithPerplexity(originalContent, referenceText);
            const cleaned = this.removeCitations(result);
            console.log('LLM: ✅ Enhanced successfully with Perplexity (citations stripped)');
            return cleaned;
        }

        throw new Error('No LLM API keys configured');
    }
}

module.exports = LLMService;
