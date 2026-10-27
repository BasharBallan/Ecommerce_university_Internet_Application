import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../features/auth/Register";
import LoginPage from "../features/auth/login";
import HomePage from "../features/Store/Pages/HomePage";
import ProductsPage from "../features/Store/Pages/ProductPage";


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
]);