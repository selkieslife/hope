import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
const deliveryDayIndexes = [2, 4, 6] // dayjs().day(): 0=Sun, 6=Sat

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

  const handleStartDateChange = (date: string) => {
    setStartDate(date)
    const base = dayjs(date)
    const end = base.add(1, 'month')
    const adjustedEnd = end.add((7 - end.day()) % 7, 'day') // Round to next Tue/Thu/Sat if needed

    if (recurrence === 'weekly') {
      setEndDate(adjustedEnd.format('YYYY-MM-DD'))
    }

    const out: Record<Day, string> = {
      Tuesday: '',
      Thursday: '',
      Saturday: '',
    }
    for (let i = 0; i < 21; i++) {
      const d = base.add(i, 'day')
      const day = d.format('dddd') as Day
      if (deliveryDays.includes(day) && !out[day]) {
        out[day] = d.format('YYYY-MM-DD')
      }
    }
    setValidDates(out)
  }

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

  const groupedProducts = ['Artisanal Breads', 'Savouries'].reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Product[]>)

  const canProceed = startDate && (recurrence === 'one-time' || endDate)

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">🧺 Build Your Box</h1>

      {/* Step 1: Recurrence */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">How often would you like this?</label>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value="one-time"
              checked={recurrence === 'one-time'}
              onChange={() => {
                setRecurrence('one-time')
                setEndDate('')
              }}
              className="mr-2"
            />
            One-time Trial
          </label>
          <label>
            <input
              type="radio"
              value="weekly"
              checked={recurrence === 'weekly'}
              onChange={() => {
                setRecurrence('weekly')
                if (startDate) {
                  handleStartDateChange(startDate)
                }
              }}
              className="mr-2"
            />
            Monthly Subscription
          </label>
        </div>
      </div>

      {/* Step 2: Start Date */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          {recurrence === 'one-time' ? 'Choose your delivery date:' : 'Start Date:'}
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          min={dayjs().format('YYYY-MM-DD')}
        />
      </div>

      {/* Step 3: End Date (only for subscription) */}
      {recurrence === 'weekly' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            min={startDate}
          />
        </div>
      )}

      {/* Step 4: Summary of Delivery Days */}
      {canProceed && recurrence === 'weekly' && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Our next deliveries are planned for:</p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {deliveryDays.map((day) => (
              <li key={day}>
                {day} ({dayjs(validDates[day]).format('DD MMM')})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 5: Product Picker */}
      {canProceed && (
        <>
          {/* One-time trial: only show selected start date's weekday */}
          {recurrence === 'one-time' ? (
            <>
              {(() => {
                const oneDay = dayjs(startDate).format('dddd') as Day
                return (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">{oneDay}</h2>
                    {Object.entries(groupedProducts).map(([group, items]) => (
                      <div key={group} className="mb-4">
                        <h3 className="font-semibold mb-2">{group}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {items.map((item) => {
                            const qty = selections[oneDay][item.id]?.quantity || 0
                            const isExpanded = expandedDescriptions[item.id]
                            const shortDesc = item.description?.slice(0, 60)

                            return (
                              <div key={item.id} className="border rounded-xl p-4 bg-white">
                                <h4 className="text-md font-medium mb-1">{item.name}</h4>
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
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => decrement(oneDay, item)}
                                    className="px-2 py-1 border rounded"
                                  >
                                    −
                                  </button>
                                  <span>{qty}</span>
                                  <button
                                    onClick={() => increment(oneDay, item)}
                                    className="px-2 py-1 border rounded"
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
                  </div>
                )
              })()}
            </>
          ) : (
            <>
              {/* Subscription: tabs for Tue/Thu/Sat */}
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

              {Object.entries(groupedProducts).map(([group, items]) => (
                <div key={group} className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">{group}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item) => {
                      const qty = selections[selectedDay][item.id]?.quantity || 0
                      const isExpanded = expandedDescriptions[item.id]
                      const shortDesc = item.description?.slice(0, 60)

                      return (
                        <div key={item.id} className="border rounded-xl p-4 bg-white">
                          <h4 className="text-md font-medium mb-1">{item.name}</h4>
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
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => decrement(selectedDay, item)}
                              className="px-2 py-1 border rounded"
                            >
                              −
                            </button>
                            <span>{qty}</span>
                            <button
                              onClick={() => increment(selectedDay, item)}
                              className="px-2 py-1 border rounded"
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
        </>
      )}

      {canProceed && (
        <div className="text-right mt-8">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">
            Next: Address →
          </button>
        </div>
      )}
    </div>
  )
}
