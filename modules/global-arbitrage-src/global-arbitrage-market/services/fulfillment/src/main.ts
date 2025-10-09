import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const PORT = process.env.PORT || 8004

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'fulfillment',
    timestamp: new Date().toISOString()
  })
})

// Mock fulfillment endpoints
app.post('/api/fulfillment/orders/:orderId/fulfill', (req, res) => {
  const { orderId } = req.params
  
  // Simulate fulfillment process
  const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  res.json({
    success: true,
    orderId,
    trackingNumber,
    estimatedDelivery,
    status: 'FULFILLED',
    message: 'Order fulfillment initiated successfully',
    timestamp: new Date().toISOString()
  })
})

app.get('/api/fulfillment/orders/:orderId/tracking', (req, res) => {
  const { orderId } = req.params
  
  // Mock tracking information
  const trackingInfo = {
    orderId,
    trackingNumber: `TRK${orderId}`,
    status: 'IN_TRANSIT',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    events: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Warehouse A',
        description: 'Package shipped',
        status: 'SHIPPED'
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Distribution Center',
        description: 'In transit',
        status: 'IN_TRANSIT'
      }
    ]
  }
  
  res.json(trackingInfo)
})

// Supplier purchase simulation
app.post('/api/fulfillment/supplier-purchase', (req, res) => {
  const { productId, quantity, supplierId } = req.body
  
  // Simulate supplier purchase
  const purchaseOrderId = `PO${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  
  res.json({
    success: true,
    purchaseOrderId,
    productId,
    quantity,
    supplierId,
    status: 'ORDERED',
    estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    message: 'Purchase order created with supplier',
    timestamp: new Date().toISOString()
  })
})

// Shipping rates simulation
app.post('/api/fulfillment/shipping-rates', (req, res) => {
  const { from, to, weight, dimensions } = req.body
  
  // Mock shipping rates
  const rates = [
    {
      carrier: 'Standard Shipping',
      service: 'Ground',
      cost: 8.99,
      estimatedDays: 5,
      currency: 'USD'
    },
    {
      carrier: 'Express Shipping',
      service: '2-Day',
      cost: 19.99,
      estimatedDays: 2,
      currency: 'USD'
    },
    {
      carrier: 'Premium Shipping',
      service: 'Overnight',
      cost: 34.99,
      estimatedDays: 1,
      currency: 'USD'
    }
  ]
  
  res.json({
    from,
    to,
    weight,
    dimensions,
    rates,
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`🚚 Fulfillment service running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})