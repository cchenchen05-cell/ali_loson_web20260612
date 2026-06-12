import { redis } from "./redis";

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds: number
): Promise<void> {
  await redis.set(key, JSON.stringify(value), ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key);
}

export function cacheKey(...parts: string[]): string {
  return parts.join(":");
}