<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'quantity',
        'price',
        'image_cover',
        'category',
        'ratings_average',
        'ratings_quantity',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
        'ratings_average' => 'float',
        'ratings_quantity' => 'integer',
    ];

    /**
     * Boot the model.
     * Automatically generate slug if title is set and slug is empty.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($product) {
            if (empty($product->slug) && !empty($product->title)) {
                $baseSlug = Str::slug($product->title);
                $slug = $baseSlug;
                $count = 1;

                while (static::where('slug', $slug)->where('id', '!=', $product->id ?? 0)->exists()) {
                    $slug = "{$baseSlug}-{$count}";
                    $count++;
                }

                $product->slug = $slug;
            }
        });
    }

    /**
     * Relationship to inventory entry by product id or string.
     */
    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'product_id', 'id');
    }
}

