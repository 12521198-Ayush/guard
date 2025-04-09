'use client'

import { useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Image from 'next/image'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Product = {
  id: number
  title: string
  image: string
}

type ScheduleDrawerProps = {
  open: boolean
  onClose: () => void
  selectedProduct: Product | null
  onComplete: () => void
}

export default function ScheduleDrawer({ open, onClose, selectedProduct, onComplete }: ScheduleDrawerProps) {
  const [step, setStep] = useState<'option' | 'later' | 'recurring'>('option')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedHour, setSelectedHour] = useState('')
  const [selectedMinute, setSelectedMinute] = useState('')
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([])
  const router = useRouter()

  // ⏱️ Set default time to current hour and nearest 15-minute mark
  useEffect(() => {
    if (open) {
      // Slight delay to wait until drawer is visible
      const timeout = setTimeout(() => {
        const now = new Date()
        const hour = now.getHours().toString().padStart(2, '0')
        const minute = now.getMinutes().toString().padStart(2, '0')
        setSelectedHour(hour)
        setSelectedMinute(minute)
        setSelectedDate(now)
        setSelectedWeekdays([])
        setStep('option') // Reset to the first step
      }, 100) // ⏱️ You can tweak this delay if needed
  
      return () => clearTimeout(timeout)
    }
  }, [open])

  const handleNowSchedule = () => {
    Swal.fire({
      title: 'Success',
      text: `Entry has been scheduled for ${selectedProduct?.title}`,
      icon: 'success',
      confirmButtonColor: '#22c55e',
      width: 350
    })
    router.push('/menu')
    onComplete()
  }

  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const renderOptionStep = () => (
    <div className="space-y-4">
      <button
        onClick={handleNowSchedule}
        className="w-full bg-[#e0f2fe] text-[#0369a1] py-3 rounded-lg shadow hover:bg-[#bae6fd] transition font-medium"
      >
        Schedule for Now
      </button>

      <button
        onClick={() => setStep('later')}
        className="w-full bg-[#d1fae5] text-[#047857] py-3 rounded-lg shadow hover:bg-[#a7f3d0] transition font-medium"
      >
        Schedule for Later
      </button>

      <button
        onClick={() => setStep('recurring')}
        className="w-full bg-[#ede9fe] text-[#7c3aed] py-3 rounded-lg shadow hover:bg-[#ddd6fe] transition font-medium"
      >
        Recurring Monthly Schedules
      </button>
    </div>
  )

  const renderCalendar = () => {
    const today = new Date()
    const days = Array.from({ length: 16 }, (_, i) => new Date(today.getTime() + i * 86400000))

    return (
      <div className="grid grid-cols-4 gap-2">
        {days.map((day) => (
          <button
            key={day.toDateString()}
            onClick={() => setSelectedDate(day)}
            className={`p-2 rounded-lg text-sm border ${day.toDateString() === selectedDate.toDateString()
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100'
              }`}
          >
            {day.toDateString().split(' ').slice(0, 3).join(' ')}
          </button>
        ))}
      </div>
    )
  }

  const renderTimePicker = () => (
    <div className="flex gap-4 items-center">
      <select
        value={selectedHour}
        onChange={(e) => setSelectedHour(e.target.value)}
        className="border rounded-lg p-2 bg-white"
      >
        {Array.from({ length: 24 }, (_, i) =>
          i.toString().padStart(2, '0')
        ).map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span>:</span>
      <select
        value={selectedMinute}
        onChange={(e) => setSelectedMinute(e.target.value)}
        className="border rounded-lg p-2 bg-white"
      >
        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((m) => ( 
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  )

  const renderLaterStep = () => (
    <div className="space-y-4">
      {renderCalendar()}
      {renderTimePicker()}
      <button
        onClick={() => {
          Swal.fire({
            title: 'Scheduled',
            text: `Visit scheduled on ${selectedDate.toDateString()} at ${selectedHour}:${selectedMinute}`,
            icon: 'success',
            confirmButtonColor: '#22c55e',
            width: 350
          })
          router.push('/menu')
          onComplete()
        }}
        className="w-full bg-green-500 text-white py-3 rounded-lg shadow hover:bg-green-600"
      >
        Confirm
      </button>
    </div>
  )

  const renderRecurringStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {weekdays.map((day) => (
          <button
            key={day}
            onClick={() => toggleWeekday(day)}
            className={`p-2 rounded-lg text-sm border ${selectedWeekdays.includes(day) ? 'bg-purple-500 text-white' : 'bg-gray-100'
              }`}
          >
            {day}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          Swal.fire({
            title: 'Scheduled',
            text: `Recurring schedule set for ${selectedWeekdays.join(', ')}`,
            icon: 'success',
            confirmButtonColor: '#22c55e',
            width: 350
          })
          router.push('/menu')
          onComplete()
        }}
        className="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700"
      >
        Confirm
      </button>
    </div>
  )

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{ className: 'rounded-t-2xl px-4 py-6 h-[86vh] overflow-y-auto shadow-xl' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Schedule Visit</h2>
        <IconButton onClick={onClose}>
          <CloseIcon className="text-gray-500" />
        </IconButton>
      </div>

      {selectedProduct && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow mb-6">
          <div className="relative w-16 h-16">
            <Image
              src={selectedProduct.image}
              alt={selectedProduct.title}
              fill
              className="object-contain rounded"
            />
          </div>
          <div className="text-gray-800 font-medium text-sm">{selectedProduct.title}</div>
        </div>
      )}

      {step === 'option' && renderOptionStep()}
      {step === 'later' && renderLaterStep()}
      {step === 'recurring' && renderRecurringStep()}
    </Drawer>
  )
}
