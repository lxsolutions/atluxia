

import { db } from '../src/index';

// Bangkok districts and BTS/MRT stations
const BANGKOK_DISTRICTS = [
  'Sukhumvit', 'Sathorn', 'Silom', 'Pathumwan', 'Phrom Phong', 
  'Thonglor', 'Ekkamai', 'Ari', 'Ratchathewi', 'Phaya Thai',
  'Huai Khwang', 'Chatuchak', 'Bang Rak', 'Khlong Toei', 'Watthana'
];

const BTS_STATIONS = [
  'Siam', 'Chit Lom', 'Phloen Chit', 'Nana', 'Asok', 
  'Phrom Phong', 'Thong Lo', 'Ekkamai', 'Phra Khanong', 'On Nut',
  'Ari', 'Sanam Pao', 'Victory Monument', 'Mo Chit', 'Chatuchak Park'
];

const MRT_STATIONS = [
  'Sukhumvit', 'Silom', 'Lumphini', 'Khlong Toei', 'Queen Sirikit National Convention Centre',
  'Sukhumvit', 'Phetchaburi', 'Phra Ram 9', 'Thailand Cultural Centre', 'Huai Khwang'
];

// Sample building data for Bangkok
const BUILDINGS = [
  {
    name: 'The Esse at Sukhumvit',
    address: '123 Sukhumvit Road, Khlong Toei',
    district: 'Sukhumvit',
    latitude: 13.738,
    longitude: 100.560,
    transit: { bts: ['Asok', 'Phrom Phong'], mrt: ['Sukhumvit'] },
    amenities: ['Pool', 'Gym', 'Security', 'Parking', 'Elevator']
  },
  {
    name: 'Ideo Q Sukhumvit',
    address: '456 Sukhumvit Soi 36, Phra Khanong',
    district: 'Sukhumvit',
    latitude: 13.725,
    longitude: 100.572,
    transit: { bts: ['Thong Lo', 'Phrom Phong'], mrt: [] },
    amenities: ['Pool', 'Gym', 'Security', 'Parking', 'Co-working']
  },
  {
    name: 'The Line Jatujak',
    address: '789 Phahonyothin Road, Chatuchak',
    district: 'Chatuchak',
    latitude: 13.802,
    longitude: 100.552,
    transit: { bts: ['Mo Chit'], mrt: ['Chatuchak Park'] },
    amenities: ['Pool', 'Gym', 'Security', 'Parking', 'Garden']
  },
  {
    name: 'Noble Around Ari',
    address: '321 Phahonyothin Road, Phaya Thai',
    district: 'Phaya Thai',
    latitude: 13.782,
    longitude: 100.542,
    transit: { bts: ['Ari', 'Sanam Pao'], mrt: [] },
    amenities: ['Pool', 'Gym', 'Security', 'Parking', 'Cafe']
  },
  {
    name: 'Lumpini Place Rama 9',
    address: '999 Rama IX Road, Huai Khwang',
    district: 'Huai Khwang',
    latitude: 13.762,
    longitude: 100.572,
    transit: { bts: [], mrt: ['Phra Ram 9', 'Thailand Cultural Centre'] },
    amenities: ['Pool', 'Gym', 'Security', 'Parking', 'Shopping']
  }
];

// Sample user data
const USERS = [
  // Admin
  {
    email: 'admin@rentshield.th',
    name: 'RentShield Admin',
    role: 'ADMIN' as const,
    phone: '+66123456789',
    verifiedAt: new Date()
  },
  // Agents
  {
    email: 'sompong@bangkokproperties.com',
    name: 'Sompong Chen',
    role: 'AGENT' as const,
    phone: '+66987654321',
    verifiedAt: new Date(),
    agentProfile: {
      agencyName: 'Bangkok Properties Co., Ltd.',
      licenseNo: 'AG123456',
      bio: 'Experienced real estate agent specializing in Sukhumvit area.',
      responseTimeAvg: 15
    }
  },
  {
    email: 'nareerat@premierestate.th',
    name: 'Nareerat Wong',
    role: 'AGENT' as const,
    phone: '+66811223344',
    verifiedAt: new Date(),
    agentProfile: {
      agencyName: 'Premiere Estate Thailand',
      licenseNo: 'AG654321',
      bio: 'Professional agent with 5+ years experience in luxury condos.',
      responseTimeAvg: 30
    }
  },
  // Owners
  {
    email: 'chatchai@email.com',
    name: 'Chatchai Srisuk',
    role: 'OWNER' as const,
    phone: '+66988776655',
    verifiedAt: new Date(),
    ownerProfile: {
      portfolioCount: 3
    }
  },
  {
    email: 'supaporn@email.com',
    name: 'Supaporn Lim',
    role: 'OWNER' as const,
    phone: '+66855443322',
    verifiedAt: new Date(),
    ownerProfile: {
      portfolioCount: 2
    }
  },
  // Renters
  {
    email: 'david@email.com',
    name: 'David Johnson',
    role: 'RENTER' as const,
    phone: '+66900112233',
    verifiedAt: new Date()
  },
  {
    email: 'jiraporn@email.com',
    name: 'Jiraporn Srisawat',
    role: 'RENTER' as const,
    phone: '+66899887766',
    verifiedAt: new Date()
  }
];

// Generate 50 realistic Bangkok listings across Sukhumvit, Sathorn, Ari, Thonglor, Phrom Phong
const generateListings = () => {
  const listings = [];
  const districts = ['Sukhumvit', 'Sathorn', 'Ari', 'Thonglor', 'Phrom Phong'];
  const buildingTypes = ['Condo', 'Apartment', 'Serviced Residence'];
  const furnishings = ['Fully furnished', 'Semi-furnished', 'Unfurnished'];
  
  const titles = [
    'Modern Studio', 'Luxury 1-Bedroom', 'Spacious 2-Bedroom', 'Executive Suite', 
    'City View Condo', 'Garden Apartment', 'Penthouse Unit', 'Family Residence',
    'Budget Studio', 'Premium Loft', 'Corner Unit', 'Sky Villa', 'River View',
    'BTS Access', 'MRT Connected', 'Quiet Retreat', 'Urban Oasis', 'Luxury Pad',
    'Executive Home', 'Designer Unit'
  ];
  
  const descriptions = [
    'Beautiful apartment with modern finishes and stunning city views.',
    'Spacious layout perfect for professionals or couples.',
    'Recently renovated with high-quality furnishings and appliances.',
    'Prime location with easy access to public transportation.',
    'Quiet building with excellent security and amenities.',
    'Perfect for long-term stays with all necessities included.',
    'Great investment property with high rental potential.',
    'Family-friendly environment with nearby schools and parks.',
    'Walking distance to shopping malls and restaurants.',
    'Luxury living experience with premium building features.'
  ];

  for (let i = 0; i < 50; i++) {
    const district = districts[i % districts.length];
    const bedrooms = Math.floor(Math.random() * 3) + 1; // 1-3 bedrooms
    const sizeSqm = 25 + Math.floor(Math.random() * 80); // 25-105 sqm
    const priceBase = bedrooms * 10000 + sizeSqm * 200;
    const priceTHB = Math.round(priceBase * (0.8 + Math.random() * 0.4)); // ±20% variation
    const depositTHB = priceTHB * 2;
    
    listings.push({
      title: `${titles[i % titles.length]} in ${district}`,
      description: `${descriptions[i % descriptions.length]} Located in the heart of ${district}.`,
      media: [
        `https://picsum.photos/800/600?random=${i * 2 + 1}`,
        `https://picsum.photos/800/600?random=${i * 2 + 2}`,
        `https://picsum.photos/800/600?random=${i * 2 + 3}`
      ],
      bedrooms,
      bathrooms: Math.max(1, bedrooms - 1),
      sizeSqm,
      floor: Math.floor(Math.random() * 30) + 1,
      furnished: Math.random() > 0.2, // 80% furnished
      priceTHB,
      depositTHB,
      minTermMonths: [6, 12, 24][Math.floor(Math.random() * 3)],
      availableFrom: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      pets: Math.random() > 0.7, // 30% allow pets
      utilitiesNote: ['Utilities included', 'Electricity extra', 'Water and electricity separate'][Math.floor(Math.random() * 3)],
      parking: Math.random() > 0.5 // 50% have parking
    });
  }
  
  return listings;
};

const LISTINGS = generateListings();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  const models = [
    'trustMetricSnapshot',
    'review',
    'viewingRequest',
    'favorite',
    'swipe',
    'leaseDraft',
    'inspection',
    'escrow',
    'dispute',
    'message',
    'thread',
    'listing',
    'building',
    'profileAgent',
    'profileOwner',
    'user'
  ];

  for (const model of models) {
    await (db as any)[model].deleteMany();
  }

  // Create buildings
  console.log('🏢 Creating buildings...');
  const createdBuildings = [];
  for (const buildingData of BUILDINGS) {
    const building = await db.building.create({
      data: buildingData
    });
    createdBuildings.push(building);
    console.log(`Created building: ${building.name}`);
  }

  // Create users with profiles
  console.log('👥 Creating users...');
  const createdUsers = [];
  for (const userData of USERS) {
    const { agentProfile, ownerProfile, ...userBase } = userData;
    
    const user = await db.user.create({
      data: {
        ...userBase,
        ...(agentProfile && {
          agentProfile: {
            create: agentProfile
          }
        }),
        ...(ownerProfile && {
          ownerProfile: {
            create: ownerProfile
          }
        })
      }
    });
    createdUsers.push(user);
    console.log(`Created user: ${user.name} (${user.role})`);
  }

  // Get agents and owners for listing assignment
  const agents = createdUsers.filter(u => u.role === 'AGENT');
  const owners = createdUsers.filter(u => u.role === 'OWNER');

  // Create listings
  console.log('🏠 Creating listings...');
  for (let i = 0; i < LISTINGS.length; i++) {
    const listingData = LISTINGS[i];
    const building = createdBuildings[i % createdBuildings.length];
    const owner = owners[i % owners.length];
    const agent = i % 2 === 0 ? agents[i % agents.length] : null; // Some listings have agents

    const listing = await db.listing.create({
      data: {
        ...listingData,
        ownerId: owner.id,
        agentId: agent?.id,
        buildingId: building.id,
        status: 'ACTIVE'
      }
    });
    console.log(`Created listing: ${listing.title} (฿${listing.priceTHB})`);
  }

  // Create some sample reviews
  console.log('⭐ Creating sample reviews...');
  const renters = createdUsers.filter(u => u.role === 'RENTER');
  const listings = await db.listing.findMany();
  
  // Create reviews for agents
  for (const agent of agents) {
    for (let i = 0; i < 3; i++) {
      const reviewer = renters[i % renters.length];
      await db.review.create({
        data: {
          reviewerId: reviewer.id,
          subjectType: 'AGENT',
          subjectId: agent.id,
          ratings: {
            communication: Math.floor(Math.random() * 5) + 1,
            accuracy: Math.floor(Math.random() * 5) + 1,
            fairness: Math.floor(Math.random() * 5) + 1,
            depositReturn: Math.floor(Math.random() * 5) + 1
          },
          comment: `Great agent! Very professional and responsive.`,
          verified: true
        }
      });
    }
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

