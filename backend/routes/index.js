
const authRoute = require("../modules/user/authRoute");

const healthRoute = require("../modules/health/healthRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/", healthRoute);

};

module.exports = mountRoutes;
