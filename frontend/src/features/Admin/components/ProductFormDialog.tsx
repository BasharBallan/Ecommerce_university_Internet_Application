import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Product } from "../../../Entities/Product";

// Supported categories matching the backend Mongoose schema
const SUPPORTED_CATEGORIES = [
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Canned",
  "Meat",
  "Poultry",
  "Fruits",
  "Vegetables",
  "Grains",
  "Oils",
  "Pantry",
  "Spices",
  "Cleaning",
  "Household",
  "Personal Care",
] as const;

const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Too short product title (min 3 chars)")
    .max(100, "Too long product title"),
  description: z
    .string()
    .trim()
    .min(20, "Too short product description (min 20 chars)"),
  price: z
    .string()
    .min(1, "Product price is required.")
    .refine(
      (value) =>
        Number.isFinite(Number(value)) &&
        Number(value) > 0 &&
        Number(value) <= 200000,
      "Price must be greater than zero and max 200,000."
    ),
  quantity: z
    .string()
    .min(1, "Product quantity is required.")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
      "Quantity must be a valid non-negative number."
    ),
  category: z.string().min(1, "Product must belong to a category."),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  initialProduct?: Product | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

const defaultValues: ProductFormValues = {
  title: "",
  description: "",
  price: "",
  quantity: "",
  category: "",
};

export default function ProductFormDialog({
  open,
  initialProduct = null,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (initialProduct) {
      reset({
        title: initialProduct.title || "",
        description: initialProduct.description || "",
        price: String(initialProduct.price || ""),
        quantity: String(initialProduct.quantity || ""),
        category:
          typeof initialProduct.category === "string"
            ? initialProduct.category
            : "",
      });
      setImagePreview(initialProduct.imageCover || "");
      setImageFile(null);
    } else {
      reset(defaultValues);
      setImagePreview("");
      setImageFile(null);
    }
    setImageError("");
  }, [open, initialProduct, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError("");
    }
  };

  const submitForm = (values: ProductFormValues) => {
    // Validate image cover presence for new products
    if (!initialProduct && !imageFile) {
      setImageError("Product Image cover is required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("description", values.description.trim());
    formData.append("price", values.price);
    formData.append("quantity", values.quantity);
    formData.append("category", values.category);

    // Generate slug automatically for the backend
    const slug = values.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    formData.append("slug", slug);

    if (imageFile) {
      formData.append("imageCover", imageFile);
    }

    onSubmit(formData);
    reset(defaultValues);
    setImageFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {initialProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            Fill in the product details below. All fields are required.
          </Alert>

          <Box sx={{ display: "grid", gap: 2 }}>
            {/* Product Title */}
            <TextField
              label="Product Title"
              fullWidth
              required
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            {/* Description */}
            <TextField
              label="Description (min 20 characters)"
              fullWidth
              required
              multiline
              minRows={3}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            {/* Category */}
            <TextField
              label="Category"
              select
              fullWidth
              required
              defaultValue=""
              {...register("category")}
              error={!!errors.category}
              helperText={errors.category?.message}
            >
              {SUPPORTED_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            {/* Price & Quantity */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Price ($)"
                type="number"
                required
                fullWidth
                slotProps={{
                  htmlInput: { min: 0.01, max: 200000, step: 0.01 },
                }}
                {...register("price")}
                error={!!errors.price}
                helperText={errors.price?.message}
              />

              <TextField
                label="Quantity (Stock)"
                type="number"
                required
                fullWidth
                slotProps={{
                  htmlInput: { min: 0, step: 1 },
                }}
                {...register("quantity")}
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
              />
            </Box>

            {/* Image Cover File Upload */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Product Cover Image *
              </Typography>
              <Button variant="outlined" component="label" fullWidth>
                Choose Image File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {imageError && (
                <Typography variant="caption" color="error">
                  {imageError}
                </Typography>
              )}
              {imagePreview && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid #ccc",
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {imageFile ? imageFile.name : "Current Image Cover"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initialProduct ? "Save Changes" : "Create Product"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
