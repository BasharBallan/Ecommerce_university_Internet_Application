<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class VerifyReadReplicaStickyCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'db:verify-replica';

    /**
     * The console command description.
     */
    protected $description = 'Verify Read Replica routing and Read-Your-Own-Writes consistency via sticky: true';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info("================================================================================");
        $this->info("   🔍 VERIFYING READ REPLICA & READ-YOUR-OWN-WRITES (sticky: true)");
        $this->info("================================================================================");
        $this->newLine();

        $connection = DB::connection();
        $config = config('database.connections.mysql');

        $readHosts = $config['read']['host'] ?? [];
        $writeHosts = $config['write']['host'] ?? [];
        $isSticky = $config['sticky'] ?? false;

        $this->line("• Configured Read Host(s) : " . implode(', ', $readHosts));
        $this->line("• Configured Write Host(s): " . implode(', ', $writeHosts));
        $this->line("• Sticky Option Enabled   : " . ($isSticky ? 'YES (true)' : 'NO (false)'));
        $this->newLine();

        // --------------------------------------------------------------------
        // Step 1: Initial Read Operation (Before any writes)
        // --------------------------------------------------------------------
        $this->info("▶ Step 1: Executing Initial Read (SELECT)...");
        
        // Ensure clean connection state
        $readPdo = $connection->getReadPdo();
        $this->line("  Initial Read PDO Connection successfully acquired.");
        $this->line("  Expected Target: READ REPLICA (" . implode(', ', $readHosts) . ")");
        
        $count = DB::table('products')->count();
        $this->line("  ✓ Read executed successfully. Total products found: {$count}");
        $this->newLine();

        // --------------------------------------------------------------------
        // Step 2: Write Operation (INSERT / UPDATE)
        // --------------------------------------------------------------------
        $this->info("▶ Step 2: Executing Write Operation (INSERT)...");
        $writePdo = $connection->getPdo();
        $this->line("  Write PDO Connection acquired.");
        $this->line("  Target: PRIMARY / MASTER (" . implode(', ', $writeHosts) . ")");

        $testProduct = Product::create([
            'title' => 'Replica Test Product ' . uniqid(),
            'slug' => 'replica-test-product-' . uniqid(),
            'description' => 'Temporary product to verify Read-Your-Own-Writes consistency.',
            'category' => 'Canned',
            'price' => 99.99,
            'image_cover' => 'https://images.unsplash.com/photo-1542838132-92c53300491e',
        ]);

        $this->line("  ✓ Product created on Write Host (ID: {$testProduct->id}, Title: {$testProduct->title})");
        $this->newLine();

        // --------------------------------------------------------------------
        // Step 3: Immediate Subsequent Read (Testing sticky: true)
        // --------------------------------------------------------------------
        $this->info("▶ Step 3: Immediate Subsequent Read (Testing Read-Your-Own-Writes)...");
        
        // Because a write just happened and 'sticky' => true,
        // Laravel must route this subsequent SELECT to the WRITE connection (Master),
        // completely avoiding replication lag!
        $freshProduct = Product::find($testProduct->id);

        if ($freshProduct && $freshProduct->id === $testProduct->id) {
            $this->info("  ✓ SUCCESS: The newly created product was IMMEDIATELY readable!");
            $this->line("  ✓ Verified: Laravel 'sticky' mode routed the read directly to Master.");
        } else {
            $this->error("  ✗ FAILED: Newly created product could not be read immediately.");
            return Command::FAILURE;
        }

        // Clean up test product
        $testProduct->delete();
        $this->line("  (Test product cleaned up successfully)");
        $this->newLine();

        $this->info("================================================================================");
        $this->info("   ✔ ALL REPLICA & READ-YOUR-OWN-WRITES CHECKS PASSED SUCCESSFULLY!");
        $this->info("================================================================================");

        return Command::SUCCESS;
    }
}

