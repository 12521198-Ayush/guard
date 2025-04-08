'use client'

import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import VendorForm from './VendorForm'
import GuestForm from './GuestForm'
import OtherForm from './OtherForm'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

export default function VisitorEntry() {
  const [openDrawer, setOpenDrawer] = useState<'' | 'vendor' | 'guest' | 'other'>('')

  const closeDrawer = () => setOpenDrawer('')

  const renderForm = () => {
    switch (openDrawer) {
      case 'vendor':
        return <VendorForm onClose={closeDrawer} />
      case 'guest':
        return <GuestForm onClose={closeDrawer} />
      case 'other':
        return <OtherForm onClose={closeDrawer} />
      default:
        return null
    }
  }

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* <h1 className="text-3xl font-semibold text-gray-800 mb-6">Visitor Entry</h1> */}

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => setOpenDrawer('vendor')}
          className="bg-white shadow-md rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 transition"
        >
          Vendor Entry
        </button>
        <button
          onClick={() => setOpenDrawer('guest')}
          className="bg-white shadow-md rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-green-50 transition"
        >
          Guest Entry
        </button>
        <button
          onClick={() => setOpenDrawer('other')}
          className="bg-white shadow-md rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-yellow-50 transition"
        >
          Other
        </button>
      </div>

      {/* MUI Bottom Drawer */}
      <Drawer
        anchor="bottom"
        open={!!openDrawer}
        onClose={closeDrawer}
        PaperProps={{
          className: 'rounded-t-2xl px-4 py-6 h-[86vh] overflow-y-auto shadow-lg',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{openDrawer} Entry</h2>
          <IconButton onClick={closeDrawer}>
            <CloseIcon className="text-gray-500" />
          </IconButton>
        </div>
        {renderForm()}
      </Drawer>
    </div>
  )
}
