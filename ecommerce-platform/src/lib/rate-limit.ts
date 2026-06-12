import { redis } from "./redis";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);
  const resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetTime,
  };
}