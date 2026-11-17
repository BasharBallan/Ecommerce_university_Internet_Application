// ======================================================================
// CACHE SERVICE (Upstash Redis Wrapper)
// ======================================================================
// This service provides a clean abstraction layer over Redis operations.
// It includes helper methods for getting, setting, and deleting cached data.
// ======================================================================

const EventEmitter = require("events");
const redis = require("../config/redis");

class CacheService extends EventEmitter {
  // ------------------------------------------------------
  // @desc    Get cached value by key
  // @param   {string} key - Redis key
  // @return  {Promise<any>} - Parsed JSON value or null
  // ------------------------------------------------------
  async get(key) {
    try {
      return await redis.get(key);
    } catch (err) {
      console.error(`Cache GET Error for key [${key}]:`, err);
      return null;
    }
  }

  // ------------------------------------------------------
  // @desc    Set cached value with TTL (default: 60 seconds)
  // @param   {string} key - Redis key
  // @param   {any} value - Value to store (auto JSON stringified)
  // @param   {number} ttl - Expiration time in seconds
  // ------------------------------------------------------
  async set(key, value, ttl = 60) {
    try {
      return await redis.set(key, JSON.stringify(value), { ex: ttl });
    } catch (err) {
      console.error(`Cache SET Error for key [${key}]:`, err);
    }
  }

  // ------------------------------------------------------
  // @desc    Delete a single key from cache
  // @param   {string} key - Redis key
  // ------------------------------------------------------
  async del(key) {
    try {
      const res = await redis.del(key);
      this.emit("invalidated", key);
      return res;
    } catch (err) {
      console.error(`Cache DEL Error for key [${key}]:`, err);
    }
  }

  // ------------------------------------------------------
  // @desc    Delete multiple keys from cache
  // @param   {string[]} keys - Array of Redis keys
  // ------------------------------------------------------
  async delMany(keys = []) {
    try {
      if (!Array.isArray(keys) || keys.length === 0) return;
      for (const key of keys) {
        await redis.del(key);
        this.emit("invalidated", key);
      }
    } catch (err) {
      console.error("Cache DELMANY Error:", err);
    }
  }

  // ------------------------------------------------------
  // @desc    Delete all keys matching pattern (e.g. "products:list:*")
  // @param   {string} pattern
  // ------------------------------------------------------
  async delByPattern(pattern) {
    try {
      if (typeof redis.keys === "function") {
        const matchedKeys = await redis.keys(pattern);
        if (Array.isArray(matchedKeys) && matchedKeys.length > 0) {
          for (const key of matchedKeys) {
            await redis.del(key);
            this.emit("invalidated", key);
          }
          console.log(`🧹 [CacheService] Purged ${matchedKeys.length} key(s) matching [${pattern}]`);
        }
      }
      this.emit("invalidatedPattern", pattern);
    } catch (err) {
      console.error(`Cache delByPattern Error for [${pattern}]:`, err);
    }
  }
}

module.exports = new CacheService();
