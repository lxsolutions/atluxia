import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { requireRole, withRole, hasAnyRole, requireAdmin, requireHost, requireTraveler } from '../src/lib/auth-guards'

// Mock the auth module
vi.mock('../src/lib/auth', () => ({
  auth: vi.fn(),
}))

import { auth } from '../src/lib/auth'

describe('Auth Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (url = 'http://localhost:3000/test'): NextRequest => {
    return {
      url,
      nextUrl: new URL(url),
    } as NextRequest
  }

  describe('requireRole', () => {
    it('should redirect to signin when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)
      const request = createMockRequest()

      const result = await requireRole('admin', request)

      expect(result).toBeDefined()
      expect(result?.status).toBe(307) // Redirect
      expect(result?.headers.get('location')).toContain('/auth/signin')
    })

    it('should return 403 when user does not have required role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'traveler' }
      })
      const request = createMockRequest()

      const result = await requireRole('admin', request)

      expect(result).toBeDefined()
      expect(result?.status).toBe(403)
      const body = await result?.json()
      expect(body.error).toBe('Insufficient permissions')
    })

    it('should return null when user has required role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'admin' }
      })
      const request = createMockRequest()

      const result = await requireRole('admin', request)

      expect(result).toBeNull()
    })
  })

  describe('withRole', () => {
    it('should execute handler when user has required role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'admin' }
      })
      const request = createMockRequest()
      const mockHandler = vi.fn().mockResolvedValue(new Response('Success'))

      const wrappedHandler = withRole('admin', mockHandler)
      await wrappedHandler(request)

      expect(mockHandler).toHaveBeenCalledWith(request)
    })

    it('should return error when user does not have required role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'traveler' }
      })
      const request = createMockRequest()
      const mockHandler = vi.fn()

      const wrappedHandler = withRole('admin', mockHandler)
      const result = await wrappedHandler(request)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(result?.status).toBe(403)
    })
  })

  describe('hasAnyRole', () => {
    it('should return false when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)
      const request = createMockRequest()

      const result = await hasAnyRole(['admin', 'host'], request)

      expect(result).toBe(false)
    })

    it('should return true when user has one of the required roles', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'host' }
      })
      const request = createMockRequest()

      const result = await hasAnyRole(['admin', 'host'], request)

      expect(result).toBe(true)
    })

    it('should return false when user has none of the required roles', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'traveler' }
      })
      const request = createMockRequest()

      const result = await hasAnyRole(['admin', 'host'], request)

      expect(result).toBe(false)
    })
  })

  describe('role-specific guards', () => {
    it('requireAdmin should check for admin role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'admin' }
      })
      const request = createMockRequest()

      const result = await requireAdmin(request)

      expect(result).toBeNull()
    })

    it('requireHost should check for host role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'host' }
      })
      const request = createMockRequest()

      const result = await requireHost(request)

      expect(result).toBeNull()
    })

    it('requireTraveler should check for traveler role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'traveler' }
      })
      const request = createMockRequest()

      const result = await requireTraveler(request)

      expect(result).toBeNull()
    })
  })
})