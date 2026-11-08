import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Search,
  ShoppingCartOutlined,
  StorefrontOutlined,
  WarehouseOutlined,
  AdminPanelSettingsOutlined,
  LogoutOutlined,
  LoginOutlined,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../Store/AuthStore";

interface StoreNavbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  cartItemCount?: number;
}

export default function StoreNavbar({
  searchValue = "",
  onSearchChange = () => {},
  cartItemCount = 0,
}: StoreNavbarProps) {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const fullName = useAuthStore((state) => state.full_name);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 72, md: 84 },
            gap: { xs: 1.5, md: 3 },
            justifyContent: "space-between",
          }}
        >
          {/* Store logo and name */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <StorefrontOutlined sx={{ fontSize: 34 }} />

            <Typography
              variant="h5"
              component="span"
              sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              ShopEase
            </Typography>
          </Box>

          {/* Main navigation links */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              Home
            </Button>

            <Button
              component={RouterLink}
              to="/products"
              color="inherit"
              sx={{ color: "text.primary", fontWeight: 500 }}
            >
              Products
            </Button>

            {/* Role specific quick-links */}
            {role === "manager" && (
              <Button
                component={RouterLink}
                to="/warehouse"
                variant="outlined"
                color="secondary"
                startIcon={<WarehouseOutlined />}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Warehouse
              </Button>
            )}

            {role === "admin" && (
              <Button
                component={RouterLink}
                to="/admin"
                variant="outlined"
                color="primary"
                startIcon={<AdminPanelSettingsOutlined />}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Admin Panel
              </Button>
            )}
          </Box>

          {/* Search field */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              maxWidth: 380,
              minWidth: 100,
              px: 1.5,
              py: 0.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "action.hover",
              "&:focus-within": {
                borderColor: "primary.main",
              },
            }}
          >
            <Search color="action" />

            <InputBase
              placeholder="Search products..."
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              inputProps={{ "aria-label": "Search products" }}
              sx={{
                ml: 1,
                flex: 1,
                fontSize: 14,
              }}
            />
          </Box>

          {/* Right Action Icons: Cart & Auth */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              aria-label="Shopping cart"
              onClick={() => navigate("/cart")}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartOutlined />
              </Badge>
            </IconButton>

            {token ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={fullName || role || "User"}
                  size="small"
                  color={role === "manager" ? "secondary" : role === "admin" ? "primary" : "default"}
                  variant="outlined"
                  sx={{ display: { xs: "none", sm: "inline-flex" } }}
                />
                <IconButton
                  aria-label="Logout"
                  title="Logout"
                  color="error"
                  onClick={handleLogout}
                >
                  <LogoutOutlined />
                </IconButton>
              </Box>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                startIcon={<LoginOutlined />}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
