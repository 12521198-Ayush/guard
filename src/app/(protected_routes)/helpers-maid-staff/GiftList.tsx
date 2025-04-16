'use client'
import React from 'react'
import { motion } from 'framer-motion'

const GiftList = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-2 text-gray-700">List of Gift Given</h2>
      <p className="text-gray-500">Track the gifts you’ve shared with your helpers.</p>
    </motion.div>
  )
}

export default GiftList
