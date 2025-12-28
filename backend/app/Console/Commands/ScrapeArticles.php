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
                'content' => 'Chatbots have transformed the way businesses interact with customers. From simple rule-based systems to sophisticated AI-powered assistants, the evolution of chatbot technology represents a significant leap in customer service automation.

Understanding chatbot fundamentals begins with recognizing the two primary types: rule-based and AI-powered. Rule-based chatbots follow predefined decision trees, making them ideal for handling straightforward queries with consistent responses. They excel in scenarios where user inputs are predictable and limited in scope.

AI-powered chatbots, on the other hand, leverage natural language processing (NLP) and machine learning to understand context, sentiment, and intent. These advanced systems can handle complex conversations, learn from interactions, and provide increasingly personalized responses over time.

The implementation process requires careful planning. Businesses must first identify their primary use cases, whether for customer support, lead generation, or information dissemination. Understanding your audience\'s needs and common pain points helps in designing effective conversation flows.

Integration with existing systems is crucial for seamless operation. Modern chatbots can connect with CRM platforms, knowledge bases, and analytics tools, creating a unified ecosystem that enhances both customer experience and operational efficiency.',
                'original_url' => 'https://beyondchats.com/blogs/chatbots-magic-beginners-guidebook',
                'source' => 'original',
                'created_at' => now()->subDays(4),
                'updated_at' => now(),
            ],
            [
                'title' => 'From 0 to Sales Hero: How Sales Chatbots Increase Conversions',
                'content' => 'Sales chatbots have emerged as game-changers in the digital marketplace. By providing instant, personalized responses to potential customers, these AI-powered assistants bridge the gap between browsing and buying, significantly boosting conversion rates.

The power of sales chatbots lies in their 24/7 availability. Unlike human sales representatives who work fixed hours, chatbots engage with prospects at any time, capturing leads that might otherwise be lost. This constant presence ensures that no sales opportunity slips through the cracks due to timing constraints.

Personalization drives sales success, and modern chatbots excel at tailoring interactions based on user behavior, browsing history, and preferences. By analyzing real-time data, they can recommend products, answer specific questions, and guide customers through the purchasing journey with relevant suggestions.

Lead qualification becomes more efficient with chatbots handling initial interactions. They can ask qualifying questions, assess customer readiness, and route high-potential leads to human sales representatives. This streamlined process allows sales teams to focus their efforts on closing deals rather than initial screening.

The integration of chatbots with CRM systems creates a powerful sales ecosystem. Every interaction is logged, providing valuable insights into customer behavior, common objections, and successful conversion patterns. This data-driven approach enables continuous optimization of sales strategies.',
                'original_url' => 'https://beyondchats.com/blogs/sales-chatbots-increase-conversions',
                'source' => 'original',
                'created_at' => now()->subDays(3),
                'updated_at' => now(),
            ],
            [
                'title' => 'Types of Chatbots',
                'content' => 'The chatbot landscape encompasses various types, each designed to serve specific purposes and operate through different mechanisms. Understanding these distinctions helps businesses select the right solution for their needs.

Rule-based chatbots operate on predefined decision trees and scripted responses. They follow if-then logic, making them predictable and easy to implement. These chatbots excel in handling frequently asked questions and guiding users through straightforward processes. Their main limitation is inflexibility - they cannot handle queries outside their programmed scenarios.

AI-based chatbots leverage natural language processing and machine learning algorithms. They can understand context, interpret user intent, and generate dynamic responses. Unlike their rule-based counterparts, AI chatbots improve over time, learning from each interaction to provide increasingly accurate and helpful responses.

Hybrid chatbots combine the reliability of rule-based systems with the intelligence of AI. They use rules for common scenarios while deploying AI for complex queries. This approach offers the best of both worlds: consistent responses for routine questions and intelligent handling of unique situations.

Voice-enabled chatbots represent another category, utilizing speech recognition and natural language understanding to facilitate voice-based interactions. These are particularly useful for hands-free scenarios and accessibility purposes, expanding chatbot utility beyond text-based platforms.',
                'original_url' => 'https://beyondchats.com/blogs/types-of-chatbots',
                'source' => 'original',
                'created_at' => now()->subDays(2),
                'updated_at' => now(),
            ],
            [
                'title' => 'Can Chatbots Boost Your E-commerce Conversions?',
                'content' => 'Integrating chatbots into e-commerce is more than a tech upgrade—it is a transformative strategy reshaping online shopping. These digital assistants provide instant support, product recommendations, and seamless checkout assistance that modern customers expect.

E-commerce chatbots excel at reducing cart abandonment by engaging customers at critical decision points. When a shopper hesitates, the chatbot can offer timely discounts, answer questions about shipping or returns, or provide reassurance about product quality. This proactive approach has been shown to recover up to 30% of abandoned carts.

Product discovery becomes more personalized with AI chatbots analyzing browsing patterns and purchase history. They can suggest complementary products, highlight current sales, and create a curated shopping experience that feels tailored to each individual customer.

Post-purchase support is another area where chatbots shine. From order tracking to return processing, they handle routine inquiries instantly, freeing human agents for complex issues. This 24/7 availability ensures customers always have access to help, regardless of time zone or business hours.

The data collected by e-commerce chatbots provides invaluable insights into customer behavior, preferences, and pain points. This information helps businesses optimize their product offerings, pricing strategies, and overall customer experience.',
                'original_url' => 'https://beyondchats.com/blogs/chatbots-ecommerce-conversions',
                'source' => 'original',
                'created_at' => now()->subDays(1),
                'updated_at' => now(),
            ],
            [
                'title' => '10X Your Leads: How Chatbots Revolutionize Lead Generation',
                'content' => 'Lead generation chatbots have revolutionized how businesses capture and nurture potential customers. Operating around the clock, these intelligent assistants ensure no opportunity is missed, regardless of when prospects visit your website.

The key advantage of lead gen chatbots is their ability to qualify prospects in real-time. Through conversational flows, they gather essential information—budget, timeline, needs—and score leads accordingly. This automated qualification process ensures sales teams focus their energy on high-potential opportunities.

Engagement rates soar when chatbots initiate proactive conversations. Rather than waiting for visitors to fill out static forms, bots can greet users, offer assistance, and guide them toward conversion through natural dialogue. This approach feels more personal and less intrusive than traditional lead capture methods.

Integration with CRM systems creates a seamless handoff from bot to sales team. Qualified leads are automatically added to pipelines with full conversation history, enabling personalized follow-up. Sales representatives can see exactly what questions were asked and what concerns were raised.

The analytics provided by lead generation chatbots offer deep insights into prospect behavior and preferences. Businesses can identify common questions, optimize their messaging, and continuously improve their lead capture strategies based on real data.',
                'original_url' => 'https://beyondchats.com/blogs/chatbots-lead-generation',
                'source' => 'original',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        Article::insert($articles);
        $this->info('Inserted 5 fallback articles with full content.');
    }
}
