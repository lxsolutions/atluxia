import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const PORT = process.env.PORT || 8005

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'risk',
    timestamp: new Date().toISOString()
  })
})

// Risk assessment endpoints
app.post('/api/risk/assess-product', (req, res) => {
  const { product, supplier, pricing } = req.body
  
  // Simple risk assessment logic
  const riskScore = calculateRiskScore(product, supplier, pricing)
  const flags = generateRiskFlags(product, supplier, pricing)
  const recommendation = getRecommendation(riskScore, flags)
  
  res.json({
    riskScore,
    flags,
    recommendation,
    assessment: {
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  })
})

app.post('/api/risk/check-map-violation', (req, res) => {
  const { brand, price, marketplace } = req.body
  
  // Mock MAP (Minimum Advertised Price) violation check
  const mapViolation = checkMAPViolation(brand, price, marketplace)
  
  res.json({
    mapViolation,
    brand,
    price,
    marketplace,
    checkedAt: new Date().toISOString()
  })
})

app.post('/api/risk/check-prohibited', (req, res) => {
  const { category, brand, description } = req.body
  
  // Mock prohibited items check
  const isProhibited = checkProhibitedItems(category, brand, description)
  
  res.json({
    isProhibited,
    category,
    brand,
    description,
    checkedAt: new Date().toISOString()
  })
})

// Fraud detection
app.post('/api/risk/detect-fraud', (req, res) => {
  const { order, user, payment } = req.body
  
  // Mock fraud detection
  const fraudScore = detectFraud(order, user, payment)
  const fraudFlags = getFraudFlags(order, user, payment)
  
  res.json({
    fraudScore,
    fraudFlags,
    recommendation: fraudScore > 0.7 ? 'REJECT' : fraudScore > 0.4 ? 'REVIEW' : 'APPROVE',
    assessedAt: new Date().toISOString()
  })
})

// Risk scoring functions
function calculateRiskScore(product: any, supplier: any, pricing: any): number {
  let score = 0
  
  // Product risk factors
  if (!product.brand || product.brand === 'Generic') score += 0.2
  if (!product.warranty) score += 0.1
  if (product.category === 'Electronics') score += 0.1
  
  // Supplier risk factors
  if (!supplier.rating || supplier.rating < 4.0) score += 0.2
  if (supplier.leadTime > 14) score += 0.1
  
  // Pricing risk factors
  if (pricing.margin > 50) score += 0.2
  if (pricing.price < 10) score += 0.1
  
  return Math.min(score, 1.0)
}

function generateRiskFlags(product: any, supplier: any, pricing: any): string[] {
  const flags: string[] = []
  
  if (!product.brand || product.brand === 'Generic') flags.push('NO_BRAND')
  if (pricing.margin > 50) flags.push('HIGH_MARGIN')
  if (supplier.rating && supplier.rating < 4.0) flags.push('LOW_SUPPLIER_RATING')
  if (pricing.price < 10) flags.push('LOW_PRICE')
  if (product.category === 'Electronics') flags.push('HIGH_RISK_CATEGORY')
  
  return flags
}

function getRecommendation(riskScore: number, flags: string[]): string {
  if (riskScore > 0.7) return 'REJECT'
  if (riskScore > 0.4 || flags.includes('HIGH_MARGIN')) return 'REVIEW'
  return 'APPROVE'
}

function checkMAPViolation(brand: string, price: number, marketplace: string): boolean {
  // Mock MAP rules
  const mapRules: Record<string, number> = {
    'Apple': 899,
    'Samsung': 699,
    'Sony': 499,
    'Bose': 299
  }
  
  const mapPrice = mapRules[brand]
  return mapPrice ? price < mapPrice : false
}

function checkProhibitedItems(category: string, brand: string, description: string): boolean {
  const prohibitedCategories = ['Weapons', 'Drugs', 'Adult', 'Counterfeit']
  const prohibitedBrands = ['FakeBrand', 'CounterfeitCo']
  const prohibitedKeywords = ['fake', 'replica', 'counterfeit', 'knockoff']
  
  if (prohibitedCategories.includes(category)) return true
  if (prohibitedBrands.includes(brand)) return true
  if (prohibitedKeywords.some(keyword => description.toLowerCase().includes(keyword))) return true
  
  return false
}

function detectFraud(order: any, user: any, payment: any): number {
  let score = 0
  
  // Order patterns
  if (order.total > 1000) score += 0.2
  if (order.items.length > 5) score += 0.1
  
  // User patterns
  if (!user.verified) score += 0.2
  if (user.accountAge < 7) score += 0.1
  
  // Payment patterns
  if (payment.method === 'new_card') score += 0.1
  if (payment.amount > order.total) score += 0.3
  
  return Math.min(score, 1.0)
}

function getFraudFlags(order: any, user: any, payment: any): string[] {
  const flags: string[] = []
  
  if (order.total > 1000) flags.push('HIGH_VALUE_ORDER')
  if (!user.verified) flags.push('UNVERIFIED_USER')
  if (user.accountAge < 7) flags.push('NEW_ACCOUNT')
  if (payment.method === 'new_card') flags.push('NEW_PAYMENT_METHOD')
  if (payment.amount > order.total) flags.push('AMOUNT_MISMATCH')
  
  return flags
}

app.listen(PORT, () => {
  console.log(`🛡️ Risk service running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})