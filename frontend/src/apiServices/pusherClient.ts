import Pusher from "pusher-js";
import { getToken } from "./cookie";

/**
 * Factory to create or retrieve Pusher / Soketi client instance
 * Connects to local Soketi container on port 6001 using Pusher protocol v7
 */
export function getPusherClient(): Pusher {
  const token = getToken();

  return new Pusher("app-key", {
    cluster: "mt1",
    wsHost: window.location.hostname || "localhost",
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    authEndpoint: "http://localhost:8000/api/v1/pusher/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
    },
  });
}
