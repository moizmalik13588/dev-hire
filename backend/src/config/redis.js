import { Redis } from 'ioredis'
import 'dotenv/config'

const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
})

export const publisher = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
})

export const subscriber = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
})

redisClient.on('connect', () => console.log('✅ Redis connected'))
redisClient.on('error', (err) => console.error('❌ Redis error:', err))

export { redisClient as connection }
export default redisClient
