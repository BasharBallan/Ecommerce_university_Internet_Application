
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
// } from "@mui/material";

// import { ProductionQuantityLimitsOutlined } from "@mui/icons-material";
// import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
// import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

// const stats = [
//   {
//     title: "Total Products",
//     value: "—",
//     description: "Products in the store",
//     icon: <Inventory2OutlinedIcon fontSize="large" />,
//   },
//   {
//     title: "Available Stock ",
//     value: "—",
//     description: "",
//     icon: <ShoppingBagOutlinedIcon fontSize="large" />,
//   },
//   {
//     title: "Out Of Stock ",
//     value: "—",
//     description: "Registered customers",
//     icon: <ProductionQuantityLimitsOutlined fontSize="large" />,
//   },
// ];

// export default function ManagerDashboardPage() {
//   return (
//     <Box>
//       <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
//         Dashboard
//       </Typography>

//       <Typography color="text.secondary" sx={{ mb: 4 }}>
//         Welcome to your inventory  administration panel.
//       </Typography>

//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: {
//             xs: "1fr",
//             sm: "repeat(2, 1fr)",
//             lg: "repeat(3, 1fr)",
//           },
//           gap: 3,
//         }}
//       >
//         {stats.map((stat) => (
//           <Card
//             key={stat.title}
//             elevation={0}
//             sx={{
//               border: "1px solid #e8eaf0",
//               borderRadius: 3,
//             }}
//           >
//             <CardContent sx={{ p: 3 }}>
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography color="text.secondary" variant="body2">
//                   {stat.title}
//                 </Typography>

//                 {stat.icon}
//               </Box>

//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 {stat.value}
//               </Typography>

//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 sx={{ mt: 1 }}
//               >
//                 {stat.description}
//               </Typography>
//             </CardContent>
//           </Card>
//         ))}
//       </Box>

//       <Card
//         elevation={0}
//         sx={{
//           mt: 4,
//           p: 3,
//           border: "1px solid #e8eaf0",
//           borderRadius: 3,
//         }}
//       >
//         <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
//           Getting started
//         </Typography>

//         <Typography color="text.secondary">
//           Use the sidebar to manage products and review products and stock.
//           Dashboard statistics will be connected to the API when the
//           required endpoints are available.
//         </Typography>
//       </Card>
//     </Box>
//   );
// }



import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { mockInventory, mockMovements } from "../data/mockInventory";
import { CheckCircleOutlined } from "@mui/icons-material";
import StatCard from "../components/StatCard";
import StockStatusChip from "../components/StockStatusChip";

export default function WarehouseDashboard() {
  const total = mockInventory.reduce(
    (sum, item) => sum + item.totalQuantity, 0
  );
  const reserved = mockInventory.reduce(
    (sum, item) => sum + item.reservedQuantity, 0
  );
  const available = mockInventory.reduce(
    (sum, item) => sum + item.availableQuantity, 0
  );
  const alerts = mockInventory.filter(
    (item) =>
      item.stockStatus === "low_stock" ||
      item.stockStatus === "out_of_stock"
  ).length;
  const statusCounts = [
    {
      label: "In Stock",
      count: mockInventory.filter((i) => i.stockStatus === "in_stock").length,
      color: "#16a34a",
    },
    {
      label: "Low Stock",
      count: mockInventory.filter((i) => i.stockStatus === "low_stock").length,
      color: "#d97706",
    },
    {
      label: "Out of Stock",
      count: mockInventory.filter((i) => i.stockStatus === "out_of_stock").length,
      color: "#dc2626",
    },
    {
      label: "Reserved",
      count: mockInventory.filter((i) => i.stockStatus === "reserved").length,
      color: "#2563eb",
    },
  ];
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{fontWeight:700}}>
          Warehouse Dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Monitor inventory levels and warehouse operations.
        </Typography>
      </Box>
      <Grid container spacing={4.5 } sx={{ my:2 ,justifySelf:'center'}}>
        <Grid size={{ xs: 12, sm: 6,md:5.7, xl: 3 }}>
          <StatCard
            title="Total Quantity"
            value={total.toLocaleString()}
            subtitle="Units in warehouse"
            icon={<Inventory2OutlinedIcon />}
            color="#2563eb"
            background="#eff6ff"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6,md:5.7, xl: 3 }}>
          <StatCard
            title="Reserved Quantity"
            value={reserved.toLocaleString()}
            subtitle="Units reserved for orders"
            icon={<LockOutlinedIcon />}
            color="#d97706"
            background="#fff7ed"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6,md:5.7, xl: 3 }}>
          <StatCard
            title="Available Quantity"
            value={available.toLocaleString()}
            subtitle="Units available for orders"
            icon={<CheckCircleOutlined />}
            color="#16a34a"
            background="#f0fdf4"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6,md:5.7, xl: 3 }}>
          <StatCard
            title="Stock Alerts"
            value={alerts}
            subtitle="Products requiring attention"
            icon={<WarningAmberOutlinedIcon />}
            color="#dc2626"
            background="#fef2f2"
          />
        </Grid>
      </Grid>
      <Grid container direction={{md:'row' }} spacing={2.5} sx={{ my: 1.5 ,justifyContent:'center'}}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid #e8eaf0", borderRadius: 3}}
          >
            <Typography variant="h6"  sx={{ mb: 3,fontWeight:700 }}>
              Stock Status Overview
            </Typography>
            <Stack spacing={2.5}>
              {statusCounts.map((item) => (
                <Box key={item.label}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{fontWeight:600}}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.count} products
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.count / mockInventory.length) * 100}
                    sx={{
                      height: 9,
                      borderRadius: 5,
                      bgcolor: "#edf0f5",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: item.color,
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid #e8eaf0", borderRadius: 3 }}
          >
            <Typography variant="h6"  sx={{ mb: 2 ,fontWeight:700}}>
              Recent Stock Movements
            </Typography>
            <Stack spacing={2}>
              {mockMovements.slice(0, 4).map((movement) => (
                <Box
                  key={movement.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    pb: 1.5,
                    borderBottom: "1px solid #edf0f5",
                  }}
                >
                  <Box>
                    <Typography sx={{fontWeight:600}}>
                      {movement.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movement.reference} · {movement.date}
                    </Typography>
                  </Box>
                  <Typography
                   sx={{  fontWeight:700}}
                    color={
                      movement.type === "in"
                        ? "success.main"
                        : movement.type === "out"
                        ? "error.main"
                        : "warning.main"
                    }
                  >
                    {movement.type === "in" ? "+" : movement.type === "out" ? "-" : "±"}
                    {movement.quantity}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Paper
        elevation={0}
        sx={{ mt: 2.5, p: 3, border: "1px solid #e8eaf0", borderRadius: 3 }}
      >
        <Typography variant="h6"  sx={{ mb: 2 ,fontWeight:700}}>
          Products Requiring Attention
        </Typography>
        <Stack spacing={2}>
          {mockInventory
            .filter((item) => item.stockStatus !== "in_stock")
            .map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{fontWeight:600}}>{item.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available: {item.availableQuantity} {item.unit}
                  </Typography>
                </Box>
                <StockStatusChip status={item.stockStatus} />
              </Box>
            ))}
        </Stack>
      </Paper>
    </Box>
  );
}