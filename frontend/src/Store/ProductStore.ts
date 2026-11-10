
import { create } from "zustand";

import type { Product } from "../features/Store/components/ProductCard";
import { mockProducts } from "../features/Store/data/mockData";

interface ProductsState {
  products: Product[];

  addProduct: (product: Omit<Product, "id">) => void;

  updateProduct: (
    id: string,
    updatedData: Omit<Product, "id">
  ) => void;

  deleteProduct: (id: string) => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  // Initial data
  products: mockProducts,

  // Add a product
  addProduct: (productData) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          ...productData,
          id: `p${Date.now()}`,
        },
      ],
    })),

  // Update a product
  updateProduct: (id, updatedData) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id
          ? { ...product, ...updatedData, id: product.id }
          : product
      ),
    })),

  // Delete a product
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter(
        (product) => product.id !== id
      ),
    })),
}));
