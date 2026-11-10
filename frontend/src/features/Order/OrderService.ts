import { useQuery } from "@tanstack/react-query";
import { nodeAxiosInstance } from "../../apiServices/api_client";
import type { Order, OrderItem, OrderStatus } from "./types";

export interface BackendOrderItem {
  _id?: string;
  product: string | { _id?: string; title?: string; imageCover?: string; price?: number };
  title?: string;
  quantity: number;
  price: number;
  imageCover?: string;
}

export interface BackendOrder {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderItems: BackendOrderItem[];
  totalOrderPrice: number;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersApiResponse {
  status: string;
  results?: number;
  data:
    | {
        orders: BackendOrder[];
      }
    | BackendOrder[];
}

export interface SingleOrderApiResponse {
  status: string;
  data: BackendOrder;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";

export const mapBackendOrderToOrder = (raw: BackendOrder): Order => {
  const customerId =
    typeof raw.user === "object" && raw.user !== null
      ? raw.user._id
      : String(raw.user || "");

  const items: OrderItem[] = (raw.orderItems || []).map((item) => {
    const isProductObj = typeof item.product === "object" && item.product !== null;
    const productId = isProductObj ? (item.product as any)._id || "" : String(item.product || "");
    const productName =
      item.title || (isProductObj ? (item.product as any).title : "") || `Product #${productId}`;
    const productImage =
      item.imageCover ||
      (isProductObj ? (item.product as any).imageCover : "") ||
      DEFAULT_IMAGE;

    return {
      productId,
      productName,
      productImage,
      quantity: item.quantity,
      unitPrice: item.price,
    };
  });

  return {
    id: raw._id,
    orderNumber: `ORD-${raw._id.slice(-6).toUpperCase()}`,
    customerId,
    items,
    totalAmount: raw.totalOrderPrice,
    status: raw.orderStatus || "pending",
    createdAt: raw.createdAt,
  };
};

export const OrderService = {
  getMyOrders: async (): Promise<Order[]> => {
    const res = await nodeAxiosInstance.get<OrdersApiResponse>("/orders/my-orders");
    const rawData = res.data.data;
    const rawOrders: BackendOrder[] = Array.isArray(rawData)
      ? rawData
      : (rawData as any)?.orders || [];
    return rawOrders.map(mapBackendOrderToOrder);
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await nodeAxiosInstance.get<SingleOrderApiResponse>(`/orders/${id}`);
    const rawOrder = res.data.data;
    return mapBackendOrderToOrder(rawOrder);
  },
};

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: OrderService.getMyOrders,
  });
}

export function useOrderDetails(orderId?: string) {
  return useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: () => OrderService.getOrderById(orderId!),
    enabled: Boolean(orderId),
  });
}

