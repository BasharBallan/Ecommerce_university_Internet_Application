const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const orderRepository = require('./orderRepository');
const ApiError = require('../../utils/apiError');
const {
  getProduct,
  checkStock,
  reserveStock,
  releaseStock,
} = require('../../utils/grpcInventoryClient');

// ======================================================================
// ORDER: GET ALL ORDERS (Admin Only) - Via OrderRepository
// ======================================================================

// ------------------------------------------------------
// @desc    Get list of all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
// ------------------------------------------------------
exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await orderRepository.findAll();

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// ======================================================================
// ORDER: GET SPECIFIC ORDER BY ID - Via OrderRepository
// ======================================================================

// ------------------------------------------------------
// @desc    Get specific order by id
// @route   GET /api/v1/orders/:id
// @access  Private/User-Admin
// ------------------------------------------------------
exports.getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderRepository.findById(id, true);

  if (!order) {
    return next(new ApiError(`No order found for id: ${id}`, 404));
  }

  // Enforce security rule: Regular user can only view their own order
  const orderOwnerId = order.user._id ? order.user._id.toString() : order.user.toString();
  if (req.user.role === 'user' && orderOwnerId !== req.user._id.toString()) {
    return next(
      new ApiError('Access denied: You are not authorized to view this order', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

// ======================================================================
// ORDER: GET LOGGED USER ORDERS - Via OrderRepository
// ======================================================================

// ------------------------------------------------------
// @desc    Get orders for the logged-in user
// @route   GET /api/v1/orders/my-orders
// @access  Private/User
// ------------------------------------------------------
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await orderRepository.findByUserId(req.user._id);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// ======================================================================
// ORDER: CREATE ORDER (Validated via gRPC MySQL Products & Pessimistic Lock)
// ======================================================================

// ------------------------------------------------------
// @desc    Create a new order, query product info & reserve/deduct stock via gRPC, save via OrderRepository
// @route   POST /api/v1/orders
// @access  Private/User
// ------------------------------------------------------
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { orderItems } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return next(new ApiError('Order items cannot be empty and must be an array', 400));
  }

  // 1. Fetch & Validate every product via gRPC from Laravel MySQL
  let processedOrderItems;
  try {
    processedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        if (!item.product) {
          throw new ApiError('Each order item must specify a product ID or slug', 400);
        }

        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          throw new ApiError(`Invalid quantity for product '${item.product}'. Must be greater than 0`, 400);
        }

        // Query product details from MySQL via gRPC
        let productInfo;
        try {
          productInfo = await getProduct(item.product);
        } catch (grpcErr) {
          throw new ApiError(`Inventory service unavailable: ${grpcErr.message}`, 503);
        }

        if (!productInfo || !productInfo.found) {
          throw new ApiError(
            `Product '${item.product}' not found in inventory database`,
            404
          );
        }

        // Validate stock availability
        if (productInfo.quantity < quantity) {
          throw new ApiError(
            `Insufficient stock for '${productInfo.title}'. Requested: ${quantity}, Available: ${productInfo.quantity}`,
            400
          );
        }

        return {
          product: productInfo.id || String(item.product),
          title: productInfo.title,
          quantity,
          price: productInfo.price, // Trusted price from Laravel MySQL database
        };
      })
    );
  } catch (validationErr) {
    return next(validationErr);
  }

  // 2. Calculate total order price using reduce
  const totalOrderPrice = processedOrderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // 3. Pre-generate planned Order ID for gRPC reservation tracking
  const plannedOrderId = new mongoose.Types.ObjectId();
  const reservedItems = [];

  try {
    // 4. Reserve and deduct stock for each item via gRPC using pessimistic locking in Laravel
    for (const item of processedOrderItems) {
      const productIdStr = String(item.product);

      let reserveRes;
      try {
        reserveRes = await reserveStock(
          productIdStr,
          item.quantity,
          plannedOrderId.toString()
        );
      } catch (err) {
        // Rollback any items already reserved
        await Promise.all(
          reservedItems.map((r) =>
            releaseStock(r.product, r.quantity, plannedOrderId.toString())
          )
        );
        return next(
          new ApiError('Inventory reservation failed: Service unavailable', 503)
        );
      }

      if (!reserveRes.success) {
        // Reservation failed (e.g. concurrent conflict or insufficient quantity)
        await Promise.all(
          reservedItems.map((r) =>
            releaseStock(r.product, r.quantity, plannedOrderId.toString())
          )
        );
        return next(new ApiError(reserveRes.message, 400));
      }

      // Successfully reserved
      reservedItems.push({
        product: productIdStr,
        quantity: item.quantity,
      });
    }

    // 5. Persist order in MongoDB using OrderRepository
    const order = await orderRepository.create({
      _id: plannedOrderId,
      user: req.user._id,
      orderItems: processedOrderItems,
      totalOrderPrice,
      orderStatus: 'pending',
    });

    // 6. Real-time notification via Socket.io
    if (global.io) {
      global.io.to(req.user._id.toString()).emit('notification', {
        type: 'ORDER_CREATED',
        message: `Your order #${order._id} has been created successfully`,
        order,
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    if (reservedItems.length > 0) {
      await Promise.all(
        reservedItems.map((r) =>
          releaseStock(r.product, r.quantity, plannedOrderId.toString())
        )
      );
    }
    return next(error);
  }
});

// ======================================================================
// ORDER: UPDATE ORDER STATUS (Admin/User) - Via OrderRepository
// ======================================================================

// ------------------------------------------------------
// @desc    Update order status (pending, ready, cancelled, rejected)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin-User
// ------------------------------------------------------
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus } = req.body;

  const validStatuses = ['pending', 'ready', 'cancelled', 'rejected'];
  if (!validStatuses.includes(orderStatus)) {
    return next(
      new ApiError(
        `Invalid status '${orderStatus}'. Allowed values: ${validStatuses.join(', ')}`,
        400
      )
    );
  }

  const currentOrder = await orderRepository.findById(req.params.id, false);
  if (!currentOrder) {
    return next(new ApiError(`No order found for this id ${req.params.id}`, 404));
  }

  // Authorization check: User can cancel/reject their own order
  if (req.user.role === 'user') {
    const ownerId = currentOrder.user._id ? currentOrder.user._id.toString() : currentOrder.user.toString();
    if (ownerId !== req.user._id.toString()) {
      return next(new ApiError('Access denied: You are not authorized to modify this order', 403));
    }
    if (orderStatus !== 'cancelled' && orderStatus !== 'rejected') {
      return next(new ApiError('Users are only authorized to cancel or reject their orders', 403));
    }
  }

  // Check if order is being transitioned to cancelled or rejected
  const isTransitioningToCancelledOrRejected =
    (orderStatus === 'cancelled' || orderStatus === 'rejected') &&
    currentOrder.orderStatus !== 'cancelled' &&
    currentOrder.orderStatus !== 'rejected';

  // If cancelling or rejecting an active order, release and refund reserved stock back to MySQL warehouse
  if (isTransitioningToCancelledOrRejected) {
    try {
      await Promise.all(
        currentOrder.orderItems.map((item) =>
          releaseStock(String(item.product), item.quantity, String(currentOrder._id))
        )
      );
    } catch (err) {
      console.error(
        `Failed to release stock for order ${currentOrder._id}:`,
        err
      );
      return next(
        new ApiError('Failed to return stock to warehouse: Inventory service unavailable', 503)
      );
    }
  }

  const updatedOrder = await orderRepository.updateStatus(req.params.id, orderStatus);

  if (global.io) {
    global.io.to(currentOrder.user.toString()).emit('notification', {
      type: 'ORDER_STATUS_CHANGED',
      message: `Your order #${currentOrder._id} status was updated to: ${orderStatus}`,
      orderId: currentOrder._id,
      status: orderStatus,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder,
    },
  });
});
