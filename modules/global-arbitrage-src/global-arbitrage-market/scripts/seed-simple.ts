import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use SQLite for demo - point to the catalog service database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

interface ProductData {
  title: string;
  brand: string;
  category: string;
  basePrice: number;
  currency: string;
  qualityScore: number;
}

const categories = [
  'Electronics', 'Home & Kitchen', 'Clothing', 'Sports & Outdoors',
  'Beauty & Personal Care', 'Toys & Games', 'Books', 'Automotive'
];

const brands = [
  'TechCorp', 'HomeStyle', 'FashionCo', 'SportPro', 'BeautyLuxe',
  'ToyWorld', 'BookNook', 'AutoParts'
];

function generateProductData(): ProductData {
  const category = faker.helpers.arrayElement(categories);
  const brand = faker.helpers.arrayElement(brands);
  
  return {
    title: `${brand} ${faker.commerce.productName()}`,
    brand,
    category,
    basePrice: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    currency: 'USD',
    qualityScore: faker.number.float({ min: 0.5, max: 1.0 })
  };
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding (SQLite demo)...');
  
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    
    await prisma.listing.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplierProduct.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.feeSchedule.deleteMany();
    await prisma.fXRate.deleteMany();
    await prisma.dutyRule.deleteMany();

    // Create suppliers
    console.log('🏭 Creating suppliers...');
    const suppliers = await Promise.all([
      prisma.supplier.create({
        data: {
          name: 'Global Wholesale Inc.',
          country: 'US',
          lead_time_days: 7,
          contact_email: 'sales@globalwholesale.com'
        }
      }),
      prisma.supplier.create({
        data: {
          name: 'Euro Imports Ltd.',
          country: 'DE',
          lead_time_days: 14,
          contact_email: 'info@euroimports.de'
        }
      }),
      prisma.supplier.create({
        data: {
          name: 'Asia Direct Trading',
          country: 'CN',
          lead_time_days: 21,
          contact_email: 'contact@asiadirect.cn'
        }
      })
    ]);

    // Create fee schedules
    console.log('💰 Creating fee schedules...');
    await prisma.feeSchedule.create({
      data: {
        platform_pct: 0.10,
        payment_pct: 0.029,
        fixed_fee: 0.30,
        region: 'US'
      }
    });

    // Create FX rates
    console.log('💱 Creating FX rates...');
    await prisma.fXRate.createMany({
      data: [
        { base: 'USD', quote: 'EUR', rate: 0.85 },
        { base: 'USD', quote: 'GBP', rate: 0.75 },
        { base: 'USD', quote: 'CNY', rate: 7.20 }
      ]
    });

    // Create duty rules
    console.log('📋 Creating duty rules...');
    await prisma.dutyRule.createMany({
      data: [
        { origin: 'CN', dest: 'US', duty_pct: 0.05 },
        { origin: 'DE', dest: 'US', duty_pct: 0.02 },
        { origin: 'US', dest: 'US', duty_pct: 0.00 }
      ]
    });

    // Generate 100 products
    console.log('📦 Generating 100 products...');
    const products = [];
    for (let i = 0; i < 100; i++) {
      const productData = generateProductData();
      const product = await prisma.product.create({
        data: {
          canonical_sku: `PROD-${i.toString().padStart(4, '0')}`,
          title: productData.title,
          brand: productData.brand,
          category: productData.category,
          quality_score: productData.qualityScore,
          status: 'DRAFT'
        }
      });
      products.push(product);

      // Create supplier products
      const supplier = faker.helpers.arrayElement(suppliers);
      const supplierProduct = await prisma.supplierProduct.create({
        data: {
          supplier_id: supplier.id,
          sku: `SUP-${i.toString().padStart(4, '0')}`,
          name: productData.title,
          brand: productData.brand,
          category: productData.category,
          base_price: productData.basePrice,
          currency: productData.currency,
          moq: faker.number.int({ min: 1, max: 10 }),
          pack_qty: faker.number.int({ min: 1, max: 5 })
        }
      });

      // Calculate landed cost (simplified)
      const shippingCost = productData.basePrice * 0.1;
      const dutyCost = productData.basePrice * 0.05;
      const platformFees = productData.basePrice * 0.10 + 0.30;
      const paymentFees = productData.basePrice * 0.029;
      const landedCost = productData.basePrice + shippingCost + dutyCost + platformFees + paymentFees;

      // Create offer
      await prisma.offer.create({
        data: {
          product_id: product.id,
          supplier_product_id: supplierProduct.id,
          region: 'US',
          landed_cost: landedCost,
          currency: 'USD',
          shipping_days: supplier.lead_time_days + 3,
          available_qty: faker.number.int({ min: 10, max: 100 })
        }
      });

      // Create listing with arbitrage pricing
      // Ensure we get some arbitrage candidates by adjusting pricing
      const targetPrice = productData.basePrice * 1.8; // 80% markup to ensure margin
      const margin = (targetPrice - landedCost) / targetPrice;
      const absoluteMargin = targetPrice - landedCost;

      if (margin >= 0.15 && absoluteMargin >= 8) {
        await prisma.listing.create({
          data: {
            product_id: product.id,
            marketplace: 'GAM',
            title: product.title,
            description_md: `High-quality ${product.category} from ${product.brand}. Excellent value with great features.`,
            price: targetPrice,
            currency: 'USD',
            status: 'DRAFT'
          }
        });
      }
    }

    // Count arbitrage candidates
    const arbCandidates = await prisma.listing.count();
    console.log(`✅ Successfully seeded database!`);
    console.log(`📊 Generated ${products.length} products`);
    console.log(`💰 Found ${arbCandidates} arbitrage candidates`);
    console.log(`🏭 Created ${suppliers.length} suppliers`);

    // Show some arbitrage examples
    console.log('\n📈 Arbitrage Examples:');
    const examples = await prisma.listing.findMany({
      take: 5,
      include: {
        product: {
          include: {
            offers: true
          }
        }
      }
    });

    examples.forEach((listing, index) => {
      const offer = listing.product.offers[0];
      const margin = ((listing.price - offer.landed_cost) / listing.price * 100).toFixed(1);
      const absoluteMargin = (listing.price - offer.landed_cost).toFixed(2);
      console.log(`  ${index + 1}. ${listing.title}`);
      console.log(`     Supplier Cost: $${offer.landed_cost.toFixed(2)} | Target Price: $${listing.price.toFixed(2)}`);
      console.log(`     Margin: ${margin}% ($${absoluteMargin})`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedDatabase();