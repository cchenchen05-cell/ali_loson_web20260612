// Redis client mock - replaces actual Redis in development
// In production, replace with ioredis or similar

const store = new Map<string, { value: string; expiry: number | null }>();

// Clean expired keys periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  store.forEach((entry, key) => {
    if (entry.expiry && entry.expiry < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => store.delete(key));
}, 60000);

export const redis = {
  async get(key: string): Promise<string | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiry && entry.expiry < Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    store.set(key, {
      value,
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  },

  async del(key: string): Promise<void> {
    store.delete(key);
  },

  async incr(key: string): Promise<number> {
    const entry = store.get(key);
    const current = entry ? parseInt(entry.value, 10) || 0 : 0;
    const next = current + 1;
    store.set(key, {
      value: String(next),
      expiry: entry?.expiry ?? null,
    });
    return next;
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = store.get(key);
    if (entry) {
      entry.expiry = Date.now() + ttlSeconds * 1000;
    }
  },

  async ttl(key: string): Promise<number> {
    const entry = store.get(key);
    if (!entry || !entry.expiry) return -1;
    const remaining = Math.ceil((entry.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  },
};