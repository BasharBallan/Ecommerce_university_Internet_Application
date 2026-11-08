<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventories';

    protected $fillable = [
        'product_id',
        'quantity',
        'reserved',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reserved' => 'integer',
    ];

    /**
     * Get available stock (quantity - reserved).
     */
    public function getAvailableAttribute(): int
    {
        return max(0, (int) $this->quantity - (int) $this->reserved);
    }

    /**
     * Relationship with Reservations.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'product_id', 'product_id');
    }
}
