<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'mode',
        'interval_minutes',
        'source_url'
    ];
    
    protected $casts = [
        'interval_minutes' => 'integer'
    ];
}
