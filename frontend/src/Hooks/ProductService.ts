import ApiClient from "../apiServices/api_client";
import type { ProductResponse, ProductsResponse } from "../Entities/Product";

const productsApi = new ApiClient<ProductsResponse>(
  "/products"
);

const productApi = new ApiClient<ProductResponse>(
  "/products"
);

export const getProducts = () => {
  return productsApi.getAll();
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
