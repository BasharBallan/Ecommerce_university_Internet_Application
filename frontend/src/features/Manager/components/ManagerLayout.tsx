
// import {
//   AppBar,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Toolbar,
//   Typography,
// } from "@mui/material";

// import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
// import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
// import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
// import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

// import { NavLink, Outlet, useNavigate } from "react-router-dom";
// import { useAuthStore } from "../../../Store/AuthStore";

// const drawerWidth = 250;

// const menuItems = [
//   {
//     label: "Dashboard",
//     path: "/manager",
//     icon: <DashboardOutlinedIcon />,
//   },
//   {
//     label: "Products",
//     path: "/manager/products",
//     icon: <Inventory2OutlinedIcon />,
//   },
//   {
//     label: "Stock Reservation",
//     path: "/manager/reservation",
//     icon: <ShoppingBagOutlinedIcon />,
//   },
// ];

// export default function ManagerLayout() {
//   const navigate = useNavigate();

//   const fullName = useAuthStore((state) => state.full_name);
//   // const role = useAuthStore((state) => state.role);
// const role = useAuthStore((state) => state.role)
//   const token = useAuthStore((state) => state.token);
//   const logout = useAuthStore((state) => state.logout);
//   console.log("Manager auth debug:", {
//   token,
//   role,
//   fullName,
// });

//   if (
//     // !token ||
//      role !== "manager") {
//     return (
//       <Box sx={{ p: 4 }}>
//         <Typography variant="h5" gutterBottom>
//           Access denied
//         </Typography>

//         <Typography color="text.secondary" sx={{ mb: 2 }}>
//           You must sign in with an manager account to access this page.
//         </Typography>

//         <Button
//           variant="contained"
//           onClick={() => navigate("/login")}
//         >
//           Go to login
//         </Button>
//       </Box>
//     );
//   }

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fc" }}>
//       <AppBar
//         position="fixed"
//         elevation={0}
//         sx={{
//           zIndex: (theme) => theme.zIndex.drawer + 1,
//           bgcolor: "#ffffff",
//           color: "#172033",
//           borderBottom: "1px solid #e8eaf0",
//         }}
//       >
//         <Toolbar sx={{ justifyContent: "space-between" }}>
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             Inventory . Manager
//           </Typography>

//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <Typography variant="body2" color="text.secondary">
//               {fullName ?? "Manager"}
//             </Typography>

//             <Button
//               color="inherit"
//               startIcon={<LogoutOutlinedIcon />}
//               onClick={handleLogout}
//             >
//               Logout
//             </Button>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer
//         variant="permanent"
//         sx={{
//           width: drawerWidth,
//           flexShrink: 0,
//           "& .MuiDrawer-paper": {
//             width: drawerWidth,
//             boxSizing: "border-box",
//             borderRight: "1px solid #e8eaf0",
//             bgcolor: "#ffffff",
//           },
//         }}
//       >
//         <Toolbar />

//         <Box sx={{ px: 2, py: 3 }}>
//           <Typography variant="overline" color="text.secondary">
//             MANAGEMENT
//           </Typography>

//           <List sx={{ mt: 1 }}>
//             {menuItems.map((item) => (
//               <ListItemButton
//                 key={item.path}
//                 component={NavLink}
//                 to={item.path}
//                 end={item.path === "/admin"}
//                 sx={{
//                   mb: 0.5,
//                   borderRadius: 2,
//                   color: "#596579",
//                   "&.active": {
//                     bgcolor: "#e9edff",
//                     color: "#3949ab",
//                     fontWeight: 700,
//                   },
//                 }}
//               >
//                 <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
//                   {item.icon}
//                 </ListItemIcon>

//                 <ListItemText primary={item.label} />
//               </ListItemButton>
//             ))}
//           </List>

//           <Divider sx={{ my: 2 }} />

//           <Typography variant="caption" color="text.secondary">
//             Inventory Manager
//           </Typography>
//         </Box>
//       </Drawer>

//       <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
//         <Toolbar />

//         <Box sx={{ p: { xs: 2, md: 4 } }}>
//           <Outlet />
//         </Box>
//       </Box>
//     </Box>
//   );
// }



import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../Store/AuthStore";
import WarehouseSidebar from "./WarehouseSidebar";

const drawerWidth = 250;
export default function ManagerLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fullName = useAuthStore((state) => state.full_name);
  // const role = useAuthStore((state) => state.role);
  const role = useAuthStore((state) => state.role)
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  if (
    !token || role !== "manager") {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Access denied
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          You must sign in with a warehouse manager account.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
        >
          Go to login
        </Button>
      </Box>
    );
  }
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const sidebar = (
    <WarehouseSidebar
      onNavigate={() => setMobileOpen(false)}
    />
  );
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f7f8fc",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "#ffffff",
          color: "#172033",
          borderBottom: "1px solid #e8eaf0",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuOutlinedIcon />
            </IconButton>
            <Typography variant="h6" sx={{fontWeight:700}}>
              ShopEase · Warehouse
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {fullName ?? "Warehouse Manager"}
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutOutlinedIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e8eaf0",
            bgcolor: "#ffffff",
          },
        }}
      >
        <Toolbar />
        {sidebar}
      </Drawer>
      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#ffffff",
          },
        }}
      >
        <Toolbar />
        {sidebar}
      </Drawer>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

