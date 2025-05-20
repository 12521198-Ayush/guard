import React, { useEffect, useState } from 'react'
import { FaTrashAlt, FaShareAlt } from 'react-icons/fa'

export interface Visitor {
  _id: string
  contact_name?: string
  contact_number?: string
  invite_type?: string
  vendor_name?: string
  signed_url?: string
  note_for_guest?: string
  start_date: string
  end_date: string
  passcode?: string
  premise_id: string
}

interface Props {
  visitor: Visitor
  onDelete: (visitor: Visitor) => void
}

const VisitorCard: React.FC<Props> = ({ visitor, onDelete }) => {
  const [loading, setLoading] = useState(true)
  const [vendorLogo, setVendorLogo] = useState<string | null>(null)
  const isGuest = !!visitor.contact_name

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const fetchVendorLogo = async () => {
      try {
        const res = await fetch('http://139.84.166.124:8060/vms-service/vendor/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ premise_id: visitor.premise_id }),
        })
        const data = await res.json()
        if (data?.data && visitor.vendor_name) {
          const match = data.data.find(
            (v: any) => v.name.toLowerCase() === visitor.vendor_name?.toLowerCase()
          )
          if (match?.logo) setVendorLogo(match.logo)
        }
      } catch (err) {
        console.error('Error fetching vendor logo:', err)
      }
    }

    if (!isGuest) {
      fetchVendorLogo()
    }
  }, [visitor])

  const flashSkeleton = `animate-pulse bg-gradient-to-r from-white via-white to-white opacity-80`

  if (loading) {
    return (
      <div className={`flex items-start bg-[#f3f4f6] rounded-2xl shadow-sm mb-4 p-4 ${flashSkeleton}`}>
        <div className="w-20 h-20 bg-white rounded-xl mr-4 opacity-80"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white rounded w-1/2 opacity-80"></div>
          <div className="h-3 bg-white rounded w-1/3 opacity-80"></div>
          <div className="h-3 bg-white rounded w-2/3 opacity-80"></div>
          <div className="h-3 bg-white rounded w-1/4 opacity-80"></div>
          <div className="h-3 bg-white rounded w-3/5 opacity-80"></div>
        </div>
      </div>
    )
  }

  const handleShare = () => {
    // @ts-ignore
    if (isGuest && window.AndroidInterface?.shareImage) {
      // Android native interface
      // @ts-ignore
      window.AndroidInterface.shareImage(
        `${visitor.signed_url}`,
        `Visitor: ${visitor.contact_name}\nPasscode: ${visitor.passcode}`
      );
    }
    // iOS native interface
    // @ts-ignore
    else if (isGuest && window.webkit?.messageHandlers?.shareImage) {
      // @ts-ignore
      window.webkit.messageHandlers.shareImage.postMessage({
        imageUrl: `${visitor.signed_url}`,
        message: `Visitor: ${visitor.contact_name}\nPasscode: ${visitor.passcode}`
      });
    }
    else {
      console.error("Native share interface not available");
    }
  };


  return (
    <div className="flex items-start bg-[#fafafa] rounded-2xl shadow-md mb-4 p-4 relative transition-all duration-300 hover:shadow-lg active:scale-[0.98]">
      <div className="flex-shrink-0 mr-4">
        {isGuest && visitor.signed_url ? (
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 text-2xl font-medium shadow-lg tracking-wide">
            {visitor.contact_name?.[0]?.toUpperCase() || '?'}
          </div>
        ) : vendorLogo ? (
          <img
            src={vendorLogo}
            alt={visitor.vendor_name}
            className="w-20 h-20 object-contain rounded-xl bg-white p-2 shadow-sm"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-600 shadow-inner">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 text-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {isGuest ? visitor.contact_name : visitor.vendor_name}
        </h3>
        {/* <p className="text-sm">
          Type: <span className="font-medium">{isGuest ? visitor.invite_type : 'VENDOR'}</span>
        </p> */}
        {visitor.note_for_guest && visitor.note_for_guest !== '-' && (
          <p className="text-sm">
            Note: <span className="font-medium">{visitor.note_for_guest}</span>
          </p>
        )}

        <p className="text-sm mt-1">
          From: <span className="font-medium">{new Date(visitor.start_date).toLocaleString()}</span><br />
          To: <span className="font-medium">{new Date(visitor.end_date).toLocaleString()}</span>
        </p>
      </div>

      <div className="ml-3 mt-1 cursor-pointer p-2 rounded-full hover:bg-red-50 active:scale-95 transition-transform" onClick={() => onDelete(visitor)}>
        <FaTrashAlt size={18} className="text-red-500" title="Delete invitation" />
      </div>

      {isGuest && (
        <div
          className="ml-3 mt-2 cursor-pointer p-2 rounded-full hover:bg-blue-50 active:scale-95 transition-transform"
          onClick={handleShare}
        >
          <FaShareAlt size={18} className="text-blue-500" title="Share invitation" />
        </div>
      )}
    </div>
  )
}

export default VisitorCard
