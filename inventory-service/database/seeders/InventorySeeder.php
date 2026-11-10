<?php

namespace Database\Seeders;

use App\Models\Inventory;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'product_id' => 'prod_race_condition_001',
                'quantity' => 1,
                'reserved' => 0,
            ],
            [
                'product_id' => 'prod_sample_002',
                'quantity' => 15,
                'reserved' => 0,
            ],
            [
                'product_id' => 'prod_out_of_stock_003',
                'quantity' => 0,
                'reserved' => 0,
            ],
            [
                'product_id' => '6501a1b2c3d4e5f6a7b8c901',
                'quantity' => 25,
                'reserved' => 0,
            ],
            [
                'product_id' => '6501a1b2c3d4e5f6a7b8c902',
                'quantity' => 5,
                'reserved' => 0,
            ],
        ];

        foreach ($items as $item) {
            Inventory::updateOrCreate(
                ['product_id' => $item['product_id']],
                $item
            );
        }
    }
}
