import ApiClient from "../apiServices/api_client";
import type { ProductsResponse, SingleProductResponse } from "../Entities/Product";

const productsApi = new ApiClient<ProductsResponse>(
  "/products"
);

const productApi = new ApiClient<SingleProductResponse>(
  "/products"
);

export const getProducts = (params?: { limit?: number; page?: number; category?: string }) => {
  return productsApi.getAll({
    params: {
      limit: 50,
      ...params,
    },
  });
};

export const getProductById = async (id: string) => {
  const response = await productApi.get(id);
  return response.data;
};

// ==========================================
// Admin Product Mutations Services
// ==========================================
export const createProduct = async (productData: any) => {
  return await productsApi.post(productData);
};

export const updateProduct = async (id: string, productData: any) => {
  return await productApi.update(id, productData);
};

export const deleteProduct = async (id: string) => {
  return await productApi.delete(id);
};
