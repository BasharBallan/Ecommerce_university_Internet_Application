
const authRoute = require("../modules/user/authRoute");
const orderRoute = require("../modules/order/orderRoute");
const healthRoute = require("../modules/health/healthRoute");
const productRoute = require("../modules/product/productRoute");
const pusherRoute = require("./pusherRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/", healthRoute);
  app.use("/api/v1/orders", orderRoute);
  app.use("/api/v1/products", productRoute);
  app.use("/api/v1/pusher", pusherRoute);
  app.use("/pusher", pusherRoute); // convenient fallback
};

module.exports = mountRoutes;
