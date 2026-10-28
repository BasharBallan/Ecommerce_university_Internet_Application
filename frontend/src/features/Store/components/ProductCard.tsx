import { ShoppingCartOutlined } from "@mui/icons-material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../CartStore";

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  discountPrice?: number | null;
  rating?: number | null;
  reviewCount?: number;
  categoryId: string;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: ProductCardProps) {
  const navigate = useNavigate();

  const openProductDetails = () => {
    navigate(`/products/${product.id}`);
  };
  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice >= 0 &&
    product.discountPrice < product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100,
      )
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  return (
    <Card
      elevation={0}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      onClick={openProductDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProductDetails();
        }
      }}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      {/* Product image */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={product.imageUrl}
          alt={product.name}
          sx={{
            height: 220,
            objectFit: "contain",
            p: 2,
            bgcolor: "grey.50",
          }}
        />

        {hasDiscount && (
          <Chip
            label={`-${discountPercentage}%`}
            color="error"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              fontWeight: 700,
            }}
          />
        )}

        <IconButton
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          // onClick={() => onToggleFavorite?.(product)}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.(product);
          }}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <FavoriteBorderIcon color={isFavorite ? "error" : "action"} />
        </IconButton>
      </Box>

      {/* Product information */}
      <CardContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          "&:last-child": { pb: 2 },
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={product.name}
        >
          {product.name}
        </Typography>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
              minHeight: 40,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </Typography>
        )}

        {product.rating != null && (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1, alignItems: "center" }}
          >
            <Rating
              value={product.rating}
              precision={0.5}
              readOnly
              size="small"
            />

            {product.reviewCount != null && (
              <Typography variant="caption" color="text.secondary">
                ({product.reviewCount})
              </Typography>
            )}
          </Stack>
        )}

        <Box sx={{ flexGrow: 1, minHeight: 16 }} />

        {/* Price and add-to-cart button */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 2, alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
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
              variant="h6"
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "primary.main",
              }}
            >
              {formatPrice(
                hasDiscount ? product.discountPrice! : product.price,
              )}
            </Typography>
          </Box>

          <IconButton
            aria-label={`Add ${product.name} to cart`}
            color="primary"
            onClick={(event) => {
              event.stopPropagation();
              addToCart(product);
            }}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 2,
            }}
          >
            <ShoppingCartOutlined />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
