
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   LinearProgress,
//   Button,
//   Divider,
//   Stack,
// } from "@mui/material";
// import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
// import { mockInventory } from "../data/mockInventory";
// import StockStatusChip from "../components/StockStatusChip";
// export default function InventoryDetailsPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const item = mockInventory.find((product) => product.id === Number(id));
//   if (!item) {
//     return (
//       <Box>
//         <Typography variant="h5">Product not found</Typography>
//         <Button onClick={() => navigate("/warehouse/inventory")}>
//           Back to Inventory
//         </Button>
//       </Box>
//     );
//   }
//   const reservedPercentage =
//     item.totalQuantity > 0
//       ? (item.reservedQuantity / item.totalQuantity) * 100
//       : 0;
//   const availablePercentage =
//     item.totalQuantity > 0
//       ? (item.availableQuantity / item.totalQuantity) * 100
//       : 0;
//   return (
//     <Box>
//       <Button
//         startIcon={<ArrowBackOutlinedIcon />}
//         onClick={() => navigate("/warehouse/inventory")}
//         sx={{ mb: 2 }}
//       >
//         Back to Inventory
//       </Button>
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h4" sx={{fontWeight:700}}>
//           {item.productName}
//         </Typography>
//         <Typography color="text.secondary">
//           Product SKU: {item.sku}
//         </Typography>
//       </Box>
//       <Grid container spacing={2.5}>
//         <Grid size={{ xs: 12, md: 8 }}>
//           <Paper
//             elevation={0}
//             sx={{ p: 3, border: "1px solid #e8eaf0", borderRadius: 3 }}
//           >
//             <Typography variant="h6"  sx={{ mb: 3,fontWeight:700 }}>
//               Quantity Breakdown
//             </Typography>
//             <Grid container spacing={2}>
//               {[
//                 { label: "Total Quantity", value: item.totalQuantity, color: "#2563eb" },
//                 { label: "Reserved Quantity", value: item.reservedQuantity, color: "#d97706" },
//                 { label: "Available Quantity", value: item.availableQuantity, color: "#16a34a" },
//               ].map((stat) => (
//                 <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
//                   <Box sx={{ bgcolor: "#f8f9fc", borderRadius: 2, p: 2 }}>
//                     <Typography variant="body2" color="text.secondary">
//                       {stat.label}
//                     </Typography>
//                     <Typography variant="h4"  sx={{ color: stat.color, mt: 1 ,fontWeight:700}}>
//                       {stat.value}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       {item.unit}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//             <Divider sx={{ my: 3 }} />
//             <Typography  sx={{ mb: 2 ,fontWeight:700}}>
//               Stock Distribution
//             </Typography>
//             <Stack spacing={2}>
//               <Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                   <Typography variant="body2">Available</Typography>
//                   <Typography variant="body2" sx={{fontWeight:600}}>
//                     {availablePercentage.toFixed(1)}%
//                   </Typography>
//                 </Box>
//                 <LinearProgress
//                   variant="determinate"
//                   value={availablePercentage}
//                   sx={{
//                     height: 12,
//                     borderRadius: 5,
//                     bgcolor: "#edf0f5",
//                     "& .MuiLinearProgress-bar": {
//                       bgcolor: "#16a34a",
//                       borderRadius: 5,
//                     },
//                   }}
//                 />
//               </Box>
//               <Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                   <Typography variant="body2">Reserved</Typography>
//                   <Typography variant="body2" sx={{fontWeight:600}}>
//                     {reservedPercentage.toFixed(1)}%
//                   </Typography>
//                 </Box>
//                 <LinearProgress
//                   variant="determinate"
//                   value={reservedPercentage}
//                   sx={{
//                     height: 12,
//                     borderRadius: 5,
//                     bgcolor: "#edf0f5",
//                     "& .MuiLinearProgress-bar": {
//                       bgcolor: "#d97706",
//                       borderRadius: 5,
//                     },
//                   }}
//                 />
//               </Box>
//             </Stack>
//           </Paper>
//         </Grid>
//         <Grid size={{ xs: 12, md: 4 }}>
//           <Paper
//             elevation={0}
//             sx={{ p: 3, border: "1px solid #e8eaf0", borderRadius: 3 }}
//           >
//             <Typography variant="h6"  sx={{ mb: 2,fontWeight:700 }}>
//               Product Information
//             </Typography>
//             <Stack spacing={2}>
//               <Box>
//                 <Typography variant="caption" color="text.secondary">
//                   Category
//                 </Typography>
//                 <Typography sx={{fontWeight:600}}>{item.category}</Typography>
//               </Box>
//               <Box>
//                 <Typography variant="caption" color="text.secondary">
//                   Warehouse Location
//                 </Typography>
//                 <Typography sx={{fontWeight:600}}>{item.location}</Typography>
//               </Box>
//               <Box>
//                 <Typography variant="caption" color="text.secondary">
//                   Reorder Level
//                 </Typography>
//                 <Typography sx={{ fontWeight:600 }}>{item.reorderLevel}</Typography>
//               </Box>
//               <Box>
//                 <Typography variant="caption" color="text.secondary">
//                   Stock Status
//                 </Typography>
//                 <Box sx={{ mt: 1 }}>
//                   <StockStatusChip status={item.stockStatus} />
//                 </Box>
//               </Box>
//             </Stack>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }


// features/Warehouse/pages/InventoryDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useInventoryDetails } from "../../../Hooks/UseInventoryDetails";
export default function InventoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } =
    useInventoryDetails(id);
  if (isLoading) {
    return (
      <Box sx={{display:"flex", justifyContent:"center" ,p:5}}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError || !data?.data) {
    return (
      <Alert
        severity="error"
        action={<Button onClick={() => refetch()}>Retry</Button>}
      >
        Unable to load product details or inventory information.
      </Alert>
    );
  }
  const product = data.data;
  const stock = product.stock;
  return (
    <Box>
      <Button onClick={() => navigate("/warehouse/inventory")}>
        Back to Inventory
      </Button>
      <Typography variant="h4" sx={{fontWeight:700 ,mt:2 ,mb:3}}>
        {product.title}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography>
            **Category:** {product.category}
          </Typography>
          <Typography>
            **Product ID:** {product._id}
          </Typography>
          <Typography>
            **Price:** {product.price}
          </Typography>
          <Typography>
            **Catalog Quantity:** {product.quantity}
          </Typography>
          <Typography variant="h6" sx={{mt:2}}>
            Live Inventory
          </Typography>
          {stock ? (
            <>
              <Typography>
                **Available:** {stock.available ? "Yes" : "No"}
              </Typography>
              <Typography variant="h4" sx={{fontWeight:700}}>
                {stock.quantity}
              </Typography>
              <Alert severity={stock.available ? "success" : "warning"}>
                {stock.message}
              </Alert>
            </>
          ) : (
            <Alert severity="warning">
              Live stock information was not returned.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}