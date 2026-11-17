<?php

namespace App\Services\Contracts;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductServiceInterface
{
    /**
     * Get all products with optional filters, business logic validations, and pagination.
     */
    public function getAll(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    /**
     * Find a product by its ID.
     */
    public function findById(int|string $id): ?Product;

    /**
     * Create a new product applying business logic & domain rules.
     */
    public function create(array $data): Product;

    /**
     * Update an existing product applying business logic & domain rules.
     */
    public function update(int|string $id, array $data): ?Product;

    /**
     * Delete a product by its ID.
     */
    public function delete(int|string $id): bool;
}

