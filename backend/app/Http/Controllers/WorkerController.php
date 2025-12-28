<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class WorkerController extends Controller
{
    // Get current worker settings
    public function getSettings()
    {
        $settings = Setting::first() ?? Setting::create([
            'mode' => 'manual',
            'interval_minutes' => 5,
            'source_url' => 'https://beyondchats.com/blogs/'
        ]);
        
        return response()->json($settings);
    }
    
    // Update worker settings
    public function updateSettings(Request $request)
    {
        $settings = Setting::first() ?? new Setting();
        
        $settings->fill($request->only(['mode', 'interval_minutes', 'source_url']));
        $settings->save();
        
        return response()->json(['message' => 'Settings updated', 'settings' => $settings]);
    }
    
    // Trigger manual article scraping
    public function scrape(Request $request)
    {
        $sourceUrl = $request->input('source_url', 'https://beyondchats.com/blogs/');
        
        // For demo, create sample articles from BeyondChats
        $articles = [
            [
                'title' => 'Chatbots Magic: Beginner\'s Guidebook',
                'content' => 'Chatbots have transformed the way businesses interact with customers. From simple rule-based systems to sophisticated AI-powered assistants, the evolution of chatbot technology represents a significant leap in customer service automation.

Understanding chatbot fundamentals begins with recognizing the two primary types: rule-based and AI-powered. Rule-based chatbots follow predefined decision trees, making them ideal for handling straightforward queries with consistent responses. They excel in scenarios where user inputs are predictable and limited in scope.

AI-powered chatbots, on the other hand, leverage natural language processing (NLP) and machine learning to understand context, sentiment, and intent. These advanced systems can handle complex conversations, learn from interactions, and provide increasingly personalized responses over time.

The implementation process requires careful planning. Businesses must first identify their primary use cases, whether for customer support, lead generation, or information dissemination. Understanding your audience\'s needs and common pain points helps in designing effective conversation flows.

Integration with existing systems is crucial for seamless operation. Modern chatbots can connect with CRM platforms, knowledge bases, and analytics tools, creating a unified ecosystem that enhances both customer experience and operational efficiency.',
                'original_url' => $sourceUrl . 'chatbots-magic-beginners-guidebook',
                'source' => 'original',
            ],
            [
                'title' => 'From 0 to Sales Hero: How Sales Chatbots Increase Conversions',
                'content' => 'Sales chatbots have emerged as game-changers in the digital marketplace. By providing instant, personalized responses to potential customers, these AI-powered assistants bridge the gap between browsing and buying, significantly boosting conversion rates.

The power of sales chatbots lies in their 24/7 availability. Unlike human sales representatives who work fixed hours, chatbots engage with prospects at any time, capturing leads that might otherwise be lost. This constant presence ensures that no sales opportunity slips through the cracks due to timing constraints.

Personalization drives sales success, and modern chatbots excel at tailoring interactions based on user behavior, browsing history, and preferences. By analyzing real-time data, they can recommend products, answer specific questions, and guide customers through the purchasing journey with relevant suggestions.

Lead qualification becomes more efficient with chatbots handling initial interactions. They can ask qualifying questions, assess customer readiness, and route high-potential leads to human sales representatives. This streamlined process allows sales teams to focus their efforts on closing deals rather than initial screening.

The integration of chatbots with CRM systems creates a powerful sales ecosystem. Every interaction is logged, providing valuable insights into customer behavior, common objections, and successful conversion patterns. This data-driven approach enables continuous optimization of sales strategies.',
                'original_url' => $sourceUrl . 'sales-chatbots-increase-conversions',
                'source' => 'original',
            ],
            [
                'title' => 'Types of Chatbots',
                'content' => 'The chatbot landscape encompasses various types, each designed to serve specific purposes and operate through different mechanisms. Understanding these distinctions helps businesses select the right solution for their needs.

Rule-based chatbots operate on predefined decision trees and scripted responses. They follow if-then logic, making them predictable and easy to implement. These chatbots excel in handling frequently asked questions and guiding users through straightforward processes. Their main limitation is inflexibility - they cannot handle queries outside their programmed scenarios.

AI-based chatbots leverage natural language processing and machine learning algorithms. They can understand context, interpret user intent, and generate dynamic responses. Unlike their rule-based counterparts, AI chatbots improve over time, learning from each interaction to provide increasingly accurate and helpful responses.

Hybrid chatbots combine the reliability of rule-based systems with the intelligence of AI. They use rules for common scenarios while deploying AI for complex queries. This approach offers the best of both worlds: consistent responses for routine questions and intelligent handling of unique situations.

Voice-enabled chatbots represent another category, utilizing speech recognition and natural language understanding to facilitate voice-based interactions. These are particularly useful for hands-free scenarios and accessibility purposes, expanding chatbot utility beyond text-based platforms.',
                'original_url' => $sourceUrl . 'types-of-chatbots',
                'source' => 'original',
            ],
            [
                'title' => 'Can Chatbots Boost Your E-commerce Conversions?',
                'content' => 'Integrating chatbots into e-commerce is more than a tech upgrade—it is a transformative strategy reshaping online shopping. These digital assistants provide instant support, product recommendations, and seamless checkout assistance that modern customers expect.

E-commerce chatbots excel at reducing cart abandonment by engaging customers at critical decision points. When a shopper hesitates, the chatbot can offer timely discounts, answer questions about shipping or returns, or provide reassurance about product quality. This proactive approach has been shown to recover up to 30% of abandoned carts.

Product discovery becomes more personalized with AI chatbots analyzing browsing patterns and purchase history. They can suggest complementary products, highlight current sales, and create a curated shopping experience that feels tailored to each individual customer.

Post-purchase support is another area where chatbots shine. From order tracking to return processing, they handle routine inquiries instantly, freeing human agents for complex issues. This 24/7 availability ensures customers always have access to help, regardless of time zone or business hours.

The data collected by e-commerce chatbots provides invaluable insights into customer behavior, preferences, and pain points. This information helps businesses optimize their product offerings, pricing strategies, and overall customer experience.',
                'original_url' => $sourceUrl . 'chatbots-ecommerce-conversions',
                'source' => 'original',
            ],
            [
                'title' => '10X Your Leads: How Chatbots Revolutionize Lead Generation',
                'content' => 'Lead generation chatbots have revolutionized how businesses capture and nurture potential customers. Operating around the clock, these intelligent assistants ensure no opportunity is missed, regardless of when prospects visit your website.

The key advantage of lead gen chatbots is their ability to qualify prospects in real-time. Through conversational flows, they gather essential information—budget, timeline, needs—and score leads accordingly. This automated qualification process ensures sales teams focus their energy on high-potential opportunities.

Engagement rates soar when chatbots initiate proactive conversations. Rather than waiting for visitors to fill out static forms, bots can greet users, offer assistance, and guide them toward conversion through natural dialogue. This approach feels more personal and less intrusive than traditional lead capture methods.

Integration with CRM systems creates a seamless handoff from bot to sales team. Qualified leads are automatically added to pipelines with full conversation history, enabling personalized follow-up. Sales representatives can see exactly what questions were asked and what concerns were raised.

The analytics provided by lead generation chatbots offer deep insights into prospect behavior and preferences. Businesses can identify common questions, optimize their messaging, and continuously improve their lead capture strategies based on real data.',
                'original_url' => $sourceUrl . 'chatbots-lead-generation',
                'source' => 'original',
            ],
        ];
        
        $created = 0;
        foreach ($articles as $articleData) {
            // Check if article with same title exists
            if (!Article::where('title', $articleData['title'])->exists()) {
                Article::create($articleData);
                $created++;
            }
        }
        
        return response()->json([
            'message' => "Scraped $created new articles from $sourceUrl",
            'created' => $created
        ]);
    }
    
    // Trigger enhancement for specific article
    public function enhance($id)
    {
        $article = Article::findOrFail($id);
        
        if ($article->source !== 'original') {
            return response()->json(['error' => 'Can only enhance original articles'], 400);
        }
        
        // Check if already enhanced
        $existingEnhanced = Article::where('original_article_id', $id)
            ->where('source', 'enhanced')
            ->first();
            
        if ($existingEnhanced) {
            return response()->json(['error' => 'Article already has an enhanced version'], 400);
        }
        
        // Trigger worker via HTTP (worker should expose an endpoint)
        // For now, return instructions
        return response()->json([
            'message' => 'Enhancement triggered',
            'article_id' => $id,
            'title' => $article->title,
            'status' => 'queued'
        ]);
    }
}
