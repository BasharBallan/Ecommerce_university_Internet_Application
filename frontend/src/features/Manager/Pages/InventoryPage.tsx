
// import { useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   TextField,
//   MenuItem,
//   Grid,
// } from "@mui/material";
// import InventoryTable from "../components/InventoryTable";
// import { mockInventory } from "../data/mockInventory";
// export default function InventoryPage() {
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("all");
//   const filteredItems = useMemo(() => {
//     return mockInventory.filter((item) => {
//       const matchesSearch =
//         item.productName.toLowerCase().includes(search.toLowerCase()) ||
//         item.sku.toLowerCase().includes(search.toLowerCase());
//       const matchesStatus =
//         status === "all" || item.stockStatus === status;
//       return matchesSearch && matchesStatus;
//     });
//   }, [search, status]);
//   return (
//     <Box>
//       <Typography variant="h4" sx={{fontWeight:700}}>
//         Inventory
//       </Typography>
//       <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
//         View and manage product stock quantities.
//       </Typography>
//       <Paper
//         elevation={0}
//         sx={{ p: 2, mb: 2.5, border: "1px solid #e8eaf0", borderRadius: 3 }}
//       >
//         <Grid container spacing={2}>
//           <Grid size={{ xs: 12, md: 8 }}>
//             <TextField
//               fullWidth
//               size="small"
//               label="Search product or SKU"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <TextField
//               select
//               fullWidth
//               size="small"
//               label="Stock Status"
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//             >
//               <MenuItem value="all">All Statuses</MenuItem>
//               <MenuItem value="in_stock">In Stock</MenuItem>
//               <MenuItem value="low_stock">Low Stock</MenuItem>
//               <MenuItem value="out_of_stock">Out of Stock</MenuItem>
//               <MenuItem value="reserved">Reserved</MenuItem>
//             </TextField>
//           </Grid>
//         </Grid>
//       </Paper>
//       <InventoryTable items={filteredItems} />
//     </Box>
//   );
// }



// features/Warehouse/pages/InventoryPage.tsx
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../../../Hooks/UseGetInventory";

export default function InventoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data, isLoading, isError, error, refetch } =
    useInventory({ page: 1, limit: 100 });
  const products = data?.data ?? [];
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  );
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product._id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });
  if (isLoading) {
    return (
      <Box  sx={{justifyContent:"center", p:5,display:"flex"}}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <button onClick={() => refetch()}>Retry</button>
        }
      >
        {error instanceof Error
          ? error.message
          : "Failed to load products"}
      </Alert>
    );
  }
  return (
    <Box>
      <Typography variant="h4" sx={{fontWeight:700 ,mb:1}}>
        Inventory
      </Typography>
      <Typography color="text.secondary" sx={{mb:3}}>
        Browse products and inspect their inventory details.
      </Typography>
      <Box  sx={{gap:2, mb:3, flexWrap:"wrap",display:"flex"}}>
        <TextField
          label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All categories</MenuItem>
          {categories.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Paper sx={{ overflowX: "auto" }}>
        {filteredProducts.length === 0 ? (
          <Typography sx={{p:3}} color="text.secondary">
            No products found.
          </Typography>
        ) : (
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Product", "Category", "Catalog Quantity", "Price", "Action"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: 16,
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td style={{ padding: 16 }}>
                    {product.title}
                  </td>
                  <td style={{ padding: 16 }}>
                    {product.category}
                  </td>
                  <td style={{ padding: 16 }}>
                    {product.quantity}
                  </td>
                  <td style={{ padding: 16 }}>
                    {product.price}
                  </td>
                  <td style={{ padding: 16 }}>
                    <button
                      onClick={() =>
                        navigate(`/warehouse/inventory/${product._id}`)
                      }
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </Paper>
    </Box>
  );
}