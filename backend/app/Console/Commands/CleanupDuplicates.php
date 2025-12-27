<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;

class CleanupDuplicates extends Command
{
    protected $signature = 'articles:cleanup-duplicates';
    protected $description = 'Remove duplicate enhanced articles, keeping only the latest one for each original';

    public function handle()
    {
        $this->info('Starting duplicate cleanup...');
        
        // Get all original articles
        $originals = Article::where('source', 'original')->get();
        
        $totalRemoved = 0;
        
        foreach ($originals as $original) {
            // Find all enhanced versions of this article
            $enhanced = Article::where('source', 'enhanced')
                ->where('original_article_id', $original->id)
                ->orderBy('created_at', 'desc')
                ->get();
            
            if ($enhanced->count() > 1) {
                $this->warn("Found {$enhanced->count()} enhanced versions of \"{$original->title}\"");
                
                // Keep the first (latest), delete the rest
                $toKeep = $enhanced->first();
                $toDelete = $enhanced->slice(1);
                
                foreach ($toDelete as $duplicate) {
                    $this->line("  Deleting duplicate ID: {$duplicate->id}");
                    $duplicate->delete();
                    $totalRemoved++;
                }
                
                $this->info("  Kept latest version (ID: {$toKeep->id})");
            }
        }
        
        $this->info("\n✅ Cleanup complete! Removed {$totalRemoved} duplicate articles.");
        
        return 0;
    }
}
