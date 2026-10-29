export type ProductCategory =
  | "Dairy"
  | "Bakery"
  | "Beverages"
  | "Snacks"
  | "Canned Goods"
  | "Meat"
  | "Produce";

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  sold?: number;
  price: number;
  imageCover: string;
  category: ProductCategory;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  status: string;
  message: string;
  results: number;

  paginationResult?: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
    next?: number;
    prev?: number;
  };

  data: Product[];
}

export interface ProductResponse {
  status: string;
  message: string;
  data: Product;
}