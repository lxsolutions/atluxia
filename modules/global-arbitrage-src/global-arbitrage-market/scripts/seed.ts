import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface ProductData {
  canonical_sku: string;
  title: string;
  brand: string;
  category: string;
  images: string[];
  quality_score: number;
  supplier_price: number;
  supplier_currency: string;
  supplier_country: string;
  product_weight_kg: number;
}

const BRANDS = [
  'Apple', 'Samsung', 'Sony', 'Nintendo', 'Microsoft', 'Dell', 'HP', 'Lenovo', 'LG', 'Asus',
  'Bose', 'JBL', 'Canon', 'Nikon', 'GoPro', 'Fitbit', 'Garmin', 'Xiaomi', 'Huawei', 'OnePlus'
];

const CATEGORIES = [
  'Electronics', 'Phones', 'Computers', 'Audio', 'Gaming', 'Cameras', 'Wearables',
  'Home Appliances', 'Kitchen', 'Fashion', 'Sports', 'Toys', 'Books', 'Beauty'
];

const COUNTRIES = ['CN', 'US', 'DE', 'JP', 'KR', 'TW', 'VN', 'TH', 'MY', 'SG'];

function generateProductData(count: number): ProductData[] {
  const products: ProductData[] = [];
  
  for (let i = 0; i < count; i++) {
    const brand = faker.helpers.arrayElement(BRANDS);
    const category = faker.helpers.arrayElement(CATEGORIES);
    const title = `${brand} ${faker.commerce.productName()} ${faker.commerce.productAdjective()}`;
    
    products.push({
      canonical_sku: `prod_${faker.string.uuid().substring(0, 12)}`,
      title,
      brand,
      category,
      images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => 
        faker.image.urlLoremFlickr({ width: 400, height: 400, category: 'product' })
      ),
      quality_score: faker.number.float({ min: 0.3, max: 0.95, fractionDigits: 2 }),
      supplier_price: faker.number.float({ min: 10, max: 2000, fractionDigits: 2 }),
      supplier_currency: 'USD',
      supplier_country: faker.helpers.arrayElement(COUNTRIES),
      product_weight_kg: faker.number.float({ min: 0.1, max: 5, fractionDigits: 2 }),
    });
  }
  
  return products;
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.listing.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();

  // Create suppliers
  console.log('🏭 Creating suppliers...');
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        id: 'supplier-global-electronics',
        name: 'Global Electronics Inc.',
        country: 'CN',
        lead_time_days: 14,
        policy_url: 'https://example.com/global-electronics',
      },
    }),
    prisma.supplier.create({
      data: {
        id: 'supplier-tech-wholesale',
        name: 'Tech Wholesale Co.',
        country: 'US',
        lead_time_days: 7,
        policy_url: 'https://example.com/tech-wholesale',
      },
    }),
    prisma.supplier.create({
      data: {
        id: 'supplier-europe-gadgets',
        name: 'Europe Gadgets GmbH',
        country: 'DE',
        lead_time_days: 10,
        policy_url: 'https://example.com/europe-gadgets',
      },
    }),
  ]);

  // Generate product data
  console.log('📦 Generating product data...');
  const productData = generateProductData(1000);

  // Create products and supplier products
  console.log('🔄 Creating products and supplier products...');
  let createdProducts = 0;
  let createdSupplierProducts = 0;

  for (const data of productData) {
    try {
      // Create product
      const product = await prisma.product.create({
        data: {
          canonical_sku: data.canonical_sku,
          title: data.title,
          brand: data.brand,
          category: data.category,
          images: data.images,
          quality_score: data.quality_score,
          status: 'DRAFT',
        },
      });
      createdProducts++;

      // Create supplier product
      const supplier = faker.helpers.arrayElement(suppliers);
      await prisma.supplierProduct.create({
        data: {
          supplier_id: supplier.id,
          sku: `supp_${faker.string.uuid().substring(0, 8)}`,
          name: data.title,
          brand: data.brand,
          category: data.category,
          base_price: data.supplier_price,
          currency: data.supplier_currency,
          moq: faker.number.int({ min: 1, max: 10 }),
          pack_qty: faker.number.int({ min: 1, max: 5 }),
        },
      });
      createdSupplierProducts++;

      if (createdProducts % 100 === 0) {
        console.log(`   Created ${createdProducts} products...`);
      }
    } catch (error) {
      console.error(`Error creating product ${data.canonical_sku}:`, error);
    }
  }

  // Create fee schedules
  console.log('💰 Creating fee schedules...');
  await Promise.all([
    prisma.feeSchedule.upsert({
      where: { region: 'US' },
      update: {},
      create: {
        region: 'US',
        platform_pct: 0.10,
        payment_pct: 0.029,
        fixed_fee: 0.30,
      },
    }),
    prisma.feeSchedule.upsert({
      where: { region: 'EU' },
      update: {},
      create: {
        region: 'EU',
        platform_pct: 0.12,
        payment_pct: 0.025,
        fixed_fee: 0.25,
      },
    }),
  ]);

  // Create FX rates
  console.log('💱 Creating FX rates...');
  const fxRates = [
    { base: 'USD', quote: 'EUR', rate: 0.85 },
    { base: 'USD', quote: 'GBP', rate: 0.73 },
    { base: 'USD', quote: 'CAD', rate: 1.35 },
    { base: 'USD', quote: 'JPY', rate: 110.5 },
    { base: 'USD', quote: 'CNY', rate: 7.2 },
  ];

  for (const rate of fxRates) {
    await prisma.fXRate.upsert({
      where: { base_quote: { base: rate.base, quote: rate.quote } },
      update: { rate: rate.rate },
      create: rate,
    });
  }

  // Create duty rules
  console.log('📋 Creating duty rules...');
  const dutyRules = [
    { origin: 'CN', dest: 'US', hs_code: '847130', duty_pct: 0.0 },
    { origin: 'CN', dest: 'US', hs_code: '851712', duty_pct: 0.0 },
    { origin: 'CN', dest: 'US', hs_code: '950300', duty_pct: 0.0 },
    { origin: 'CN', dest: 'EU', hs_code: '', duty_pct: 0.03 },
    { origin: 'CN', dest: 'UK', hs_code: '', duty_pct: 0.025 },
  ];

  for (const rule of dutyRules) {
    await prisma.dutyRule.upsert({
      where: { origin_dest_hs_code: { origin: rule.origin, dest: rule.dest, hs_code: rule.hs_code || '' } },
      update: { duty_pct: rule.duty_pct },
      create: rule,
    });
  }

  console.log('✅ Database seeding completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log(`   - Products: ${createdProducts}`);
  console.log(`   - Supplier Products: ${createdSupplierProducts}`);
  console.log(`   - Fee Schedules: 2`);
  console.log(`   - FX Rates: ${fxRates.length}`);
  console.log(`   - Duty Rules: ${dutyRules.length}`);

  // Generate some sample offers for arbitrage testing
  console.log('🎯 Creating sample offers for arbitrage testing...');
  const products = await prisma.product.findMany({
    take: 100,
    where: { quality_score: { gte: 0.65 } },
  });

  const supplierProducts = await prisma.supplierProduct.findMany({
    take: 100,
    include: { supplier: true },
  });

  let createdOffers = 0;
  for (let i = 0; i < Math.min(products.length, supplierProducts.length); i++) {
    const product = products[i];
    const supplierProduct = supplierProducts[i];
    
    // Calculate a landed cost that creates arbitrage opportunities
    const baseCost = supplierProduct.base_price;
    const landedCost = baseCost * faker.number.float({ min: 1.1, max: 1.8 }); // 10-80% markup
    
    await prisma.offer.create({
      data: {
        product_id: product.id,
        supplier_product_id: supplierProduct.id,
        region: 'US',
        landed_cost: landedCost,
        currency: 'USD',
        shipping_days: supplierProduct.supplier.lead_time_days + faker.number.int({ min: 2, max: 7 }),
        available_qty: faker.number.int({ min: 10, max: 100 }),
      },
    });
    createdOffers++;
  }

  console.log(`   - Sample Offers: ${createdOffers}`);
  console.log('\n🎉 Seeding complete! Ready for arbitrage analysis.');
}

seedDatabase()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });