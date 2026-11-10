import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/warehouse",
    icon: <DashboardOutlinedIcon />,
  },
  {
    label: "Inventory",
    path: "/warehouse/inventory",
    icon: <Inventory2OutlinedIcon />,
  },
  {
    label: "Stock Movements",
    path: "/warehouse/movements",
    icon: <SwapHorizOutlinedIcon />,
  },
  {
    label: "Stock Receiving",
    path: "/warehouse/receiving",
    icon: <MoveToInboxOutlinedIcon />,
  },
  {
    label: "Low Stock Alerts",
    path: "/warehouse/low-stock",
    icon: <WarningAmberOutlinedIcon />,
  },
];

interface WarehouseSidebarProps {
  onNavigate?: () => void;
}

export default function WarehouseSidebar({
  onNavigate,
}: WarehouseSidebarProps) {
  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontWeight: 700 }}
      >
        WAREHOUSE MANAGEMENT
      </Typography>
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === "/warehouse"}
            onClick={onNavigate}
            sx={{
              mb: 0.7,
              borderRadius: 2,
              color: "#596579",
              "&.active": {
                bgcolor: "#e9edff",
                color: "#3949ab",
                fontWeight: 700,
              },
              "&:hover": {
                bgcolor: "#f2f4fa",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "inherit",
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                "& .MuiListItemText-primary": {
                  fontSize: 14,
                  fontWeight: 500,
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        Inventory Operations
      </Typography>
    </Box>
  );
}
