'use client'

import React, { useState } from 'react'
import { Drawer } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import {
    ChevronLeft,
    Flame,
    AlertTriangle,
    BellRing,
    ShieldAlert,
    AlarmCheck,
} from 'lucide-react'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';


const emergencyOptions = [
    {
        key: 'fire',
        label: 'Fire Alert',
        about: 'Notify security immediately about a fire or smoke emergency.',
        icon: <Flame className="h-6 w-6 text-red-700" />,
        color: 'from-pink-400 to-red-60',
    },
    {
        key: 'lift',
        label: 'Lift Stuck',
        about: 'Report a lift malfunction to dispatch urgent assistance.',
        icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
        color: 'from-orange-400 to-orange-60',
    },
    {
        key: 'animal',
        label: 'Animal Scare',
        about: 'Alert about stray or aggressive animals spotted nearby.',
        icon: <BellRing className="h-6 w-6 text-yellow-600" />,
        color: 'from-yellow-300 to-yellow-100',
    },
    {
        key: 'visitor',
        label: 'Visitor Alert',
        about: 'Report a suspicious or unverified visitor at your premises.',
        icon: <ShieldAlert className="h-6 w-6 text-blue-600" />,
        color: 'from-blue-400 to-blue-100',
    },
]


const EmergencyAlerts = () => {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Inline Emergency Button */}
            <button
                onClick={() => setOpen(true)}
            >
                <NotificationsActiveRoundedIcon style={{ fontSize: 22 }} />
            </button>

            {/* Emergency Drawer */}
            <Drawer
                anchor="bottom"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    className:
                        'rounded-t-3xl px-4 py-6 max-h-[80vh] overflow-y-auto shadow-xl bg-gray-50 animate-slideUp',
                }}
            >
                <style jsx global>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0%);
              opacity: 1;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.35s ease-out;
          }
        `}</style>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Emergency Alerts</h2>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-blue-600 font-medium flex items-center gap-1"
                    >
                        <ChevronLeft size={18} />
                        Close
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        className="grid gap-5"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                    >
                        {emergencyOptions.map((option) => (
                            <motion.button
                                key={option.key}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => alert(`${option.label} reported!`)} // Replace with real handler
                                className={`w-full text-left rounded-xl p-4 bg-gradient-to-tr ${option.color} shadow-md hover:shadow-lg transition-all flex items-start gap-3`}
                            >
                                {option.icon}
                                <div>
                                    <span className="block text-base font-semibold text-gray-800">
                                        {option.label}
                                    </span>
                                    <span className="mt-1 text-sm text-gray-600">{option.about}</span>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </Drawer>
        </>
    )
}

export default EmergencyAlerts
