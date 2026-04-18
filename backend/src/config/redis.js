import "dotenv/config";

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

console.log("⚠️  Redis disabled in production");

export const publisher = dummyRedis;
export const subscriber = dummyRedis;
export { dummyRedis as connection };
export default dummyRedis;
