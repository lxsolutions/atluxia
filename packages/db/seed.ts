
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Test database connection first
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Please ensure PostgreSQL is running on localhost:5432');
    console.log('💡 You can start it with: docker compose -f infra/docker-compose.dev.yml up -d db');
    process.exit(1);
  }

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@nomad.life' },
    update: {},
    create: {
      email: 'test@nomad.life',
      name: 'Test User',
      phone: '+15551234567',
      role: 'guest'
    }
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // Create sample properties for stays
  const properties = await Promise.all([
    prisma.property.upsert({
      where: { id: 'prop_1' },
      update: {},
      create: {
        title: 'Luxury Condo in Sukhumvit',
        description: 'Beautiful modern condo in the heart of Bangkok with amazing city views',
        city: 'Bangkok',
        country: 'Thailand',
        address: '123 Sukhumvit Road',
        latitude: 13.736717,
        longitude: 100.523186,
        hasDedicatedWorkspace: true,
        wifiSpeed: 200,
        hasKitchen: true,
        hasLaundry: true,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        monthlyPrice: 45000,
        nightlyPrice: 2500,
        trustScore: 4.8,
        hostId: testUser.id
      }
    }),
    prisma.property.upsert({
      where: { id: 'prop_2' },
      update: {},
      create: {
        title: 'Cozy Studio near BTS',
        description: 'Compact but comfortable studio apartment just steps from BTS station',
        city: 'Bangkok',
        country: 'Thailand',
        address: '456 Silom Road',
        latitude: 13.724560,
        longitude: 100.513240,
        hasDedicatedWorkspace: true,
        wifiSpeed: 100,
        hasKitchen: true,
        hasLaundry: false,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        monthlyPrice: 22000,
        nightlyPrice: 1200,
        trustScore: 4.5,
        hostId: testUser.id
      }
    })
  ]);

  console.log(`✅ Created ${properties.length} sample properties`);

  // Create units for each property
  const units = await Promise.all([
    prisma.unit.upsert({
      where: { id: 'unit_1' },
      update: {},
      create: {
        propertyId: properties[0].id,
        name: 'Luxury Condo - Unit A',
        sleeps: 4,
        bedrooms: 2,
        bathrooms: 2,
        isActive: true
      }
    }),
    prisma.unit.upsert({
      where: { id: 'unit_2' },
      update: {},
      create: {
        propertyId: properties[1].id,
        name: 'Studio Unit - B',
        sleeps: 2,
        bedrooms: 1,
        bathrooms: 1,
        isActive: true
      }
    })
  ]);

  console.log(`✅ Created ${units.length} sample units`);

  // Create a sample booking
  const booking = await prisma.booking.upsert({
    where: { id: 'booking_1' },
    update: {},
    create: {
      unitId: units[0].id,
      userId: testUser.id,
      checkin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      checkout: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'confirmed',
      currency: 'THB',
      subtotal: 17500,
      fees: 500,
      taxes: 875,
      total: 18875
    }
  });

  console.log(`✅ Created sample booking`);

  // Create visa countries and rules
  const countries = await Promise.all([
    prisma.visaCountry.upsert({
      where: { code: 'US' },
      update: {},
      create: {
        code: 'US',
        name: 'United States',
        region: 'North America'
      }
    }),
    prisma.visaCountry.upsert({
      where: { code: 'TH' },
      update: {},
      create: {
        code: 'TH',
        name: 'Thailand',
        region: 'Southeast Asia'
      }
    }),
    prisma.visaCountry.upsert({
      where: { code: 'JP' },
      update: {},
      create: {
        code: 'JP',
        name: 'Japan',
        region: 'East Asia'
      }
    }),
    prisma.visaCountry.upsert({
      where: { code: 'DE' },
      update: {},
      create: {
        code: 'DE',
        name: 'Germany',
        region: 'Europe'
      }
    }),
    prisma.visaCountry.upsert({
      where: { code: 'SG' },
      update: {},
      create: {
        code: 'SG',
        name: 'Singapore',
        region: 'Southeast Asia'
      }
    })
  ]);

  console.log(`✅ Created ${countries.length} visa countries`);

  // Create visa rules
  const visaRules = await Promise.all([
    // US to Thailand - tourism
    prisma.visaRule.upsert({
      where: { 
        fromCountryId_toCountryId_purpose: {
          fromCountryId: countries[0].id,
          toCountryId: countries[1].id,
          purpose: 'tourism'
        }
      },
      update: {},
      create: {
        fromCountryId: countries[0].id,
        toCountryId: countries[1].id,
        purpose: 'tourism',
        visaRequired: false,
        visaOnArrival: true,
        maxStayDays: 30,
        processingTimeDays: 0,
        costMin: 0,
        costMax: 0,
        requirements: JSON.stringify([
          'Passport valid for 6 months',
          'Return ticket',
          'Proof of sufficient funds'
        ])
      }
    }),
    // US to Japan - tourism
    prisma.visaRule.upsert({
      where: { 
        fromCountryId_toCountryId_purpose: {
          fromCountryId: countries[0].id,
          toCountryId: countries[2].id,
          purpose: 'tourism'
        }
      },
      update: {},
      create: {
        fromCountryId: countries[0].id,
        toCountryId: countries[2].id,
        purpose: 'tourism',
        visaRequired: false,
        visaOnArrival: false,
        maxStayDays: 90,
        processingTimeDays: 0,
        costMin: 0,
        costMax: 0,
        requirements: JSON.stringify([
          'Passport valid for duration of stay',
          'Return ticket',
          'Proof of accommodation'
        ])
      }
    })
  ]);

  console.log(`✅ Created ${visaRules.length} visa rules`);

  // Create driver profiles and vehicles
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@nomad.life' },
    update: {},
    create: {
      email: 'driver@nomad.life',
      name: 'Driver User',
      phone: '+15559876543',
      role: 'traveler'
    }
  });

  const driverProfile = await prisma.driverProfile.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNumber: 'DL123456',
      licenseCountry: 'US',
      licenseExpiry: new Date('2026-12-31'),
      yearsExperience: 5,
      languages: JSON.stringify(['en', 'th']),
      specialties: JSON.stringify(['airport', 'city']),
      rating: 4.8,
      totalTrips: 150,
      isVerified: true,
      isActive: true
    }
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { id: 'vehicle_1' },
    update: {},
    create: {
      driverId: driverProfile.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'White',
      licensePlate: 'ABC123',
      capacity: 4,
      vehicleType: 'sedan',
      isActive: true,
      isVerified: true
    }
  });

  console.log(`✅ Created driver profile and vehicle`);

  // Create driver presence
  await prisma.driverPresence.upsert({
    where: { id: 'presence_1' },
    update: {},
    create: {
      driverId: driverProfile.id,
      isOnline: true,
      latitude: 13.736717,
      longitude: 100.523186,
      lastPingAt: new Date()
    }
  });

  console.log(`✅ Created driver presence`);

  console.log('🌱 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
