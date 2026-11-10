// features/Warehouse/hooks/useInventory.ts
import { useQuery } from "@tanstack/react-query";
import { inventoryApi, type InventoryParams } from "../apiServices/InventoryApi";
export const inventoryKeys = {
  all: ["warehouse", "inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (params: InventoryParams) =>
    [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...inventoryKeys.details(), id] as const,
};
export const useInventory = (params: InventoryParams = {}) => {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.getProducts(params),
    staleTime: 30_000,
  });
};