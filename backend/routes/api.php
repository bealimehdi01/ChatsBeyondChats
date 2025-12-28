<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\WorkerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Article routes
Route::get('/articles/latest', [ArticleController::class, 'latest']);
Route::resource('articles', ArticleController::class);

// Admin/Worker control routes
Route::get('/settings', [WorkerController::class, 'getSettings']);
Route::put('/settings', [WorkerController::class, 'updateSettings']);
Route::post('/scrape', [WorkerController::class, 'scrape']);
Route::post('/enhance/{id}', [WorkerController::class, 'enhance']);

