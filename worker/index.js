require('dotenv').config();
const Scraper = require('./scraper');
const LLMService = require('./llm');
const axios = require('axios');

// Config
const API_URL = process.env.API_URL || 'http://localhost:8000/api';
const LLM_API_KEY = process.env.LLM_API_KEY;

async function main() {
    console.log('Worker: Starting...');

    const scraper = new Scraper();
    const llm = new LLMService(LLM_API_KEY);

    try {
        await scraper.init();

        // 1. Fetch latest article from Laravel (simulated for now with dummy data if API fails)
        let article;
        try {
            console.log('Worker: Fetching latest article from API...');
            const res = await axios.get(`${API_URL}/articles/latest`);
            article = res.data;
        } catch (e) {
            console.warn('Worker: API offline or no articles. Using dummy data for testing.');
            article = {
                id: 999,
                title: 'The Future of AI Chatbots',
                content: 'Chatbots are becoming popular. They use NLP.'
            };
        }

        console.log(`Worker: Processing article "${article.title}"`);

        // 2. Search Google
        const links = await scraper.searchGoogle(article.title);
        console.log('Worker: Found links:', links);

        // 3. Scrape References
        let referenceText = '';
        for (const link of links) {
            const data = await scraper.scrapeArticle(link);
            referenceText += `Source (${data.url}):\n${data.content}\n\n`;
        }

        // 4. LLM Enhance
        const enhancedContent = await llm.enhanceContent(article.content, referenceText);

        // 5. Publish/Update (mock POST for now)
        console.log('Worker: Publishing enhanced content...');
        try {
            await axios.post(`${API_URL}/articles`, {
                title: article.title + ' (Enhanced)',
                content: enhancedContent,
                original_article_id: article.id,
                reference_links: JSON.stringify(links),
                source: 'enhanced' // <--- REQUIRED BY BACKEND
            });
            console.log('Worker: Successfully published!');
        } catch (e) {
            console.error('Worker: Failed to publish to API.');
            if (e.response) {
                console.error('API Error Response:', JSON.stringify(e.response.data, null, 2));
            } else {
                console.error('Error:', e.message);
            }
            console.log('--- ENHANCED CONTENT PREVIEW ---');
            console.log(enhancedContent.substring(0, 500) + '...');
        }

    } catch (error) {
        console.error('Worker: Fatal Error', error);
    } finally {
        await scraper.close();
        console.log('Worker: Done.');
    }
}

main();
