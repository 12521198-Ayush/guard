'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import ScheduleDrawer from './ScheduleDrawer'

type Props = {
  onClose: () => void
}

type Product = {
  id: number
  title: string
  image: string
}

export default function VendorForm({ onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [openScheduleDrawer, setOpenScheduleDrawer] = useState(false)
  const [loading, setLoading] = useState(true) // ✅ Step 1: loading state

  // Fetching products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch('https://fakestoreapi.com/products/')
        const data = await res.json()
        setProducts(data)
        setFiltered(data)
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false) // ✅ Step 2: stop loading after data is fetched
      }
    }

    fetchProducts()
  }, [])

  // Filter based on search
  useEffect(() => {
    const lower = search.toLowerCase()
    setFiltered(products.filter((item) => item.title.toLowerCase().includes(lower)))
  }, [search, products])

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm"
      />

      {/* Product List or Skeleton Loader */}
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
                  className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer
                    ${isSelected ? 'bg-blue-100 shadow-lg' : 'bg-white shadow hover:shadow-md'}`}
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <span className="text-sm text-gray-700">{item.title}</span>
                </div>
              )
            })}
      </div>

      {/* Continue Button */}
      <button
        onClick={() => selectedProduct && setOpenScheduleDrawer(true)}
        disabled={!selectedProduct}
        className={`w-full py-3 rounded-lg shadow-md transition 
          ${
            selectedProduct
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
      >
        Continue
      </button>

      {/* Schedule Drawer */}
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