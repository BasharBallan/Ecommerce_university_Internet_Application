<?php

namespace App\Console\Commands;

use App\Models\Inventory;
use App\Models\Product;
use Database\Seeders\ProductSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProductSeederCommand extends Command
{
    /**
     * The name and signature of the console command.
     * Replicates the exact behavior of seeder.js with -i and -d flags.
     *
     * @var string
     */
    protected $signature = 'products:seed 
                            {--i|insert : Insert products into the database} 
                            {--d|destroy : Destroy/delete all products from the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed or destroy products in MySQL database (similar to seeder.js -i / -d)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $insert = $this->option('insert');
        $destroy = $this->option('destroy');

        if ($destroy) {
            $this->warn('Deleting all products from database...');
            
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            Product::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            $this->info('Data Destroyed Successfully!');
            return Command::SUCCESS;
        }

        if ($insert) {
            $this->info('Inserting products into database...');
            $seeder = new ProductSeeder();
            $seeder->setCommand($this);
            $seeder->run();
            $this->info('Data Inserted Successfully!');
            return Command::SUCCESS;
        }

        $this->warn('Use -i to insert or -d to delete (e.g. php artisan products:seed -i)');
        return Command::SUCCESS;
    }
}
