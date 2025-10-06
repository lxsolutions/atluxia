import type { NextAuthOptions } from 'next-auth';
import type { DefaultSession } from 'next-auth';

// Mock providers for now - we'll install actual dependencies later
const GoogleProvider = (config: any) => config;
const GitHubProvider = (config: any) => config;

export interface AtluxiaUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  platform: 'nomad' | 'polyverse' | 'everpath';
  createdAt: Date;
  updatedAt: Date;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.platform = 'nomad'; // Default platform
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.platform = token.platform as 'nomad' | 'polyverse' | 'everpath';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export const authConfig = {
  // Shared auth configuration across platforms
  platforms: ['nomad', 'polyverse', 'everpath'] as const,
  defaultPlatform: 'nomad' as const,
  
  // Session configuration
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export function getAuthUrl(platform: 'nomad' | 'polyverse' | 'everpath'): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api/auth`;
}

export function validatePlatform(platform: string): platform is 'nomad' | 'polyverse' | 'everpath' {
  return ['nomad', 'polyverse', 'everpath'].includes(platform);
}