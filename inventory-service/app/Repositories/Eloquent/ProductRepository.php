<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Get all products with optional filters and pagination.
     * Fixes N+1 Query Problem using Eager Loading (with('inventory')).
     * Routes read queries to the Read Replica.
     */
    public function getAll(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Product::with('inventory');

        // Filter by category
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        // Search by title or description
        if (!empty($filters['keyword'])) {
            $keyword = $filters['keyword'];
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'LIKE', "%{$keyword}%")
                  ->orWhere('description', 'LIKE', "%{$keyword}%");
            });
        }

        // Filter by min price
        if (isset($filters['min_price'])) {
            $query->where('price', '>=', (float) $filters['min_price']);
        }

        // Filter by max price
        if (isset($filters['max_price'])) {
            $query->where('price', '<=', (float) $filters['max_price']);
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Find a product by ID with eager-loaded inventory.
     * Queries the Read Replica first, falling back to Primary Write connection
     * if replication lag occurs.
     */
    public function findById(int|string $id, bool $onWriteConnection = false): ?Product
    {
        if ($onWriteConnection) {
            return Product::onWriteConnection()->with('inventory')->find($id);
        }

        $product = Product::with('inventory')->find($id);

        // Replication lag fallback: verify with primary before returning null
        if (!$product) {
            $product = Product::onWriteConnection()->with('inventory')->find($id);
        }

        return $product;
    }

    /**
     * Create a new product on the Primary Write Host.
     */
    public function create(array $data): Product
    {
        return Product::create($data);
    }

    /**
     * Update an existing product on the Primary Write Host.
     */
    public function update(int|string $id, array $data): ?Product
    {
        $product = $this->findById($id, true);

        if (!$product) {
            return null;
        }

        $product->update($data);

        return $product->fresh();
    }

    /**
     * Delete a product by ID from the Primary Write Host.
     */
    public function delete(int|string $id): bool
    {
        $product = $this->findById($id, true);

        if (!$product) {
            return false;
        }

        return (bool) $product->delete();
    }
}
