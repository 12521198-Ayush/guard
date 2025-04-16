'use client'
import React from 'react'
import { motion } from 'framer-motion'

const RecruitHelper = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Recruit a New Helper</h2>
      <p className="text-gray-500">Find and register new helpers to assist you.</p>
    </motion.div>
  )
}

export default RecruitHelper
