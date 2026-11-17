<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array matching the standard API format.
     */
    public function toArray(Request $request): array
    {
        $availableQty = $this->inventory ? $this->inventory->quantity : (int) $this->quantity;
        $reservedQty = $this->inventory ? (int) $this->inventory->reserved : 0;

        return [
            '_id' => (string) $this->id,
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'quantity' => (int) $this->quantity,
            'availableqty' => max(0, $availableQty),
            'reservedqty' => $reservedQty,
            'status' => $this->quantity > 0 ? 'in_stock' : 'out_of_stock',
            'price' => (float) $this->price,
            'imageCover' => !empty($this->image_cover) && !str_starts_with($this->image_cover, 'http')
                ? 'http://localhost:8001' . (str_starts_with($this->image_cover, '/') ? '' : '/') . $this->image_cover
                : ($this->image_cover ?: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80'),
            'category' => $this->category,
            'ratingsAverage' => (float) $this->ratings_average,
            'ratingsQuantity' => (int) $this->ratings_quantity,
            'stock' => [
                'available' => $this->quantity > 0,
                'quantity' => (int) $this->quantity,
                'reserved' => $reservedQty,
                'message' => $this->quantity > 0 ? 'In Stock' : 'Out of Stock',
            ],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
