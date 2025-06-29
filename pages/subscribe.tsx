import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
const deliveryDayIndexes = [2, 4, 6] // dayjs().day(): 0=Sunday, ..., 6=Saturday

type Day = typeof deliveryDays[number]

type Product = {
  id: number
  name: string
  category: string
  description?: string
}

type DaySelections = Record<Day, { [productId: number]: { product: Product; quantity: number } }>

export default function SubscribePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recurrence, setRecurrence] = useState<'one-time' | 'weekly'>('one-time')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [validDates, setValidDates] = useState<Record<Day, string>>({} as any)
  const [selectedDay, setSelectedDay] = useState<Day>('Tuesday')
  const [selections, setSelections] = useState<DaySelections>({
    Tuesday: {},
    Thursday: {},
    Saturday: {},
  })
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({})
  const [address, setAddress] = useState('')

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

  useEffect(() => {
    if (startDate && recurrence === 'weekly') {
      const base = dayjs(startDate)
      const end = base.add(1, 'month')
      const days: Record<Day, string> = {
        Tuesday: '',
        Thursday: '',
        Saturday: '',
      }
      for (let i = 0; i < 31; i++) {
        const date = base.add(i, 'day')
        const d = date.format('dddd') as Day
        if (deliveryDays.includes(d) && !days[d]) {
          days[d] = date.format('YYYY-MM-DD')
        }
      }
      setEndDate(end.format('YYYY-MM-DD'))
      setValidDates(days)
    }
  }, [startDate, recurrence])

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
      if (currentQty <= 1) delete updated[product.id]
      else updated[product.id] = { product, quantity: currentQty - 1 }
      return { ...prev, [day]: updated }
    })
  }

  const groupedProducts = ['Artisanal Breads', 'Savouries'].reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Product[]>)

  const renderSummary = () => {
    const items = deliveryDays.flatMap((day) =>
      Object.values(selections[day]).map((entry) => ({
        ...entry.product,
        quantity: entry.quantity,
        day,
      }))
    )
    return (
      <div className="bg-white rounded p-4 mt-6 shadow">
        <h2 className="text-lg font-semibold mb-2">📦 Order Summary</h2>
        <p className="text-sm mb-2">Start: {dayjs(startDate).format('DD MMM YYYY')}</p>
        {recurrence === 'weekly' && (
          <p className="text-sm mb-2">End: {dayjs(endDate).format('DD MMM YYYY')}</p>
        )}
        <ul className="list-disc pl-5 text-sm">
          {items.map((item, idx) => (
            <li key={idx}>{item.day}: {item.name} × {item.quantity}</li>
          ))}
        </ul>
        <p className="mt-4 font-medium text-sm">Delivery PIN Code: 400607</p>
        <a
          href="https://razorpay.me/@selkies"
          className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full"
        >
          Proceed to Pay
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">🧺 Build Your Box</h1>

      {/* Recurrence */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">How often would you like this?</label>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value="one-time"
              checked={recurrence === 'one-time'}
              onChange={() => setRecurrence('one-time')}
              className="mr-2"
            />
            One-time Trial
          </label>
          <label>
            <input
              type="radio"
              value="weekly"
              checked={recurrence === 'weekly'}
              onChange={() => setRecurrence('weekly')}
              className="mr-2"
            />
            Monthly Subscription
          </label>
        </div>
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          {recurrence === 'one-time' ? 'Choose your delivery date:' : 'Select a start date:'}
        </label>
        <select
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">-- Choose a date --</option>
          {[...Array(30)].map((_, i) => {
            const date = dayjs().add(i, 'day')
            const dayNum = date.day()
            if (!deliveryDayIndexes.includes(dayNum)) return null
            return (
              <option key={i} value={date.format('YYYY-MM-DD')}>
                {date.format('dddd, D MMM')}
              </option>
            )
          })}
        </select>
      </div>

      {/* End Date */}
      {recurrence === 'weekly' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select an end date (optional):</label>
          <input
            type="date"
            value={endDate}
            min={dayjs(startDate).add(7, 'day').format('YYYY-MM-DD')}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      )}

      {/* Product Picker */}
      {startDate && (
        <>
          <div className="flex gap-2 mb-4">
            {deliveryDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 rounded-full border ${
                  selectedDay === day ? 'bg-orange-200 border-orange-400' : 'bg-white border-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Products */}
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
                      {item.description && (
                        <p className="text-sm text-gray-700">
                          {isExpanded ? item.description : shortDesc}
                          {item.description.length > 60 && (
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

          {renderSummary()}
        </>
      )}
    </div>
  )
}
