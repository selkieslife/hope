import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

const deliveryDays = ['Tuesday', 'Thursday', 'Saturday'] as const
const deliveryDayIndexes = [2, 4, 6]

type Day = typeof deliveryDays[number]

type Product = {
  id: number
  name: string
  category: string
  description?: string
  image?: string
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

  const generateDeliveryDates = () => {
    const options: { label: string; value: string }[] = []
    let day = dayjs()
    for (let i = 0; i < 60; i++) {
      if (deliveryDayIndexes.includes(day.day())) {
        options.push({
          label: `${day.format('dddd')} (${day.format('DD MMM')})`,
          value: day.format('YYYY-MM-DD'),
        })
      }
      day = day.add(1, 'day')
    }
    return options
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

  const canProceed =