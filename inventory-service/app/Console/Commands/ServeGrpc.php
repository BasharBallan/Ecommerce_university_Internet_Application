<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class ServeGrpc extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'grpc:serve {--debug : Run in debug mode}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start the RoadRunner gRPC server for Inventory Service';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting RoadRunner gRPC server on tcp://0.0.0.0:50051...');

        $binary = file_exists(base_path('rr.exe')) ? base_path('rr.exe') : 'rr';
        $args = [$binary, 'serve'];

        if ($this->option('debug')) {
            $args[] = '-d';
        }

        $process = new Process($args, base_path(), null, null, null);
        $process->setTimeout(null);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        return $process->getExitCode() ?? 0;
    }
}
