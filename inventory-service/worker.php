<?php

use App\Grpc\Inventory\InventoryServiceInterface;
use App\Services\InventoryGrpcService;
use Spiral\RoadRunner\GRPC\Server;
use Spiral\RoadRunner\Worker;

require __DIR__ . '/vendor/autoload.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once __DIR__ . '/bootstrap/app.php';

// Bootstrap the Laravel application kernel for database and service provider access
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$server = new Server();
$server->registerService(
    InventoryServiceInterface::class,
    $app->make(InventoryGrpcService::class)
);

$server->serve(Worker::create());
