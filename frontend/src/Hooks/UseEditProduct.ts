

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "./ProductService";


export const useEditProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["editProduct", productId],

    mutationFn: async (data: any) => {
      return await updateProduct(productId,data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    },
  });
};