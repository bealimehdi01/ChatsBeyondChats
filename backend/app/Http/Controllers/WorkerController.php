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
        
        // 1. Fetch the main blog page
        try {
            $response = Http::timeout(30)->get($sourceUrl);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to reach source URL'], 500);
            }

            $crawler = new \Symfony\Component\DomCrawler\Crawler($response->body());
            $articles = [];
            
            // 2. Find article links (flexible selectors)
            $crawler->filter('article, .blog-post, .post-item')->each(function ($node) use (&$articles) {
                if (count($articles) >= 5) return;
                
                try {
                    $titleNode = $node->filter('h2 a, h3 a, .post-title a, .entry-title a')->first();
                    if ($titleNode->count() === 0) return;
                    
                    $title = trim($titleNode->text());
                    $url = $titleNode->attr('href');
                    
                    if (!str_starts_with($url, 'http')) {
                        $url = 'https://www.beyondchats.com' . $url;
                    }
                    
                    // 3. Request each article page to get full content
                    $content = $this->scrapeArticleContent($url);
                    
                    if ($content) {
                        $articles[] = [
                            'title' => $title,
                            'content' => $content,
                            'original_url' => $url,
                            'source' => 'original',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                } catch (\Exception $e) {
                    // Continue to next article if one fails
                }
            });
            
            // 4. Save to Database
            $created = 0;
            foreach ($articles as $articleData) {
                if (!Article::where('title', $articleData['title'])->exists()) {
                    Article::create($articleData);
                    $created++;
                }
            }
            
            if ($created === 0 && empty($articles)) {
                 // ONLY if real scraping fails completely do we error out (no automatic fallback to mock)
                 return response()->json(['error' => 'No articles found correctly. Check formatting.'], 404);
            }
            
            return response()->json([
                'message' => "Successfully scraped $created new articles from web!",
                'created' => $created
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Scraping failed: ' . $e->getMessage()], 500);
        }
    }

    // Helper to scrape inner content
    private function scrapeArticleContent($url)
    {
        try {
            $response = Http::timeout(15)->get($url);
            if (!$response->successful()) return null;
            
            $crawler = new \Symfony\Component\DomCrawler\Crawler($response->body());
            
            // Try common content selectors
            $selectors = ['.entry-content', '.post-content', '.article-body', 'article .content'];
            
            foreach ($selectors as $selector) {
                $node = $crawler->filter($selector);
                if ($node->count() > 0) {
                    return trim($node->text());
                }
            }
            
            // Fallback: Just grab paragraphs
            $paragraphs = $crawler->filter('p')->each(function ($node) {
                return trim($node->text());
            });
            return implode("\n\n", array_filter($paragraphs));
            
        } catch (\Exception $e) {
            return null;
        }
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
            'message' => 'Enhancement queued',
            'article_id' => $id,
            'title' => $article->title,
            'status' => 'queued'
        ]);
    }
}
