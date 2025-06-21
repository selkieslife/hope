import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
type Day = typeof deliveryDays[number]

type Product = {
  id: number
  name: string
  category: string
  description?: string
  is_available?: boolean
  stock_quantity?: number
}

export default function SubscribePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedDay, setSelectedDay] = useState<Day>('Tuesday')
  const [selections, setSelections] = useState<Record<Day, Product[]>>({
    Tuesday: [],
    Thursday: [],
    Saturday: [],
  })

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

  const toggleProduct = (day: Day, product: Product) => {
    const current = selections[day]
    const exists = current.find((p) => p.id === product.id)
    const updated = exists
      ? current.filter((p) => p.id !== product.id)
      : [...current, product]
    setSelections({ ...selections, [day]: updated })
  }

  const copyFromDay = (from: Day, to: Day) => {
    setSelections((prev) => ({ ...prev, [to]: prev[from] }))
  }

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

      {/* PRODUCT SELECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {products.map((item) => {
          const isSelected = selections[selectedDay].some((p) => p.id === item.id)
          return (
            <div
              key={item.id}
              onClick={() => toggleProduct(selectedDay, item)}
              className={`cursor-pointer border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2 transition ${
                isSelected ? 'ring-2 ring-orange-400' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">{item.name}</h3>
                {isSelected && <span className="text-xs">✓</span>}
              </div>
              {item.description && (
                <p className="text-sm text-gray-700">{item.description}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* NEXT STEP PLACEHOLDER */}
      <div className="text-right">
        <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">
          Next: Choose Schedule →
        </button>
      </div>
    </div>
  )
}
