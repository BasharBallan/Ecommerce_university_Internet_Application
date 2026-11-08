<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Display a paginated listing of products.
     * GET /api/products
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('limit', 50);
        $filters = $request->only(['category', 'keyword', 'min_price', 'max_price', 'sort_by', 'sort_order']);

        $products = $this->productRepository->getAll($filters, $perPage);

        return response()->json([
            'status' => 'success',
            'results' => $products->count(),
            'pagination' => [
                'currentPage' => $products->currentPage(),
                'totalPages' => $products->lastPage(),
                'totalItems' => $products->total(),
                'perPage' => $products->perPage(),
            ],
            'data' => ProductResource::collection($products),
        ], 200);
    }

    /**
     * Store a newly created product.
     * POST /api/products
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productRepository->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => new ProductResource($product),
        ], 201);
    }

    /**
     * Display the specified product.
     * GET /api/products/{id}
     */
    public function show(int|string $id): JsonResponse
    {
        $product = $this->productRepository->findById($id);

        if (!$product) {
            return response()->json([
                'status' => 'fail',
                'message' => "No product found for id {$id}",
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => new ProductResource($product),
        ], 200);
    }

    /**
     * Update the specified product.
     * PUT/PATCH /api/products/{id}
     */
    public function update(UpdateProductRequest $request, int|string $id): JsonResponse
    {
        $product = $this->productRepository->update($id, $request->validated());

        if (!$product) {
            return response()->json([
                'status' => 'fail',
                'message' => "No product found for id {$id}",
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product),
        ], 200);
    }

    /**
     * Remove the specified product.
     * DELETE /api/products/{id}
     */
    public function destroy(int|string $id): JsonResponse
    {
        $deleted = $this->productRepository->delete($id);

        if (!$deleted) {
            return response()->json([
                'status' => 'fail',
                'message' => "No product found for id {$id}",
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully',
        ], 200);
    }
}

