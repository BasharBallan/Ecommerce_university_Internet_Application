<?php

use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Product CRUD APIs implemented via Repository Design Pattern
*/

Route::apiResource('products', ProductController::class);

