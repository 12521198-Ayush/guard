'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

const premiseDetails = {
  premise_id: 'c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af',
  sub_premise_id: '0aad0a20-6b21-11ef-b2cb-13f201b16993',
  premise_unit_id: 'D-0005',
}

type Helper = {
  name: string
  mobile: string
  skill: string
  picture_url: string
  address: string
}

const MyHelpers = () => {
  const [helpers, setHelpers] = useState<Helper[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement | null>(null)
  const { data: session } = useSession()

  const fetchHelpers = useCallback(async () => {
    if (loading || !hasMore || !session) return
    setLoading(true)
    try {
      const res = await axios.post(
        'http://139.84.166.124:8060/staff-service/list',
        {
          ...premiseDetails,
          page,
          limit: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user?.accessToken}`,
          },
        }
      );
      console.log(res.data)
      const fetched = res.data?.data?.array || []
      setHelpers((prev) => [...prev, ...fetched])
      setHasMore(fetched.length > 0)
      if (fetched.length > 0) setPage((prev) => prev + 1)
    } catch (err) {
      console.error('Failed to fetch helpers:', err)
    } finally {
      setLoading(false)
    }
  }, [page, hasMore, loading])

  useEffect(() => {
    fetchHelpers()
  }, [])

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchHelpers()
        }
      },
      { threshold: 1 }
    )
    const currentRef = observerRef.current
    if (currentRef) observer.observe(currentRef)
    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [fetchHelpers, hasMore, loading])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4"
    >
      <h2 className="text-xl font-semibold mb-2 text-gray-700">My Helpers</h2>
      <p className="text-gray-500 mb-4">List of your registered helpers will appear here.</p>

      {helpers.length === 0 && !loading ? (
        <p className="text-gray-400">No helpers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helpers.map((helper, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-white"
            >
              <Image
                src={helper.picture_url}
                alt={helper.name}
                width={64}
                height={64}
                className="rounded-full object-cover border"
              />
              <div>
                <h3 className="font-medium text-gray-800">{helper.name}</h3>
                <p className="text-sm text-gray-500">📞 {helper.mobile}</p>
                <p className="text-sm text-gray-500">🛠️ {helper.skill}</p>
                <p className="text-xs text-gray-400">{helper.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-center text-gray-400 mt-4">Loading more...</p>}
      <div ref={observerRef} className="h-10" />
    </motion.div>
  )
}

export default MyHelpers
