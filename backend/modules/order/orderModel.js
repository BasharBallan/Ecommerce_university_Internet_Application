const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    orderItems: [
      {
        product: {
          type: String,
          required: [true, 'Order item must have a product ID'],
        },
        title: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: [true, 'Product price is required'],
        },
      },
    ],
    totalOrderPrice: {
      type: Number,
      required: [true, 'Total order price is required'],
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'ready', 'cancelled', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
