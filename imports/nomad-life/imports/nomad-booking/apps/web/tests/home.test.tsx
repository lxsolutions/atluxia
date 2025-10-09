















import { PrismaClient } from '@prisma/client'

describe('Database tests', () => {
  it('should be able to create and use Prisma client', async () => {
    const prisma = new PrismaClient()

    // Test that the client can be instantiated
    expect(prisma).toBeDefined()
    expect(typeof prisma.property.findMany).toBe('function')

    // Clean up connection pool on test end
    await prisma.$disconnect()
  })
})












