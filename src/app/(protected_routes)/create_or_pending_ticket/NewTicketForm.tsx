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
import axios from 'axios'
import { FaUpload } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';

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
      object_id: uploadedObjectId,
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
      message.info('.')
    }
  }

  const priorities = [
    { label: 'Normal', icon: <MdNotificationsNone className="text-green-500 w-5 h-5" /> },
    { label: 'Emergency', icon: <MdWarningAmber className="text-red-500 w-5 h-5" /> },
  ];

  const selectedPriority = priorities.find(p => p.label === form.priority)

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedObjectId, setUploadedObjectId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const getBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 2;
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'application/pdf',
    ];

    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Only PNG, JPG, GIF, or PDF files are allowed.';
      setUploadError(errorMsg);
      message.warning(errorMsg);
      return;
    }

    let finalFile = file;

    if (file.type !== 'application/pdf') {
      try {
        // Compress image to be under 2MB
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        finalFile = await imageCompression(file, options);
        console.log('🗜️ Compressed file size (MB):', finalFile.size / 1024 / 1024);
      } catch (error) {
        console.error('❌ Image compression failed:', error);
        message.error('Image compression failed.');
        setUploading(false);
        return;
      }
    } else {
      // For PDFs, just check size
      const isTooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
      if (isTooLarge) {
        const errorMsg = `PDF must be smaller than ${MAX_FILE_SIZE_MB}MB`;
        setUploadError(errorMsg);
        message.warning(errorMsg);
        setUploading(false);
        return;
      }
    }

    setUploadError(null);
    setUploadedFile(finalFile);
    console.log('📂 Final file selected:', finalFile);

    // Preview
    if (finalFile.type === 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(finalFile));
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(finalFile);
    }

    try {
      const base64WithPrefix = await getBase64(finalFile);
      const payload = {
        premise_id: session?.user?.primary_premise_id,
        filetype: finalFile.type,
        file_extension: finalFile.name.split('.').pop(),
        base64_data: base64WithPrefix,
      };

      console.log('📤 Upload payload:', payload);

      const res = await axios.post(
        'http://139.84.166.124:8060/order-service/upload/async',
        payload,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      const objectKey = res?.data?.data?.key;
      if (objectKey) {
        setUploadedObjectId(objectKey);
        console.log('✅ File uploaded, Object ID:', objectKey);
        message.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      message.error('File upload failed.');
    }

    setUploading(false);
  };

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
      {/* <motion.div
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
      </motion.div> */}


      {/* <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gray-100 shadow-inner">
        <BadgeCheck className="text-purple-500 w-5 h-5" />
        <input
          type="text"
          value={skill}
          disabled
          className="flex-1 bg-transparent text-sm text-gray-600 font-medium cursor-not-allowed focus:outline-none"
        />
      </div> */}

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
            className="absolute z-40 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden"
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
        <div className="relative bg-white rounded-2xl px-3 space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Describe the issue
          </label>

          <textarea
            id="description"
            placeholder="Write a brief description..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full resize-none px-4 py-3 text-sm text-gray-800 bg-gray-50 border-gray-300 rounded-xl focus:outline-none focus:ring-2 ring-blue-500 focus:border-blue-400 transition-all duration-200"
          />
        </div>
      </motion.div>

      <div className="relative w-full">
        <label htmlFor="vehicle-doc-upload" className="block mb-2 text-sm text-gray-800">
          Upload a snapshot of your issue
        </label>

        <label
          htmlFor="vehicle-doc-upload"
          className={`cursor-pointer w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 hover:shadow-lg transition-all
                                                            ${uploading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
        >
          {uploading ? (
            <span className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>Uploading...</span>
            </span>
          ) : (
            <>
              {uploadedFile ? uploadedFile.name : 'Choose Image (JPG, PNG, GIF, PDF)'}
              <FaUpload className="ml-2 h-4 w-4 text-gray-500" />
            </>
          )}
        </label>

        <input
          id="vehicle-doc-upload"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />

        {uploadError && (
          <p className="text-sm text-red-500 mt-2">{uploadError}</p>
        )}

        {uploadedFile && (
          <p className="text-xs text-gray-500 mt-1">
            File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>

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
