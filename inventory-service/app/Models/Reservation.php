<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    protected $table = 'reservations';

    protected $fillable = [
        'product_id',
        'order_id',
        'quantity',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Relationship with Inventory.
     */
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'product_id', 'product_id');
    }
}
