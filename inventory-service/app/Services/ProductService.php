<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Services\Contracts\ProductServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductService implements ProductServiceInterface
{
    /**
     * Data access is strictly delegated to the Repository layer.
     * The Service layer contains domain & business logic and does NOT perform direct Eloquent queries.
     */
    protected ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Get paginated products with business validation and sanitization.
     */
    public function getAll(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        // 1. Business Logic: Bound and sanitize per-page pagination limit
        $boundedPerPage = max(1, min($perPage, 100));

        // 2. Business Logic: Sanitize sort fields to prevent SQL injection or invalid column errors
        $allowedSortFields = ['id', 'title', 'price', 'created_at', 'category'];
        $sortBy = strtolower($filters['sort_by'] ?? 'created_at');
        if (!in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'created_at';
        }

        $sortOrder = strtolower($filters['sort_order'] ?? 'desc');
        if (!in_array($sortOrder, ['asc', 'desc'], true)) {
            $sortOrder = 'desc';
        }

        // 3. Business Logic: Sanitize filters
        $sanitizedFilters = [];
        $sanitizedFilters['sort_by'] = $sortBy;
        $sanitizedFilters['sort_order'] = $sortOrder;

        if (!empty($filters['category'])) {
            $sanitizedFilters['category'] = trim((string) $filters['category']);
        }

        if (!empty($filters['keyword'])) {
            $sanitizedFilters['keyword'] = trim((string) $filters['keyword']);
        }

        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $sanitizedFilters['min_price'] = max(0.0, (float) $filters['min_price']);
        }

        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $sanitizedFilters['max_price'] = max(0.0, (float) $filters['max_price']);
        }

        // 4. Delegate to Repository (Eloquent data access layer)
        return $this->productRepository->getAll($sanitizedFilters, $boundedPerPage);
    }

    /**
     * Find a product by ID.
     */
    public function findById(int|string $id): ?Product
    {
        // Delegate to repository
        return $this->productRepository->findById($id);
    }

    /**
     * Create a new product with domain business rules (slug generation, defaults, logging).
     */
    public function create(array $data): Product
    {
        // 1. Business Rule: Auto-generate slug if not provided
        if (empty($data['slug']) && !empty($data['title'])) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
        }

        // 2. Business Rule: Fallback image cover if missing
        if (empty($data['image_cover'])) {
            $data['image_cover'] = 'https://images.unsplash.com/photo-1542838132-92c53300491e';
        }

        // 3. Delegate creation to Repository
        $product = $this->productRepository->create($data);

        Log::info("Product created successfully via ProductService", [
            'id' => $product->id,
            'title' => $product->title,
        ]);

        return $product;
    }

    /**
     * Update an existing product with domain rules.
     */
    public function update(int|string $id, array $data): ?Product
    {
        // 1. Check if product exists via repository
        $existing = $this->productRepository->findById($id);
        if (!$existing) {
            return null;
        }

        // 2. Business Rule: If title changed and slug is not explicitly given, regenerate slug
        if (!empty($data['title']) && empty($data['slug']) && $data['title'] !== $existing->title) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
        }

        // 3. Delegate update to Repository
        $updatedProduct = $this->productRepository->update($id, $data);

        Log::info("Product updated successfully via ProductService", [
            'id' => $id,
        ]);

        return $updatedProduct;
    }

    /**
     * Delete a product by ID.
     */
    public function delete(int|string $id): bool
    {
        $deleted = $this->productRepository->delete($id);

        if ($deleted) {
            Log::info("Product deleted successfully via ProductService", ['id' => $id]);
        }

        return $deleted;
    }

    /**
     * Accessor for underlying repository if needed for backward compatibility.
     */
    public function getRepository(): ProductRepositoryInterface
    {
        return $this->productRepository;
    }
}

