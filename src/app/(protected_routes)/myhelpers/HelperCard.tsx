// components/HelperCard.tsx
import Image from 'next/image'
import { MdPhone, MdBuild, MdLocationOn } from 'react-icons/md'
import { useState } from 'react'
import HelperDrawer from './HelperDrawer'

export type HelperProps = {
  profilePicture: any
  name: string
  mobile: string
  skill: string
  address: string
  picture_url: string
  qr_code: string
  card_no: number
}

const HelperCard = (props: HelperProps) => {
  const [openDrawer, setOpenDrawer] = useState(false)

  return (
    <>
      <div
        className="w-full max-w-2xl mx-auto flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md mb-4 transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer"
        onClick={() => setOpenDrawer(true)}
      >
        <div className="flex-shrink-0">
          <Image
            src={props.picture_url?.startsWith('http') ? props.picture_url : '/placeholder.jpg'}
            alt={props.name}
            width={80}
            height={80}
            className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
          />

        </div>

        <div className="flex-1 text-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{props.name}</h3>

          <div className="flex items-center text-sm mb-1">
            <MdPhone className="text-blue-600 mr-2 text-base" />
            <span className="font-medium">{props.mobile}</span>
          </div>

          <div className="flex items-center text-sm mb-1">
            <MdBuild className="text-green-600 mr-2 text-base" />
            <span className="font-medium">{props.skill}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MdLocationOn className="text-red-500 mr-2 text-base" />
            <span className="font-medium">{props.address}</span>
          </div>
        </div>
      </div>

      <HelperDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} helper={props} />
    </>
  )
}

export default HelperCard