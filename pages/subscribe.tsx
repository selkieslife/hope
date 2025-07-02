import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
type Day = typeof deliveryDays[number]

type Product = {
  id: number
  name: string
  category: string
  description?: string
  price: number
}

type SelectionMap = Record<
  Day,
  { [productId: number]: { product: Product; quantity: number } }
>

export default function SubscribePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recurrence, setRecurrence] = useState<'one-time' | 'weekly'>('one-time')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDay, setSelectedDay] = useState<Day>('Tuesday')
  const [selections, setSelections] = useState<SelectionMap>({
    Tuesday: {},
    Thursday: {},
    Saturday: {},
  })
  const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({})
  const [address, setAddress] = useState('')
  const [razorpayReady, setRazorpayReady] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('Products')
        .select('*')
        .in('category', ['Artisanal Breads', 'Savouries'])
        .order('name')
      setProducts(data || [])
    }
    fetch()

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRazorpayReady(true)
    document.body.appendChild(script)
  }, [])

  const validStartDates = Array.from({ length: 30 }, (_, i) =>
    dayjs().add(i, 'day')
  ).filter((d) => [2, 4, 6].includes(d.day()))

  const validEndDates = validStartDates.filter(
    (d) => d.isAfter(dayjs(startDate))
  )

  const deliveriesBetween = () => {
    if (!startDate || !endDate) return []
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    const days = []
    for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, 'day')) {
      if ([2, 4, 6].includes(d.day())) {
        days.push(d.format('dddd') as Day)
      }
    }
    return Array.from(new Set(days))
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
    setSelections((prev) => {
      const updated = { ...prev[day] }
      if (!updated[product.id]) return prev
      if (updated[product.id].quantity <= 1) delete updated[product.id]
      else updated[product.id].quantity -= 1
      return { ...prev, [day]: updated }
    })
  }

  const getDayTotal = (day: Day) =>
    Object.values(selections[day] || {}).reduce(
      (sum, s) => sum + s.quantity * s.product.price,
      0
    )

  const getGrandTotal = () => {
    const deliverySet =
      recurrence === 'weekly' ? deliveriesBetween() : [selectedDay]
    return deliverySet.reduce((sum, day) => sum + getDayTotal(day), 0)
  }

  const launchPayment = () => {
    const total = getGrandTotal() * 100 // in paise
    const options = {
      key: 'rzp_live_wwVL2OoYowGOtO',
      amount: total,
      currency: 'INR',
      name: 'Selkie’s Bakery',
      description: 'Subscription Payment',
      handler: function (response: any) {
        alert('Payment successful! ID: ' + response.razorpay_payment_id)
        // Here you would log to Supabase
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#f97316',
      },
    }

    if (razorpayReady) {
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    }
  }

  const groupedProducts = ['Artisanal Breads', 'Savouries'].reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Product[]>)

  const canProceed = startDate && (recurrence === 'one-time' || endDate)

  return (
    <div className="min-h-screen p-4 bg-[#fffaf5] font-serif">
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

      {/* Step 2: Date pickers */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          {recurrence === 'one-time' ? 'Choose your delivery date' : 'Select a start date'}
        </label>
        <select
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">-- Select --</option>
          {validStartDates.map((d) => (
            <option key={d.format()} value={d.format('YYYY-MM-DD')}>
              {d.format('dddd')} ({d.format('DD MMM')})
            </option>
          ))}
        </select>
      </div>

      {recurrence === 'weekly' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select an end date</label>
          <select
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Select --</option>
            {validEndDates.map((d) => (
              <option key={d.format()} value={d.format('YYYY-MM-DD')}>
                {d.format('dddd')} ({d.format('DD MMM')})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Product picker */}
      {canProceed && (
        <>
          <div className="flex gap-2 mb-4">
            {(recurrence === 'one-time' ? [selectedDay] : deliveryDays).map((day) => (
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

          {Object.entries(groupedProducts).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{group}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const qty = selections[selectedDay][item.id]?.quantity || 0
                  const isExpanded = expandedDesc[item.id]
                  const shortDesc = item.description?.slice(0, 60) || ''
                  return (
                    <div className="border p-4 rounded-xl bg-white shadow-sm" key={item.id}>
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{item.name}</h3>
                        <span className="text-sm font-medium">₹{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-700">
                          {isExpanded ? item.description : shortDesc}
                          {item.description.length > 60 && (
                            <button
                              className="ml-2 text-blue-600 underline text-xs"
                              onClick={() =>
                                setExpandedDesc((prev) => ({
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
                        <button onClick={() => decrement(selectedDay, item)}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => increment(selectedDay, item)}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-2 text-right text-sm">
                Total for {selectedDay}: ₹{getDayTotal(selectedDay)}
              </p>
            </div>
          ))}
        </>
      )}

      {/* Step 4: Address */}
      {canProceed && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Delivery Address (PIN 400607 only)</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      )}

      {/* Step 5: Summary + Pay */}
      {canProceed && (
        <>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-md font-bold mb-2">Order Summary</h3>
            {(recurrence === 'weekly' ? deliveriesBetween() : [selectedDay]).map((day) => (
              <div key={day} className="mb-2">
                <strong>{day}</strong> — ₹{getDayTotal(day)}
              </div>
            ))}
            <div className="mt-2 font-semibold">Total: ₹{getGrandTotal()}</div>
          </div>

          <button
            onClick={launchPayment}
            className="mt-6 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600"
          >
            Pay Now
          </button>
        </>
      )}
    </div>
  )
}
