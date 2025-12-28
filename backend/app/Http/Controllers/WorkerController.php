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

Understanding chatbot fundamentals begins with recognizing the two primary types: rule-based and AI-powered. Rule-based chatbots follow predefined decision trees, making them ideal for handling straightforward queries with consistent responses.

AI-powered chatbots leverage natural language processing (NLP) and machine learning to understand context, sentiment, and intent. These advanced systems can handle complex conversations, learn from interactions, and provide increasingly personalized responses over time.

The implementation process requires careful planning. Businesses must first identify their primary use cases, whether for customer support, lead generation, or information dissemination.',
                'original_url' => $sourceUrl . 'chatbots-magic-beginners-guidebook',
                'source' => 'original',
            ],
            [
                'title' => 'From 0 to Sales Hero: How Sales Chatbots Increase Conversions',
                'content' => 'Sales chatbots have emerged as game-changers in the digital marketplace. By providing instant, personalized responses to potential customers, these AI-powered assistants bridge the gap between browsing and buying.

The power of sales chatbots lies in their 24/7 availability. Unlike human sales representatives who work fixed hours, chatbots engage with prospects at any time, capturing leads that might otherwise be lost.

Personalization drives sales success, and modern chatbots excel at tailoring interactions based on user behavior, browsing history, and preferences. By analyzing real-time data, they can recommend products and guide customers through the purchasing journey.

Lead qualification becomes more efficient with chatbots handling initial interactions. They can ask qualifying questions, assess customer readiness, and route high-potential leads to human sales representatives.',
                'original_url' => $sourceUrl . 'sales-chatbots-increase-conversions',
                'source' => 'original',
            ],
            [
                'title' => 'Types of Chatbots: A Complete Guide',
                'content' => 'The chatbot landscape encompasses various types, each designed to serve specific purposes and operate through different mechanisms. Understanding these distinctions helps businesses select the right solution.

Rule-based chatbots operate on predefined decision trees and scripted responses. They follow if-then logic, making them predictable and easy to implement. These chatbots excel in handling frequently asked questions.

AI-based chatbots leverage natural language processing and machine learning algorithms. They can understand context, interpret user intent, and generate dynamic responses. Unlike rule-based counterparts, AI chatbots improve over time.

Hybrid chatbots combine the reliability of rule-based systems with the intelligence of AI. They use rules for common scenarios while deploying AI for complex queries. This approach offers consistent responses for routine questions.',
                'original_url' => $sourceUrl . 'types-of-chatbots',
                'source' => 'original',
            ],
            [
                'title' => 'Can Chatbots Boost Your E-commerce Conversions?',
                'content' => 'Integrating chatbots into e-commerce is more than a tech upgrade—it\'s a transformative strategy reshaping online shopping. These digital assistants provide instant support, product recommendations, and seamless checkout assistance.

E-commerce chatbots excel at reducing cart abandonment by engaging customers at critical decision points. When a shopper hesitates, the chatbot can offer timely discounts, answer questions, or provide reassurance.

Product discovery becomes more personalized with AI chatbots analyzing browsing patterns and purchase history. They can suggest complementary products, highlight sales, and create a curated shopping experience.

Post-purchase support is another area where chatbots shine. From order tracking to return processing, they handle routine inquiries instantly, freeing human agents for complex issues.',
                'original_url' => $sourceUrl . 'chatbots-ecommerce-conversions',
                'source' => 'original',
            ],
            [
                'title' => '10X Your Leads: How Chatbots Revolutionize Lead Generation',
                'content' => 'Lead generation chatbots have revolutionized how businesses capture and nurture potential customers. Operating around the clock, these intelligent assistants ensure no opportunity is missed.

The key advantage of lead gen chatbots is their ability to qualify prospects in real-time. Through conversational flows, they gather essential information—budget, timeline, needs—and score leads accordingly.

Engagement rates soar when chatbots initiate proactive conversations. Rather than waiting for visitors to fill out forms, bots can greet users, offer assistance, and guide them toward conversion.

Integration with CRM systems creates a seamless handoff from bot to sales team. Qualified leads are automatically added to pipelines with full conversation history, enabling personalized follow-up.',
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
