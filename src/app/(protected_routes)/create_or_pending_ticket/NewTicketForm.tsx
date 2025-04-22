'use client'
import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, MessageSquareText, BadgeCheck } from 'lucide-react'
import { FaBell, FaExclamationTriangle } from 'react-icons/fa'
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { MdNotificationsNone, MdWarningAmber } from 'react-icons/md';
import { message } from 'antd';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'

interface Props {
  skill: string
}

interface Resident {
  sub_premise_id: string
  premise_unit_id: string
  name: string
  mobile: string
}

interface Props {
  skill: string
  onClose: any
}


const NewTicketForm: React.FC<Props> = ({ skill, onClose }) => {
  const { data: session } = useSession();

  const AdminName = session?.user?.name;
  const phone = session?.user?.phone;

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

  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [base64String, setBase64String] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        setError("Only image files (JPG, PNG, GIF) are allowed.")
        setUploadedFile(null)
      } else {
        setError("")
        setUploadedFile(file)
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = () => {
          setBase64String(reader.result as string)
        }
        reader.onerror = () => {
          setError("Error converting file to Base64")
        }
      }
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    onClose();
    e.preventDefault()

    const requestData = {
      premise_id: session?.user?.primary_premise_id,
      sub_premise_id: session?.user?.sub_premise_id,
      premise_unit_id: session?.user?.premise_unit_id,
      servicetype: skill,
      service_priority: form.priority,
      order_description: form.description,
      customer_name: session?.user?.name,
      customer_mobile: session?.user?.phone
    }

    try {
      const response = await fetch('http://139.84.166.124:8060/order-service/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      if (response.status === 201) {
        console.log('Ticket created:', data)
        message.success('Ticket submitted successfully!')
      }

      setForm({
        name: '',
        phone: '',
        description: '',
        priority: 'Normal',
      })
    } catch (error) {
      console.error('Failed to submit ticket:', error)
      alert('Failed to submit ticket. Please try again.')
    }
  }


  const priorities = [
    { label: 'Normal', icon: <MdNotificationsNone className="text-green-500 w-5 h-5" /> },
    { label: 'Emergency', icon: <MdWarningAmber className="text-red-500 w-5 h-5" /> },
  ];

  const selectedPriority = priorities.find(p => p.label === form.priority)

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto px-2 py-2 space-y-6 bg-white rounded-2xl"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <motion.h2
          className="text-2xl font-semibold text-gray-800"
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

      {/* Name and Phone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-start gap-4 bg-gray-50 p-4 rounded-2xl shadow-inner"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm uppercase">
          {AdminName?.charAt(0) || 'G'}
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="text"
            placeholder="Visitor Name"
            value={(AdminName || '').toString()}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full rounded-xl px-4 py-2 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-inner"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone?.replace(/\D/g, '').slice(-10) || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full rounded-xl px-4 py-2 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-inner"
          />
        </div>
      </motion.div>

      {/* Skill (Read-only) */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gray-100 shadow-inner">
        <BadgeCheck className="text-purple-500 w-5 h-5" />
        <input
          type="text"
          value={skill}
          disabled
          className="flex-1 bg-transparent text-sm text-gray-600 font-medium cursor-not-allowed focus:outline-none"
        />
      </div>

      {/* Priority Dropdown */}
      <motion.div className="relative" initial={{ scale: 1 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <motion.div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-inner cursor-pointer"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            {selectedPriority?.icon}
            <span className="text-sm font-medium text-gray-700">{form.priority}</span>
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
            className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden"
          >
            {priorities.map((opt) => (
              <motion.div
                key={opt.label}
                onClick={() => {
                  handleChange('priority', opt.label);
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer transition duration-150"
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <textarea
            placeholder="Describe the issue..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-inner pr-10"
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/jpg"
            style={{ display: 'none' }}
            onChange={handleUploadClick}
          />

          {/* Upload button */}
          <button
            type="button"
            className="absolute bottom-2 right-3 text-blue-500 hover:text-blue-600"
            onClick={handleButtonClick}
          >
            <CloudUploadOutlinedIcon fontSize="small" />
          </button>
        </div>
      </motion.div>


      {/* Submit Button */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out"
      >
        Submit Ticket
      </motion.button>
    </motion.form>


  )
}

export default NewTicketForm
