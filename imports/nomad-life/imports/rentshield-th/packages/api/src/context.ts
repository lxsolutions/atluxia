
import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { db } from '@rentshield/db';

// Simple in-memory rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function createContext(opts: CreateNextContextOptions) {
  const ip = opts.req.headers['x-forwarded-for'] || opts.req.socket.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    db,
    rateLimit: {
      check: (key: string, limit: number, windowMs: number) => {
        const rateKey = `${ip}:${key}`;
        const current = rateLimitStore.get(rateKey) || { count: 0, resetTime: now + windowMs };
        
        if (current.resetTime < now) {
          current.count = 0;
          current.resetTime = now + windowMs;
        }
        
        current.count++;
        rateLimitStore.set(rateKey, current);
        
        return {
          limited: current.count > limit,
          remaining: Math.max(0, limit - current.count),
          reset: current.resetTime,
        };
      },
    },
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
