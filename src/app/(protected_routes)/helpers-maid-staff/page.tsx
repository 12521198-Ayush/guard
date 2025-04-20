'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Drawer } from '@mui/material'
import { useRouter } from 'next/navigation'
import { Users, Tag, Gift, UserPlus, ChevronLeft } from 'lucide-react'
import TagYourHelper from './TagYourHelper'
import GiftList from './GiftList'
import RecruitHelper from './RecruitHelper'

const options = [
  {
    key: 'tag',
    label: 'Tag Your Helper',
    about: 'Assign or identify helpers linked to your premises.',
    icon: <Tag className="h-6 w-6 text-indigo-600" />,
    component: <TagYourHelper />,
    color: 'from-indigo-100 to-white',
  },
  {
    key: 'helpers',
    label: 'My Helpers',
    about: 'View all helpers currently working with you.',
    icon: <Users className="h-6 w-6 text-teal-600" />,
    route: '/myhelpers',
    color: 'from-teal-100 to-white',
  },
  {
    key: 'gifts',
    label: 'List of Gift Given',
    about: 'Track gifts and appreciation shared with your helpers.',
    icon: <Gift className="h-6 w-6 text-yellow-600" />,
    component: <GiftList />,
    color: 'from-yellow-100 to-white',
  },
  {
    key: 'recruit',
    label: 'Recruit a New Helper',
    about: 'Onboard a new helper to assist you.',
    icon: <UserPlus className="h-6 w-6 text-pink-600" />,
    component: <RecruitHelper />,
    color: 'from-pink-100 to-white',
  },
]

const HelpersPage = () => {
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  const closeDrawer = () => {
    setOpen(false)
    router.push('/menu') // 👈 Push to /menu when closed
  }

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={closeDrawer}
        PaperProps={{
          className:
            'rounded-t-3xl px-2 md:px-10 py-6 h-[86vh] max-h-[90vh] overflow-y-auto shadow-xl bg-gray-50 animate-slideUp',
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
          <h2 className="text-xl font-bold text-gray-800">
            {selected === null ? 'Helpers' : options[selected].label}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {selected === null ? (
            <motion.div
              className="grid gap-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              {options.map((entry, index) => (
                <motion.button
                  key={entry.key}
                  onClick={() => {
                    if (entry.route) {
                      router.push(entry.route)
                    } else {
                      setSelected(index)
                    }
                  }}

                  whileTap={{ scale: 0.97 }}
                  className={`w-full text-left rounded-xl p-4 bg-gradient-to-tr ${entry.color} shadow-md hover:shadow-lg transition-all flex items-start gap-3`}
                >
                  {entry.icon}
                  <div>
                    <span className="block text-base font-semibold text-gray-800">
                      {entry.label}
                    </span>
                    <span className="mt-1 text-sm text-gray-600">{entry.about}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className=""
            >
              <button
                onClick={() => setSelected(null)}
                className="mb-4 flex items-center gap-1 text-blue-600 font-medium"
              >
                <ChevronLeft size={18} />
                Back
              </button>
              {options[selected].component}
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </>
  )
}

export default HelpersPage
