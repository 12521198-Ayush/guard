'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ScheduleDrawer from './ScheduleDrawer'
import { useSession } from 'next-auth/react'

type Props = {
  onClose: () => void
}

type Product = {
  id: string
  title: string
  image: string
  whitelist_duration_in_hours?: number
}

// Utility to check if the URL points to an image
const isValidImageUrl = (url: string) => {
  return (
    typeof url === 'string' &&
    (url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.webp') ||
      url.endsWith('.svg'))
  )
}

export default function VendorForm({ onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [openScheduleDrawer, setOpenScheduleDrawer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const premiseId = session?.user?.primary_premise_id || ''

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setErrorMessage(null)

        const res = await fetch('http://139.84.166.124:8060/vms-service/vendor/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ premise_id: premiseId }),
        })

        if (!res.ok) {
          const errorResponse = await res.text()
          setErrorMessage(`Error fetching products: ${errorResponse}`)
          throw new Error(`Error: ${res.statusText}`)
        }

        const data = await res.json()

        const mappedProducts: Product[] = data?.data?.map((vendor: any) => ({
          id: vendor._id,
          title: vendor.name,
          image: vendor.logo,
          whitelist_duration_in_hours: vendor.whitelist_duration_in_hours,
        })) || []

        setProducts(mappedProducts)
        setFiltered(mappedProducts)
      } catch (err) {
        console.error('Error fetching products:', err)
        setErrorMessage(`Error fetching products: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    if (premiseId) {
      fetchProducts()
    }
  }, [session?.user?.primary_premise_id])

  useEffect(() => {
    const lower = search.toLowerCase()
    setFiltered(
      products.filter((item) =>
        item.title?.toLowerCase().includes(lower)
      )
    )
  }, [search, products])

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Search vendors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm"
      />

      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-white shadow animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))
          : filtered.map((item) => {
              const isSelected = selectedProduct?.id === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer
                    ${isSelected ? 'bg-blue-100 shadow-lg' : 'bg-white shadow hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={isValidImageUrl(item.image) ? item.image : '/no-image.png'}
                        alt={item.title}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-800 font-medium">{item.title}</div>
                      {item.whitelist_duration_in_hours !== undefined && (
                        <div className="text-xs text-gray-500">
                          Allowed for {item.whitelist_duration_in_hours} hour{item.whitelist_duration_in_hours > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
      </div>

      <button
        onClick={() => selectedProduct && setOpenScheduleDrawer(true)}
        disabled={!selectedProduct}
        className={`w-full py-3 rounded-lg shadow-md transition 
          ${selectedProduct
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
      >
        Continue
      </button>

      <ScheduleDrawer
        open={openScheduleDrawer}
        onClose={() => setOpenScheduleDrawer(false)}
        selectedProduct={selectedProduct}
        onComplete={() => {
          setOpenScheduleDrawer(false)
          onClose()
        }}
      />
    </div>
  )
}
