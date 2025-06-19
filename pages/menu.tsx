import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const dietColors: Record<string, string> = {
  veg: 'bg-green-100 text-green-800',
  egg: 'bg-yellow-100 text-yellow-800',
  'non-veg': 'bg-red-100 text-red-800',
}

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'veg' | 'egg' | 'non-veg'>('all')

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .order('name')

      console.log('📦 Data:', data)
      console.log('🚨 Error:', error)
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  const filtered = filter === 'all'
    ? products
    : products.filter((p) => p.diet_type === filter)

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">Explore Our Global Bakes</h1>
      <div className="flex gap-2 mb-6 text-sm">
        {['all', 'veg', 'egg', 'non-veg'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-3 py-1 rounded-full border ${
              filter === type
                ? 'bg-orange-200 border-orange-400'
                : 'bg-white border-gray-300'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  dietColors[item.diet_type] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.diet_type || 'unspecified'}
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-gray-700">{item.description}</p>
            )}
            <div className="text-sm mt-auto">
              {item.is_available === false ? (
                <span className="text-red-500 font-semibold">Sold Out</span>
              ) : item.stock_quantity !== null && item.stock_quantity <= 3 ? (
                <span className="text-orange-600 font-medium">
                  Only {item.stock_quantity} left!
                </span>
              ) : (
                <span className="text-green-600 font-medium">In Stock</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
// test deploy
