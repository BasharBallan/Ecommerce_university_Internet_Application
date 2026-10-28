import {
  Box,
  Button,
  Skeleton,
  Typography,
} from "@mui/material";

export interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  loading?: boolean;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  loading = false,
}: CategoryFilterProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton
            key={item}
            variant="rounded"
            width={100}
            height={40}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant={selectedCategory === null ? "contained" : "outlined"}
          onClick={() => onCategoryChange(null)}
          sx={{ borderRadius: 5, textTransform: "none", px: 2.5 }}
        >
          All Products
        </Button>

        {categories.map((category) => (
          <Button
            key={category.id}
            variant={
              selectedCategory === category.id ? "contained" : "outlined"
            }
            onClick={() => onCategoryChange(category.id)}
            sx={{ borderRadius: 5, textTransform: "none", px: 2.5 }}
          >
            {category.name}
          </Button>
        ))}
      </Box>

      {categories.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No categories available.
        </Typography>
      )}
    </Box>
  );
}
