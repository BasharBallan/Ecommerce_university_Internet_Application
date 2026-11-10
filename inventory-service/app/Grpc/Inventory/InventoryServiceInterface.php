<?php

namespace App\Grpc\Inventory;

use Spiral\RoadRunner\GRPC\ContextInterface;
use Spiral\RoadRunner\GRPC\ServiceInterface;

interface InventoryServiceInterface extends ServiceInterface
{
    public const NAME = 'inventory.InventoryService';

    public function CheckStock(ContextInterface $ctx, StockRequest $in): StockResponse;

    public function ReserveStock(ContextInterface $ctx, ReserveRequest $in): ReserveResponse;

    public function ReleaseStock(ContextInterface $ctx, ReleaseRequest $in): ReleaseResponse;

    public function GetProduct(ContextInterface $ctx, ProductRequest $in): ProductResponse;
}
