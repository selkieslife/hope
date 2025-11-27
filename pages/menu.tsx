import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const dietColors = {
  veg: 'bg-green-100 text-green-800',
  egg: 'bg-yellow-100 text-yellow-800',
  'non-veg': 'bg-red-100 text-red-800',
}

export default function MenuPage() {
  const [products, setProducts] = useState([])
  const [dietFilter, setDietFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expandedGroups, setExpandedGroups] = useState({})
  const [expandedDesc, setExpandedDesc] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('Products').select('*').order('name')
      if (!error) setProducts(data || [])
    }
    fetchProducts()
  }, [])

  const priorityOrder = ['artisanal breads', 'italian pastries', 'japanese pastries']

  const rawCategories = [...new Set(products.map((p) => p.category?.toLowerCase()))].filter(Boolean)

  const sortedCategories = [...rawCategories].sort((a, b) => {
    const ai = priorityOrder.indexOf(a)
    const bi = priorityOrder.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  const filtered = products.filter((p) => {
    const matchDiet = dietFilter === 'all' || p.diet_type?.toLowerCase() === dietFilter
    const matchCategory = categoryFilter === 'all' || p.category?.toLowerCase() === categoryFilter
    return matchDiet && matchCategory
  })

  const grouped = filtered.reduce((acc, item) => {
    const key = item.subcategory || item.category || 'Misc'
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen p-4 bg-[#fffaf5]">
      <h1 className="text-2xl font-serif mb-4">Explore Our Global Bakes</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'veg', 'egg', 'non-veg'].map((type) => (
          <button
            key={type}
            onClick={() => setDietFilter(type)}
            className={`px-3 py-1 rounded-full border ${
              dietFilter === type ? 'bg-orange-200 border-orange-400' : 'bg-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <select
        className="mb-6 px-3 py-2 rounded border bg-white shadow-sm"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="all">All Categories</option>
        {sortedCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Empty */}
      {filtered.length === 0 && <p>No products found.</p>}

      {/* Groups */}
      {Object.keys(grouped).map((group) => (
        <div className="mb-6" key={group}>
          <button
            onClick={() =>
              setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
            }
            className="w-full text-left text-lg font-semibold bg-gray-100 px-4 py-2 rounded-md flex justify-between"
          >
            {group}
            <span>{expandedGroups[group] ? '−' : '+'}</span>
          </button>

          {expandedGroups[group] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {grouped[group].map((item) => (
                <div key={item.id} className="border p-4 rounded-xl shadow-sm bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold">{item.name}</h3>

                    {item.diet_type && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          dietColors[item.diet_type.toLowerCase()]
                        }`}
                      >
                        {item.diet_type}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700">
                    {expandedDesc[item.id]
                      ? item.description
                      : item.description?.slice(0, 60)}

                    {item.description?.length > 60 && (
                      <button
                        className="ml-2 text-blue-600 underline text-xs"
                        onClick={() =>
                          setExpandedDesc((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }))
                        }
                      >
                        {expandedDesc[item.id] ? 'less' : 'more'}
                      </button>
                    )}
                  </p>

                  <div className="text-sm mt-2">
                    {item.is_available === false ? (
                      <span className="text-red-500">Sold Out</span>
                    ) : item.stock_quantity <= 3 ? (
                      <span className="text-orange-600">
                        Only {item.stock_quantity} left!
                      </span>
                    ) : (
                      <span className="text-green-600">In Stock</span>
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
