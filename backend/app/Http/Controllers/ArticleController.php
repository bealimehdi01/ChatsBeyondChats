<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Return latest first
        return Article::orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'original_url' => 'nullable|url',
            'source' => 'required|in:original,enhanced',
            'original_article_id' => 'nullable|exists:articles,id',
            'reference_links' => 'nullable', // can be array or json string, handle with care or trust cast
        ]);

        $article = Article::create($validated);

        return response()->json($article, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Article::findOrFail($id);
    }
    
    /**
     * Get the latest original article for the worker to process.
     */
    public function latest()
    {
        $article = Article::where('source', 'original')->latest()->first();
        if (!$article) {
             return response()->json(['message' => 'No articles found'], 404);
        }
        return response()->json($article);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        $article->update($request->all());
        return response()->json($article);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Article::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
