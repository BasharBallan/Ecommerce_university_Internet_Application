
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { Order } from "../../Order/types";

interface OrderDetailsDialogProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export default function OrderDetailsDialog({
  open,
  order,
  onClose,
}: OrderDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Order Details
      </DialogTitle>

      <DialogContent dividers>
        {!order ? (
          <Typography color="text.secondary">
            No order selected.
          </Typography>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Order Number
              </Typography>

              <Typography sx={{fontWeight:700}}>
                {order.orderNumber}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                ID: {order.id}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Customer ID
              </Typography>

              <Typography>
                {order.customerId}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>

              <Typography>
                {formatDate(order.createdAt)}
              </Typography>
            </Box>

            <Divider />

            <Typography variant="h6" sx={{fontWeight:700}}>
              Products
            </Typography>

            {order.items.map((item, index) => (
              <Box
                key={`${item.productId}-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src={item.productImage}
                  alt={item.productName}
                  sx={{
                    width: 72,
                    height: 72,
                    objectFit: "contain",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{fontWeight:600}}>
                    {item.productName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Quantity: {item.quantity}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Unit price: {formatAmount(item.unitPrice)}
                  </Typography>
                </Box>

                <Typography sx={{fontWeight:600}}>
                  {formatAmount(item.quantity * item.unitPrice)}
                </Typography>
              </Box>
            ))}

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                Total
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatAmount(order.totalAmount)}
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
