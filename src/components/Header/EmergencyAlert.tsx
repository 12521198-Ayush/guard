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
} from 'lucide-react'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useSession } from 'next-auth/react';

const emergencyOptions = [
    {
        key: 'fire',
        label: 'Fire Alert',
        about: 'Notify security immediately about a fire or smoke emergency.',
        icon: <Flame className="h-6 w-6 text-red-600" />,
        color: 'from-pink-200 to-white',
    },
    {
        key: 'lift',
        label: 'Lift Stuck',
        about: 'Report a lift malfunction to dispatch urgent assistance.',
        icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
        color: 'from-orange-200 to-white',
    },
    {
        key: 'animal',
        label: 'Animal Scare',
        about: 'Alert about stray or aggressive animals spotted nearby.',
        icon: <BellRing className="h-6 w-6 text-yellow-600" />,
        color: 'from-yellow-200 to-white',
    },
    {
        key: 'visitor',
        label: 'Visitor Alert',
        about: 'Report a suspicious or unverified visitor at your premises.',
        icon: <ShieldAlert className="h-6 w-6 text-blue-600" />,
        color: 'from-blue-200 to-white',
    },
]

const EmergencyAlerts = () => {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession();

    const handleEmergencyClick = async (emergency_type: string) => {
        const payload = {
            premise_id: session?.user?.primary_premise_id,
            premise_unit_id: session?.user?.premise_unit_id,
            mobile: session?.user?.phone,
            emergency_type,
        }

        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/misc/emergency_alarm/create',
                payload
            )

            if (response.data?.data?.acknowledged) {
                Swal.fire({
                    icon: 'success',
                    title: 'Alert Sent!',
                    text: `${emergency_type} alert has been successfully reported.`,
                    confirmButtonColor: '#3085d6',
                })
                setOpen(false)
            } else {
                throw new Error('API did not acknowledge the request.')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'Something went wrong. Please try again.',
                confirmButtonColor: '#d33',
            })
        }
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>
                <img
                    width="40"
                    height="40"
                    src="https://img.icons8.com/color/48/hot-line.png"
                    alt="hot-line"
                />
            </button>

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
                                onClick={() => handleEmergencyClick(option.key)}
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
