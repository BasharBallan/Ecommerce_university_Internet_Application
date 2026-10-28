
import { useSyncExternalStore } from "react";
import { mockOrders } from './data/mockOrders';
import type { Order, OrderItem } from "./types";

let orders: Order[] = [...mockOrders];

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return orders;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function useOrders() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function createMockOrder(
  customerId: string,
  items: OrderItem[]
): Order {
  if (items.length === 0) {
    throw new Error("An order must contain at least one item.");
  }

  for (const item of items) {
    if (
      !item.productId ||
      !item.productName ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0
    ) {
      throw new Error("The order contains invalid item data.");
    }
  }

  const totalAmount = Number(
    items
      .reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0
      )
      .toFixed(2)
  );

  const order: Order = {
    id: `order-${crypto.randomUUID()}`,
    orderNumber: `ORD-${Date.now()}`,
    customerId,
    items,
    totalAmount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders = [order, ...orders];
  notify();

  return order;
}

export function getMockOrderById(orderId: string) {
  return orders.find((order) => order.id === orderId);
}
