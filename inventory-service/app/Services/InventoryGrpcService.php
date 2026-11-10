<?php

namespace App\Services;

use App\Grpc\Inventory\InventoryServiceInterface;
use App\Grpc\Inventory\ProductRequest;
use App\Grpc\Inventory\ProductResponse;
use App\Grpc\Inventory\ReleaseRequest;
use App\Grpc\Inventory\ReleaseResponse;
use App\Grpc\Inventory\ReserveRequest;
use App\Grpc\Inventory\ReserveResponse;
use App\Grpc\Inventory\StockRequest;
use App\Grpc\Inventory\StockResponse;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spiral\RoadRunner\GRPC\ContextInterface;

class InventoryGrpcService implements InventoryServiceInterface
{
    /**
     * Helper to resolve Inventory record by product_id, ID, or slug.
     */
    private function resolveInventory(string $identifier, bool $lock = false): ?Inventory
    {
        $query = Inventory::where('product_id', $identifier);
        if ($lock) {
            $query->lockForUpdate();
        }
        $inventory = $query->first();

        if (!$inventory) {
            // Check if identifier is product ID or slug
            $product = Product::where('id', $identifier)
                ->orWhere('slug', $identifier)
                ->first();

            if ($product) {
                $query = Inventory::where('product_id', (string) $product->id);
                if ($lock) {
                    $query->lockForUpdate();
                }
                $inventory = $query->first();

                // If inventory record doesn't exist yet for this product, create it on the fly
                if (!$inventory) {
                    $inventory = Inventory::create([
                        'product_id' => (string) $product->id,
                        'quantity' => $product->quantity,
                        'reserved' => 0,
                    ]);
                    if ($lock) {
                        $inventory = Inventory::where('id', $inventory->id)->lockForUpdate()->first();
                    }
                }
            }
        }

        return $inventory;
    }

    /**
     * Check available stock for a given product.
     */
    public function CheckStock(ContextInterface $ctx, StockRequest $in): StockResponse
    {
        $productId = $in->getProductId();

        $inventory = $this->resolveInventory($productId, false);

        if (!$inventory) {
            return new StockResponse([
                'available' => false,
                'quantity' => 0,
                'message' => "Product {$productId} not found in inventory",
            ]);
        }

        $available = $inventory->quantity;

        return new StockResponse([
            'available' => $available > 0,
            'quantity' => max(0, $available),
            'message' => $available > 0 ? "Product available in stock" : "Product is out of stock",
        ]);
    }

    /**
     * Reserve and DEDUCT stock for an order using pessimistic locking.
     * Decrements physical quantity in both `inventories` and `products` tables.
     */
    public function ReserveStock(ContextInterface $ctx, ReserveRequest $in): ReserveResponse
    {
        $productId = $in->getProductId();
        $qty = $in->getQuantity();
        $orderId = $in->getOrderId();

        if ($qty <= 0) {
            return new ReserveResponse([
                'success' => false,
                'message' => 'Requested quantity must be greater than zero',
                'remaining' => 0,
            ]);
        }

        return DB::transaction(function () use ($productId, $qty, $orderId) {
            // lockForUpdate applies exclusive row-level lock (SELECT ... FOR UPDATE)
            $inventory = $this->resolveInventory($productId, true);

            if (!$inventory) {
                return new ReserveResponse([
                    'success' => false,
                    'message' => "Product {$productId} not found in inventory",
                    'remaining' => 0,
                ]);
            }

            // Find matching Product row with lock to update product table quantity as well
            $product = Product::where('id', $inventory->product_id)
                ->orWhere('slug', $inventory->product_id)
                ->lockForUpdate()
                ->first();

            $available = $inventory->quantity;

            if ($available < $qty) {
                return new ReserveResponse([
                    'success' => false,
                    'message' => "Insufficient stock for product {$productId}. Available: {$available}, Requested: {$qty}",
                    'remaining' => max(0, $available),
                ]);
            }

            // 1. Deduct quantity directly in inventories table
            $inventory->quantity -= $qty;
            $inventory->reserved += $qty;
            $inventory->save();

            // 2. Deduct quantity directly in products table
            if ($product) {
                $product->quantity = max(0, $product->quantity - $qty);
                $product->save();
            }

            // 3. Track reservation in reservations table
            Reservation::create([
                'product_id' => $inventory->product_id,
                'order_id' => $orderId,
                'quantity' => $qty,
                'status' => 'pending',
            ]);

            $remaining = $inventory->quantity;

            Log::info("gRPC: Deducted {$qty} units of product {$inventory->product_id} for order {$orderId}. Remaining: {$remaining}");

            return new ReserveResponse([
                'success' => true,
                'message' => "Successfully reserved and deducted {$qty} units for order {$orderId}",
                'remaining' => $remaining,
            ]);
        });
    }

    /**
     * Release stock when order is cancelled or rejected.
     * Returns/refunds quantity back into both `inventories` and `products` tables.
     */
    public function ReleaseStock(ContextInterface $ctx, ReleaseRequest $in): ReleaseResponse
    {
        $productId = $in->getProductId();
        $qty = $in->getQuantity();
        $orderId = $in->getOrderId();

        return DB::transaction(function () use ($productId, $qty, $orderId) {
            $inventory = $this->resolveInventory($productId, true);

            if (!$inventory) {
                return new ReleaseResponse([
                    'success' => false,
                    'message' => "Product {$productId} not found in inventory",
                ]);
            }

            $product = Product::where('id', $inventory->product_id)
                ->orWhere('slug', $inventory->product_id)
                ->lockForUpdate()
                ->first();

            // 1. Return/refund quantity in inventories table
            $inventory->quantity += $qty;
            $inventory->reserved = max(0, $inventory->reserved - $qty);
            $inventory->save();

            // 2. Return/refund quantity in products table
            if ($product) {
                $product->quantity += $qty;
                $product->save();
            }

            // 3. Update reservation status to released
            Reservation::where('order_id', $orderId)
                ->where('product_id', $inventory->product_id)
                ->where('status', 'pending')
                ->update(['status' => 'released']);

            Log::info("gRPC: Refunded/Released {$qty} units of product {$inventory->product_id} for order {$orderId}. Returned to warehouse.");

            return new ReleaseResponse([
                'success' => true,
                'message' => "Successfully released and refunded {$qty} units for order {$orderId}",
            ]);
        });
    }

    /**
     * Query product details from MySQL and return current quantity.
     */
    public function GetProduct(ContextInterface $ctx, ProductRequest $in): ProductResponse
    {
        $productId = $in->getProductId();

        $product = Product::with('inventory')
            ->where('id', $productId)
            ->orWhere('slug', $productId)
            ->first();

        if (!$product) {
            // Also check if productId matches an inventory record's product_id
            $inventory = Inventory::where('product_id', $productId)->first();
            if ($inventory && is_numeric($inventory->product_id)) {
                $product = Product::with('inventory')->find($inventory->product_id);
            }
        }

        if (!$product) {
            return new ProductResponse([
                'found' => false,
                'id' => '',
                'title' => '',
                'slug' => '',
                'price' => 0.0,
                'quantity' => 0,
                'category' => '',
                'image_cover' => '',
                'message' => "Product '{$productId}' not found in database",
            ]);
        }

        // Available quantity is directly the product's current quantity
        $availableQuantity = $product->quantity;

        return new ProductResponse([
            'found' => true,
            'id' => (string) $product->id,
            'title' => (string) $product->title,
            'slug' => (string) $product->slug,
            'price' => (float) $product->price,
            'quantity' => (int) max(0, $availableQuantity),
            'category' => (string) ($product->category ?? ''),
            'image_cover' => (string) ($product->image_cover ?? ''),
            'message' => 'Product retrieved successfully',
        ]);
    }
}
