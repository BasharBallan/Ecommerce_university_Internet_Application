import { createBrowserRouter } from "react-router-dom";
import AdminDashboard from "../features/Admin/Pages/AdminDashboard";
import AdminLayout from "../features/Admin/components/AdminLayout";
import AdminOrder from "../features/Admin/components/AdminOrder";
import AdminProduct from "../features/Admin/components/AdminProduct";
import InventoryDetailsPage from "../features/Manager/Pages/InventoryDetailes";
import InventoryPage from "../features/Manager/Pages/InventoryPage";
import ManagerDashboard from "../features/Manager/Pages/ManagerDashboard";
import ManagerLayout from "../features/Manager/components/ManagerLayout";
import MyOrdersPage from "../features/Order/MyOrdersPage";
import OrderDetailsPage from "../features/Order/OrderDetailsPage";
import CartPage from "../features/Store/Pages/CartPage";
import HomePage from "../features/Store/Pages/HomePage";
import ProductsPage from "../features/Store/Pages/ProductPage";
import ProductDetailes from "../features/Store/components/ProductDetailes";
import RegisterPage from "../features/auth/Register";
import LoginPage from "../features/auth/login";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/products",
    element: <ProductsPage />,
  },
  {
    path: "/products/:id",
    element: <ProductDetailes />,
  },
  {
    path: "/orders",
    element: <MyOrdersPage />,
  },
  {
    path: "/orders/:orderId",
    element: <OrderDetailsPage />,
  },

  {
    path: "/cart",
    element: <CartPage />,
  },


  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "products",
        element: <AdminProduct />,
      },
      {
        path: "orders",
        element: <AdminOrder />,
      },

    ],
  },
  {
    path: '/warehouse',
    element: <ManagerLayout />,
    children: [

      {
        index: true,
        element: <ManagerDashboard />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      {
        path: "inventory/:id",
        element: <InventoryDetailsPage />,
      },
    ],
  },



]);
