




import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seed() {
  // Clear existing data
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding cities...')

  // Create test organizations
  const org1 = await prisma.organization.create({
    data: { name: 'Nomad Nest Properties' }
  })

  const org2 = await prisma.organization.create({
    data: { name: 'Digital Dream Spaces' }
  })

  console.log('Seeding properties...')

  // Bangkok properties
  const bangkokProp1 = await prisma.property.create({
    data: {
      orgId: org1.id,
      type: 'aparthotel',
      address: 'Sukhumvit Soi 39',
      geo: { type: 'Point', coordinates: [100.5624, 13.7481] },
      city: 'Bangkok',
      country: 'Thailand',
      timezone: 'Asia/Bangkok'
    }
  })

  const bangkokProp2 = await prisma.property.create({
    data: {
      orgId: org2.id,
      type: 'apt',
      address: 'Ari Sathorn Road',
      geo: { type: 'Point', coordinates: [100.5347, 13.7689] },
      city: 'Bangkok',
      country: 'Thailand',
      timezone: 'Asia/Bangkok'
    }
  })

  // Chiang Mai properties
  const chiangMaiProp = await prisma.property.create({
    data: {
      orgId: org1.id,
      type: 'house',
      address: 'Nimmanhaemin Road',
      geo: { type: 'Point', coordinates: [98.9765, 18.7943] },
      city: 'Chiang Mai',
      country: 'Thailand',
      timezone: 'Asia/Bangkok'
    }
  })

  // Bali properties
  const baliProp = await prisma.property.create({
    data: {
      orgId: org2.id,
      type: 'apt',
      address: 'Seminyak Beach',
      geo: { type: 'Point', coordinates: [115.1784, -8.6930] },
      city: 'Denpasar',
      country: 'Indonesia',
      timezone: 'Asia/Makassar'
    }
  })

  console.log('Seeding units...')

  // Bangkok Unit 1
  const bangkokUnit1 = await prisma.unit.create({
    data: {
      propertyId: bangkokProp1.id,
      name: 'Luxury Studio with Pool Access',
      sleeps: 2,
      bedrooms: 1,
      bathrooms: 1.5,
      sqft: 450
    }
  })

  // Bangkok Unit 2 (shared workspace)
  const bangkokUnit2 = await prisma.unit.create({
    data: {
      propertyId: bangkokProp1.id,
      name: 'Co-working Loft',
      sleeps: 3,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 700
    }
  })

  // Bangkok Unit 3 (family)
  const bangkokUnit3 = await prisma.unit.create({
    data: {
      propertyId: bangkokProp2.id,
      name: 'Family Apartment',
      sleeps: 4,
      bedrooms: 2,
      bathrooms: 2.5,
      sqft: 800
    }
  })

  console.log('Seeding rate plans...')

  // Monthly discount plan for Bangkok Unit 1
  await prisma.ratePlan.create({
    data: {
      unitId: bangkokUnit1.id,
      baseNightly: 45.00,
      weeklyDiscountPct: 10,
      monthlyDiscountPct: 30,
      minNights: 28,
      maxNights: 90
    }
  })

  // Weekly discount plan for Bangkok Unit 2
  await prisma.ratePlan.create({
    data: {
      unitId: bangkokUnit2.id,
      baseNightly: 55.00,
      weeklyDiscountPct: 15,
      monthlyDiscountPct: 35,
      minNights: 7,
      maxNights: 60
    }
  })

  // Standard plan for Bangkok Unit 3
  await prisma.ratePlan.create({
    data: {
      unitId: bangkokUnit3.id,
      baseNightly: 65.00,
      weeklyDiscountPct: 12,
      monthlyDiscountPct: 28,
      minNights: 7,
      maxNights: 90
    }
  })

  console.log('Seeding availability...')

  // Set up basic availability for next 6 months
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() + 1) // Start from next month

  for (let i = 0; i < 180; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + i)

    await prisma.availability.createMany({
      data: [
        { unitId: bangkokUnit1.id, date: currentDate, isBlocked: false },
        { unitId: bangkokUnit2.id, date: currentDate, isBlocked: false },
        { unitId: bangkokUnit3.id, date: currentDate, isBlocked: false }
      ]
    })
  }

  console.log('Seeding complete!')
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

