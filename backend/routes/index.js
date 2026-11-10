
const authRoute = require("../modules/user/authRoute");
const orderRoute = require("../modules/order/orderRoute");
const healthRoute = require("../modules/health/healthRoute");
const productRoute = require("../modules/product/productRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/", healthRoute);
  app.use("/api/v1/orders", orderRoute);
  app.use("/api/v1/products", productRoute);
};

module.exports = mountRoutes;
