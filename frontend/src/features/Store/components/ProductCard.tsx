import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import type { Product } from "../../../Entities/Product";

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

  // فتح صفحة التفاصيل عند الضغط على الكارد باستخدام الـ _id الحقيقي
  const openProductDetails = () => {
    navigate(`/products/${product._id}`);
  };

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
      aria-label={`View details for ${product.title}`}
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
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={product.imageCover}
          alt={product.title}
          sx={{
            height: 220,
            objectFit: "contain",
            p: 2,
            bgcolor: "grey.50",
          }}
        />

        <IconButton
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          onClick={(event) => {
            event.stopPropagation(); // منع الانتقال لصفحة التفاصيل عند الضغط على زر المفضلة
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
          <FavoriteBorderIcon
            color={isFavorite ? "error" : "action"}
          />
        </IconButton>
      </Box>

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
          title={product.title}
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.title}
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

        {product.ratingsAverage != null && (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1, alignItems: "center" }}
          >
            <Rating
              value={product.ratingsAverage}
              precision={0.5}
              readOnly
              size="small"
            />

            <Typography variant="caption" color="text.secondary">
              ({product.ratingsQuantity ?? 0})
            </Typography>
          </Stack>
        )}

        <Box sx={{ flexGrow: 1, minHeight: 16 }} />

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {formatPrice(product.price)}
          </Typography>

          <IconButton
            aria-label={`Add ${product.title} to cart`}
            color="primary"
            onClick={(event) => {
              event.stopPropagation(); // منع الانتقال لصفحة التفاصيل عند الضغط على زر السلة
              onAddToCart?.(product);
            }}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 2,
            }}
          >
            <ShoppingCartOutlinedIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
