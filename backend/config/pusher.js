// config/pusher.js
const Pusher = require("pusher");
const dotenv = require("dotenv");

// Ensure environment variables are loaded
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "config.env.test" });
} else {
  dotenv.config({ path: "config.env" });
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "app-id",
  key: process.env.PUSHER_APP_KEY || "app-key",
  secret: process.env.PUSHER_APP_SECRET || "app-secret",
  host: process.env.PUSHER_HOST || (process.env.NODE_ENV === "test" ? "127.0.0.1" : "soketi"),
  port: process.env.PUSHER_PORT || "6001",
  useTLS: false,
});

module.exports = pusher;
