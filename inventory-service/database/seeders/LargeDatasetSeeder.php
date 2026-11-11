<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LargeDatasetSeeder extends Seeder
{
    /**
     * Seed 10,000 realistic products with inventory records for performance and EXPLAIN benchmarks.
     */
    public function run(): void
    {
        $totalRecords = 10000;
        $chunkSize = 1000;

        $categories = [
            'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Canned',
            'Meat', 'Poultry', 'Fruits', 'Vegetables', 'Grains',
            'Oils', 'Pantry', 'Spices', 'Cleaning', 'Household', 'Personal Care'
        ];

        $adjectives = ['Fresh', 'Organic', 'Premium', 'Pure', 'Natural', 'Extra', 'Deluxe', 'Selected', 'Golden', 'Classic'];
        $nouns = ['Milk', 'Bread', 'Cheese', 'Juice', 'Apples', 'Olive Oil', 'Coffee', 'Rice', 'Tea', 'Steak', 'Pasta', 'Honey'];

        $this->command?->info("Starting bulk insertion of {$totalRecords} products for performance testing...");

        $now = now();
        $baseId = 100;

        for ($i = 0; $i < $totalRecords; $i += $chunkSize) {
            $productBatch = [];
            $inventoryBatch = [];

            for ($j = 0; $j < $chunkSize; $j++) {
                $id = $baseId + $i + $j + 1;
                $adj = $adjectives[array_rand($adjectives)];
                $noun = $nouns[array_rand($nouns)];
                $cat = $categories[array_rand($categories)];

                $title = "{$adj} {$noun} SKU-{$id}";
                $slug = Str::slug($title) . "-{$id}";
                $price = round(rand(500, 25000) / 100, 2); // 5.00 to 250.00
                $quantity = rand(10, 500);

                $productBatch[] = [
                    'id' => $id,
                    'title' => substr($title, 0, 100),
                    'slug' => $slug,
                    'description' => "High quality {$title} belonging to category {$cat}. Tested and verified for supermarket stock.",
                    'quantity' => $quantity,
                    'price' => $price,
                    'image_cover' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
                    'category' => $cat,
                    'ratings_average' => round(rand(35, 50) / 10, 2),
                    'ratings_quantity' => rand(5, 500),
                    'created_at' => $now->copy()->subMinutes(rand(1, 100000)),
                    'updated_at' => $now,
                ];

                $inventoryBatch[] = [
                    'product_id' => (string) $id,
                    'quantity' => $quantity,
                    'reserved' => rand(0, min(5, $quantity)),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('products')->insert($productBatch);
            DB::table('inventories')->insert($inventoryBatch);

            $this->command?->info("Inserted " . ($i + $chunkSize) . " / {$totalRecords} products...");
        }

        $this->command?->info("Successfully seeded {$totalRecords} products and inventories!");
    }
}
