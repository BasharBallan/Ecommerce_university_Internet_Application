import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../features/auth/Register";
import LoginPage from "../features/auth/login";
import HomePage from "../features/Store/Pages/HomePage";
import ProductsPage from "../features/Store/Pages/ProductPage";
import ProductDetailsPage from "../features/Store/components/ProductDetailes";
import MyOrdersPage from "../features/Order/MyOrdersPage";
import OrderDetailsPage from "../features/Order/OrderDetailsPage";
import CartPage from "../features/Store/Pages/CartPage";


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
  path: "/products/:productId",
  element: <ProductDetailsPage />,
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
}
]);