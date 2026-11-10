
import { Chip } from "@mui/material";
import type { StockStatus } from "../../../Entities/InventoryData";
const statusConfig: Record<
  StockStatus,
  { label: string; color: "success" | "warning" | "error" | "info" }
> = {
  in_stock: { label: "In Stock", color: "success" },
  low_stock: { label: "Low Stock", color: "warning" },
  out_of_stock: { label: "Out of Stock", color: "error" },
  reserved: { label: "Reserved", color: "info" },
};
export default function StockStatusChip({
  status,
}: {
  status: StockStatus;
}) {
  const config = statusConfig[status];
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}