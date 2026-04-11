import { Redis } from "ioredis";
import "dotenv/config";

// BullMQ + General use
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Publisher — events publish karne ke liye
export const publisher = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Subscriber — events sunne ke liye
export const subscriber = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

export { redis as connection };
export default redis;
