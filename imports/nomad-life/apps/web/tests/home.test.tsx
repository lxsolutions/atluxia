















import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Database tests', () => {
  test('should be able to create and use Prisma client', async () => {
    // Test that the client can be instantiated
    expect(prisma).toBeDefined()
    expect(typeof prisma.property.findMany).toBe('function')

    // Clean up connection pool on test end
    await prisma.$disconnect()
  })
});









