// pages/subscribe.tsx
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

  const generateStartDates = () => {
    const options: { label: string; value: string }[] = []
    let day = dayjs()
    for (let i = 0; i < 30; i++) {
      if (deliveryDayIndexes.includes(day.day())) {
        options.push({ label: `${day.format('dddd')} (${day.format('DD MMM')})`, value: day.format('YYYY-MM-DD') })
      }
      day = day.add(1, 'day')
    }
    return options
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)

    // Auto-fill end date to 1 month from start, on same weekday
    const nextMonth = dayjs(value).add(1, 'month')
    const validEnd = nextMonth
      .add(7 - (nextMonth.day() % 7), 'day')
      .startOf('day')
    setEndDate(validEnd.format('YYYY-MM-DD'))

    const base = dayjs(value)
    const out: Record<Day, string> = { Tuesday: '', Thursday: '', Saturday: '' }
    for (let i = 0; i < 21; i++) {
      const date = base.add(i, 'day')
      const dayName = date.format('dddd') as Day
      if (deliveryDays.includes(dayName) && !out[dayName]) {
        out[dayName] = date.format('YYYY-MM-DD')
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

  const canProceed = !!startDate && (recurrence === 'one-time' || !!endDate)

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">🧺 Build Your Box</h1>

      {/* STEP 0: Recurrence */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">How often would you like this?</label>
        <label className="block mb-2 font-medium">We deliver on Tuesdays, Thurdays & Saturdays - between 3-7pm :) </label>
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

      {/* STEP 1: Start Date */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          {recurrence === 'one-time' ? 'Choose your delivery date:' : 'Select a start date:'}
        </label>
        <select
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">-- Choose a date --</option>
          {generateStartDates().map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* STEP 1.5: End Date */}
      {recurrence === 'weekly' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select end date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            min={startDate}
            max={dayjs(startDate).add(2, 'month').format('YYYY-MM-DD')}
          />
        </div>
      )}

      {/* STEP 2: Delivery Dates */}
      {canProceed && (
        <div className="mb-6">
          <p className="mb-2 text-sm">
            {recurrence === 'one-time'
              ? `Delivery scheduled for ${dayjs(startDate).format('DD MMM YYYY')}`
              : 'Our next deliveries are planned for:'}
          </p>
          {recurrence === 'weekly' && (
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {deliveryDays
                .map((day) => ({
                  day,
                  date: dayjs(validDates[day]).format('DD MMM YYYY'),
                }))
                .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())
                .map((d) => (
                  <li key={d.day}>
                    {d.date} ({d.day})
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {/* STEP 3: Product Picker */}
      {canProceed && (
        <>
          {recurrence === 'weekly' && (
            <>
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
            </>
          )}

          {Object.entries(groupedProducts).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{group}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const qty = selections[selectedDay][item.id]?.quantity || 0
                  const isExpanded = expandedDescriptions[item.id]
                  const shortDesc = item.description?.slice(0, 60)
                  const imagePath = `/images/subscribe/${item.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .toUpperCase()}.webp`

                  return (
                    <div
                      key={item.id}
                      className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2"
                    >

                      <div className="w-full h-40 flex items-center justify-center bg-white overflow-hidden rounded">
  <img
    src={imagePath}
    alt={item.name}
    className="object-contain max-h-full max-w-full"
    style={{ maxHeight: '100%', maxWidth: '100%' }}
  />
</div>

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

          <div className="text-right mt-8">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">
              Next: Address →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
