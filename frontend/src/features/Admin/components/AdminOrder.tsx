import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApiClient from "../../../apiServices/api_client";
import OrderDetailsDialog from "./OrderDetailsDialog";

// ==========================================
// 1. Types and API Service Setup
// ==========================================
export interface OrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
    imageCover: string;
  };
  quantity: number;
  price: number;
  _id: string;
}

export interface BackendOrder {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  totalOrderPrice: number;
  orderStatus: "pending" | "ready" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface OrdersApiResponse {
  status: string;
  results?: number;
  data: BackendOrder[] | { orders: BackendOrder[] };
}

const ordersApiClient = new ApiClient<OrdersApiResponse, any>("/orders");

export const AdminOrderService = {
  // Fetch all orders from backend
  getOrders: async () => {
    const res = await ordersApiClient.getAll();
    const data = (res as any).data;
    return Array.isArray(data) ? data : data?.orders || [];
  },

  // Update order status using a dedicated ApiClient instance for the status sub-route
  updateOrderStatus: async (orderId: string, orderStatus: string) => {
    // We instantiate ApiClient targeting the specific order status endpoint
    const statusClient = new ApiClient<any, { orderStatus: string }>(`/orders/${orderId}/status`);
    // Passing empty string or dummy id as first parameter, and the payload as second parameter to match update signature
    return await statusClient.update("", { orderStatus });
  },
};

export const AdminService = AdminOrderService;

// ==========================================
// 2. Constants and Utilities
// ==========================================
const statusLabels: Record<string, string> = {
  pending: "Pending",
  ready: "Ready",
  cancelled: "Cancelled",
};

const statusColors: Record<string, "warning" | "success" | "error"> = {
  pending: "warning",
  ready: "success",
  cancelled: "error",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString();
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

// ==========================================
// 3. Admin Orders Page Component
// ==========================================
export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch orders using TanStack Query
  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-orders-page"],
    queryFn: AdminOrderService.getOrders,
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      AdminOrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-page"] });
      setSuccessMsg("Order status updated successfully!");
    },
    onError: (err: any) => {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status"
      );
    },
  });

  // Search and filter logic
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order: BackendOrder) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchValue) ||
        order.user?.name?.toLowerCase().includes(searchValue) ||
        order.user?.email?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const visibleOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : "Failed to load orders"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Orders Management
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          View and manage customer orders and fulfillment statuses.
        </Typography>
      </Box>

      {/* Main Container */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e8eaf0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Filters Section */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Search orders"
            placeholder="Search by Order ID or User name/email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />

          <TextField
            select
            size="small"
            label="Order status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { sm: 200 } }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="ready">Ready</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>

        {/* Orders Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f7f8fc" }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items Count</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status & Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleOrders.map((order: BackendOrder) => {
                const itemCount =
                  order.orderItems?.reduce(
                    (total, item) => total + item.quantity,
                    0
                  ) || 0;

                return (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography
                        component="button"
                        onClick={() => setSelectedOrder(order)}
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                          cursor: "pointer",
                          border: 0,
                          background: "transparent",
                          padding: 0,
                          font: "inherit",
                          textAlign: "left",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {order._id.substring(0, 12)}...
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        Full ID: {order._id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {order.user?.name || "Unknown User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user?.email}
                      </Typography>
                    </TableCell>

                    <TableCell>{formatDate(order.createdAt)}</TableCell>

                    <TableCell>{itemCount}</TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatAmount(order.totalOrderPrice)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          py: 1,
                        }}
                      >
                        <Chip
                          size="small"
                          label={statusLabels[order.orderStatus] || order.orderStatus}
                          color={statusColors[order.orderStatus] || "default"}
                          sx={{ width: "fit-content" }}
                        />

                        <TextField
                          select
                          size="small"
                          label="Change status"
                          value={order.orderStatus}
                          onChange={(event) => {
                            updateStatusMutation.mutate({
                              id: order._id,
                              status: event.target.value,
                            });
                          }}
                          sx={{ minWidth: 150 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="ready">Ready</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </TextField>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {visibleOrders.length === 0 && {
                // handled below safely
              } && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={selectedOrder !== null}
        order={selectedOrder as any}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Success Notification */}
      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success" variant="filled">
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
