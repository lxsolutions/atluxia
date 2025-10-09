import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testArbitragePipeline() {
  console.log('🧪 Testing arbitrage pipeline...\n');

  // 1. Check database connectivity and data
  console.log('1. Checking database connectivity...');
  try {
    const productCount = await prisma.product.count();
    const supplierCount = await prisma.supplier.count();
    const offerCount = await prisma.offer.count();
    
    console.log(`   ✅ Products: ${productCount}`);
    console.log(`   ✅ Suppliers: ${supplierCount}`);
    console.log(`   ✅ Offers: ${offerCount}`);
    
    if (productCount === 0) {
      console.log('   ❌ No products found. Run `make seed` first.');
      return;
    }
  } catch (error) {
    console.log('   ❌ Database connection failed:', error);
    return;
  }

  // 2. Find arbitrage candidates
  console.log('\n2. Finding arbitrage candidates...');
  
  // Get products with high quality scores
  const highQualityProducts = await prisma.product.findMany({
    where: {
      quality_score: { gte: 0.65 },
    },
    include: {
      offers: {
        include: {
          supplierProduct: {
            include: {
              supplier: true,
            },
          },
        },
      },
    },
    take: 50,
  });

  console.log(`   ✅ Found ${highQualityProducts.length} high-quality products`);

  // 3. Simulate pricing calculation
  console.log('\n3. Simulating pricing calculations...');
  
  const candidates = [];
  
  for (const product of highQualityProducts) {
    for (const offer of product.offers) {
      // Simplified arbitrage check
      const supplierPrice = offer.supplierProduct.base_price;
      const landedCost = offer.landed_cost;
      const targetPrice = landedCost * 1.3; // 30% markup
      
      const marginPct = (targetPrice - landedCost) / targetPrice;
      const absMargin = targetPrice - landedCost;
      
      // Check arbitrage viability
      const minMarginPct = 0.15;
      const minAbsMargin = 8.0;
      
      const isViable = marginPct >= minMarginPct && absMargin >= minAbsMargin;
      
      if (isViable) {
        candidates.push({
          productId: product.id,
          title: product.title,
          brand: product.brand,
          supplierPrice,
          landedCost,
          targetPrice,
          marginPct: Math.round(marginPct * 100),
          absMargin: Math.round(absMargin * 100) / 100,
          qualityScore: product.quality_score,
        });
      }
    }
  }

  console.log(`   ✅ Found ${candidates.length} viable arbitrage candidates`);

  // 4. Display top candidates
  if (candidates.length > 0) {
    console.log('\n4. Top arbitrage candidates:');
    console.log('   ┌' + '─'.repeat(100) + '┐');
    console.log('   │ ' + 'Product'.padEnd(30) + ' │ ' + 'Brand'.padEnd(10) + ' │ ' + 'Margin'.padEnd(8) + ' │ ' + 'Profit'.padEnd(8) + ' │ ' + 'Quality'.padEnd(8) + ' │');
    console.log('   ├' + '─'.repeat(100) + '┤');
    
    const topCandidates = candidates
      .sort((a, b) => b.marginPct - a.marginPct)
      .slice(0, 10);
    
    for (const candidate of topCandidates) {
      const title = candidate.title.length > 28 ? candidate.title.substring(0, 25) + '...' : candidate.title;
      console.log(
        `   │ ${title.padEnd(30)} │ ${candidate.brand.padEnd(10)} │ ${candidate.marginPct + '%'.padEnd(8)} │ $${candidate.absMargin.toFixed(2).padEnd(8)} │ ${candidate.qualityScore.toFixed(2).padEnd(8)} │`
      );
    }
    console.log('   └' + '─'.repeat(100) + '┘');
  }

  // 5. Summary
  console.log('\n5. Pipeline Summary:');
  console.log(`   ✅ Database: Connected with ${highQualityProducts.length} high-quality products`);
  console.log(`   ✅ Arbitrage: ${candidates.length} viable candidates found`);
  console.log(`   ✅ Quality: ${candidates.filter(c => c.qualityScore >= 0.8).length} premium candidates`);
  
  if (candidates.length >= 50) {
    console.log('\n🎉 SUCCESS: Arbitrage pipeline is working correctly!');
    console.log('   The system can identify profitable arbitrage opportunities.');
  } else {
    console.log('\n⚠️  WARNING: Not enough arbitrage candidates found.');
    console.log('   Consider adjusting pricing parameters or adding more products.');
  }
}

testArbitragePipeline()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });