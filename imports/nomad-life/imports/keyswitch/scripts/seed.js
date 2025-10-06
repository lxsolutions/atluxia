











const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Clean existing data
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;

  console.log('Seeding database...');

  // Create airports
  const laxAirport = await prisma.airport.create({
    data: {
      name: 'Los Angeles International Airport',
      code: 'LAX',
      country: 'USA'
    }
  });

  const jfkAirport = await prisma.airport.create({
    data: {
      name: 'John F Kennedy International Airport',
      code: 'JFK',
      country: 'USA'
    }
  });

  // Create protection plans
  const basicPlan = await prisma.protectionPlan.create({
    data: {
      name: 'Basic Protection (60% host take)',
      description: 'Standard coverage with $500 deductible',
      hostTakeRate: 0.60,
      deductible: 500
    }
  });

  const premiumPlan = await prisma.protectionPlan.create({
    data: {
      name: 'Premium Protection (75% host take)',
      description: 'Enhanced coverage with $300 deductible',
      hostTakeRate: 0.75,
      deductible: 300
    }
  });

  const elitePlan = await prisma.protectionPlan.create({
    data: {
      name: 'Elite Protection (85% host take)',
      description: 'Comprehensive coverage with $100 deductible',
      hostTakeRate: 0.85,
      deductible: 100
    }
  });

  // Create users and profiles
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@keyswitch.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }
  });

  const hostUser = await prisma.user.create({
    data: {
      email: 'host@example.com',
      firstName: 'Host',
      lastName: 'User',
      role: 'host',
      hostProfile: {
        create: {}
      }
    }
  });

  // Create vehicles
  for (let i = 1; i <= 5; i++) {
    await prisma.vehicle.create({
      data: {
        make: ['Toyota', 'Honda', 'Ford', 'Tesla'][i % 4],
        model: `Model ${['Camry', 'Civic', 'F-150', 'Model Y'][i % 4]}`,
        year: 2020 + i,
        licensePlate: `CA-VEH-${String(i).padStart(3, '0')}`,
        vin: `1HGCM826${String(Math.floor(100000 + Math.random() * 900000))}`,
        hostProfileId: hostUser.hostProfile.id,
        photos: {
          create: [
            { url: `/vehicles/${i}/photo-1.jpg` },
            { url: `/vehicles/${i}/photo-2.jpg` }
          ]
        }
      }
    });
  }

  // Create telematics device
  await prisma.telematicsDevice.create({
    data: {
      vehicleId: (await prisma.vehicle.findFirst()).id,
      deviceId: 'TEL-' + Math.random().toString(36).substr(2, 9),
      make: 'LockboxX',
      model: 'OBD-II Adapter'
    }
  });

  console.log('Database seeded successfully!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });











