import type {
  ProductsResponse,
  ProductDetailsResponse,
} from "../../src/Entities/InventoryData";
import { laravelAxiosInstance } from "./api_client";

export interface InventoryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: string;
}

export const inventoryApi = {
  getProducts: async (
    params: InventoryParams = {},
  ): Promise<ProductsResponse> => {
    const response = await laravelAxiosInstance.get<ProductsResponse>(
      "/products",
      { params },
    );
    return response.data;
  },
  getProductDetails: async (
    productId: string,
  ): Promise<ProductDetailsResponse> => {
    const response = await laravelAxiosInstance.get<ProductDetailsResponse>(
      `/products/${productId}`,
    );
    return response.data;
  },
};
