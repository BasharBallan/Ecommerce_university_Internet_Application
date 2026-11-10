const mongoose = require('mongoose');
const orderRepository = require('./orderRepository');
const ApiError = require('../../utils/apiError');
const cacheService = require('../../utils/cacheService');
const {
  getProduct,
  checkStock,
  reserveStock,
  releaseStock,
} = require('../../utils/grpcInventoryClient');

/**
 * ======================================================================
 * ORDER SERVICE (Business Logic Layer)
 * ======================================================================
 * Strictly decoupled from Controller & Product module (Modular Monolith).
 * Contains pure business logic, calculations, inventory reservations,
 * and database interactions via repository.
 * ======================================================================
 */
class OrderService {
  /**
   * Get all orders (Admin only)
   */
  async getAllOrders() {
    return await orderRepository.findAll();
  }

  /**
   * Get single order by ID with ownership authorization check
   */
  async getOrderById(id, user) {
    const order = await orderRepository.findById(id, true);
    if (!order) {
      throw new ApiError(`No order found for id: ${id}`, 404);
    }

    const orderOwnerId = order.user._id ? order.user._id.toString() : order.user.toString();
    if (user.role === 'user' && orderOwnerId !== user._id.toString()) {
      throw new ApiError('Access denied: You are not authorized to view this order', 403);
    }

    return order;
  }

  /**
   * Get orders of currently logged-in user
   */
  async getUserOrders(userId) {
    return await orderRepository.findByUserId(userId);
  }

  /**
   * Create new order with gRPC stock verification & pessimistic reservation
   */
  async createOrder(userId, orderItems) {
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      throw new ApiError('Order items cannot be empty and must be an array', 400);
    }

    // 1. Fetch & Validate every product via gRPC from Laravel MySQL
    const processedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        if (!item.product) {
          throw new ApiError('Each order item must specify a product ID or slug', 400);
        }

        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          throw new ApiError(`Invalid quantity for product '${item.product}'. Must be greater than 0`, 400);
        }

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
          price: productInfo.price,
        };
      })
    );

    // 2. Calculate total order price
    const totalOrderPrice = processedOrderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // 3. Pre-generate planned Order ID for gRPC tracking
    const plannedOrderId = new mongoose.Types.ObjectId();
    const reservedItems = [];

    try {
      // 4. Reserve and deduct stock for each item via gRPC
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
          await Promise.all(
            reservedItems.map((r) =>
              releaseStock(r.product, r.quantity, plannedOrderId.toString())
            )
          );
          throw new ApiError('Inventory reservation failed: Service unavailable', 503);
        }

        if (!reserveRes.success) {
          await Promise.all(
            reservedItems.map((r) =>
              releaseStock(r.product, r.quantity, plannedOrderId.toString())
            )
          );
          throw new ApiError(reserveRes.message, 400);
        }

        reservedItems.push({
          product: productIdStr,
          quantity: item.quantity,
        });
      }

      // 5. Persist order in MongoDB
      const order = await orderRepository.create({
        _id: plannedOrderId,
        user: userId,
        orderItems: processedOrderItems,
        totalOrderPrice,
        orderStatus: 'pending',
      });

      // 6. Decoupled cache invalidation via generic cache service (No product module dependency)
      for (const r of reservedItems) {
        cacheService.del(`product:${r.product}`).catch(() => {});
      }

      // 7. Real-time notification via Socket.io
      if (global.io) {
        global.io.to(userId.toString()).emit('notification', {
          type: 'ORDER_CREATED',
          message: `Your order #${order._id} has been created successfully`,
          order,
        });
      }

      return order;
    } catch (error) {
      if (reservedItems.length > 0) {
        await Promise.all(
          reservedItems.map((r) =>
            releaseStock(r.product, r.quantity, plannedOrderId.toString())
          )
        );
      }
      throw error;
    }
  }

  /**
   * Update order status with automatic warehouse stock refund if cancelled
   */
  async updateOrderStatus(orderId, orderStatus, user) {
    const validStatuses = ['pending', 'ready', 'cancelled', 'rejected'];
    if (!validStatuses.includes(orderStatus)) {
      throw new ApiError(
        `Invalid status '${orderStatus}'. Allowed values: ${validStatuses.join(', ')}`,
        400
      );
    }

    const currentOrder = await orderRepository.findById(orderId, false);
    if (!currentOrder) {
      throw new ApiError(`No order found for this id ${orderId}`, 404);
    }

    if (user.role === 'user') {
      const ownerId = currentOrder.user._id ? currentOrder.user._id.toString() : currentOrder.user.toString();
      if (ownerId !== user._id.toString()) {
        throw new ApiError('Access denied: You are not authorized to modify this order', 403);
      }
      if (orderStatus !== 'cancelled' && orderStatus !== 'rejected') {
        throw new ApiError('Users are only authorized to cancel or reject their orders', 403);
      }
    }

    const isTransitioningToCancelledOrRejected =
      (orderStatus === 'cancelled' || orderStatus === 'rejected') &&
      currentOrder.orderStatus !== 'cancelled' &&
      currentOrder.orderStatus !== 'rejected';

    if (isTransitioningToCancelledOrRejected) {
      try {
        await Promise.all(
          currentOrder.orderItems.map((item) =>
            releaseStock(String(item.product), item.quantity, String(currentOrder._id))
          )
        );
        for (const item of currentOrder.orderItems) {
          cacheService.del(`product:${item.product}`).catch(() => {});
        }
      } catch (err) {
        throw new ApiError('Failed to return stock to warehouse: Inventory service unavailable', 503);
      }
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, orderStatus);

    if (global.io) {
      global.io.to(currentOrder.user.toString()).emit('notification', {
        type: 'ORDER_STATUS_CHANGED',
        message: `Your order #${currentOrder._id} status was updated to: ${orderStatus}`,
        orderId: currentOrder._id,
        status: orderStatus,
      });
    }

    return updatedOrder;
  }
}

module.exports = new OrderService();
