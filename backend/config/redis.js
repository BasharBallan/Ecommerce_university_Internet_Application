// config/redis.js
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

let client;

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

// Try Upstash Redis if package is installed and credentials exist
let upstashInitialized = false;
try {
  const { Redis } = require("@upstash/redis");
  if (url && token) {
    client = new Redis({
      url: url,
      token: token,
    });
    client.ping().then(() => {
      console.log("📦 Upstash Redis connected successfully via REST!");
    }).catch((err) => {
      console.error("❌ Upstash Redis Connection Error:", err.message);
    });
    upstashInitialized = true;
  }
} catch (e) {
  // @upstash/redis not installed, fallback to local Redis
}

// Fallback to standard redis client (connects to Docker tic-redis container)
if (!upstashInitialized) {
  const { createClient } = require("redis");
  const localClient = createClient({
    url: redisUrl,
  });

  localClient.on("error", (err) => console.error("❌ Redis Client Error:", err.message));
  localClient.connect().then(() => {
    console.log(`📦 Redis connected successfully to: ${redisUrl}`);
  }).catch((err) => {
    console.warn("⚠️ Redis connection warning:", err.message);
  });

  // Wrapper providing same get/set/del interface
  client = {
    get: async (key) => {
      try {
        const val = await localClient.get(key);
        try {
          return val ? JSON.parse(val) : null;
        } catch {
          return val;
        }
      } catch (err) {
        return null;
      }
    },
    set: async (key, val, options) => {
      try {
        const str = typeof val === "string" ? val : JSON.stringify(val);
        if (options && options.ex) {
          return await localClient.set(key, str, { EX: options.ex });
        }
        return await localClient.set(key, str);
      } catch (err) {
        return null;
      }
    },
    del: async (key) => {
      try {
        return await localClient.del(key);
      } catch (err) {
        return null;
      }
    },
    ping: async () => localClient.ping(),
  };
}

module.exports = client;
