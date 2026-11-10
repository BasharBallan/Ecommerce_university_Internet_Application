// features/Warehouse/hooks/useInventoryDetails.ts
import { useQuery } from "@tanstack/react-query";
import { inventoryKeys } from "./UseGetInventory";
import { inventoryApi } from "../apiServices/InventoryApi";
export const useInventoryDetails = (productId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.detail(productId ?? ""),
    queryFn: () =>
      inventoryApi.getProductDetails(productId!),
    enabled: Boolean(productId),
    staleTime: 15_000,
  });
};