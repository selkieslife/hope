//updated

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'
import Script from 'next/script'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
const deliveryDayIndexes = [2, 4, 6]
type Day = typeof deliveryDays[number]

type Product = {
  id: number
  name: string
  category: string
  description?: string
  price: number
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
  const [address, setAddress] = useState({ name: '', phone: '', line: '', pin: '' })

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
      const base = dayjs(startDate)
      const out: Record<Day, string> = { Tuesday: '', Thursday: '', Saturday: '' }
      for (let i = 0; i < 21; i++) {
        const date = base.add(i, 'day')
        const dayName = date.format('dddd') as Day
        if (deliveryDays.includes(dayName) && !out[dayName]) {
          out[dayName] = date.format('YYYY-MM-DD')
        }
      }
      setValidDates(out)
      setEndDate(base.add(1, 'month').format('YYYY-MM-DD'))
    }
  }, [startDate])

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

  const calculateTotal = () => {
    if (recurrence === 'one-time') {
      return Object.values(selections[selectedDay]).reduce((sum, s) => sum + s.product.price * s.quantity, 0)
    } else {
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      let total = 0
      for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, 'day')) {
        const dayName = d.format('dddd') as Day
        if (deliveryDays.includes(dayName)) {
          total += Object.values(selections[dayName]).reduce((sum, s) => sum + s.product.price * s.quantity, 0)
        }
      }
      return total
    }
  }

  const handlePayment = () => {
    if (address.pin !== '400607') {
      alert('We currently only deliver to 400607')
      return
    }

    const total = calculateTotal()
    const options = {
      key: 'rzp_live_wwVL2OoYowGOtO',
      amount: total * 100,
      currency: 'INR',
      name: 'Selkie’s',
      description: recurrence === 'one-time' ? 'Trial Order' : 'Monthly Subscription',
      handler: async function (response: any) {
        await supabase.from('Orders').insert([
          {
            name: address.name,
            phone: address.phone,
            address: address.line,
            pin: address.pin,
            amount: total,
            razorpay_id: response.razorpay_payment_id,
            recurrence,
            start_date: startDate,
            end_date: recurrence === 'weekly' ? endDate : null,
            selections,
          },
        ])
        alert('Payment Successful!')
      },
      prefill: {
        name: address.name,
        contact: address.phone,
      },
      theme: { color: '#F97316' },
    }
    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  const groupedProducts = ['Artisanal Breads', 'Savouries'].reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Product[]>)

  const canProceed = startDate && recurrence

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h1 className="text-2xl mb-4">🧺 Build Your Box</h1>

      {/* STEP 0: Recurrence */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">How often would you like this?</label>
        <div className="flex gap-4">
          <label><input type="radio" value="one-time" checked={recurrence === 'one-time'} onChange={() => setRecurrence('one-time')} className="mr-2" />One-time Trial</label>
          <label><input type="radio" value="weekly" checked={recurrence === 'weekly'} onChange={() => setRecurrence('weekly')} className="mr-2" />Monthly Subscription</label>
        </div>
      </div>

      {/* STEP 1: Dates */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select a start date:</label>
        <select value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-3 py-2 rounded w-full">
          <option value="">-- Choose a date --</option>
          {generateStartDates().map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {recurrence === 'weekly' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select an end date:</label>
          <input type="date" className="border px-3 py-2 rounded w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      )}

      {/* STEP 2: Product Picker */}
      {canProceed && (
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
                        <span className="text-sm font-medium text-orange-700">₹{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-700">
                          {isExpanded ? item.description : shortDesc}
                          {item.description.length > 60 && (
                            <button className="ml-2 text-blue-600 underline text-xs" onClick={() =>
                              setExpandedDescriptions((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                            }>{isExpanded ? 'less' : 'more'}</button>
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

          {/* STEP 3: Address */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Delivery Address</h2>
            <input type="text" placeholder="Name" className="w-full mb-2 px-3 py-2 border rounded" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
            <input type="text" placeholder="Phone" className="w-full mb-2 px-3 py-2 border rounded" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
            <textarea placeholder="Address Line" className="w-full mb-2 px-3 py-2 border rounded" value={address.line} onChange={(e) => setAddress({ ...address, line: e.target.value })} />
            <input type="text" placeholder="PIN Code" className="w-full mb-4 px-3 py-2 border rounded" value={address.pin} onChange={(e) => setAddress({ ...address, pin: e.target.value })} />
          </div>

          {/* STEP 4: Summary & Payment */}
          <div className="bg-white p-4 rounded-xl shadow mt-6">
            <h2 className="text-lg font-bold mb-3">Order Summary</h2>
            {recurrence === 'one-time' ? (
              <div>
                <h3 className="font-medium">{selectedDay}</h3>
                <ul className="text-sm">
                  {Object.values(selections[selectedDay]).map((s) => (
                    <li key={s.product.id}>{s.product.name} × {s.quantity}</li>
                  ))}
                </ul>
              </div>
            ) : (
              deliveryDays.map((d) => (
                <div key={d} className="mb-3">
                  <h3 className="font-medium">{d}</h3>
                  <ul className="text-sm">
                    {Object.values(selections[d]).map((s) => (
                      <li key={s.product.id}>{s.product.name} × {s.quantity}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
            <p className="font-semibold mt-2">Total: ₹{calculateTotal()}</p>
            <button onClick={handlePayment} className="mt-4 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
              Pay Now
            </button>
          </div>
        </>
      )}
    </div>
  )
}
