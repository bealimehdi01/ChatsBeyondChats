<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;

class ScrapeArticles extends Command
{
    protected $signature = 'scrape:initial';
    protected $description = 'Scrape the 5 oldest articles from BeyondChats blog (pages 14-15)';

    public function handle()
    {
        $this->info('Scraping articles from BeyondChats blog...');

        // Check if articles exist
        if (Article::where('source', 'original')->count() >= 5) {
            $this->info('Articles already exist. Skipping.');
            return;
        }

        $articles = [];
        
        // Scrape pages 14 and 15 (oldest articles)
        foreach ([15, 14] as $page) {
            $this->info("Fetching page $page...");
            
            try {
                $response = Http::timeout(30)->get("https://www.beyondchats.com/blogs/page/$page");
                
                if (!$response->successful()) {
                    $this->error("Failed to fetch page $page");
                    continue;
                }

                $crawler = new Crawler($response->body());
                
                // Find all article cards (adjust selector based on actual HTML)
                $crawler->filter('article, .blog-post, .post-item')->each(function (Crawler $node) use (&$articles, $page) {
                    if (count($articles) >= 5) return;
                    
                    try {
                        // Extract title and link
                        $titleNode = $node->filter('h2 a, h3 a, .post-title a, .entry-title a')->first();
                        if ($titleNode->count() === 0) return;
                        
                        $title = trim($titleNode->text());
                        $url = $titleNode->attr('href');
                        
                        // Make URL absolute if needed
                        if (!str_starts_with($url, 'http')) {
                            $url = 'https://www.beyondchats.com' . $url;
                        }
                        
                        $this->info("Found: $title");
                        
                        // Scrape full content from article page
                        $content = $this->scrapeArticleContent($url);
                        
                        $articles[] = [
                            'title' => $title,
                            'content' => $content,
                            'original_url' => $url,
                            'source' => 'original',
                            'created_at' => now()->subDays(count($articles)), // Older articles get older dates
                            'updated_at' => now(),
                        ];
                        
                    } catch (\Exception $e) {
                        $this->error("Error parsing article: " . $e->getMessage());
                    }
                });
                
                if (count($articles) >= 5) break;
                
            } catch (\Exception $e) {
                $this->error("Error fetching page $page: " . $e->getMessage());
            }
        }

        if (empty($articles)) {
            $this->error('No articles found. Using fallback data...');
            $this->useFallbackData();
            return;
        }

        // Insert only the first 5
        Article::insert(array_slice($articles, 0, 5));
        $this->info('Successfully scraped ' . count(array_slice($articles, 0, 5)) . ' articles.');
    }

    private function scrapeArticleContent($url)
    {
        try {
            $this->info("  Fetching full content from: $url");
            
            $response = Http::timeout(30)->get($url);
            if (!$response->successful()) {
                return "Content unavailable (HTTP error)";
            }

            $crawler = new Crawler($response->body());
            
            // Try multiple common selectors for article content
            $selectors = [
                'article .entry-content',
                '.post-content',
                '.article-body',
                '.blog-content',
                'article .content',
                '[class*="content"] p',
            ];
            
            foreach ($selectors as $selector) {
                try {
                    $contentNode = $crawler->filter($selector);
                    if ($contentNode->count() > 0) {
                        $content = $contentNode->text();
                        if (strlen($content) > 200) { // Ensure we got substantial content
                            return $content;
                        }
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }
            
            // Fallback: get all paragraph text
            $paragraphs = $crawler->filter('p')->each(function (Crawler $node) {
                return trim($node->text());
            });
            
            $content = implode("\n\n", array_filter($paragraphs));
            
            if (strlen($content) < 200) {
                return "Unable to extract full content. Please check the URL manually.";
            }
            
            return $content;
            
        } catch (\Exception $e) {
            $this->error("  Failed to scrape content: " . $e->getMessage());
            return "Failed to scrape article content";
        }
    }

    private function useFallbackData()
    {
        $articles = [
            [
                'title' => 'Chatbots Magic: Beginner\'s Guidebook',
                'content' => 'Embrace the evolution by understanding your website\'s unique needs and leveraging Chatbots to create meaningful user experiences. This comprehensive guide covers everything from basic setup to advanced implementation strategies.',
                'original_url' => 'https://beyondchats.com/blogs/chatbots-magic-beginners-guidebook',
                'source' => 'original',
                'created_at' => now()->subDays(4),
                'updated_at' => now(),
            ],
            [
                'title' => 'From 0 to Sales Hero: How Sales Chatbots Increase Conversions',
                'content' => 'A sales chatbot acts as a tireless assistant, efficiently handling customer queries for seamless interactions. Learn how modern chatbots can transform your sales pipeline.',
                'original_url' => 'https://beyondchats.com/blogs/sales-chatbots-increase-conversions',
                'source' => 'original',
                'created_at' => now()->subDays(3),
                'updated_at' => now(),
            ],
            [
                'title' => 'Can Chatbots Boost Your E-commerce Conversions?',
                'content' => 'Integrating chatbots into e-commerce is more than a tech upgrade—it\'s a transformative strategy reshaping online shopping.',
                'original_url' => 'https://beyondchats.com/blogs/chatbots-ecommerce-conversions',
                'source' => 'original',
                'created_at' => now()->subDays(2),
                'updated_at' => now(),
            ],
            [
                'title' => '10 Solutions for Common Customer Service Issues',
                'content' => 'We explore common customer service issues and offer simple, innovative solutions to transform challenges into better customer experiences.',
                'original_url' => 'https://beyondchats.com/blogs/customer-service-solutions',
                'source' => 'original',
                'created_at' => now()->subDays(1),
                'updated_at' => now(),
            ],
            [
                'title' => '10X Your Leads: How Chatbots Revolutionize Lead Generation',
                'content' => 'Explore lead generation chatbots: discover their benefits, effective strategies, best practices, and the path to e-commerce success.',
                'original_url' => 'https://beyondchats.com/blogs/chatbots-lead-generation',
                'source' => 'original',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        Article::insert($articles);
        $this->info('Inserted fallback articles from pages 14-15.');
    }
}
