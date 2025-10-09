
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables for SQLite with correct path
config({ path: '.env.sqlite' });
process.env.DATABASE_URL = "file:./prisma/dev.db";

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying seed data...');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users count: ${userCount}`);

    // Count visa applications
    const visaAppCount = await prisma.visaApplication.count();
    console.log(`📋 Visa applications count: ${visaAppCount}`);

    // Count checklist items
    const checklistCount = await prisma.checklistItem.count();
    console.log(`✅ Checklist items count: ${checklistCount}`);

    // Count reminders
    const reminderCount = await prisma.reminder.count();
    console.log(`⏰ Reminders count: ${reminderCount}`);

    // Get sample data
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        visaApplications: {
          include: {
            checklist: true
          }
        },
        reminders: true
      }
    });

    console.log('\n📊 Sample data:');
    users.forEach(user => {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`  Role: ${user.role}, KYC Status: ${user.kycStatus}`);
      
      if (user.profile) {
        console.log(`  Profile: ${user.profile.nationality}, DOB: ${user.profile.dateOfBirth}`);
      }

      console.log(`  Visa Applications: ${user.visaApplications.length}`);
      user.visaApplications.forEach(app => {
        console.log(`    - ${app.destination} visa (${app.status}): ${app.checklist.length} checklist items`);
      });

      console.log(`  Reminders: ${user.reminders.length}`);
      user.reminders.forEach(reminder => {
        console.log(`    - ${reminder.title} (due: ${reminder.dueDate})`);
      });
    });

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
