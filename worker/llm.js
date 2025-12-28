const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class LLMService {
    constructor(geminiApiKey, perplexityApiKey) {
        this.geminiApiKey = geminiApiKey;
        this.perplexityApiKey = perplexityApiKey;

        if (geminiApiKey) {
            this.gemini = new GoogleGenerativeAI(geminiApiKey);
            this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        }
    }

    async enhanceWithGemini(originalContent, referenceText) {
        if (!this.geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = `You are a professional content writer. Rewrite the following article to be comprehensive and well-structured.

CRITICAL RULES:
- Write naturally WITHOUT any citation numbers like [1], [2], [3]
- Do NOT include bracketed numbers anywhere in the text
- Create flowing, readable paragraphs

Original Article:
${originalContent}

Reference Content:
${referenceText}

Write a comprehensive, engaging article. NO CITATION NUMBERS.`;

        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        return this.cleanOutput(response.text());
    }

    async enhanceWithPerplexity(originalContent, referenceText) {
        if (!this.perplexityApiKey) {
            throw new Error('Perplexity API key not configured');
        }

        const prompt = `Rewrite this article to be comprehensive and well-structured.

CRITICAL: Write naturally WITHOUT any citation numbers. NO [1], [2], [3] etc.

Original Article:
${originalContent}

Reference Content:
${referenceText}

Write a comprehensive article. DO NOT USE CITATION NUMBERS.`;

        const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a content writer. NEVER use citation numbers like [1], [2], [3]. Write naturally without any bracketed references.'
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

        return this.cleanOutput(response.data.choices[0].message.content);
    }

    // AGGRESSIVE citation and formatting cleanup
    cleanOutput(text) {
        return text
            // Remove citation patterns: [1], [2], [1][2][3], [1,2,3], [1-5], etc.
            .replace(/\[\d+(?:,\s*\d+)*\]/g, '')  // [1], [1,2], [1, 2, 3]
            .replace(/\[\d+(?:\]\[\d+)+\]/g, '')  // [1][2][3]
            .replace(/\[\d+-\d+\]/g, '')          // [1-5]
            .replace(/\[\d+\]/g, '')              // Any remaining [N]
            // Remove markdown bold markers
            .replace(/\*\*/g, '')
            // Clean up extra spaces
            .replace(/\s+/g, ' ')
            .replace(/\s+\./g, '.')
            .replace(/\s+,/g, ',')
            // Clean up empty parentheses that might remain
            .replace(/\(\s*\)/g, '')
            .trim();
    }

    async enhanceContent(originalContent, referenceText) {
        // Try Gemini first
        if (this.geminiApiKey) {
            try {
                console.log('LLM: Trying Gemini...');
                const result = await this.enhanceWithGemini(originalContent, referenceText);
                console.log('LLM: ✅ Gemini success');
                return result;
            } catch (error) {
                console.warn('LLM: ⚠️ Gemini failed:', error.message);

                if (this.perplexityApiKey) {
                    console.log('LLM: Falling back to Perplexity...');
                    try {
                        const result = await this.enhanceWithPerplexity(originalContent, referenceText);
                        console.log('LLM: ✅ Perplexity success (citations stripped)');
                        return result;
                    } catch (perplexityError) {
                        console.error('LLM: ❌ Perplexity failed:', perplexityError.message);
                        if (perplexityError.response) {
                            console.error('LLM: Perplexity Response:', JSON.stringify(perplexityError.response.data));
                        }
                        throw new Error(`Both LLM providers failed`);
                    }
                }
                throw error;
            }
        }

        if (this.perplexityApiKey) {
            console.log('LLM: Using Perplexity...');
            const result = await this.enhanceWithPerplexity(originalContent, referenceText);
            console.log('LLM: ✅ Perplexity success (citations stripped)');
            return result;
        }

        throw new Error('No LLM API keys configured');
    }
}

module.exports = LLMService;
