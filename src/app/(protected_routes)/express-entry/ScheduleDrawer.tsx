'use client'

import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Image from 'next/image'

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

export default function ScheduleDrawer({
  open,
  onClose,
  selectedProduct,
  onComplete,
}: ScheduleDrawerProps) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        className: 'rounded-t-2xl px-4 py-6 h-[86vh] overflow-y-auto shadow-xl',
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Schedule Visit</h2>
        <IconButton onClick={onClose}>
          <CloseIcon className="text-gray-500" />
        </IconButton>
      </div>

      {/* Show Selected Item */}
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

      {/* Schedule Form */}
      <div className="space-y-4">
        <input
          type="date"
          className="w-full border rounded-lg p-3 bg-gray-50 shadow-sm"
        />
        <input
          type="time"
          className="w-full border rounded-lg p-3 bg-gray-50 shadow-sm"
        />
        <button
          onClick={() => {
            alert('Visit Scheduled Successfully')
            onComplete()
          }}
          className="w-full bg-green-500 text-white py-3 rounded-lg shadow-md hover:bg-green-600 transition"
        >
          Confirm
        </button>
      </div>
    </Drawer>
  )
}
