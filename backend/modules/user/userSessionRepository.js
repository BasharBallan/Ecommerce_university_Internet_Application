const UserSession = require('./models/userSessionModel');

// ======================================================================
// USER SESSION REPOSITORY (MongoDB Session Persistence Layer)
// Encapsulates device session management, multi-device logins & invalidation.
// ======================================================================
class UserSessionRepository {
  // ======================================================================
  // CREATE OPERATION (New Session Record)
  // ======================================================================
  /**
   * Persist a new user session document.
   * @param {Object} sessionData
   * @returns {Promise<Object>}
   */
  async create(sessionData) {
    return await UserSession.create(sessionData);
  }

  // ======================================================================
  // QUERY & RETRIEVAL OPERATIONS (Find by Session ID or User ID)
  // ======================================================================
  /**
   * Find a session by its ID with populated user data.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return await UserSession.findById(id).populate('user').exec();
  }

  /**
   * Find all active sessions belonging to a specific user.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return await UserSession.find({ user: userId }).exec();
  }

  // ======================================================================
  // DELETE & INVALIDATION OPERATIONS (Logout, Invalidate All, Expired Cleanup)
  // ======================================================================
  /**
   * Delete a single session by its ID (Single device logout).
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    return await UserSession.findByIdAndDelete(id).exec();
  }

  /**
   * Delete all sessions for a specific user (Logout from all devices).
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async deleteByUserId(userId) {
    return await UserSession.deleteMany({ user: userId }).exec();
  }

  /**
   * Cleanup and remove all expired sessions from the database.
   * @returns {Promise<Object>}
   */
  async deleteExpired() {
    return await UserSession.deleteMany({ expiresAt: { $lt: new Date() } }).exec();
  }
}

module.exports = new UserSessionRepository();
