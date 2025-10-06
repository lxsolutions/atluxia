


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal database seed...');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        role: 'guest',
      },
    });

    console.log('✅ Test user created:', user.email);

    // Create sample properties
    const properties = await Promise.all([
      prisma.property.create({
        data: {
          title: 'Modern Apartment in Bangkok',
          description: 'Beautiful modern apartment in the heart of Bangkok with high-speed internet and dedicated workspace.',
          city: 'Bangkok',
          country: 'Thailand',
          address: '123 Sukhumvit Road',
          latitude: 13.736717,
          longitude: 100.523186,
          amenities: 'WiFi,Kitchen,Laundry,Workspace',
          images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          hasDedicatedWorkspace: true,
          wifiSpeed: 200,
          hasKitchen: true,
          hasLaundry: true,
          monthlyPrice: 1200,
          nightlyPrice: 45,
          available: true,
          trustScore: 4.8,
          hostId: user.id,
        },
      }),
      prisma.property.create({
        data: {
          title: 'Chiang Mai Villa with Pool',
          description: 'Spacious villa with private pool and mountain views. Perfect for digital nomads.',
          city: 'Chiang Mai',
          country: 'Thailand',
          address: '456 Nimman Road',
          latitude: 18.796464,
          longitude: 98.965462,
          amenities: 'WiFi,Kitchen,Pool,Garden',
          images: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 2,
          hasDedicatedWorkspace: true,
          wifiSpeed: 100,
          hasKitchen: true,
          hasLaundry: false,
          monthlyPrice: 1800,
          nightlyPrice: 65,
          available: true,
          trustScore: 4.9,
          hostId: user.id,
        },
      }),
      prisma.property.create({
        data: {
          title: 'Beachfront Condo in Phuket',
          description: 'Stunning beachfront condo with ocean views and modern amenities.',
          city: 'Phuket',
          country: 'Thailand',
          address: '789 Patong Beach',
          latitude: 7.880448,
          longitude: 98.275991,
          amenities: 'WiFi,Kitchen,Beach Access,Gym',
          images: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          maxGuests: 3,
          bedrooms: 1,
          bathrooms: 1,
          hasDedicatedWorkspace: true,
          wifiSpeed: 150,
          hasKitchen: true,
          hasLaundry: true,
          monthlyPrice: 1500,
          nightlyPrice: 55,
          available: true,
          trustScore: 4.7,
          hostId: user.id,
        },
      }),
    ]);

    console.log('✅ Properties created:', properties.map(p => p.title));
    console.log('🌱 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });


