import { Redis } from 'ioredis'
import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production'

// Dummy Redis — production mein requests waste nahi hongi
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
  ping: async () => 'PONG',
}

let redisClient, publisherClient, subscriberClient

if (isProduction) {
  console.log('⚠️  Production mode — Redis disabled (Upstash free tier)')
  redisClient = dummyRedis
  publisherClient = dummyRedis
  subscriberClient = dummyRedis
} else {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })
  publisherClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })
  subscriberClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })

  redisClient.on('connect', () => console.log('✅ Redis connected'))
  redisClient.on('error', (err) => console.error('❌ Redis error:', err.message))
}

export { publisherClient as publisher }
export { subscriberClient as subscriber }
export { redisClient as connection }
export default redisClient
