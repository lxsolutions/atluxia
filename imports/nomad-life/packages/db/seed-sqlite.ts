
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables for SQLite
config({ path: '.env.sqlite' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SQLite database seed...');
  
  // Test database connection first
  try {
    await prisma.$connect();
    console.log('✅ SQLite database connection successful');
    
    // Create database tables if they don't exist
    console.log('🔄 Creating database tables...');
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      name TEXT,
      role TEXT DEFAULT 'guest',
      kycStatus TEXT DEFAULT 'not_started',
      verifiedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Profile (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE,
      dateOfBirth DATETIME,
      nationality TEXT,
      documentId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS VisaApplication (
      id TEXT PRIMARY KEY,
      userId TEXT,
      visaPathId TEXT,
      nationality TEXT,
      destination TEXT,
      purpose TEXT,
      stayLengthDays INTEGER,
      hasDependents BOOLEAN DEFAULT FALSE,
      currentResidence TEXT,
      status TEXT DEFAULT 'draft',
      submittedAt DATETIME,
      approvedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS ChecklistItem (
      id TEXT PRIMARY KEY,
      applicationId TEXT,
      title TEXT,
      description TEXT,
      priority TEXT,
      completed BOOLEAN DEFAULT FALSE,
      completedAt DATETIME,
      estimatedTimeMinutes INTEGER,
      dependencies TEXT,
      formId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (applicationId) REFERENCES VisaApplication(id) ON DELETE CASCADE
    )`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Reminder (
      id TEXT PRIMARY KEY,
      userId TEXT,
      applicationId TEXT,
      type TEXT,
      title TEXT,
      description TEXT,
      dueDate DATETIME,
      completed BOOLEAN DEFAULT FALSE,
      completedAt DATETIME,
      recurrence TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (applicationId) REFERENCES VisaApplication(id) ON DELETE CASCADE
    )`;
    
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ SQLite database connection failed:', error.message);
    process.exit(1);
  }

  // Create test user for immigration flows
  const testUser = await prisma.user.upsert({
    where: { email: 'test+immigration@nomad.life' },
    update: {},
    create: {
      email: 'test+immigration@nomad.life',
      name: 'Immigration Test User',
      phone: '+15551234567',
      role: 'guest',
      kycStatus: 'approved',
      verifiedAt: new Date(),
      profile: {
        create: {
          dateOfBirth: new Date('1990-01-01'),
          nationality: 'US',
          documentId: 'TEST123456'
        }
      }
    },
    include: {
      profile: true
    }
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // Create sample visa applications
  const visaApplication = await prisma.visaApplication.create({
    data: {
      userId: testUser.id,
      visaPathId: 'thailand-visa-exempt',
      nationality: 'US',
      destination: 'TH',
      purpose: 'tourism',
      stayLengthDays: 30,
      hasDependents: false,
      currentResidence: 'US',
      checklist: {
        create: [
          {
            title: 'Prepare passport',
            description: 'Ensure passport is valid for at least 6 months',
            priority: 'critical',
            estimatedTimeMinutes: 5,
            completed: true
          },
          {
            title: 'Book onward flight',
            description: 'Proof of onward travel within 30 days',
            priority: 'high',
            estimatedTimeMinutes: 30,
            completed: false
          },
          {
            title: 'Prepare proof of funds',
            description: 'Bank statement showing equivalent of 20,000 THB',
            priority: 'medium',
            estimatedTimeMinutes: 15,
            completed: false
          }
        ]
      }
    },
    include: {
      checklist: true
    }
  });

  console.log(`✅ Created visa application: ${visaApplication.id}`);

  // Create sample reminders
  const reminder = await prisma.reminder.create({
    data: {
      userId: testUser.id,
      applicationId: visaApplication.id,
      type: 'tm30',
      title: 'Complete TM30 arrival reporting',
      description: 'Report your arrival to immigration within 24 hours',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      completed: false,
      recurrence: 'once'
    }
  });

  console.log(`✅ Created reminder: ${reminder.title}`);

  console.log('🌱 SQLite database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
