


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Atluxia database seed...');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create test users for different platforms
    const nomadUser = await prisma.user.upsert({
      where: { email: 'nomad@example.com' },
      update: {},
      create: {
        email: 'nomad@example.com',
        name: 'Nomad Traveler',
        phone: '+1234567890',
        role: 'user',
      },
    });

    const polyverseUser = await prisma.user.upsert({
      where: { email: 'polyverse@example.com' },
      update: {},
      create: {
        email: 'polyverse@example.com',
        name: 'Polyverse Explorer',
        phone: '+1234567891',
        role: 'user',
      },
    });

    const everpathUser = await prisma.user.upsert({
      where: { email: 'everpath@example.com' },
      update: {},
      create: {
        email: 'everpath@example.com',
        name: 'Everpath Learner',
        phone: '+1234567892',
        role: 'user',
      },
    });

    const crittersUser = await prisma.user.upsert({
      where: { email: 'critters@example.com' },
      update: {},
      create: {
        email: 'critters@example.com',
        name: 'Critters Player',
        phone: '+1234567893',
        role: 'user',
      },
    });

    console.log('✅ Test users created for all platforms');

    // =========================================================================
    // NOMAD-LIFE DATA
    // =========================================================================

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
          hostId: nomadUser.id,
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
          hostId: nomadUser.id,
        },
      }),
    ]);

    console.log('✅ Nomad Life properties created');

    // =========================================================================
    // POLYVERSE DATA
    // =========================================================================

    // Create sample feeds and posts
    const feed = await prisma.feed.create({
      data: {
        name: 'Polyverse Main Feed',
        description: 'Main feed for Polyverse platform',
        ownerId: polyverseUser.id,
      },
    });

    const posts = await Promise.all([
      prisma.post.create({
        data: {
          title: 'Welcome to Polyverse',
          content: 'This is the beginning of a decentralized compute platform.',
          authorId: polyverseUser.id,
          feedId: feed.id,
        },
      }),
      prisma.post.create({
        data: {
          title: 'OpenGrid Integration',
          content: 'OpenGrid is now integrated with the Polyverse platform.',
          authorId: polyverseUser.id,
          feedId: feed.id,
        },
      }),
    ]);

    console.log('✅ Polyverse feeds and posts created');

    // =========================================================================
    // EVERPATH DATA
    // =========================================================================

    // Create learning paths
    const path = await prisma.learningPath.create({
      data: {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of web development',
        difficulty: 'beginner',
        estimatedHours: 40,
        creatorId: everpathUser.id,
      },
    });

    const skills = await Promise.all([
      prisma.skill.create({
        data: {
          name: 'HTML Basics',
          description: 'Learn HTML structure and elements',
          pathId: path.id,
        },
      }),
      prisma.skill.create({
        data: {
          name: 'CSS Fundamentals',
          description: 'Learn CSS styling and layout',
          pathId: path.id,
        },
      }),
    ]);

    console.log('✅ Everpath learning paths and skills created');

    // =========================================================================
    // CURIO-CRITTERS DATA
    // =========================================================================

    // Create sample critters and quests
    const critter = await prisma.critter.create({
      data: {
        name: 'Sparky the Firefly',
        type: 'insect',
        rarity: 'common',
        description: 'A friendly firefly that loves to light up the night',
        ownerId: crittersUser.id,
      },
    });

    const quest = await prisma.quest.create({
      data: {
        title: 'Find the Lost Glow',
        description: 'Help Sparky find his lost glow in the enchanted forest',
        difficulty: 'easy',
        reward: 100,
        creatorId: crittersUser.id,
      },
    });

    console.log('✅ Curio Critters data created');

    console.log('🌱 Atluxia database seeded successfully!');
    console.log('');
    console.log('📊 Seed Summary:');
    console.log(`   👥 Users: 4 (nomad, polyverse, everpath, critters)`);
    console.log(`   🏠 Properties: ${properties.length} (Nomad Life)`);
    console.log(`   📝 Posts: ${posts.length} (Polyverse)`);
    console.log(`   📚 Learning Paths: 1 (Everpath)`);
    console.log(`   🐾 Critters: 1 (Curio Critters)`);

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


