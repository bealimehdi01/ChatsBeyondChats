<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;

class ScrapeArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scrape:initial';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate scraping initial articles for the assignment';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Scraping initial articles...');

        // Check if articles exist
        if (Article::count() > 0) {
            $this->info('Articles already exist. Skipping.');
            return;
        }

        // Seed 3 Mock Articles
        $articles = [
            [
                'title' => 'The Future of AI Chatbots',
                'content' => 'Chatbots are becoming popular. They use NLP to understand humans better than ever before. Companies are adopting them for support.',
                'original_url' => 'https://beyondchats.com/blogs/future-of-ai',
                'source' => 'original',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Understanding LLMs',
                'content' => 'Large Language Models are the backbone of modern AI. They are trained on vast amounts of text data.',
                'original_url' => 'https://beyondchats.com/blogs/understanding-llms',
                'source' => 'original',
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
            [
                'title' => 'Types of Chatbots',
                'content' => 'There are rule-based chatbots and AI-based chatbots. Rule-based are simple, while AI-based are complex.',
                'original_url' => 'https://beyondchats.com/blogs/chatbot-types',
                'source' => 'original',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ]
        ];

        Article::insert($articles);

        $this->info('Successfully scraped (seeded) 3 articles.');
    }
}
