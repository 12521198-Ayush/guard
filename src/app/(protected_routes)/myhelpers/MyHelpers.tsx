'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import HelpersList from './HelpersList'
import Loader from './Loader'

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
  const initialLoadDone = useRef(false)

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
      )

      const fetched: Helper[] = res.data?.data?.array || []

      // Avoid duplicates using mobile as unique key
      setHelpers((prev) => {
        const existingMobiles = new Set(prev.map((h) => h.mobile))
        const filtered = fetched.filter((h) => !existingMobiles.has(h.mobile))
        return [...prev, ...filtered]
      })

      if (fetched.length > 0) {
        setPage((prev) => prev + 1)
      }

      setHasMore(fetched.length === 5) // If fetched less than 5, assume no more pages
    } catch (err) {
      console.error('Failed to fetch helpers:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, session])

  useEffect(() => {
    if (session && !initialLoadDone.current) {
      initialLoadDone.current = true
      fetchHelpers()
    }
  }, [session, fetchHelpers])

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
    <div className="bg-[#f1f5f9] p-3 font-sans transition-all">
      <div className="flex justify-center mb-6">
        <h2
          className="text-xl font-medium text-[#222] px-6 py-3 rounded-2xl bg-white"
          style={{
            textAlign: 'center',
            width: '90%',
            background: 'linear-gradient(to right, #ffffff, #f9fbfd)',
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 -1px 3px rgba(0, 0, 0, 0.07)',
          }}
        >
          Helpers List
        </h2>
      </div>
      {/* Scrollable area below the heading */}
      <div className="mt-4 space-y-4 overflow-y-auto" style={{ height: '70vh' }}>
        {helpers.length === 0 && !loading ? (
          <p className="text-gray-400">No helpers found.</p>
        ) : (
          <HelpersList helpers={helpers} />
        )}

        {loading && <Loader />}
        <div ref={observerRef} className="h-1" />
      </div>
    </div>
  )
}

export default MyHelpers
