<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    /**
     * Get all products with optional filters and pagination.
     * Fixes N+1 Query Problem using Eager Loading (with('inventory')).
     */
    public function getAll(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    /**
     * Find a product by its ID (with optional onWriteConnection flag for lag resilience).
     */
    public function findById(int|string $id, bool $onWriteConnection = false): ?Product;

    /**
     * Create a new product.
     */
    public function create(array $data): Product;

    /**
     * Update an existing product.
     */
    public function update(int|string $id, array $data): ?Product;

    /**
     * Delete a product by its ID.
     */
    public function delete(int|string $id): bool;
}
