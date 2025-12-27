require('dotenv').config();
const Scraper = require('./scraper');
const LLMService = require('./llm');
const axios = require('axios');

// Config
const API_URL = process.env.API_URL || 'http://localhost:8000/api';
const GEMINI_API_KEY = process.env.LLM_API_KEY; // Keep old name for backward compatibility
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!GEMINI_API_KEY && !PERPLEXITY_API_KEY) {
    console.error('❌ ERROR: No LLM API keys configured! Set LLM_API_KEY or PERPLEXITY_API_KEY');
    process.exit(1);
}

// 6. Start Health Check Server (Keep HF happy)
const http = require('http');
const PORT = 7860;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worker is Running! 🚀');
});

server.listen(PORT, () => {
    console.log(`Health Check Server running on port ${PORT}`);
});

// 7. Main Loop
async function runWorker() {
    console.log('Worker: Starting Job Cycle...');

    const scraper = new Scraper();
    const llm = new LLMService(GEMINI_API_KEY, PERPLEXITY_API_KEY);

    try {
        await scraper.init();

        // 1. Fetch oldest ORIGINAL article that doesn't have an enhanced version yet
        let article;
        try {
            console.log('Worker: Fetching articles from API...');
            const allArticles = await axios.get(`${API_URL}/articles`);

            // Find original articles that don't have enhanced versions
            const originalArticles = allArticles.data.filter(a => a.source === 'original');
            const enhancedArticles = allArticles.data.filter(a => a.source === 'enhanced');

            // Find originals without enhancements
            const unenhancedOriginals = originalArticles.filter(original => {
                return !enhancedArticles.some(enhanced =>
                    enhanced.original_article_id === original.id
                );
            });

            if (unenhancedOriginals.length === 0) {
                console.log('Worker: All articles already enhanced! Nothing to do.');
                return;
            }

            // Get the oldest unenhanced article
            article = unenhancedOriginals.sort((a, b) =>
                new Date(a.created_at) - new Date(b.created_at)
            )[0];

            console.log(`Worker: Found unenhanced article: "${article.title}"`);

        } catch (e) {
            console.warn('Worker: No articles found. Waiting...');
            return; // Skip this cycle
        }

        console.log(`Worker: Processing article "${article.title}"`);

        // 2. Search & Scrape
        const links = await scraper.searchGoogle(article.title);
        let referenceText = '';
        for (const link of links) {
            try {
                const data = await scraper.scrapeArticle(link);
                referenceText += `Source (${data.url}):\n${data.content}\n\n`;
            } catch (err) {
                console.error(`Skipping link ${link}: ${err.message}`);
            }
        }

        // 3. Enhance
        const enhancedContent = await llm.enhanceContent(article.content, referenceText);

        // 4. Publish
        await axios.post(`${API_URL}/articles`, {
            title: article.title + ' (Enhanced)',
            content: enhancedContent,
            original_article_id: article.id,
            reference_links: JSON.stringify(links),
            source: 'enhanced'
        });
        console.log('Worker: Job Complete!');

    } catch (error) {
        console.error('Worker Cycle Error:', error.message);
    } finally {
        await scraper.close();
    }
}

// Run every 5 minutes to respect Gemini API rate limits
console.log('Worker Application Started. Polling every 5 minutes.');
runWorker(); // First run immediately
setInterval(runWorker, 5 * 60 * 1000); // 5 minutes
