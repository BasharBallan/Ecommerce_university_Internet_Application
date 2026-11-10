const asyncHandler = require('express-async-handler');
const orderService = require('./orderService');

/**
 * ======================================================================
 * ORDER CONTROLLER (HTTP Presentation Layer)
 * ======================================================================
 * Responsible ONLY for parsing HTTP requests, passing data to OrderService,
 * and formatting HTTP responses.
 * ======================================================================
 */

// ------------------------------------------------------
// @desc    Get all orders (Admin only)
// @route   GET /api/v1/orders
// @access  Private/Admin
// ------------------------------------------------------
const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// ------------------------------------------------------
// @desc    Get specific order by ID
// @route   GET /api/v1/orders/:id
// @access  Private/User-Admin
// ------------------------------------------------------
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id, req.user);

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

// ------------------------------------------------------
// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private/User
// ------------------------------------------------------
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// ------------------------------------------------------
// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private/User
// ------------------------------------------------------
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;
  const order = await orderService.createOrder(req.user._id, orderItems);

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// ------------------------------------------------------
// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin-User
// ------------------------------------------------------
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const updatedOrder = await orderService.updateOrderStatus(
    req.params.id,
    orderStatus,
    req.user
  );

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder,
    },
  });
});

module.exports = {
  getOrders,
  getOrder,
  getMyOrders,
  createOrder,
  updateOrderStatus,
};

