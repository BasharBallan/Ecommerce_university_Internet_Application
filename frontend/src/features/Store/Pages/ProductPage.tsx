
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
} from "@mui/material";

import StoreNavbar from "../components/StoreNavbar";
import CategoryFilter from "../components/CategoryFilter";
import FeaturedProducts from "../components/FeaturedProducts";
import { mockCategories, mockProducts } from "../data/mockData";

// Temporary data source.
// We will replace this with backend data later.
// const categories: Category[] = [];
// const products: Product[] = [];

const PRODUCTS_PER_PAGE = 8;

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "rating-desc";

export default function ProductsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return mockProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === null ||
        product.categoryId === selectedCategory;

      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchValue, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    switch (sortBy) {
      case "price-asc":
        return result.sort((a, b) => a.price - b.price);

      case "price-desc":
        return result.sort((a, b) => b.price - a.price);

      case "name-asc":
        return result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      case "rating-desc":
        return result.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
        );

      default:
        return result;
    }
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(
    sortedProducts.length / PRODUCTS_PER_PAGE
  );

  const visibleProducts = useMemo(() => {
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;

    return sortedProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    );
  }, [sortedProducts, page]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <StoreNavbar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography
          variant="h4"
          component="h1"
         sx={{  fontWeight: 800 }}
        >
          All Products
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Find the products you are looking for.
        </Typography>

        <CategoryFilter
          categories={mockCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 4, mb: 3, justifyContent:"space-between",
          alignItems:{ xs: "stretch", sm: "center" }
          }}
        >
          <Typography color="text.secondary">
            {sortedProducts.length} products found
          </Typography>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="sort-products-label">
              Sort by
            </InputLabel>

            <Select
              labelId="sort-products-label"
              value={sortBy}
              label="Sort by"
              onChange={(event) =>
                handleSortChange(event.target.value as SortOption)
              }
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="price-asc">
                Price: Low to High
              </MenuItem>
              <MenuItem value="price-desc">
                Price: High to Low
              </MenuItem>
              <MenuItem value="name-asc">Name: A to Z</MenuItem>
              <MenuItem value="rating-desc">
                Highest Rated
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <FeaturedProducts products={visibleProducts} />

        {totalPages > 1 && (
          <Stack  sx={{ mt: 5 ,alignItems:"center"}}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              shape="rounded"
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
