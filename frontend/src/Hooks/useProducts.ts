import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./ProductService";
import type { Product, ProductsResponse } from "../Entities/Product";

export function useProducts(params?: { limit?: number; page?: number; category?: string }) {
  return useQuery<ProductsResponse, Error, Product[]>({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    select: (response: ProductsResponse): Product[] => response.data,
  });
}
