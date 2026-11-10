import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useOrderDetails } from "./OrderService";
import type { OrderStatus } from "./types";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: "default" | "success" | "warning" | "error" | "info";
  }
> = {
  pending: { label: "Pending", color: "warning" },
  ready: { label: "Ready", color: "info" },
  confirmed: { label: "Confirmed", color: "success" },
  processing: { label: "Processing", color: "info" },
  shipped: { label: "Shipped", color: "info" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "default" },
  rejected: { label: "Rejected", color: "error" },
  failed: { label: "Failed", color: "error" },
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const formatDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError, error, refetch } = useOrderDetails(orderId);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {(error as any)?.response?.data?.message ||
              (error as any)?.message ||
              "Order not found. The order may not exist or the link may be invalid."}
          </Alert>

          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/orders")}
            >
              Back to My Orders
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </Stack>
        </Stack>
      </Container>
    );
  }

  const status = statusConfig[order.status] || {
    label: order.status,
    color: "default" as const,
  };

  const calculatedTotal = order.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 5 }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          {/* Back navigation */}
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/orders")}
            >
              Back to My Orders
            </Button>
          </Box>

          {/* Order header */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    Order Details
                  </Typography>

                  <Typography color="text.secondary">
                    Order #{order.orderNumber}
                  </Typography>
                </Box>

                <Chip
                  label={status.label}
                  color={status.color}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Order Number
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {order.orderNumber}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Order Date
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatDate(order.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Order items */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Ordered Products
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={3}>
                {order.items.map((item, idx) => (
                  <Box key={`${item.productId}-${idx}`}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <Box
                        component="img"
                        src={item.productImage}
                        alt={item.productName}
                        sx={{
                          width: { xs: 76, sm: 100 },
                          height: { xs: 76, sm: 100 },
                          objectFit: "cover",
                          borderRadius: 2,
                          bgcolor: "grey.100",
                          flexShrink: 0,
                        }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
                        >
                          {item.productName}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Quantity: {item.quantity}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Unit price: {formatPrice(item.unitPrice)}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        {formatPrice(item.quantity * item.unitPrice)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Order total */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Order Summary
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="text.secondary">
                  Total ({order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )} items)
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatPrice(order.totalAmount || calculatedTotal)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/orders")}
            >
              Back to My Orders
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
