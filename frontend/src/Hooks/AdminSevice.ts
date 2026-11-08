import ApiClient from "../apiServices/api_client";
import type { Product } from "../Entities/Product";

export interface ProductsApiResponse {
  status: string;
  results?: number;
  data: Product[];
}

export interface OrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
    imageCover: string;
  };
  quantity: number;
  price: number;
  _id: string;
}

export interface BackendOrder {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  totalOrderPrice: number;
  orderStatus: "pending" | "ready" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface OrdersApiResponse {
  status: string;
  results?: number;
  data: BackendOrder[] | { orders: BackendOrder[] };
}

const productsApiClient = new ApiClient<ProductsApiResponse, Product>("/products");
const ordersApiClient = new ApiClient<OrdersApiResponse, any>("/orders");

export const AdminService = {
  getProducts: async () => {
    const res = await productsApiClient.getAll();
    return (res as any).data || res;
  },

  deleteProduct: async (id: string) => {
    return await productsApiClient.delete(id);
  },

  getOrders: async () => {
    const res = await ordersApiClient.getAll();
    const data = (res as any).data;
    return Array.isArray(data) ? data : data?.orders || [];
  },

  updateOrderStatus: async (orderId: string, orderStatus: string) => {
    const apiClient = new ApiClient<any, any>(`/orders/${orderId}/status`);
    return await apiClient.put({ orderStatus });
  },
};
