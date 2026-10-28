
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
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import { useNavigate } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import {
  getCartItemCount,
  getCartSubtotal,
  removeFromCart,
  updateCartQuantity,
  useCart,
} from "../CartStore";
import { DeleteOutlined } from "@mui/icons-material";



export default function CartPage() {
  const navigate = useNavigate();
  const cartItems = useCart();

  const itemCount = getCartItemCount();
  const subtotal = getCartSubtotal();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

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
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 800 }}
          >
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
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
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
            {/* Cart items */}
            <Stack spacing={2}>
              {cartItems.map(({ product, productId, quantity }) => {
                const hasDiscount =
                  product.discountPrice != null &&
                  product.discountPrice >= 0 &&
                  product.discountPrice < product.price;

                const unitPrice = hasDiscount
                  ? product.discountPrice!
                  : product.price;

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
                        src={product.imageUrl}
                        alt={product.name}
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
                              fontSize: { xs: "1rem", md: "1.15rem" },
                            }}
                          >
                            {product.name}
                          </Typography>

                          {hasDiscount && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textDecoration: "line-through" }}
                            >
                              {formatPrice(product.price)}
                            </Typography>
                          )}

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
                          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                            <IconButton
                              size="small"
                              aria-label={`Decrease ${product.name} quantity`}
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
                              aria-label={`Increase ${product.name} quantity`}
                              onClick={() =>
                                updateCartQuantity(productId, quantity + 1)
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
                            aria-label={`Remove ${product.name} from cart`}
                            onClick={() => removeFromCart(productId)}
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
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

            {/* Order summary */}
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
                <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                  <Typography color="text.secondary">
                    Items ({itemCount})
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatPrice(subtotal)}
                  </Typography>
                </Stack>

                <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                  <Typography color="text.secondary">Shipping</Typography>
                  <Typography color="text.secondary">
                    Calculated at checkout
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
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

                <Alert severity="info">
                  Shipping fees and final order confirmation will be handled
                  during checkout.
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/checkout")}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Proceed to Checkout
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
