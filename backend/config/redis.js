// config/redis.js
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

let client;

const useLocalRedis = process.env.USE_LOCAL_REDIS === "true" || process.env.PREFER_LOCAL_REDIS === "true";
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

let localConnected = false;

// 1. Connect to high-speed In-Memory Local Redis (Docker container tic-redis)
if (useLocalRedis || !url || !token) {
  const { createClient } = require("redis");
  const localClient = createClient({
    url: redisUrl,
  });

  localClient.on("error", (err) => console.error("❌ Local Redis Client Error:", err.message));
  localClient.connect().then(() => {
    console.log(`⚡ High-Speed Local Redis (In-Memory RAM) connected successfully to: ${redisUrl}`);
    localConnected = true;
  }).catch((err) => {
    console.warn("⚠️ Local Redis connection warning:", err.message);
  });

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
} else {
  // 2. Fallback to Cloud Upstash Redis via REST
  const { Redis } = require("@upstash/redis");
  client = new Redis({
    url: url,
    token: token,
  });
  client.ping().then(() => {
    console.log("📦 Cloud Upstash Redis connected successfully via REST!");
  }).catch((err) => {
    console.error("❌ Upstash Redis Connection Error:", err.message);
  });
}

module.exports = client;
