import type { H3Event } from "h3"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "10 m"),
  analytics: true,
})

function getClientKey(event: H3Event) {
  const apiKey = getRequestHeader(event, "x-api-key")
  if (apiKey)
    return `cli:${apiKey}`
  return getRequestHeader(event, "x-forwarded-for") || event.node.req.socket.remoteAddress || "anonymous"
}

export default defineEventHandler(async (event) => {
  const key = getClientKey(event)
  const { success, limit, remaining, reset } = await ratelimit.limit(key)

  event.context.rateLimit = { limit, remaining, reset }
  if (!success) {
    event.node.res.statusCode = 429
    return { statusCode: 429, message: "Too many requests – please wait a few seconds.", limit, remaining, reset }
  }
})
