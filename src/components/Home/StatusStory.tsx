'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { FaRegSmile, FaPaperPlane } from 'react-icons/fa'

interface StatusStoryProps {
    imageUrl: string
    title: string
    subtitle?: string
    avatarUrl?: string
}

const StatusStory: React.FC<StatusStoryProps> = ({
    imageUrl,
    title,
    subtitle = 'Today at 12:26 pm',
    avatarUrl = 'https://www.servizing.com/assets/images/logo-128x128.png',
}) => {
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(0)
    const [showReplyBox, setShowReplyBox] = useState(false)

    const progressRef = useRef<number>(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0)
    const elapsedTimeRef = useRef<number>(0)

    const STORY_DURATION = 15000 // 15 seconds

    const startTimer = () => {
        clearTimers()

        startTimeRef.current = Date.now()

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current + elapsedTimeRef.current
            const percent = Math.min(100, (elapsed / STORY_DURATION) * 100)
            progressRef.current = percent
            setProgress(percent)

            if (percent >= 100) {
                clearTimers()
                timerRef.current = setTimeout(() => setOpen(false), 300)
            }
        }, 100)

        timerRef.current = setTimeout(() => setOpen(false), STORY_DURATION - elapsedTimeRef.current)
    }

    const clearTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current)
        if (intervalRef.current) clearInterval(intervalRef.current)
    }

    useEffect(() => {
        if (open) {
            setProgress(0)
            progressRef.current = 0
            elapsedTimeRef.current = 0
            startTimeRef.current = Date.now()
            startTimer()
        } else {
            clearTimers()
        }

        return () => clearTimers()
    }, [open])

    useEffect(() => {
        if (showReplyBox) {
            // Pause timer
            elapsedTimeRef.current += Date.now() - startTimeRef.current
            clearTimers()
        } else if (open && progressRef.current < 100) {
            // Resume timer
            startTimer()
        }
    }, [showReplyBox])

    const handlers = useSwipeable({
        onSwipedDown: () => setOpen(false),
        onSwipedUp: () => setShowReplyBox(true),
        trackTouch: true,
    })

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Status Circle */}
            <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                    setOpen(true)
                    setShowReplyBox(false)
                }}
                className="cursor-pointer transition-transform duration-300"
            >
                <div className="bg-gradient-to-tr from-blue-400 via-cyan-300 to-indigo-500 p-[2px] rounded-full">
                    <div className="bg-white p-[2px] rounded-full">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
                            <Image
                                src={avatarUrl}
                                alt="Status"
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Fullscreen Story */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        {...handlers}
                        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex flex-col justify-start items-center z-[1000]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white bg-opacity-30 fixed top-0 left-0 z-20">
                            <motion.div
                                className="h-full bg-green-400"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: 'linear', duration: 0.1 }}
                            />
                        </div>

                        {/* Header */}
                        <div className="w-full absolute top-0 left-0 z-20 flex items-center p-4 gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white">
                                <Image src={avatarUrl} alt="Avatar" width={40} height={40} />
                            </div>
                            <div className="text-white">
                                <p className="font-semibold text-sm">{title}</p>
                                <p className="text-xs text-gray-300">{subtitle}</p>
                            </div>
                        </div>

                        {/* Story Image */}
                        <div className="relative w-full h-full flex justify-center items-center">
                            <Image
                                src={imageUrl}
                                alt="Story Image"
                                fill
                                className={`object-cover transition-all duration-300 ${showReplyBox ? 'blur-md scale-105' : ''
                                    }`}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                        </div>


                        {/* Bottom Gradient */}
                        <div className="absolute bottom-0 w-full h-28 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                        {/* Emoji + Comment Box */}
                        <motion.div
                            className="absolute bottom-0 w-full bg-black bg-opacity-60 px-4 py-2 flex items-center gap-2 z-20"
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                        >
                            <FaRegSmile className="text-white text-2xl cursor-pointer" />
                            <input
                                type="text"
                                placeholder="Leave a message for Servizing..."
                                className="flex-1 px-4 py-2 rounded-full bg-white text-black placeholder-gray-500 text-sm focus:outline-none"
                                onFocus={() => setShowReplyBox(true)}
                                onBlur={() => setShowReplyBox(false)}
                            />
                            <FaPaperPlane className="text-white text-xl cursor-pointer" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default StatusStory
