import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
const deliveryDayIndexes = [2, 4, 6] // 0=Sun, ..., 6=Sat

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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDay, setSelectedDay] = useState<Day>('Tuesday')
  const [selections, setSelections] = useState<DaySelections>({
    Tuesday: {},
    Thursday: {},
    Saturday: {},
  })
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({})
  const [showSummary, setShowSummary] = useState(false)

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

  const generateValidDates = () => {
    const dates = []
    let day = dayjs()
    for (let i = 0; i < 60; i++) {
      if (deliveryDayIndexes.includes(day.day())) {
        dates.push(day.format('YYYY-MM-DD'))
      }
      day = day.add(1, 'day')
    }
    return dates
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    if (recurrence === 'weekly') {
      const autoEnd = dayjs(value).add(30, 'days')
      let adjusted = autoEnd
      while (!deliveryDayIndexes.includes(adjusted.day())) {
        adjusted = adjusted.subtract(1, 'day')
      }
      setEndDate(adjusted.format('YYYY-MM-DD'))
    } else {
      setEndDate('')
    }
  }

  const groupedProducts = ['Artisanal Breads', 'Savouries'].reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Product[]>)

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

  const copyFromDay = (from: Day, to: Day) => {
    setSelections((prev) => ({ ...prev, [to]: { ...prev[from] } }))
  }

  const summaryItems = Object.entries(selections)
    .flatMap(([day, items]) =>
      Object.values(items).map(({ product, quantity }) => ({
        day,
        name: product.name,
        quantity,
      }))
    )
    .sort((a, b) => a.day.localeCompare(b.day))

  const isDateValid = (date: string) => deliveryDayIndexes.includes(dayjs(date).day())

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-6">🧺 Build Your Box</h1>

      {/* Step 0: Recurrence */}
      <div className="mb-6">
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

      {/* Step 1: Dates */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">
            {recurrence === 'weekly' ? 'Start Date (Tues/Thu/Sat only)' : 'Choose your delivery date'}
          </label>
          <select
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Select --</option>
            {generateValidDates().map((d) => (
              <option key={d} value={d}>
                {dayjs(d).format('dddd, D MMM')}
              </option>
            ))}
          </select>
        </div>

        {recurrence === 'weekly' && (
          <div>
            <label className="block mb-1 font-medium">End Date (auto-filled, editable)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              min={startDate}
            />
          </div>
        )}
      </div>

      {/* Step 2: Product Picker */}
      {startDate && (recurrence === 'weekly' || recurrence === 'one-time') && (
        <>
          {recurrence === 'weekly' && (
            <>
              {/* Tabs */}
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

              {/* Copy from */}
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
            </>
          )}

          {/* Product Grid */}
          {Object.entries(groupedProducts).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{group}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const qty =
                    recurrence === 'weekly'
                      ? selections[selectedDay][item.id]?.quantity || 0
                      : selections['Tuesday'][item.id]?.quantity || 0

                  return (
                    <div key={item.id} className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2">
                      <h3 className="text-md font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-700">
                        {expandedDescriptions[item.id]
                          ? item.description
                          : item.description?.slice(0, 60)}
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
                            {expandedDescriptions[item.id] ? 'less' : 'more'}
                          </button>
                        )}
                      </p>

                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() =>
                            recurrence === 'weekly'
                              ? decrement(selectedDay, item)
                              : decrement('Tuesday', item)
                          }
                          className="px-2 py-1 border rounded text-xl"
                        >
                          −
                        </button>
                        <span className="text-md w-6 text-center">{qty}</span>
                        <button
                          onClick={() =>
                            recurrence === 'weekly'
                              ? increment(selectedDay, item)
                              : increment('Tuesday', item)
                          }
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
        </>
      )}

      {/* Step 3: Summary + Razorpay CTA */}
      {startDate && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">🧾 Order Summary</h2>
          <ul className="text-sm mb-4">
            {summaryItems.map((item, i) => (
              <li key={i}>
                {item.day}: {item.name} × {item.quantity}
              </li>
            ))}
          </ul>
          <a
            href="https://razorpay.me/@selkies"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
          >
            Proceed to Payment
          </a>
        </div>
      )}
    </div>
  )
}
