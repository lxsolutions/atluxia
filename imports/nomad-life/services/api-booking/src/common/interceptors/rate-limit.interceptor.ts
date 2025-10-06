import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private store: RateLimitStore = {};
  private readonly config: RateLimitConfig;

  constructor() {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per 15 minutes
      message: 'Too many requests, please try again later.',
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get client identifier (IP address or user ID)
    const identifier = this.getIdentifier(request);
    
    // Check rate limit
    const isRateLimited = this.checkRateLimit(identifier);
    
    if (isRateLimited) {
      throw new HttpException(
        this.config.message,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Set rate limit headers
    this.setRateLimitHeaders(response, identifier);

    return next.handle().pipe(
      tap(() => {
        // Increment counter after successful request
        this.incrementCounter(identifier);
      }),
    );
  }

  private getIdentifier(request: any): string {
    // Use IP address as primary identifier
    const ip = request.ip || 
                request.connection?.remoteAddress ||
                request.socket?.remoteAddress ||
                request.headers['x-forwarded-for']?.split(',')[0] ||
                'unknown';
    
    // For authenticated users, combine with user ID for more granular limits
    const userId = request.user?.id;
    
    return userId ? `${userId}:${ip}` : ip;
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up old entries
    this.cleanupStore(windowStart);

    const entry = this.store[identifier];

    if (!entry) {
      // First request from this identifier
      this.store[identifier] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
      return false;
    }

    // Check if window has reset
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.config.windowMs;
      return false;
    }

    // Check if limit exceeded
    return entry.count >= this.config.max;
  }

  private incrementCounter(identifier: string): void {
    const entry = this.store[identifier];
    if (entry) {
      entry.count++;
    }
  }

  private setRateLimitHeaders(response: any, identifier: string): void {
    const entry = this.store[identifier];
    if (entry) {
      const remaining = Math.max(0, this.config.max - entry.count);
      const resetTime = Math.ceil(entry.resetTime / 1000); // Convert to seconds
      
      response.setHeader('X-RateLimit-Limit', this.config.max);
      response.setHeader('X-RateLimit-Remaining', remaining);
      response.setHeader('X-RateLimit-Reset', resetTime);
    }
  }

  private cleanupStore(windowStart: number): void {
    Object.keys(this.store).forEach(key => {
      const entry = this.store[key];
      if (entry.resetTime < windowStart) {
        delete this.store[key];
      }
    });
  }

  // Method to get current rate limit status (for debugging)
  getStatus(identifier: string): { count: number; resetTime: number; max: number } | null {
    const entry = this.store[identifier];
    if (!entry) return null;
    
    return {
      count: entry.count,
      resetTime: entry.resetTime,
      max: this.config.max,
    };
  }
}