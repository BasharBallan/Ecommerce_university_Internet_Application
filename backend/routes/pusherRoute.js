// routes/pusherRoute.js
const express = require('express');
const router = express.Router();
const pusher = require('../config/pusher');
const orderRepository = require('../modules/order/orderRepository');
const { protect, allowedTo } = require('../modules/user/authService');
const ApiError = require('../utils/apiError');

/**
 * Pusher / Soketi Private Channel Authentication Endpoint
 * Verifies User Identity (Authentication via protect) and Permissions (Authorization via allowedTo):
 * - 'private-admin': Strictly restricted to 'admin' and 'manager' via authService.allowedTo('admin', 'manager')
 * - 'private-order-<orderId>': Strictly restricted to the order owner or admin (Ownership Authorization)
 * - 'private-user-<userId>': Strictly restricted to the user themselves or admin
 */
router.post(
  '/auth',
  express.urlencoded({ extended: true }),
  express.json(),
  (req, res, next) => {
    // Fallback: If Authorization header missing but cookie present, populate header for protect
    if (!req.headers.authorization && req.cookies && req.cookies.token) {
      req.headers.authorization = `Bearer ${req.cookies.token}`;
    }
    next();
  },
  protect,
  async (req, res, next) => {
    try {
      const socketId = req.body.socket_id;
      const channelName = req.body.channel_name;

      if (!socketId || !channelName) {
        return next(new ApiError('socket_id and channel_name are required', 400));
      }

      // 1. Channel 'private-admin': Only Admin or Manager via allowedTo from authService.js
      if (channelName === 'private-admin') {
        return allowedTo('admin', 'manager')(req, res, (err) => {
          if (err) return next(err);
          const authResponse = pusher.authorizeChannel(socketId, channelName);
          return res.send(authResponse);
        });
      }

      // 2. Channel 'private-order-<orderId>': Only Order Owner or Admin (Ownership Authorization)
      if (channelName.startsWith('private-order-')) {
        const orderId = channelName.replace('private-order-', '');
        const order = await orderRepository.findById(orderId, true);
        if (!order) {
          return next(new ApiError(`Order #${orderId} not found`, 404));
        }

        const orderOwnerId = order.user._id ? order.user._id.toString() : order.user.toString();
        const isOwner = orderOwnerId === req.user._id.toString();
        const isAdmin = ['admin', 'manager'].includes(req.user.role);

        if (!isOwner && !isAdmin) {
          return next(new ApiError("Forbidden: You cannot track another customer's order", 403));
        }
      }

      // 3. Channel 'private-user-<userId>': Only User themselves or Admin
      if (channelName.startsWith('private-user-')) {
        const targetUserId = channelName.replace('private-user-', '');
        const isSelf = targetUserId === req.user._id.toString();
        const isAdmin = ['admin', 'manager'].includes(req.user.role);

        if (!isSelf && !isAdmin) {
          return next(new ApiError('Forbidden: Unauthorized user channel', 403));
        }
      }

      // Generate Pusher authorization signature
      const authResponse = pusher.authorizeChannel(socketId, channelName);
      return res.send(authResponse);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
