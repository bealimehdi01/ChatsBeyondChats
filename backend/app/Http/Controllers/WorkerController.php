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
        $startUrl = $request->input('source_url', 'https://beyondchats.com/blogs/');
        $maxNewArticles = 5;
        $createdCount = 0;
        $maxPages = 3; // Safety limit to prevent infinite loops
        $currentPage = 1;
        $urlToScrape = $startUrl;

        try {
            while ($createdCount < $maxNewArticles && $currentPage <= $maxPages) {
                
                $response = Http::withoutVerifying()->timeout(30)->get($urlToScrape);
                
                if (!$response->successful()) { 
                    break; 
                }

                $crawler = new \Symfony\Component\DomCrawler\Crawler($response->body());
                $currentNewOnPage = 0;

                // Loop through articles on THIS page
                $articleNodes = $crawler->filter('article, .blog-post, .post-item');
                
                foreach ($articleNodes as $node) {
                    if ($createdCount >= $maxNewArticles) break;

                    $crawlerNode = new \Symfony\Component\DomCrawler\Crawler($node);
                    $titleNode = $crawlerNode->filter('h2 a, h3 a, .post-title a, .entry-title a')->first();
                    
                    if ($titleNode->count() === 0) continue;

                    $title = trim($titleNode->text());
                    
                    // CHECK DB FIRST
                    if (Article::where('title', $title)->exists()) {
                        continue; // Skip if already exists
                    }

                    $url = $titleNode->attr('href');
                    if (!str_starts_with($url, 'http')) {
                        $url = 'https://www.beyondchats.com' . $url;
                    }

                    // Scrape deep content
                    $content = $this->scrapeArticleContent($url);

                    if ($content) {
                        Article::create([
                            'title' => $title,
                            'content' => $content,
                            'original_url' => $url,
                            'source' => 'original',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $createdCount++;
                        $currentNewOnPage++;
                    }
                }

                // If we found NO new articles on this page, try the next page
                if ($createdCount < $maxNewArticles) {
                    $nextPageLink = $crawler->filter('a.next.page-numbers, a.next');
                    if ($nextPageLink->count() > 0) {
                        $urlToScrape = $nextPageLink->attr('href');
                        $currentPage++;
                    } else {
                        break; // No more pages
                    }
                } else {
                    break; // Met quota
                }
            }

            return response()->json([
                'message' => "Successfully scraped $createdCount new articles.",
                'created' => $createdCount
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Scraping failed: ' . $e->getMessage()], 500);
        }
    }

    // Helper to scrape inner content
    private function scrapeArticleContent($url)
    {
        try {
            $response = Http::withoutVerifying()->timeout(15)->get($url);
            if (!$response->successful()) return null;
            
            $crawler = new \Symfony\Component\DomCrawler\Crawler($response->body());
            
            // Try common content selectors
            // Try common content selectors (Prioritize Elementor)
            $selectors = [
                 '.elementor-widget-theme-post-content', 
                 '.elementor-widget-text-editor',
                 '.entry-content', 
                 '.post-content', 
                 '.article-body', 
                 'article .content'
            ];
            
            foreach ($selectors as $selector) {
                $node = $crawler->filter($selector);
                if ($node->count() > 0) {
                     $html = $node->html();
                     // Basic cleaning: add newlines for breaks/paragraphs
                     $html = str_replace(['<br>', '<br/>', '<p>', '</div>'], ["\n", "\n", "\n\n", "\n"], $html);
                     $text = strip_tags($html);
                     $text = preg_replace('/\s+/', ' ', $text); // Collapse multiple spaces
                     $text = trim($text);

                     // If we found a substantial amount of text, return it
                     if (strlen($text) > 150) {
                         return $text;
                     }
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
