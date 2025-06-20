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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('Products').select('*').order('name')
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

 const priorityOrder = ['Artisanal Breads', 'Italian Pastries', 'Japanese Pastries']

const categories = Array.from(
  new Set(products.map((p) => p.category?.toLowerCase()))
).filter(Boolean)

categories.sort((a, b) => {
  const aIndex = priorityOrder.indexOf(a)
  const bIndex = priorityOrder.indexOf(b)

  if (aIndex === -1 && bIndex === -1) return a.localeCompare(b) // normal sort
  if (aIndex === -1) return 1
  if (bIndex === -1) return -1
  return aIndex - bIndex
})

  
  const filtered = products.filter((p) => {
    const matchDiet =
      dietFilter === 'all' || (p.diet_type && p.diet_type.toLowerCase() === dietFilter)
    const matchCategory =
      categoryFilter === 'all' || (p.category && p.category.toLowerCase() === categoryFilter)
    return matchDiet && matchCategory
  })

  const grouped = filtered.reduce((acc, item) => {
    const groupKey = (item.subcategory || item.category || 'Misc').trim()
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(item)
    return acc
  }, {} as Record<string, any[]>)

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">Explore Our Global Bakes</h1>

      {/* DIET FILTER */}
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

      {/* CATEGORY DROPDOWN */}
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="mb-6 px-3 py-2 border rounded-md bg-white shadow-sm text-sm"
      >
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <p className="text-gray-600 text-sm italic">No products match this filter.</p>
      )}

      {/* GROUPED PRODUCTS */}
      {Object.keys(grouped).map((group) => (
        <div key={group} className="mb-6">
          <button
            onClick={() => toggleGroup(group)}
            className="w-full text-left text-lg font-semibold mb-2 flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md"
          >
            {group}
            <span>{expandedGroups[group] ? '−' : '+'}</span>
          </button>

          {expandedGroups[group] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grouped[group].map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold">{item.name}</h3>
                    {item.diet_type && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          dietColors[item.diet_type.toLowerCase()] || 'bg-gray-100 text-gray-800'
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
          )}
        </div>
      ))}
    </div>
  )
}
