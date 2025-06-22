import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
type Day = typeof deliveryDays[number]

const shortDesc = item.description?.slice(0, 60) || ''


type Product = {
  id: number
  name: string
  category: string
  description?: string
  is_available?: boolean
  stock_quantity?: number
}

type DaySelections = Record<
  Day,
  {
    [productId: number]: {
      product: Product
      quantity: number
    }
  }
>

export default function SubscribePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedDay, setSelectedDay] = useState<Day>('Tuesday')
  const [selections, setSelections] = useState<DaySelections>({
    Tuesday: {},
    Thursday: {},
    Saturday: {},
  })
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('Products')
        .select('*')
        .in('category', ['Artisanal Breads', 'Savouries'])
        .order('name')
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  const increment = (day: Day, product: Product) => {
    setSelections((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [product.id]: {
          product,
          quantity: (prev[day][product.id]?.quantity || 0) + 1,
        },
      },
    }))
  }

  const decrement = (day: Day, product: Product) => {
    const currentQty = selections[day][product.id]?.quantity || 0
    setSelections((prev) => {
      const updated = { ...prev[day] }
      if (currentQty <= 1) {
        delete updated[product.id]
      } else {
        updated[product.id] = {
          product,
          quantity: currentQty - 1,
        }
      }
      return { ...prev, [day]: updated }
    })
  }

  const copyFromDay = (from: Day, to: Day) => {
    setSelections((prev) => ({
      ...prev,
      [to]: { ...prev[from] },
    }))
  }

  const groupedProducts = ['Artisanal Breads', 'Savouries'].reduce((acc, category) => {
    acc[category] = products.filter((p) => p.category === category)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">🧺 Build Your Box</h1>

      {/* STEP 0 – placeholder */}
      <div className="mb-6 text-sm italic text-gray-600">
        (Login/Guest logic coming soon)
      </div>

      {/* STEP 1 – Delivery Day Tabs */}
      <div className="flex gap-2 mb-4">
        {deliveryDays.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1 rounded-full border ${
              selectedDay === day
                ? 'bg-orange-200 border-orange-400'
                : 'bg-white border-gray-300'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* COPY FROM ANOTHER DAY */}
      <div className="mb-3 text-sm text-gray-700">
        Copy from:{' '}
        {deliveryDays
          .filter((d) => d !== selectedDay)
          .map((d) => (
            <button
              key={d}
              onClick={() => copyFromDay(d, selectedDay)}
              className="underline text-blue-600 mr-2"
            >
              {d}
            </button>
          ))}
      </div>

      {/* PRODUCT GRID – Grouped by Category */}
      {Object.entries(groupedProducts).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{group}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => {
              const qty = selections[selectedDay][item.id]?.quantity || 0
              const isExpanded = expandedDescriptions[item.id]
              const shortDesc = item.description?.slice(0, 60)

              return (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold">{item.name}</h3>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-gray-700">
                      {isExpanded
                        ? item.description
                        : shortDesc}
                      {item.description && item.description.length > 60 && (
                        <button
                          className="ml-2 text-blue-600 underline text-xs"
                          onClick={() =>
                            setExpandedDescriptions((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                        >
                          {isExpanded ? 'less' : 'more'}
                        </button>
                      )}
                    </p>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => decrement(selectedDay, item)}
                      className="px-2 py-1 border rounded text-xl"
                    >
                      −
                    </button>
                    <span className="text-md w-6 text-center">{qty}</span>
                    <button
                      onClick={() => increment(selectedDay, item)}
                      className="px-2 py-1 border rounded text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* NEXT STEP PLACEHOLDER */}
      <div className="text-right mt-8">
        <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">
          Next: Choose Schedule →
        </button>
      </div>
    </div>
  )
}
