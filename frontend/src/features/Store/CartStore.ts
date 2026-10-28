
import { useSyncExternalStore } from "react";
import type { Product } from "./components/ProductCard";

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

  const existingItem = cartItems.find(
    (item) => item.productId === product.id,
  );

  if (existingItem) {
    cartItems = cartItems.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    );
  } else {
    cartItems = [
      ...cartItems,
      {
        productId: product.id,
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
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer.");
  }

  cartItems = cartItems.map((item) =>
    item.productId === productId
      ? { ...item, quantity }
      : item,
  );

  notify();
}

export function removeFromCart(productId: string) {
  cartItems = cartItems.filter(
    (item) => item.productId !== productId,
  );

  notify();
}

export function clearCart() {
  cartItems = [];
  notify();
}

export function getCartItemCount() {
  return cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
}

export function getCartSubtotal() {
  return Number(
    cartItems
      .reduce((total, item) => {
        const { product, quantity } = item;

        const hasDiscount =
          product.discountPrice != null &&
          product.discountPrice >= 0 &&
          product.discountPrice < product.price;

        const unitPrice = hasDiscount
          ? product.discountPrice!
          : product.price;

        return total + unitPrice * quantity;
      }, 0)
      .toFixed(2),
  );
}
