import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function test() {
  try {
    console.log('Testing Prisma connection...');
    const suppliers = await prisma.supplier.findMany();
    console.log('Suppliers:', suppliers);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();