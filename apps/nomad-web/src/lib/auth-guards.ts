
import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'
import { UserRole } from '@nomad-life/contracts'

// UserRole values from the Zod schema
const USER_ROLES = {
  GUEST: 'guest',
  TRAVELER: 'traveler', 
  HOST: 'host',
  ADMIN: 'admin'
} as const

/**
 * Middleware to check if user has required role
 */
export async function requireRole(role: UserRole, request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (session.user.role !== role) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  return null // No error, user has required role
}

/**
 * Higher-order function to create role-based API route handlers
 */
export function withRole(role: UserRole, handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const roleCheck = await requireRole(role, request)
    if (roleCheck) {
      return roleCheck
    }
    return handler(request, ...args)
  }
}

/**
 * Check if current user has at least one of the required roles
 */
export async function hasAnyRole(roles: UserRole[], _request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return false
  }

  return roles.includes(session.user.role as UserRole)
}

/**
 * Guard for admin routes
 */
export async function requireAdmin(request: NextRequest) {
  return requireRole(USER_ROLES.ADMIN, request)
}

/**
 * Guard for host routes  
 */
export async function requireHost(request: NextRequest) {
  return requireRole(USER_ROLES.HOST, request)
}

/**
 * Guard for traveler routes
 */
export async function requireTraveler(request: NextRequest) {
  return requireRole(USER_ROLES.TRAVELER, request)
}
