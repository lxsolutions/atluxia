import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create fee schedules
  await prisma.feeSchedule.upsert({
    where: { region: 'US' },
    update: {},
    create: {
      region: 'US',
      platform_pct: 0.10,
      payment_pct: 0.029,
      fixed_fee: 0.30,
    },
  });

  // Create FX rates
  const fxRates = [
    { base: 'USD', quote: 'EUR', rate: 0.85 },
    { base: 'USD', quote: 'GBP', rate: 0.73 },
    { base: 'USD', quote: 'CAD', rate: 1.35 },
    { base: 'USD', quote: 'JPY', rate: 110.5 },
  ];

  for (const rate of fxRates) {
    await prisma.fXRate.upsert({
      where: { base_quote: { base: rate.base, quote: rate.quote } },
      update: { rate: rate.rate },
      create: rate,
    });
  }

  // Create duty rules
  const dutyRules = [
    { origin: 'CN', dest: 'US', hs_code: '847130', duty_pct: 0.0 },
    { origin: 'CN', dest: 'US', hs_code: '851712', duty_pct: 0.0 },
    { origin: 'CN', dest: 'US', hs_code: '950300', duty_pct: 0.0 },
  ];

  for (const rule of dutyRules) {
    await prisma.dutyRule.upsert({
      where: { origin_dest_hs_code: { origin: rule.origin, dest: rule.dest, hs_code: rule.hs_code || '' } },
      update: { duty_pct: rule.duty_pct },
      create: rule,
    });
  }

  // Create sample suppliers
  const suppliers = [
    {
      id: 'supplier-1',
      name: 'Global Electronics Inc.',
      country: 'CN',
      lead_time_days: 14,
      policy_url: 'https://example.com/policy',
    },
    {
      id: 'supplier-2',
      name: 'Tech Wholesale Co.',
      country: 'US',
      lead_time_days: 7,
      policy_url: 'https://example.com/policy',
    },
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { id: supplier.id },
      update: {},
      create: supplier,
    });
  }

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });