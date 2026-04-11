import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { subscriber } from "../config/redis.js";

// userId → WebSocket connection map
const clients = new Map();

const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    // URL se token lo: ws://localhost:5000?token=xxx
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Token required");
      return;
    }

    // Token verify karo
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      ws.close(1008, "Invalid token");
      return;
    }

    // Client register karo
    clients.set(userId, ws);
    console.log(`🔌 WebSocket connected: ${userId}`);

    // Redis subscribe karo is user ke liye
    subscriber.subscribe(`notifications:${userId}`, (err) => {
      if (err) console.error("Subscribe error:", err);
    });

    // Ping — connection alive rakhne ke liye
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Client disconnect
    ws.on("close", () => {
      clients.delete(userId);
      subscriber.unsubscribe(`notifications:${userId}`);
      console.log(`🔌 WebSocket disconnected: ${userId}`);
    });

    ws.on("error", (err) => {
      console.error("WS error:", err);
    });

    // Welcome message
    ws.send(
      JSON.stringify({
        type: "CONNECTED",
        message: "Real-time notifications active ✅",
      }),
    );
  });

  // Redis message aane pe → client ko push karo
  subscriber.on("message", (channel, message) => {
    // channel = "notifications:userId"
    const userId = channel.split(":")[1];
    const client = clients.get(userId);

    if (client && client.readyState === WebSocket.OPEN) {
      client.send(message);
      console.log(`📨 Notification pushed to: ${userId}`);
    }
  });

  // Heartbeat — dead connections hatao
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  console.log("🔌 WebSocket server ready");
  return wss;
};

export default initWebSocket;
