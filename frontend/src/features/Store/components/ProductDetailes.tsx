import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Rating,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import StoreNavbar from "../components/StoreNavbar";
import { mockCategories, mockProducts } from "../data/mockData";
import { addToCart } from "../CartStore";

export default function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const product = mockProducts.find((item) => item.id === productId);

  // Handle an invalid or unknown product ID.
  if (!product) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <StoreNavbar />

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ p: 5, borderRadius: 3, textAlign: "center" }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
              Product Not Found
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              The product you are looking for does not exist or is no longer
              available.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/products")}
              startIcon={<ArrowBackIcon />}
            >
              Back to Products
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const category = mockCategories.find(
    (item) => item.id === product.categoryId,
  );

  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice >= 0 &&
    product.discountPrice < product.price;

  const finalPrice = hasDiscount ? product.discountPrice! : product.price;

  const discountPercentage = hasDiscount
    ? Math.round(((product.price - finalPrice) / product.price) * 100)
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <StoreNavbar />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Back navigation */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/products")}
          sx={{ mb: 3 }}
        >
          Back to Products
        </Button>

        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1fr) minmax(0, 1fr)",
              },
              gap: { xs: 4, md: 6 },
              alignItems: "start",
            }}
          >
            {/* Product image */}
            <Box
              sx={{
                position: "relative",
                bgcolor: "grey.50",
                borderRadius: 3,
                overflow: "hidden",
                minHeight: { xs: 280, md: 440 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {hasDiscount && (
                <Chip
                  label={`-${discountPercentage}%`}
                  color="error"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 1,
                    fontWeight: 800,
                  }}
                />
              )}

              <Box
                component="img"
                src={product.imageUrl}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: { xs: 280, md: 440 },
                  objectFit: "contain",
                  p: { xs: 2, md: 4 },
                }}
              />
            </Box>

            {/* Product information */}
            <Stack spacing={2.5} sx={{ py: { md: 1 } }}>
              {category && (
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: 1.5,
                  }}
                >
                  {category.name}
                </Typography>
              )}

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                }}
              >
                {product.name}
              </Typography>

              {product.rating != null && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Rating value={product.rating} precision={0.1} readOnly />

                  <Typography sx={{ fontWeight: 700 }}>
                    {product.rating.toFixed(1)}
                  </Typography>

                  {product.reviewCount != null && (
                    <Typography color="text.secondary">
                      ({product.reviewCount} reviews)
                    </Typography>
                  )}
                </Stack>
              )}

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.9 }}
              >
                {product.description || "No description available."}
              </Typography>

              {/* Price */}
              <Box>
                {hasDiscount && (
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through" }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                )}

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", flexWrap: "wrap" }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800 }}
                    color="primary.main"
                  >
                    {formatPrice(finalPrice)}
                  </Typography>

                  {hasDiscount && (
                    <Chip
                      icon={<LocalOfferOutlinedIcon />}
                      label={`Save ${formatPrice(product.price - finalPrice)}`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>

              {/* Quantity selector */}
              <Box>
                <Typography sx={{ mb: 1, fontWeight: 700 }}>
                  Quantity
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <IconButton
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    sx={{ border: "1px solid", borderColor: "divider" }}
                  >
                    <RemoveIcon />
                  </IconButton>

                  <Typography
                    aria-live="polite"
                    sx={{
                      minWidth: 40,
                      textAlign: "center",
                      fontWeight: 800,
                    }}
                  >
                    {quantity}
                  </Typography>

                  <IconButton
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((current) => current + 1)}
                    sx={{ border: "1px solid", borderColor: "divider" }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Box>

              {/* Total */}
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Subtotal
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {formatPrice(finalPrice * quantity)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartOutlinedIcon />}
                onClick={handleAddToCart}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Add to Cart
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
        >
          Added {quantity} × {product.name} to your cart.
        </Alert>
      </Snackbar>
    </Box>
  );
}
