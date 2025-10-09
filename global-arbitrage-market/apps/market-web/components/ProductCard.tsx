'use client'

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

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const savingsPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="aspect-w-1 aspect-h-1 bg-gray-200">
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm text-gray-600">Product Image</div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.title}
          </h3>
          {product.savings && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Save ${product.savings}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="flex items-center mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <>
              <span className="ml-2 text-lg text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
              <span className="ml-2 text-sm font-medium text-red-600">
                {savingsPercentage}% off
              </span>
            </>
          )}
        </div>

        {/* Delivery Info */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Delivery in {product.deliveryDays} days</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  )
}