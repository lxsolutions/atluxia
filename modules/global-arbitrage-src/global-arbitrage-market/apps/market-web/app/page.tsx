'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import Cart from '@/components/Cart'

interface Product {
  id: string
  title: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  image: string
  description: string
  deliveryDays: number
  savings?: number
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    const mockProducts: Product[] = [
      {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        brand: 'AudioTech',
        category: 'Electronics',
        price: 89.99,
        originalPrice: 129.99,
        image: '/api/placeholder/300/300',
        description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
        deliveryDays: 3,
        savings: 40.00,
      },
      {
        id: '2',
        title: 'Ergonomic Office Chair',
        brand: 'ComfortSeat',
        category: 'Furniture',
        price: 249.99,
        originalPrice: 349.99,
        image: '/api/placeholder/300/300',
        description: 'Professional ergonomic office chair with lumbar support and adjustable height.',
        deliveryDays: 5,
        savings: 100.00,
      },
      {
        id: '3',
        title: 'Stainless Steel Water Bottle',
        brand: 'HydroFlask',
        category: 'Sports & Outdoors',
        price: 34.99,
        originalPrice: 49.99,
        image: '/api/placeholder/300/300',
        description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours.',
        deliveryDays: 2,
        savings: 15.00,
      },
      {
        id: '4',
        title: 'Smart Fitness Watch',
        brand: 'FitTech',
        category: 'Electronics',
        price: 199.99,
        originalPrice: 279.99,
        image: '/api/placeholder/300/300',
        description: 'Advanced fitness tracker with heart rate monitoring and GPS.',
        deliveryDays: 4,
        savings: 80.00,
      },
      {
        id: '5',
        title: 'Organic Coffee Beans',
        brand: 'MorningBrew',
        category: 'Food & Beverage',
        price: 24.99,
        originalPrice: 34.99,
        image: '/api/placeholder/300/300',
        description: 'Premium organic coffee beans from sustainable farms.',
        deliveryDays: 3,
        savings: 10.00,
      },
      {
        id: '6',
        title: 'Yoga Mat Premium',
        brand: 'ZenFlow',
        category: 'Sports & Outdoors',
        price: 39.99,
        originalPrice: 59.99,
        image: '/api/placeholder/300/300',
        description: 'Non-slip premium yoga mat with extra cushioning.',
        deliveryDays: 2,
        savings: 20.00,
      },
    ]

    setProducts(mockProducts)
    setLoading(false)
  }, [])

  const addToCart = (product: Product) => {
    setCart([...cart, product])
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const cartTotal = cart.reduce((total, item) => total + item.price, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading marketplace...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                GAM Marketplace
              </h1>
              <p className="ml-4 text-sm text-gray-500">
                Global Arbitrage Deals
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              Global Arbitrage Marketplace
            </h2>
            <p className="text-xl mb-8">
              Discover amazing deals sourced from global markets with guaranteed savings
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Global Sourcing</h3>
                <p className="text-sm">Products sourced from international markets</p>
              </div>
              <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
                <p className="text-sm">Guaranteed savings through arbitrage</p>
              </div>
              <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm">Quick fulfillment with tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </section>

      {/* Cart Sidebar */}
      {showCart && (
        <Cart
          cart={cart}
          total={cartTotal}
          onClose={() => setShowCart(false)}
          onRemoveItem={removeFromCart}
        />
      )}
    </div>
  )
}