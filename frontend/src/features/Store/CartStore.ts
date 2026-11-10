import { useSyncExternalStore } from "react";
import type { Product } from "../../Entities/Product";

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

let cartItems: CartItem[] = [];

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return cartItems;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function addToCart(product: Product, quantity = 1) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer.");
  }

  const prodId = String(product.id || (product as any)._id);

  const existingItem = cartItems.find(
    (item) => String(item.productId) === prodId,
  );

  if (existingItem) {
    cartItems = cartItems.map((item) =>
      String(item.productId) === prodId
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    );
  } else {
    cartItems = [
      ...cartItems,
      {
        productId: prodId,
        product,
        quantity,
      },
    ];
  }

  notify();
}

export function updateCartQuantity(
  productId: string,
  quantity: number,
) {
  const prodId = String(productId);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return;
  }

  cartItems = cartItems.map((item) =>
    String(item.productId) === prodId ? { ...item, quantity } : item,
  );

  notify();
}

export function removeFromCart(productId: string) {
  const prodId = String(productId);
  cartItems = cartItems.filter((item) => String(item.productId) !== prodId);
  notify();
}

export function clearCart() {
  cartItems = [];
  notify();
}
