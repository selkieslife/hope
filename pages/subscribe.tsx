import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'


const deliveryDays = [2, 4, 6] // Tue, Thu, Sat
const deliveryDayNames = ['Tuesday', 'Thursday', 'Saturday']



type Product = {
  id: number
  name: string
  category: string
  description?: string
}



export default function SubscribePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recurrence, setRecurrence] = useState<'one-time' | 'weekly'>('one-time')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDay, setSelectedDay] = useState('Tuesday')
  const [selections, setSelections] = useState<Record<string, Record<number, number>>>({
    Tuesday: {},
    Thursday: {},
    Saturday: {},
  })
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

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

  const filterValidDate = (dateStr: string) => {
    const d = dayjs(dateStr)
    return deliveryDays.includes(d.day())
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const d = dayjs(value)
    if (!deliveryDays.includes(d.day())) return
    setStartDate(value)
    if (recurrence === 'weekly') {
      const end = d.add(1, 'month')
      let nextValid = end
      while (!deliveryDays.includes(nextValid.day())) {
        nextValid = nextValid.add(1, 'day')
      }
      setEndDate(nextValid.format('YYYY-MM-DD'))
    }
  }

  const grouped = ['Artisanal Breads', 'Savouries'].reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Product[]>)

  const increment = (day: string, id: number) => {
    setSelections((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [id]: (prev[day]?.[id] || 0) + 1,
      },
    }))
  }

  const decrement = (day: string, id: number) => {
    setSelections((prev) => {
      const updated = { ...prev[day] }
      if (updated[id] <= 1) delete updated[id]
      else updated[id] -= 1
      return { ...prev, [day]: updated }
    })
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">
      <h1 className="text-2xl mb-6">🧺 Build Your Box</h1>

      {/* Recurrence */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">How often would you like this?</label>
        <div className="flex gap-4 text-sm">
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
              onChange={() => setRecurrence('weekly')}
              className="mr-2"
            />
            Monthly Subscription
          </label>
        </div>
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          {recurrence === 'weekly' ? 'Start Date (Tue/Thu/Sat only)' : 'Choose your delivery date'}
        </label>
        <input
          type="date"
          value={startDate}
          onChange={handleStartChange}
          className="border px-3 py-2 rounded w-full"
          min={dayjs().format('YYYY-MM-DD')}
        />
      </div>

      {/* End Date for subscription */}
      {recurrence === 'weekly' && startDate && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">End Date (Modify if needed)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              const d = dayjs(e.target.value)
              if (deliveryDays.includes(d.day())) setEndDate(e.target.value)
            }}
            className="border px-3 py-2 rounded w-full"
            min={dayjs(startDate).add(1, 'week').format('YYYY-MM-DD')}
          />
        </div>
      )}

      {/* Delivery Summary */}
      {startDate && (
        <div className="text-sm mb-6">
          <p className="mb-1 font-medium">
            {recurrence === 'one-time'
              ? 'Your selected delivery date is:'
              : 'Our next deliveries are planned for:'}
          </p>
          <ul className="list-disc pl-5">
            {recurrence === 'one-time' ? (
              <li>{dayjs(startDate).format('dddd, DD MMM')}</li>
            ) : (
              deliveryDayNames.map((day) => {
                const base = dayjs(startDate)
                let next = base
                while (next.format('dddd') !== day) {
                  next = next.add(1, 'day')
                }
                return (
                  <li key={day}>
                    {day} ({next.format('DD MMM')})
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}

      {/* Product Picker */}
      {startDate && (
        <>
          {recurrence === 'weekly' && (
            <div className="mb-4">
              <div className="flex gap-2 mb-2 text-sm">
                {deliveryDayNames.map((day) => (
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
              <p className="text-sm mb-2">
                Copy from:{' '}
                {deliveryDayNames
                  .filter((d) => d !== selectedDay)
                  .map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelections((prev) => ({ ...prev, [selectedDay]: { ...prev[d] } }))}
                      className="underline text-blue-600 mr-2"
                    >
                      {d}
                    </button>
                  ))}
              </p>
            </div>
          )}

          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{group}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const qty = selections[selectedDay]?.[item.id] || 0
                  const shortDesc = item.description?.slice(0, 60)
                  const showFull = expanded[item.id]
                  return (
                    <div
                      key={item.id}
                      className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2"
                    >
                      <img
                        src={`/images/subscribe/${item.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()}.webp`}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <h3 className="text-md font-semibold">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-700">
                          {showFull ? item.description : shortDesc}
                          {item.description.length > 60 && (
                            <button
                              className="ml-2 text-blue-600 underline text-xs"
                              onClick={() =>
                                setExpanded((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }))
                              }
                            >
                              {showFull ? 'less' : 'more'}
                            </button>
                          )}
                        </p>
                      )}
                      {recurrence === 'weekly' && (
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            onClick={() => decrement(selectedDay, item.id)}
                            className="px-2 py-1 border rounded text-xl"
                          >
                            −
                          </button>
                          <span className="text-md w-6 text-center">{qty}</span>
                          <button
                            onClick={() => increment(selectedDay, item.id)}
                            className="px-2 py-1 border rounded text-xl"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
