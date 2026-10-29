import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import StoreNavbar from "../components/StoreNavbar";
import { removeFromCart, updateCartQuantity, useCart } from "../CartStore";
import ApiClient from "../../../apiServices/api_client";

const orderApiClient = new ApiClient<any, any>("/orders");

export default function CartPage() {
  const navigate = useNavigate();
  const cartItems = useCart();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const handleCreateOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      setErrorMsg("Cart items cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const payload = {
        orderItems: cartItems.map((item) => ({
          product: item.productId || item.product._id,
          quantity: item.quantity,
        })),
      };

      await orderApiClient.post(payload);

      navigate("/products");
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <StoreNavbar cartItemCount={itemCount} />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/products")}
          sx={{ mb: 3 }}
        >
          Continue Shopping
        </Button>

        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Shopping Cart
          </Typography>

          <Typography color="text.secondary">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </Typography>
        </Stack>

        {cartItems.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <ShoppingCartOutlinedIcon
              sx={{
                fontSize: 64,
                color: "text.disabled",
                mb: 2,
              }}
            />

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Your cart is empty
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added any products yet.
            </Typography>

            <Button
              variant="contained"
              startIcon={<ShoppingBagOutlinedIcon />}
              onClick={() => navigate("/products")}
            >
              Explore Products
            </Button>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1.7fr) minmax(280px, 1fr)",
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Stack spacing={2}>
              {cartItems.map(({ product, productId, quantity }) => {
                const unitPrice = product.price;
                const hasStock = product.quantity > 0;

                return (
                  <Paper
                    key={productId}
                    variant="outlined"
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "88px minmax(0, 1fr)",
                          sm: "120px minmax(0, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={product.imageCover}
                        alt={product.title}
                        sx={{
                          width: "100%",
                          height: { xs: 100, sm: 130 },
                          objectFit: "contain",
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      />

                      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: {
                                xs: "1rem",
                                md: "1.15rem",
                              },
                            }}
                          >
                            {product.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {product.category}
                          </Typography>

                          <Typography
                            color="primary.main"
                            sx={{ fontWeight: 800 }}
                          >
                            {formatPrice(unitPrice)}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          sx={{
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                          >
                            <IconButton
                              size="small"
                              aria-label={`Decrease ${product.title} quantity`}
                              disabled={quantity <= 1}
                              onClick={() =>
                                updateCartQuantity(productId, quantity - 1)
                              }
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>

                            <Typography
                              aria-live="polite"
                              sx={{
                                minWidth: 24,
                                textAlign: "center",
                                fontWeight: 700,
                              }}
                            >
                              {quantity}
                            </Typography>

                            <IconButton
                              size="small"
                              aria-label={`Increase ${product.title} quantity`}
                              disabled={
                                !hasStock || quantity >= product.quantity
                              }
                              onClick={() =>
                                updateCartQuantity(
                                  productId,
                                  Math.min(quantity + 1, product.quantity),
                                )
                              }
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <IconButton
                            color="error"
                            aria-label={`Remove ${product.title} from cart`}
                            onClick={() => removeFromCart(productId)}
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Stack>

                        {!hasStock && (
                          <Alert severity="warning">
                            This product is currently out of stock.
                          </Alert>
                        )}

                        {hasStock && quantity > product.quantity && (
                          <Alert severity="warning">
                            The requested quantity exceeds available stock.
                          </Alert>
                        )}

                        <Typography variant="body2" color="text.secondary">
                          Item total:{" "}
                          <Box
                            component="span"
                            sx={{
                              color: "text.primary",
                              fontWeight: 800,
                            }}
                          >
                            {formatPrice(unitPrice * quantity)}
                          </Box>
                        </Typography>
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                position: { md: "sticky" },
                top: { md: 110 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Order Summary
              </Typography>

              <Stack spacing={2}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography color="text.secondary">
                    Items ({itemCount})
                  </Typography>

                  <Typography sx={{ fontWeight: 600 }}>
                    {formatPrice(subtotal)}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography color="text.secondary">Shipping</Typography>

                  <Typography color="text.secondary">
                    Calculated at checkout
                  </Typography>
                </Stack>

                <Divider />

                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Subtotal
                  </Typography>

                  <Typography
                    variant="h6"
                    color="primary.main"
                    sx={{ fontWeight: 800 }}
                  >
                    {formatPrice(subtotal)}
                  </Typography>
                </Stack>

                {errorMsg && (
                  <Alert severity="error">
                    {errorMsg}
                  </Alert>
                )}

                <Alert severity="info">
                  Shipping fees and final order confirmation will be handled during order placement.
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || cartItems.length === 0}
                  onClick={handleCreateOrder}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Create Order"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}
