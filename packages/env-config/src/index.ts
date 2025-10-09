import { z } from 'zod';

// Environment configuration schema
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Payments
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Storage
  S3_ENDPOINT: z.string().url().optional().default('http://localhost:9000'),
  S3_ACCESS_KEY_ID: z.string().optional().default('minioadmin'),
  S3_SECRET_ACCESS_KEY: z.string().optional().default('minioadmin'),
  S3_BUCKET_NAME: z.string().optional().default('atluxia'),
  S3_REGION: z.string().optional().default('us-east-1'),
  
  // Redis
  REDIS_URL: z.string().url().optional().default('redis://localhost:6379'),
  
  // Service URLs
  BOOKING_API_URL: z.string().url().optional().default('http://localhost:3009'),
  DRIVERS_API_URL: z.string().url().optional().default('http://localhost:3010'),
  IMMIGRATION_API_URL: z.string().url().optional().default('http://localhost:3011'),
  VEHICLES_API_URL: z.string().url().optional().default('http://localhost:3012'),
  RELAY_URL: z.string().url().optional().default('http://localhost:8080'),
  RELAY_JWT_SECRET: z.string().optional(),
  
  // Feature Flags
  MOCK_PROVIDERS: z.enum(['true', 'false']).optional().default('true'),
  FEATURE_ACTIVITYPUB_ENABLED: z.enum(['true', 'false']).optional().default('false'),
  FEATURE_AI_ROUTER_ENABLED: z.enum(['true', 'false']).optional().default('false'),
  FEATURE_TRUTH_ARCHIVE_ENABLED: z.enum(['true', 'false']).optional().default('true'),
  
  // Logging & Monitoring
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
  SENTRY_DSN: z.string().url().optional(),
  
  // Development
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  DEBUG: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(env: Record<string, string | undefined>): EnvConfig {
  const result = envSchema.safeParse(env);
  
  if (!result.success) {
    const errorMessages = result.error.errors
      .map(error => `${error.path.join('.')}: ${error.message}`)
      .join('\n');
    
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }
  
  return result.data;
}

// Get validated environment config
export function getEnvConfig(): EnvConfig {
  return validateEnv(process.env);
}

// Service-specific configs
export const bookingServiceConfig = envSchema.pick({
  DATABASE_URL: true,
  STRIPE_SECRET_KEY: true,
  STRIPE_WEBHOOK_SECRET: true,
  MOCK_PROVIDERS: true,
  LOG_LEVEL: true,
  NODE_ENV: true,
});

export type BookingServiceConfig = z.infer<typeof bookingServiceConfig>;

export const nomadWebConfig = envSchema.pick({
  NEXTAUTH_URL: true,
  NEXTAUTH_SECRET: true,
  GOOGLE_CLIENT_ID: true,
  GOOGLE_CLIENT_SECRET: true,
  GITHUB_CLIENT_ID: true,
  GITHUB_CLIENT_SECRET: true,
  STRIPE_PUBLISHABLE_KEY: true,
  BOOKING_API_URL: true,
  DRIVERS_API_URL: true,
  IMMIGRATION_API_URL: true,
  VEHICLES_API_URL: true,
  MOCK_PROVIDERS: true,
  LOG_LEVEL: true,
  NODE_ENV: true,
});

export type NomadWebConfig = z.infer<typeof nomadWebConfig>;

export const relayServiceConfig = envSchema.pick({
  DATABASE_URL: true,
  RELAY_JWT_SECRET: true,
  LOG_LEVEL: true,
  NODE_ENV: true,
});

export type RelayServiceConfig = z.infer<typeof relayServiceConfig>;