import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getSession(sessionId: string) {
  return await redis.get(`session:${sessionId}`);
}

export async function updateSession(sessionId: string, data: any) {
  // 30 minute TTL for sessions
  await redis.set(`session:${sessionId}`, data, { ex: 1800 });
}
