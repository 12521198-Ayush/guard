'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { FaRegSmile, FaPaperPlane, FaTimes } from 'react-icons/fa'

interface StoryMedia {
  type: 'image' | 'video'
  url: string
}

interface StatusStoryProps {
  media: StoryMedia[]
  title: string
  subtitle?: string
  avatarUrl?: string
}

const STORY_DURATION = 10000

const StatusStory: React.FC<StatusStoryProps> = ({
  media,
  title,
  subtitle = 'Today at 12:26 pm',
  avatarUrl = media[0]?.url || '',
}) => {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showReplyBox, setShowReplyBox] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const elapsedRef = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const currentMedia = media[index]

  const startTimer = () => {
    clearTimers()
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current + elapsedRef.current
      const percent = Math.min(100, (elapsed / STORY_DURATION) * 100)
      setProgress(percent)
      if (percent >= 100) {
        clearTimers()
        if (index < media.length - 1) {
          setIndex(prev => prev + 1)
        } else {
          setOpen(false)
        }
      }
    }, 100)

    timerRef.current = setTimeout(() => {
      if (index < media.length - 1) setIndex(prev => prev + 1)
      else setOpen(false)
    }, STORY_DURATION - elapsedRef.current)
  }

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  useEffect(() => {
    if (open && !paused) {
      setProgress(0)
      elapsedRef.current = 0
      startTimer()
    }
    return () => clearTimers()
  }, [open, index])

  useEffect(() => {
    if (paused) {
      elapsedRef.current += Date.now() - startTimeRef.current
      clearTimers()
    } else if (open && progress < 100) {
      startTimer()
    }
  }, [paused])


  const handlers = useSwipeable({
    onSwipedUp: () => setShowReplyBox(true),
    onSwipedLeft: () => index < media.length - 1 && setIndex(index + 1),
    onSwipedRight: () => index > 0 && setIndex(index - 1),
    onSwipedDown: () => setOpen(false),
    trackTouch: true,
  })


  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setPaused(true)
      if (videoRef.current) videoRef.current.pause()
    }, 200)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    if (paused) {
      setPaused(false)
      if (videoRef.current) videoRef.current.play()
    }
  }


  const handleTapZone = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = e
    const screenWidth = window.innerWidth
    if (clientX < screenWidth / 2) {
      if (index > 0) setIndex(index - 1)
    } else {
      if (index < media.length - 1) setIndex(index + 1)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => {
          setOpen(true)
          setIndex(0)
          setPaused(false)
          setShowReplyBox(false)
        }}
        className="cursor-pointer transition-transform duration-300"
      >
        <div className="bg-gradient-to-tr from-blue-400 via-cyan-300 to-indigo-500 p-[2px] rounded-full">
          <div className="bg-white p-[2px] rounded-full">
            <div className="w-15 h-15 rounded-full overflow-hidden bg-white">
              <Image src={avatarUrl} alt="Status" width={80} height={80} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            {...handlers}
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-[1000] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Tap to navigate zones */}
            <div className="absolute w-full h-full z-[1010] flex">
              <div className="w-1/2 h-full" onClick={handleTapZone} />
              <div className="w-1/2 h-full" onClick={handleTapZone} />
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white bg-opacity-30 z-20 flex">
              {media.map((_, i) => (
                <div key={i} className="flex-1 h-full mx-0.5 bg-white bg-opacity-50 relative overflow-hidden">
                  {i === index && (
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-green-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'linear', duration: 0.1 }}
                    />
                  )}
                  {i < index && <div className="absolute top-0 left-0 h-full w-full bg-green-400" />}
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 z-30 w-full flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white">
                  <Image src={avatarUrl} alt="Avatar" width={40} height={40} />
                </div>
                <div className="text-white">
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-gray-300">{subtitle}</p>
                </div>
              </div>
              <FaTimes
                onClick={() => setOpen(false)}
                className="text-white text-xl cursor-pointer hover:scale-110 transition"
              />
            </div>

            {/* Media Content */}
            <div
              className="flex-1 relative w-full flex justify-center items-center"
              onTouchStart={handleLongPressStart}
              onTouchEnd={handleLongPressEnd}
              onMouseDown={handleLongPressStart}
              onMouseUp={handleLongPressEnd}
              onClick={() => setShowReplyBox(true)}
            >
              {currentMedia.type === 'image' ? (
                <Image
                  src={currentMedia.url}
                  alt="Story"
                  fill
                  className={`object-cover ${showReplyBox ? 'blur-md scale-105' : ''}`}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${showReplyBox ? 'blur-md scale-105' : ''}`}
                  onPlay={() => setPaused(false)}
                  onPause={() => setPaused(true)}
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>


            {/* Bottom Gradient */}
            <div className="absolute bottom-0 w-full h-28 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

            {/* Comment Box */}
            <motion.div
              className="absolute bottom-0 w-full bg-black bg-opacity-60 px-4 py-2 flex items-center gap-2 z-20"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
            >
              <FaRegSmile className="text-white text-2xl cursor-pointer" />
              <input
                type="text"
                placeholder="Leave a message..."
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
