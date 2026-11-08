
import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { PeopleOutlined } from "@mui/icons-material";

const stats = [
  {
    title: "Total Products",
    value: "—",
    description: "Products in the store",
    icon: <Inventory2OutlinedIcon fontSize="large" />,
  },
  {
    title: "Total Orders",
    value: "—",
    description: "Orders received",
    icon: <ShoppingBagOutlinedIcon fontSize="large" />,
  },
  {
    title: "Customers",
    value: "—",
    description: "Registered customers",
    icon: <PeopleOutlined fontSize="large" />,
  },
];

export default function AdminDashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        Dashboard
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your store administration panel.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {stats.map((stat) => (
          <Card
            key={stat.title}
            elevation={0}
            sx={{
              border: "1px solid #e8eaf0",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  {stat.title}
                </Typography>

                {stat.icon}
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stat.value}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {stat.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          border: "1px solid #e8eaf0",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          Getting started
        </Typography>

        <Typography color="text.secondary">
          Use the sidebar to manage products and review customer orders.
          Dashboard statistics will be connected to the API when the
          required endpoints are available.
        </Typography>
      </Card>
    </Box>
  );
}
