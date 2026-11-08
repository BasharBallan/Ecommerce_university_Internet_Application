import { useQuery } from "@tanstack/react-query";
import { getProductById } from "./ProductService";

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],

    queryFn: () => {
      if (!id) {
        throw new Error("Product ID is required.");
      }

      return getProductById(id);
    },

    enabled: Boolean(id),
  });
}