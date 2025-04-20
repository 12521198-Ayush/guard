'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, MessageSquareText, BadgeCheck } from 'lucide-react'
import { FaBell, FaExclamationTriangle } from 'react-icons/fa'
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  skill: string
}

const NewTicketForm: React.FC<Props> = ({ skill }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    description: '',
    priority: 'Normal',
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ ...form, skill })
    // submission logic here
  }

  const priorities = [
    { label: 'Normal', icon: <FaBell className="text-green-500" /> },
    { label: 'Emergency', icon: <FaExclamationTriangle className="text-red-500" /> },
  ]

  const selectedPriority = priorities.find(p => p.label === form.priority)

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto px-2 py-2 space-y-5 bg-white rounded-2xl shadow-md"
    >
      <div className="text-center">
        <motion.h2
          className="text-xl font-semibold text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Raise a Ticket
        </motion.h2>
        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Please fill in the details below
        </motion.p>
      </div>

      <div className="space-y-4">

        {/* Skill (disabled) */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white shadow-inner">
          <BadgeCheck className="text-purple-500 w-5 h-5" />
          <input
            type="text"
            value={skill}
            disabled
            className="flex-1 bg-transparent text-sm text-gray-600 font-medium cursor-not-allowed placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Name */}
        <motion.div
          className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-100"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <User className="text-blue-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder-gray-400 focus:outline-none"
          />
        </motion.div>

        {/* Phone */}
        <motion.div
          className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-100"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Phone className="text-green-500 w-5 h-5" />
          <input
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder-gray-400 focus:outline-none"
          />
        </motion.div>

        {/* Priority Dropdown - Custom */}
        <motion.div
          className="relative"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white shadow-inner cursor-pointer"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              {selectedPriority?.icon}
              <span className="text-gray-600 text-sm font-medium">{form.priority}</span>
            </div>
            {dropdownOpen ? (
              <ChevronUp className="text-gray-400 w-5 h-5" />
            ) : (
              <ChevronDown className="text-gray-400 w-5 h-5" />
            )}
          </motion.div>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute z-10 mt-1 w-full bg-white shadow-md rounded-xl overflow-hidden"
            >
              {priorities.map((opt) => (
                <motion.div
                  key={opt.label}
                  onClick={() => {
                    handleChange('priority', opt.label)
                    setDropdownOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  {opt.icon}
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Description */}
        <motion.div
          className="flex gap-3 items-start rounded-xl px-3 py-2 bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-100"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <MessageSquareText className="text-violet-500 w-5 h-5 mt-1" />
          <textarea
            placeholder="Describe the issue"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder-gray-400 focus:outline-none resize-none"
            rows={4}
          />
        </motion.div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        Submit Ticket
      </motion.button>
    </motion.form>
  )
}

export default NewTicketForm
