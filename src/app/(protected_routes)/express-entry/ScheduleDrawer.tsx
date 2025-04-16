'use client'

import { useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Image from 'next/image'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([])
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        const now = new Date()
        const hour = now.getHours().toString().padStart(2, '0')
        const minute = now.getMinutes().toString().padStart(2, '0')
        setSelectedHour(hour)
        setSelectedMinute(minute)
        setSelectedDate(now)
        setSelectedWeekdays([])
        setStep('option')
      }, 100)

      return () => clearTimeout(timeout)
    }
  }, [open])

  // @ts-ignore
  const formatDate = (date: Date) => {
    return date.toISOString();
  };


  const handleNowSchedule = async () => {
    if (!selectedProduct || !session) return;

    const start_time_iso = new Date().toISOString(); // ISO format

    const payload = {
      premise_id: session.user?.primary_premise_id,
      premise_unit_id: session.user?.premise_unit_id,
      sub_premise_id: session.user?.sub_premise_id,
      resident_mobile_number: session.user?.phone,
      vendor_name: selectedProduct.title,
      duration_array: [{ start_time_iso }]
    };

    try {
      const res = await fetch('http://139.84.166.124:8060/vms-service/vendor/preinvite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user?.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success',
          text: `Entry has been scheduled for ${selectedProduct.title}`,
          icon: 'success',
          confirmButtonColor: '#22c55e',
          width: 350
        });
        router.push('/menu');
        onComplete();
      } else {
        Swal.fire({
          title: 'Failed',
          text: data?.error?.message || 'Something went wrong!',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          width: 350
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Network error. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        width: 350
      });
    }
  };

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
        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((h) => (
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
        onClick={async () => {
          if (!selectedProduct || !session) return

          const date = new Date(selectedDate)
          date.setHours(parseInt(selectedHour), parseInt(selectedMinute))

          const start_time_iso = formatDate(date)

          const payload = {
            premise_id: session.user?.primary_premise_id,
            premise_unit_id: session.user?.premise_unit_id,
            sub_premise_id: session.user?.sub_premise_id,
            vendor_name: selectedProduct.title,
            resident_mobile_number: session.user?.phone,
            duration_array: [{ start_time_iso }]
          }

          try {
            const res = await fetch('http://139.84.166.124:8060/vms-service/vendor/preinvite', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.user?.accessToken}`
              },
              body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (res.ok) {
              Swal.fire({
                title: 'Scheduled',
                text: `Visit scheduled on ${selectedDate.toDateString()} at ${selectedHour}:${selectedMinute}`,
                icon: 'success',
                confirmButtonColor: '#22c55e',
                width: 350
              })
              router.push('/menu')
              onComplete()
            } else {
              Swal.fire({
                title: 'Failed',
                text: data?.message || 'Something went wrong!',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                width: 350
              })
            }
          } catch (err) {
            Swal.fire({
              title: 'Error',
              text: 'Network error. Please try again.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              width: 350
            })
          }
        }}
        className="w-full bg-green-500 text-white py-3 rounded-lg shadow hover:bg-green-600"
      >
        Confirm
      </button>
    </div>
  )

  const MultipleRenderCalendar = () => {
    const today = new Date();
    const days = Array.from({ length: 16 }, (_, i) => new Date(today.getTime() + i * 86400000));

    const toggleDate = (date: Date) => {
      const exists = selectedDates.some(d => d.toDateString() === date.toDateString());
      if (exists) {
        setSelectedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates(prev => [...prev, date]);
      }
    };

    return (
      <div className="grid grid-cols-4 gap-2">
        {days.map((day) => {
          const isSelected = selectedDates.some(d => d.toDateString() === day.toDateString());
          return (
            <button
              key={day.toDateString()}
              onClick={() => toggleDate(day)}
              className={`p-2 rounded-lg text-sm border text-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
            >
              {day.toDateString().split(' ').slice(0, 3).join(' ')}
            </button>
          );
        })}
      </div>
    );
  };

  const MultipleRenderTimePicker = () => (
    <div className="flex gap-4 items-center">
      <select
        value={selectedHour}
        onChange={(e) => setSelectedHour(e.target.value)}
        className="border rounded-lg p-2 bg-white"
      >
        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((h) => (
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

  const handleConfirm = async () => {
    if (!selectedProduct || !session) return;

    // Check if dates and time values are selected
    if (!selectedDates.length || selectedHour === '' || selectedMinute === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Missing info',
        text: 'Please select at least one date and both hour and minute',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    try {
      setLoading(true);
      // Format date to "ddMMyyyy HH:mm"
      const formatDateTime = (date: Date, hour: string, minute: string) => {
        const newDate = new Date(date);
        newDate.setHours(parseInt(hour, 10));
        newDate.setMinutes(parseInt(minute, 10));
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        return newDate.toISOString();
      };      

      const duration_array = selectedDates.map((date) => ({
        start_time_iso: formatDateTime(date, selectedHour, selectedMinute),
      }));

      const payload = {
        premise_id: session?.user?.primary_premise_id,
        premise_unit_id: session?.user?.premise_unit_id,
        sub_premise_id: session.user?.sub_premise_id,
        resident_mobile_number: session?.user?.phone,
        vendor_name: selectedProduct.title,
        duration_array,
      };

      const response = await fetch('http://139.84.166.124:8060/vms-service/vendor/preinvite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Scheduled',
          text: 'Recurring vendor visit has been scheduled successfully!',
          icon: 'success',
          confirmButtonColor: '#22c55e',
          width: 350,
        });
        router.push('/menu');
        onComplete();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: result?.message || 'Something went wrong!',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };


  const renderRecurringStep = () => (
    <div className="space-y-4">
      <MultipleRenderCalendar />
      {MultipleRenderTimePicker()}
      <button
        onClick={handleConfirm}
        className="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Scheduling...' : 'Confirm'}
      </button>
    </div>
  );
  


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
