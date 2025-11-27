import IORedis from 'ioredis';
import config from '../config/config.js';

const TTL = config.contextTTLSeconds || 3600;
let redis = null;
if (config.redis.enabled) {
  redis = new IORedis({ host: config.redis.host, port: config.redis.port });
  redis.on('error', (e) => console.warn('Redis error', e.message));
}

const inMemory = new Map();

export async function pushTurn(sessionId, turn) {
  const key = `ctx:${sessionId}`;
  const serialized = JSON.stringify(turn);
  if (redis) {
    await redis.rpush(key, serialized);
    await redis.expire(key, TTL);
    await redis.ltrim(key, -200, -1);
    return;
  }
  const rec = inMemory.get(sessionId) || { items: [], expiresAt: Date.now() + TTL * 1000 };
  rec.items.push(turn);
  rec.expiresAt = Date.now() + TTL * 1000;
  if (rec.items.length > 200) rec.items = rec.items.slice(-200);
  inMemory.set(sessionId, rec);
}

export async function getContext(sessionId, n = 8) {
  const key = `ctx:${sessionId}`;
  if (redis) {
    const arr = await redis.lrange(key, -n, -1);
    return arr.map(i => JSON.parse(i));
  }
  const rec = inMemory.get(sessionId);
  if (!rec) return [];
  rec.expiresAt = Date.now() + TTL * 1000;
  return rec.items.slice(-n);
}

export async function clearContext(sessionId) {
  const key = `ctx:${sessionId}`;
  if (redis) {
    await redis.del(key);
    return;
  }
  inMemory.delete(sessionId);
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of inMemory.entries()) {
    if (v.expiresAt < now) inMemory.delete(k);
  }
}, 60 * 1000);