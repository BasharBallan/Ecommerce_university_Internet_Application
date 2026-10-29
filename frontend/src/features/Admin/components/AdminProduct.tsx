import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useProducts } from "../../../Hooks/useProducts";
import { createProduct, updateProduct, deleteProduct } from "../../../Hooks/ProductService";
import type { Product } from "../../../Entities/Product";
import { mockCategories } from "../../Store/data/mockData";
import ProductFormDialog from "./ProductFormDialog";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  // Fetch real products from the API using TanStack Query
  const { data: products = [], isLoading, isError, error } = useProducts();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [successMessageOpen, setSuccessMessageOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Mutation for creating or updating a product
  const saveProductMutation = useMutation({
    mutationFn: (data: { id?: string; formData: any }) => {
      if (data.id) {
        return updateProduct(data.id, data.formData);
      } else {
        return createProduct(data.formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setFormOpen(false);
      setEditingProduct(null);
      setSuccessMessage("Product saved successfully");
      setSuccessMessageOpen(true);
    },
    onError: (err: any) => {
        console.error("Backend Validation Error Response:", err.response?.data);
        alert(JSON.stringify(err.response?.data || err.message));
      },
  });

  // Mutation for deleting a product
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSuccessMessage("Product deleted successfully");
      setSuccessMessageOpen(true);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || "Failed to delete product");
    },
  });

  const handleSaveProduct = (productData: any) => {
    saveProductMutation.mutate({
      id: editingProduct ? editingProduct._id : undefined,
      formData: productData,
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    deleteProductMutation.mutate(id);
  };

  // Filter products based on search term and category
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product: Product) => {
      const matchesSearch = product.title
        ?.toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const visibleProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : "Failed to load products"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Products Management
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Manage your store products, prices, and inventory.
          </Typography>
        </Box>

        <Button variant="contained" onClick={handleOpenAddProduct}>
          Add Product
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e8eaf0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Search products"
            placeholder="Enter product title..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />

          <TextField
            select
            size="small"
            label="Category"
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { sm: 200 } }}
          >
            <MenuItem value="all">All categories</MenuItem>
            {mockCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f7f8fc" }}>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleProducts.map((product: Product) => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        minWidth: 220,
                      }}
                    >
                      <Box
                        component="img"
                        src={product.imageCover}
                        alt={product.title}
                        sx={{
                          width: 52,
                          height: 52,
                          objectFit: "contain",
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {product.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {product._id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    {typeof product.category === "string" ? product.category : product.category?.name || "Uncategorized"}
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {product.ratingsAverage?.toFixed(1) ?? "0.0"} ({product.ratingsQuantity ?? 0})
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                      color={product.quantity > 0 ? "success" : "error"}
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      aria-label={`Edit ${product.title}`}
                      onClick={() => handleEditProduct(product)}
                    >
                      <EditOutlinedIcon />
                    </IconButton>

                    <IconButton
                      aria-label={`Delete ${product.title}`}
                      color="error"
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {visibleProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredProducts.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ProductFormDialog
        open={formOpen}
        categories={mockCategories}
        initialProduct={editingProduct}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
      />

      <Snackbar
        open={successMessageOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessMessageOpen(false)}
        message={successMessage}
      />
    </Box>
  );
}
