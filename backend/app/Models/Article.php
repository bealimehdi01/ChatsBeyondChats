<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'original_url',
        'source', // 'original' or 'enhanced'
        'original_article_id', // if enhanced, points to parent
        'reference_links', // JSON
    ];

    protected $casts = [
        'reference_links' => 'array',
    ];
}
