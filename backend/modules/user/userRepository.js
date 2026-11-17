const User = require('./models/userModel');

// ======================================================================
// USER REPOSITORY (MongoDB Data Access Layer)
// Encapsulates user entity persistence and database query logic.
// ======================================================================
class UserRepository {
  // ======================================================================
  // CREATE OPERATION (New User Persistence)
  // ======================================================================
  /**
   * Create a new user document.
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async create(userData) {
    return await User.create(userData);
  }

  // ======================================================================
  // QUERY & LOOKUP OPERATIONS (ID, Email, OAuth, Verification Tokens)
  // ======================================================================
  /**
   * Find a user by their ID.
   * @param {string} id
   * @param {string} [select='']
   * @returns {Promise<Object|null>}
   */
  async findById(id, select = '') {
    let query = User.findById(id);
    if (select) {
      query = query.select(select);
    }
    return await query.exec();
  }

  /**
   * Find a user by their email address.
   * @param {string} email
   * @param {string} [select='']
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email, select = '') {
    let query = User.findOne({ email });
    if (select) {
      query = query.select(select);
    }
    return await query.exec();
  }

  /**
   * Find a user by Google ID.
   * @param {string} googleId
   * @returns {Promise<Object|null>}
   */
  async findByGoogleId(googleId) {
    return await User.findOne({ googleId }).exec();
  }

  /**
   * Find a user by email verification code.
   * @param {string} hashedCode
   * @returns {Promise<Object|null>}
   */
  async findByVerificationCode(hashedCode) {
    return await User.findOne({
      emailVerificationCode: hashedCode,
      emailVerificationExpires: { $gt: Date.now() },
    }).exec();
  }

  /**
   * Find a user by password reset token.
   * @param {string} hashedToken
   * @returns {Promise<Object|null>}
   */
  async findByPasswordResetToken(hashedToken) {
    return await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).exec();
  }

  /**
   * Find all users matching a filter.
   * @param {Object} [filter={}]
   * @param {Object} [sort={ createdAt: -1 }]
   * @returns {Promise<Array>}
   */
  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return await User.find(filter).sort(sort).exec();
  }

  // ======================================================================
  // UPDATE OPERATIONS (Profile, Password & Roles)
  // ======================================================================
  /**
   * Update a user document by ID.
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  // ======================================================================
  // DELETE & AGGREGATION OPERATIONS (Account Removal & User Counting)
  // ======================================================================
  /**
   * Delete a user by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    return await User.findByIdAndDelete(id).exec();
  }

  /**
   * Count total users matching a filter.
   * @param {Object} [filter={}]
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    return await User.countDocuments(filter).exec();
  }
}

module.exports = new UserRepository();
