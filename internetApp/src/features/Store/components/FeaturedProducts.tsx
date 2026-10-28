import {
  Alert,
  Box,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import ProductCard, { type Product } from "./ProductCard";

interface FeaturedProductsProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onAddToCart?: (product: Product) => void;
}

export default function FeaturedProducts({
  products,
  loading = false,
  error = null,
  onAddToCart,
}: FeaturedProductsProps) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton variant="rounded" height={220} />
            <Skeleton height={32} sx={{ mt: 1 }} />
            <Skeleton width="60%" height={28} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (products.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          No products found
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Try another search or category.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid
          key={product.id}
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        >
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
          />
        </Grid>
      ))}
    </Grid>
  );
}
