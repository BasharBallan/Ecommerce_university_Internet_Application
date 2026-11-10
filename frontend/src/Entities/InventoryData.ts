export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "reserved";

export interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  category: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  location: string;
  unit: string;
  stockStatus: StockStatus;
}

export type MovementType = "in" | "out" | "adjustment";

export interface StockMovement {
  id: number;
  productName: string;
  sku: string;
  type: MovementType;
  quantity: number;
  reference: string;
  performedBy: string;
  date: string;
}

export interface ReceivingItem {
  id: number;
  productName: string;
  sku: string;
  quantity: number;
  supplier: string;
  reference: string;
  receivedAt: string;
}

// features/Warehouse/types/inventory.types.ts
export interface ProductStock {
  available: boolean;
  quantity: number;
  message: string;
}

export interface InventoryProduct {
  _id: string;
  id?: number | string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  imageCover: string;
  category: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  createdAt: string;
  updatedAt: string;
  stock?: ProductStock;
}

export interface PaginationResult {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  totalResults: number;
}

export interface ProductsResponse {
  status: string;
  results: number;
  paginationResult: PaginationResult;
  data: InventoryProduct[];
}

export interface ProductDetailsResponse {
  status: string;
  data: InventoryProduct;
}
