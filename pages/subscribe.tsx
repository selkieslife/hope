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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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

  const handleStartDateChange = (val: string) => {
    const selected = dayjs(val)
    if (!deliveryDayIndexes.includes(selected.day())) {
      alert('Please select a valid delivery day (Tue/Thu/Sat)')
      return
    }
    setStartDate(val)
    generateValidDeliveryDates(val)
    const tentativeEnd = selected.add(30, 'day')
    for (let i = 0; i < 10; i++) {
      const tryDate = tentativeEnd.add(i, 'day')
      if (deliveryDayIndexes.includes(tryDate.day())) {
        setEndDate(tryDate.format('YYYY-MM-DD'))
        break
      }
    }
  }

  const handleEndDateChange = (val: string) => {
    const selected = dayjs(val)
    if (!deliveryDayIndexes.includes(selected.day())) {
      alert('End date must be Tue/Thu/Sat')
      return
    }
    setEndDate(val)
  }

  const generateValidDeliveryDates = (start: string) => {
    const base = dayjs(start)
    const out: Record<Day, string> = {
      Tuesday: '',
      Thursday: '',
      Saturday: '',
    }
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

  const canProceed = startDate && recurrence

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
          {recurrence === 'one-time' ? 'Choose your delivery date' : 'Select a start date:'}
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      {/* End Date (for subscription only) */}
      {recurrence === 'weekly' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select an end date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      )}

      {/* Delivery Days */}
      {canProceed && (
        <div className="mb-6">
          <p className="mb-2 text-sm">
            {recurrence === 'one-time'
              ? 'Our next delivery is planned for:'
              : 'Our next deliveries are planned for:'}
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {recurrence === 'one-time' ? (
              <li>{dayjs(startDate).format('DD MMM (ddd)')}</li>
            ) : (
              deliveryDays.map((day) => (
                <li key={day}>
                  {validDates[day] ? dayjs(validDates[day]).format('DD MMM (ddd)') : day}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Product Picker */}
      {recurrence === 'weekly' && canProceed && (
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

          {Object.entries(groupedProducts).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{group}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const qty = selections[selectedDay][item.id]?.quantity || 0
                  const isExpanded = expandedDescriptions[item.id]
                  const shortDesc = item.description?.slice(0, 60)
                  const initials = item.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                  return (
                    <div
                      key={item.id}
                      className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2"
                    >
                      <img
                        src={`/images/subscribe/${initials}.webp`}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded"
                      />
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
        </>
      )}

      {/* Next Button */}
      <div className="text-right mt-8">
        <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">
          Next: Address →
        </button>
      </div>
    </div>
  )
}
