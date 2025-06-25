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
  const [deliverySchedule, setDeliverySchedule] = useState<string[]>([])
  const [showAllDates, setShowAllDates] = useState(false)
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

  useEffect(() => {
    if (startDate) {
      const defaultEnd = dayjs(startDate).add(1, 'month').format('YYYY-MM-DD')
      setEndDate(defaultEnd)
      generateDeliverySchedule(startDate, defaultEnd)
    }
  }, [startDate])

  useEffect(() => {
    if (startDate && endDate) {
      generateDeliverySchedule(startDate, endDate)
    }
  }, [endDate])

  const generateDeliverySchedule = (start: string, end: string) => {
    const schedule: string[] = []
    let current = dayjs(start)
    const last = dayjs(end)

    while (current.isBefore(last) || current.isSame(last)) {
      if (deliveryDayIndexes.includes(current.day())) {
        schedule.push(current.format('dddd, D MMM'))
      }
      current = current.add(1, 'day')
    }

    const firstThree: Record<Day, string> = {
      Tuesday: '',
      Thursday: '',
      Saturday: '',
    }
    schedule.forEach((dateStr) => {
      const d = dayjs(dateStr, 'dddd, D MMM')
      const day = d.format('dddd') as Day
      if (!firstThree[day]) {
        firstThree[day] = d.format('YYYY-MM-DD')
      }
    })

    setValidDates(firstThree)
    setDeliverySchedule(schedule)
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

      {/* STEP 0: Recurrence */}
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
            Weekly Subscription
          </label>
        </div>
      </div>

      {/* STEP 1: Start and End Dates */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      {startDate && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">End Date (autofilled to 1 month):</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      )}

      {/* STEP 2: Delivery Schedule */}
      {canProceed && (
        <div className="mb-6">
          <label className="block mb-2 font-medium">Delivery Schedule:</label>
          <ul className="text-sm text-gray-700 list-disc pl-5">
            {(showAllDates ? deliverySchedule : deliverySchedule.slice(0, 3)).map((d, idx) => (
              <li key={idx}>{d}</li>
            ))}
          </ul>
          {deliverySchedule.length > 3 && (
            <button
              onClick={() => setShowAllDates(!showAllDates)}
              className="text-blue-600 underline text-sm mt-1"
            >
              {showAllDates ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
