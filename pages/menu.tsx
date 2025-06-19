import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const dietColors: Record<string, string> = {
  veg: 'bg-green-100 text-green-800',
  egg: 'bg-yellow-100 text-yellow-800',
  'non-veg': 'bg-red-100 text-red-800',
}

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([])
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'egg' | 'non-veg'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('Products').select('*').order('name')
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean)

  const filtered = products.filter(p => {
    const matchDiet = dietFilter === 'all' || p.diet_type === dietFilter
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter
    return matchDiet && matchCategory
  })

  // Group by subcategory or fallback to category
  const grouped = filtered.reduce((acc, item) => {
    const groupKey = item.subcategory || item.category || 'Others'
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(item)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">Explore Our Global Bakes</h1>

      {/* DIET FILTERS */}
      <div className="flex gap-2 mb-3 text-sm flex-wrap">
        {['all', 'veg', 'egg', 'non-veg'].map((type) => (
          <button
            key={type}
            onClick={() => setDietFilter(type as any)}
            className={`px-3 py-1 rounded-full border ${
              dietFilter === type
                ? 'bg-orange-200 border-orange-400'
                : 'bg-white border-gray-300'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex gap-2 mb-6 text-sm flex-wrap">
        {['all', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full border ${
              categoryFilter === cat
                ? 'bg-purple-200 border-purple-400'
                : 'bg-white border-gray-300'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* GROUPED PRODUCT DISPLAY */}
      {Object.keys(grouped).map((groupName) => (
        <div key={groupName} className="mb-8">
          <h2 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">{groupName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {grouped[groupName].map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold">{item.name}</h3>
                  {item.diet_type && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        dietColors[item.diet_type] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.diet_type}
                    </span>
                  )}
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
      ))}
    </div>
  )
}
