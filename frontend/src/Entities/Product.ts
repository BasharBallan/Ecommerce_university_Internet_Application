export type ProductCategory =
  | "Dairy"
  | "Bakery"
  | "Beverages"
  | "Snacks"
  | "Canned"
  | "Meat"
  | "Poultry"
  | "Fruits"
  | "Vegetables"
  | "Grains"
  | "Oils"
  | "Pantry"
  | "Spices"
  | "Cleaning"
  | "Household"
  | "Personal Care"
  | string;

export interface Product {
  _id?: string;
  id?: number | string;
  title: string;
  name?: string;
  slug?: string;
  description: string;
  quantity: number;
  reservedqty?: number;
  availableqty?: number;
  status?: string;
  sold?: number;
  price: number;
  discountPrice?: number;
  imageCover?: string;
  imageUrl?: string;
  category?: ProductCategory;
  categoryId?: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  status: string;
  message?: string;
  results?: number;

  pagination?: {
    currentPage: number;
    limit?: number;
    perPage?: number;
    numberOfPages?: number;
    totalPages?: number;
    totalResults?: number;
    total?: number;
  };
  paginationResult?: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
    totalResults: number;
  };

  data: Product[];
}

export type ProductResponse = ProductsResponse;

export interface SingleProductResponse {
  status: string;
  message?: string;
  data: Product;
}
