<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to add optimized indexes to products table.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // 1. Composite Index for category filtering combined with price ranges
            $table->index(['category', 'price'], 'idx_products_category_price');

            // 2. Composite Index for category filtering combined with default created_at sorting
            $table->index(['category', 'created_at'], 'idx_products_category_created_at');

            // 3. Index for sorting by creation date (eliminates filesort)
            $table->index('created_at', 'idx_products_created_at');

            // 4. Index for price sorting and filtering
            $table->index('price', 'idx_products_price');

            // 5. Index for title search
            $table->index('title', 'idx_products_title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_category_price');
            $table->dropIndex('idx_products_category_created_at');
            $table->dropIndex('idx_products_created_at');
            $table->dropIndex('idx_products_price');
            $table->dropIndex('idx_products_title');
        });
    }
};

