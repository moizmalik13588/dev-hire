import { Redis } from "ioredis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL;

const dummyRedis = {
  get: async () => null,
  set: async () => null,
  setex: async () => null,
  del: async () => null,
  keys: async () => [],
  publish: async () => null,
  subscribe: async () => null,
  unsubscribe: async () => null,
  on: () => {},
};

const createRedis = (url) => {
  if (!url) {
    console.log("⚠️  No REDIS_URL — using dummy Redis");
    return dummyRedis;
  }
  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 500, 2000);
    },
  });
  client.on("connect", () => console.log("✅ Redis connected"));
  client.on("error", (err) => console.error("❌ Redis error:", err.message));
  return client;
};

const redisClient = createRedis(redisUrl);

export const publisher = dummyRedis;
export const subscriber = dummyRedis;
export { redisClient as connection };
export default redisClient;
