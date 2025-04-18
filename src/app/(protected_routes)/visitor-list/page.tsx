'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import VisitorCard, { Visitor } from './VisitorCard'
import Tabs from './Tabs'
import Loader from './Loader'
import { useSession } from 'next-auth/react'

const PAGE_SIZE = 5

const Page: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'VENDOR'>('PERSONAL')
  const { data: session } = useSession()
  const observer = useRef<IntersectionObserver | null>(null)

  const filteredVisitors = visitors.filter(v =>
    activeTab === 'VENDOR' ? !!v.vendor_name : !v.vendor_name
  )

  const lastVisitorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1)
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  const handleDelete = async (visitor: Visitor) => {
    const result = await Swal.fire({
      title: 'Delete Invitation?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      width: 350
    })

    if (!result.isConfirmed) return

    try {
      const { data } = await axios.post('http://139.84.166.124:8060/vms-service/preinvite/cancel', {
        premise_id: session?.user?.primary_premise_id,
        _id: visitor._id,
        premise_unit_id: session?.user?.premise_unit_id
      })

      if (data?.data?.acknowledged) {
        setVisitors(prev => prev.filter(v => v._id !== visitor._id))
        Swal.fire({
          title: 'Deleted!',
          text: 'The invitation has been removed.',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'bg-green-500 text-white hover:bg-green-600'
          }
        })
      } else {
        throw new Error('Delete failed')
      }
    } catch (err) {
      Swal.fire('Error!', 'Failed to delete. Try again.', 'error')
    }
  }

  // Reset data on tab change
  useEffect(() => {
    setVisitors([])
    setPage(1)
    setHasMore(true)
  }, [activeTab])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const fetchVisitors = async () => {
      if (!session) return

      setLoading(true)
      const delay = new Promise(res => (timeoutId = setTimeout(res, 10)))

      try {
        const response = await axios.post(
          'http://139.84.166.124:8060/vms-service/preinvite/list',
          {
            premise_id: session.user.primary_premise_id,
            premise_unit_id: session.user.premise_unit_id,
            sub_premise_id: session.user.sub_premise_id,
            resident_mobile_number: session.user.phone,
            page: page.toString(),
            limit: PAGE_SIZE.toString(),
            bIsVendor: activeTab === 'VENDOR' ? 'yes' : 'no',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        )

        const newData: Visitor[] = response.data.data || []
        setVisitors(prev => {
          const ids = new Set(prev.map(v => v._id))
          return [...prev, ...newData.filter(v => !ids.has(v._id))]
        })

        if (newData.length < PAGE_SIZE) setHasMore(false)
      } catch (err) {
        console.error('Error fetching:', err)
      }

      await delay
      setLoading(false)
    }

    fetchVisitors()
    return () => clearTimeout(timeoutId)
  }, [page, activeTab, session])

  return (
    <div className="bg-[#f1f5f9] p-3 font-sans transition-all">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 bg-white p-2 rounded-2xl shadow-md text-center">
        Pre-Invited Visitor List
      </h2>

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 space-y-4 overflow-y-auto" style={{ height: '70vh' }}>
        {filteredVisitors.map((visitor, index) => {
          const refProps = index === filteredVisitors.length - 1 ? { ref: lastVisitorRef } : {}
          return (
            <div key={`${visitor._id}-${index}`} {...refProps}>
              <VisitorCard visitor={visitor} onDelete={handleDelete} />
            </div>
          )
        })}

        {!loading && filteredVisitors.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-24 px-4 text-center">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-blue-100 to-gray-100 animate-pulse-soft shadow-inner mb-5 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-500">No Pre-Invited Visitor Found</p>
            <p className="text-sm text-gray-400">Start inviting guests or vendors to see them here.</p>
          </div>
        )}


        {loading && (
          <div className="mt-6 flex justify-center">
            <Loader />
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
