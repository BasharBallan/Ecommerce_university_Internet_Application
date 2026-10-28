
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "./OrderStore";
import type { OrderStatus } from './types';

const statusConfig: Record<
  OrderStatus,
  { label: string; color: "default" | "success" | "warning" | "error" | "info" }
> = {
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "success" },
  processing: { label: "Processing", color: "info" },
  shipped: { label: "Shipped", color: "info" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "default" },
  failed: { label: "Failed", color: "error" },
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export default function MyOrdersPage() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Temporary mock data. Later, replace this with API data.
  const orders = useOrders();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesSearch = order.orderNumber
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 5 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Page heading */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
              My Orders
            </Typography>

            <Typography color="text.secondary">
              Track your orders and view your purchase history.
            </Typography>
          </Box>

          {/* Summary */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingBagOutlinedIcon />
                </Box>

                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {orders.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Search and filter */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
          >
            <TextField
              fullWidth
              label="Search by order number"
              placeholder="e.g. ORD-1001"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
            />

            <TextField
              select
              label="Order status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 200 } }}
            >
              <MenuItem value="all">All statuses</MenuItem>
              {Object.entries(statusConfig).map(([value, config]) => (
                <MenuItem key={value} value={value}>
                  {config.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Orders list */}
          <Stack spacing={2}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const status = statusConfig[order.status];

                const itemCount = order.items.reduce(
                  (total, item) => total + item.quantity,
                  0
                );

                return (
                  <Card
                    key={order.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      transition: "box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {/* Order information */}
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                         sx={{ justifyContent: "space-between" , alignItems: { xs: "flex-start", sm: "center" } }}
                         
                          spacing={2}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700 }}
                            >
                              {order.orderNumber}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Placed on {formatDate(order.createdAt)}
                            </Typography>
                          </Box>

                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </Stack>

                        {/* Products preview */}
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            component="img"
                            src={order.items[0]?.productImage}
                            alt={order.items[0]?.productName ?? "Product"}
                            sx={{
                              width: 72,
                              height: 72,
                              objectFit: "cover",
                              borderRadius: 2,
                              bgcolor: "grey.100",
                            }}
                          />

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600 }}>
                              {order.items[0]?.productName}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {itemCount}{" "}
                              {itemCount === 1 ? "item" : "items"}
                              {order.items.length > 1
                                ? ` · ${order.items.length} different products`
                                : ""}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Total and action */}
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          sx={{
                            pt: 2,
                            borderTop: 1,
                            borderColor: "divider",
                             justifyContent: "space-between" , alignItems: { xs: "flex-start", sm: "center" } }}
                         
                          
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Order total
                            </Typography>

                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700 }}
                            >
                              {formatPrice(order.totalAmount)}
                            </Typography>
                          </Box>

                          <Button
                            variant="outlined"
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() =>
                              navigate(`/orders/${order.id}`)
                            }
                          >
                            View Details
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ py: 6, textAlign: "center" }}>
                  <ShoppingBagOutlinedIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                  />

                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    No orders found
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Try changing your search or status filter.
                  </Typography>

                  <Button
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
