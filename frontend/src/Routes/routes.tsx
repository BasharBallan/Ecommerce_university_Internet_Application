import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../features/auth/Register";
import LoginPage from "../features/auth/login";
import HomePage from "../features/Store/Pages/HomePage";
import ProductsPage from "../features/Store/Pages/ProductPage";
import ProductDetailsPage from "../features/Store/components/ProductDetailes";
import MyOrdersPage from "../features/Order/MyOrdersPage";
import OrderDetailsPage from "../features/Order/OrderDetailsPage";
import CartPage from "../features/Store/Pages/CartPage";
import AdminLayout from "../features/Admin/components/AdminLayout";
import AdminProduct from "../features/Admin/components/AdminProduct";
import AdminOrder from "../features/Admin/components/AdminOrder";
import AdminDashboard from "../features/Admin/Pages/AdminDashboard";
import AdminOrdersPage from "../features/Admin/components/AdminOrder";
import ProductDetailes from "../features/Store/components/ProductDetailes";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage  />,
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
//     {
//   path: "orders",
//   element: <AdminOrdersPage />,
// }
  ],
},

]);