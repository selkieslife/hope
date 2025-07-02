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
  price?: number
}

type DaySelections = Record<Day, { [productId: number]: { product: Product; quantity: number } }>

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function SubscribePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recurrence, setRecurrence] = useState<'one-time' | 'weekly'>('one-time')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [validDates, setValidDates] = useState<Record<Day, string>>({} as any)
  const [selectedDay, setSelectedDay] = useState<Day>('Tuesday')
  const [selections, setSelections] = useState<DaySelections>({ Tuesday: {}, Thursday: {}, Saturday: {} })
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({})
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('Products').select('*').in('category', ['Artisanal Breads', 'Savouries']).order('name')
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  const getDeliveryDates = () => {
    const dates: string[] = []
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    let current = start
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      if (deliveryDayIndexes.includes(current.day())) {
        dates.push(current.format('YYYY-MM-DD'))
      }
      current = current.add(1, 'day')
    }
    return dates
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

  const calculateTotal = () => {
    const dates = recurrence === 'weekly' ? getDeliveryDates() : [startDate]
    let total = 0
    dates.forEach((date) => {
      const day = dayjs(date).format('dddd') as Day
      Object.values(selections[day] || {}).forEach(({ product, quantity }) => {
        total += (product.price || 0) * quantity
      })
    })
    return total
  }

  const handlePayment = () => {
    const total = calculateTotal()
    const options = {
      key: 'rzp_live_wwVL2OoYowGOtO',
      amount: total * 100,
      currency: 'INR',
      name: 'Selkie’s',
      description: 'Subscription Order',
      handler: (response: any) => {
        alert('Payment successful!')
      },
      prefill: {
        name,
        contact: mobile,
      },
      notes: {
        address,
        note,
      },
      theme: {
        color: '#f97316',
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const canProceed = startDate && recurrence && name && mobile && address

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-4">🧺 Build Your Box</h1>

      {/* Recurrence */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">How often would you like this?</label>
        <div className="flex gap-4">
          <label><input type="radio" value="one-time" checked={recurrence === 'one-time'} onChange={() => setRecurrence('one-time')} className="mr-2" /> One-time Trial</label>
          <label><input type="radio" value="weekly" checked={recurrence === 'weekly'} onChange={() => setRecurrence('weekly')} className="mr-2" /> Monthly Subscription</label>
        </div>
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select a start date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-3 py-2 rounded w-full" />
      </div>

      {/* End Date */}
      {recurrence === 'weekly' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select an end date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-3 py-2 rounded w-full" />
        </div>
      )}

      {/* Product Picker */}
      {recurrence && startDate && (recurrence === 'one-time' || endDate) && (
        <>
          <div className="flex gap-2 mb-4">
            {deliveryDays.map((day) => (
              <button key={day} onClick={() => setSelectedDay(day)} className={`px-3 py-1 rounded-full border ${selectedDay === day ? 'bg-orange-200 border-orange-400' : 'bg-white border-gray-300'}`}>{day}</button>
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
                    <div key={item.id} className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-semibold">{item.name}</h3>
                        <span className="text-sm font-medium text-gray-700">₹{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-700">
                          {isExpanded ? item.description : shortDesc}
                          {item.description.length > 60 && (
                            <button onClick={() => setExpandedDescriptions((prev) => ({ ...prev, [item.id]: !prev[item.id] }))} className="ml-2 text-blue-600 underline text-xs">{isExpanded ? 'less' : 'more'}</button>
                          )}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-auto">
                        <button onClick={() => decrement(selectedDay, item)} className="px-2 py-1 border rounded text-xl">−</button>
                        <span className="text-md w-6 text-center">{qty}</span>
                        <button onClick={() => increment(selectedDay, item)} className="px-2 py-1 border rounded text-xl">+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Address */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Delivery Address</h2>
            <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="mb-2 border px-3 py-2 rounded w-full" />
            <input placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="mb-2 border px-3 py-2 rounded w-full" />
            <textarea placeholder="Flat/Building, Street/Area" value={address} onChange={(e) => setAddress(e.target.value)} className="mb-2 border px-3 py-2 rounded w-full" />
            <input value="400607" readOnly className="mb-2 border px-3 py-2 rounded w-full bg-gray-100" />
            <input placeholder="Optional Note" value={note} onChange={(e) => setNote(e.target.value)} className="border px-3 py-2 rounded w-full" />
          </div>

          {/* Total & Payment */}
          <div className="text-right mt-6">
            <p className="text-lg font-semibold mb-2">Total: ₹{calculateTotal()}</p>
            <button disabled={!canProceed} onClick={handlePayment} className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 disabled:opacity-50">Proceed to Pay</button>
          </div>
        </>
      )}
    </div>
  )
}
