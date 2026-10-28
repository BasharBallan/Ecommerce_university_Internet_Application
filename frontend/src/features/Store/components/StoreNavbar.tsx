import {
  AppBar,
  Badge,
  Box,
  Button,
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
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

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
            gap: { xs: 1.5, md: 4 },
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
              FlyStore
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

            <Button
              component={RouterLink}
              to="/offers"
              color="inherit"
              sx={{ color: "text.primary", fontWeight: 500 }}
            >
              Offers
            </Button>
          </Box>

          {/* Search field */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              maxWidth: 420,
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

          {/* Shopping cart */}
          <IconButton
            aria-label="Shopping cart"
            onClick={() => navigate("/cart")}
          >
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCartOutlined />
            </Badge>
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
