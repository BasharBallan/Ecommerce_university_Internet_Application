const Order = require('./orderModel');

// ======================================================================
// ORDER REPOSITORY (MongoDB Data Access Layer)
// Encapsulates data persistence logic and decouples ORM from business rules.
// ======================================================================
class OrderRepository {
  // ======================================================================
  // CREATE OPERATION (New Order Persistence)
  // ======================================================================
  /**
   * Create a new order document in the database.
   * @param {Object} orderData
   * @returns {Promise<Object>}
   */
  async create(orderData) {
    return await Order.create(orderData);
  }

  // ======================================================================
  // QUERY & RETRIEVAL OPERATIONS (Find by ID, User, or Filter)
  // ======================================================================
  /**
   * Find an order by its ID with optional user population.
   * @param {string} id
   * @param {boolean} [populateUser=true]
   * @returns {Promise<Object|null>}
   */
  async findById(id, populateUser = true) {
    let query = Order.findById(id);
    if (populateUser) {
      query = query.populate({
        path: 'user',
        select: 'name email role phone',
      });
    }
    return await query.exec();
  }

  /**
   * Find all orders belonging to a specific user.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Find all orders matching an optional filter.
   * @param {Object} [filter={}]
   * @param {Object} [sort={ createdAt: -1 }]
   * @returns {Promise<Array>}
   */
  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return await Order.find(filter)
      .populate({
        path: 'user',
        select: 'name email role',
      })
      .sort(sort)
      .exec();
  }

  // ======================================================================
  // UPDATE OPERATIONS (Status Updates & Arbitrary Modifications)
  // ======================================================================
  /**
   * Update order status by ID.
   * @param {string} id
   * @param {string} newStatus
   * @returns {Promise<Object|null>}
   */
  async updateStatus(id, newStatus) {
    return await Order.findByIdAndUpdate(
      id,
      { orderStatus: newStatus },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Update an order by ID with arbitrary fields.
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  // ======================================================================
  // DELETE & AGGREGATION OPERATIONS (Removal & Document Counting)
  // ======================================================================
  /**
   * Delete an order by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    return await Order.findByIdAndDelete(id).exec();
  }

  /**
   * Count documents matching a filter.
   * @param {Object} [filter={}]
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    return await Order.countDocuments(filter).exec();
  }
}

module.exports = new OrderRepository();
