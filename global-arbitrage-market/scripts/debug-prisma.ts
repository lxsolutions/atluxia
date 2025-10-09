import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function debug() {
  console.log('Prisma client keys:', Object.keys(prisma));
  
  // Check specific model names
  console.log('fxRate exists:', 'fxRate' in prisma);
  console.log('fXRate exists:', 'fXRate' in prisma);
  console.log('FXRate exists:', 'FXRate' in prisma);
  
  // Test which one works
  try {
    console.log('Testing fXRate...');
    await prisma.fXRate.deleteMany();
    console.log('fXRate works!');
  } catch (error) {
    console.log('fXRate error:', error.message);
  }
  
  try {
    console.log('Testing FXRate...');
    await prisma.FXRate.deleteMany();
    console.log('FXRate works!');
  } catch (error) {
    console.log('FXRate error:', error.message);
  }
  
  await prisma.$disconnect();
}

debug();