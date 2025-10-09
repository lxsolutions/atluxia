

import { PrismaClient } from '@prisma/client';

// Create Prisma client with direct SQLite path
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:/workspace/packages/db/prisma/dev.db"
    }
  }
});

async function main() {
  console.log('🔍 Simple verification of seed data...');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users count: ${userCount}`);

    // Get first user
    const user = await prisma.user.findFirst({
      include: {
        profile: true
      }
    });

    if (user) {
      console.log(`\n📋 First user: ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}, KYC: ${user.kycStatus}`);
      
      if (user.profile) {
        console.log(`   Profile: ${user.profile.nationality}`);
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

