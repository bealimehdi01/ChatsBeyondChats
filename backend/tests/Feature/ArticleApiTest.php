<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Article;

class ArticleApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test getting a list of articles.
     */
    public function test_can_fetch_articles(): void
    {
        Article::factory()->count(3)->create();

        $response = $this->getJson('/api/articles');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /**
     * Test creating a new article.
     */
    public function test_can_create_article(): void
    {
        $data = [
            'title' => 'Test Article',
            'content' => 'This is a test content.',
            'source' => 'original',
            'original_url' => 'http://example.com'
        ];

        $response = $this->postJson('/api/articles', $data);

        $response->assertStatus(201)
                 ->assertJsonFragment(['title' => 'Test Article']);
                 
        $this->assertDatabaseHas('articles', ['title' => 'Test Article']);
    }

    /**
     * Test validation.
     */
    public function test_api_validation_errors(): void
    {
        $response = $this->postJson('/api/articles', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['title', 'content', 'source']);
    }
}
