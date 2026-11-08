<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/products.json');

        if (!File::exists($jsonPath)) {
            $this->command?->error("File not found at: {$jsonPath}");
            return;
        }

        $jsonContent = File::get($jsonPath);
        $products = json_decode($jsonContent, true);

        if (!is_array($products)) {
            $this->command?->error("Invalid or empty JSON data in: {$jsonPath}");
            return;
        }

        $this->command?->info("Destroying old product and inventory data...");

        // Disable foreign key constraints and truncate tables cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Reservation::truncate();
        Inventory::truncate();
        Product::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command?->info("Seeding " . count($products) . " fresh products with live internet image URLs...");

        foreach ($products as $item) {
            $product = Product::create([
                'title'            => $item['title'],
                'slug'             => $item['slug'],
                'description'      => $item['description'],
                'quantity'         => $item['quantity'] ?? 0,
                'price'            => $item['price'] ?? 0,
                'image_cover'      => $item['imageCover'] ?? $item['image_cover'] ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
                'category'         => $item['category'],
                'ratings_average'  => $item['ratingsAverage'] ?? 0.00,
                'ratings_quantity' => $item['ratingsQuantity'] ?? 0,
            ]);

            // Sync with inventory table
            Inventory::create([
                'product_id' => (string) $product->id,
                'quantity'   => $product->quantity,
                'reserved'   => 0,
            ]);
        }

        $this->command?->info("Successfully seeded " . count($products) . " products with working image URLs into MySQL database!");
    }
}
