<?php

namespace App\Providers;

use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Eloquent\ProductRepository;
use App\Services\Contracts\ProductServiceInterface;
use App\Services\ProductService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services and repositories into the Laravel Service Container.
     */
    public function register(): void
    {
        // 1. Data Access Layer: Bind ProductRepositoryInterface to Eloquent Implementation
        $this->app->bind(
            ProductRepositoryInterface::class,
            ProductRepository::class
        );

        // 2. Business Logic Layer: Bind ProductServiceInterface to ProductService
        $this->app->bind(
            ProductServiceInterface::class,
            ProductService::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
