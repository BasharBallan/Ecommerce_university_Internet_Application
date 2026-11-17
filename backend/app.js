const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const langMiddleware = require('./middlewares/langMiddleware');
 const mountRoutes = require('./routes');
 const ApiError = require('./utils/apiError');
 const globalError = require('./middlewares/errorMiddleware');
 const { getHealthStatus } = require("./modules/health/healthService");

// Winston Logging Middlewares
const correlationId = require("./middlewares/correlationId");
const requestLogger = require("./middlewares/requestLogger");
const errorLogger = require("./middlewares/errorLogger");

const app = express();

// ------------------------------------------------------
// Inject io BEFORE any routes
// ------------------------------------------------------
app.use((req, res, next) => {
  req.io = global.io;
  next();
});


app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());

// Compress responses
app.use(compression());

// helmet Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Body parser
app.use(express.json({ limit: '20kb' }));

// Safe static uploads setup (Skipped on Vercel to prevent EROFS errors)
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'uploads')));
  app.use("/uploads", express.static("uploads"));
}
// Cookie parser
app.use(cookieParser());

// Add Correlation ID FIRST
app.use(correlationId);

// Log every request (Winston)
app.use(requestLogger);

// Morgan (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50000, // Elevated for high-concurrency load testing
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ['price', 'sold', 'quantity', 'ratingsAverage', 'ratingsQuantity'],
  })
);

// Custom language middleware
app.use(langMiddleware);
// Swagger
const { swaggerUi, swaggerSpec } = require("./swagger");
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------------------------------------------
// Mount routes
// ------------------------------------------------------
mountRoutes(app);

// ------------------------------------------------------
// Health Check Endpoint (Real-time DB / Redis / RabbitMQ Status)
// ------------------------------------------------------
app.get("/health", async (req, res) => {
  const health = await getHealthStatus();
  const statusCode = health.status === "UP" ? 200 : 503;
  res.status(statusCode).json(health);
});

// ------------------------------------------------------
// 404 Handler - Unhandled Routes
// ------------------------------------------------------
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// ------------------------------------------------------
// Global Error Logging Middleware (Winston)
// ------------------------------------------------------
app.use(errorLogger);

// ------------------------------------------------------
// Global Error Handling Middleware (Express)
// ------------------------------------------------------
app.use(globalError);

module.exports = app;
