const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class Scraper {
    constructor() {
        this.browser = null;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium' || '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    /**
     * Search Google for a query and return top 2 article links.
     */
    async searchGoogle(query) {
        console.log(`Searching Google for: ${query}`);
        const page = await this.browser.newPage();

        // basic evasion
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        try {
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });

            // Extract links
            const links = await page.evaluate(() => {
                const results = [];
                const items = document.querySelectorAll('.g a'); // Select search result links
                for (let i = 0; i < items.length; i++) {
                    const href = items[i].href;
                    if (href && !href.includes('google.com') && !href.includes('beyondchats.com') && href.startsWith('http')) {
                        results.push(href);
                    }
                    if (results.length >= 2) break;
                }
                return results;
            });

            await page.close();
            return links;
        } catch (error) {
            console.error('Error searching Google:', error);
            await page.close();
            return [];
        }
    }

    /**
     * Scrape the text content of a given URL.
     */
    async scrapeArticle(url) {
        console.log(`Scraping article: ${url}`);
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const content = await page.evaluate(() => {
                // Heuristic: grab p tags from the main tag or body
                const pTags = document.querySelectorAll('p');
                let text = '';
                pTags.forEach(p => {
                    if (p.innerText.length > 50) { // filter out short snippets
                        text += p.innerText + '\n\n';
                    }
                });
                return text;
            });

            await page.close();
            return { url, content };
        } catch (error) {
            console.error(`Failed to scrape ${url}:`, error);
            await page.close();
            return { url, content: '' };
        }
    }
}

module.exports = Scraper;
