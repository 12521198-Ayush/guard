'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  List,
  ListItemIcon,
  ListItemText,
  Box,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import CancelIcon from '@mui/icons-material/Cancel'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import LockIcon from '@mui/icons-material/Lock'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'


dayjs.extend(relativeTime)
type OrderStatusKey = keyof typeof statusTextMap

type TimelineEntry = {
  status: string
  time: string
  comment_on_status_change: string
}

type Ticket = {
  _id: string
  order_id: string
  servicetype: string
  customer_name: string
  order_status: string
  order_timeline: TimelineEntry[]
}

const statusIconMap: Record<OrderStatusKey, JSX.Element> = {
  order_initiate: <HourglassTopIcon color="action" />,
  picked: <DirectionsRunIcon color="primary" />,
  temporarily_parked: <HourglassTopIcon color="warning" />,
  cancelled_by_customer: <CancelIcon color="error" />,
  pending: <HelpOutlineIcon color="disabled" />,
  complete: <CheckCircleIcon color="success" />,
  complete_without_otp: <CheckCircleIcon color="success" />,
  customer_not_available: <CancelIcon color="error" />,
  door_locked: <LockIcon color="action" />,
}

const statusTextMap = {
  order_initiate: 'Order Initiated',
  picked: 'Picked',
  temporarily_parked: 'Temporarily Parked',
  cancelled_by_customer: 'Cancelled by Customer',
  pending: 'Pending',
  complete: 'Completed',
  complete_without_otp: 'Completed without OTP',
  customer_not_available: 'Customer Not Available',
  door_locked: 'Door Locked',
}

function normalizeStatus(status: string): OrderStatusKey {
  return status.toLowerCase().replace(/\s+/g, '_') as OrderStatusKey;
}


const Page = () => {
  const [list, setList] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const fetchTickets = async () => {
    const res = await axios.post('http://139.84.166.124:8060/order-service/list', {
      premise_id: 'c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af',
      sub_premise_id: '0aad0a20-6b21-11ef-b2cb-13f201b16993',
      premise_unit_id: 'D-0005',
    })
    setList(res.data.data.array)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <>
      <div className="bg-white p-4 font-sans">
        <div className="flex justify-center mb-6">
          <h2
            className="text-xl font-medium text-[#222] px-6 py-3 rounded-2xl bg-white"
            style={{
              textAlign: 'center',
              width: '90%',
              background: 'linear-gradient(to right, #ffffff, #f9fbfd)',
              boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 -1px 3px rgba(0, 0, 0, 0.07)',
            }}
          >
            Order History
          </h2>
        </div>

        <div className="space-y-4 overflow-y-auto" style={{ height: '75vh' }}>
          {list.map((ticket: any) => (
            <div
              key={ticket._id}
              className="bg-white p-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-start space-x-3"
              style={{
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
              }}
              onClick={() => setSelectedTicket(ticket)} 
            >
              {/* Status Icon as Profile */}
              <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center shadow-inner">
                {statusIconMap[ticket.order_status as keyof typeof statusIconMap]}
              </div>

              {/* Ticket Info */}
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-gray-800 mb-1">
                  #{ticket.order_id} • {ticket.servicetype}
                </h3>
                <p className="text-sm text-gray-500">
                  {statusTextMap[ticket.order_status as keyof typeof statusTextMap] ?? ticket.order_status}
                </p>
                <p className="text-sm text-gray-500">
                  {dayjs(ticket.order_creation_ts).format('DD MMM YYYY, hh:mm A')} (
                  {dayjs(ticket.order_creation_ts).fromNow()})
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Timeline Drawer */}
      <Drawer
        anchor="bottom"
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pt: 2,
            pb: 4,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
          },
        }}
      >
        {selectedTicket && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                Order #{selectedTicket.order_id} Timeline
              </Typography>
              <IconButton onClick={() => setSelectedTicket(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <List dense>
              <AnimatePresence>
                {selectedTicket.order_timeline.map((entry, index) => {
                  const normalized = normalizeStatus(entry.status)
                  const isLatest = index === selectedTicket.order_timeline.length - 1

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        sx={{
                          backgroundColor: isLatest ? '#f0f9ff' : '#fff',
                          borderRadius: 2,
                          mb: 1.5,
                          px: 2,
                          py: 1,
                          boxShadow: isLatest ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {statusIconMap[normalized as OrderStatusKey] || <AccessTimeIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={statusTextMap[normalized as OrderStatusKey] || entry.status}
                          secondary={
                            <>
                              {dayjs(entry.time).format('DD MMM YYYY, hh:mm A')} (
                              {dayjs(entry.time).fromNow()})
                              <br />
                              {entry.comment_on_status_change}
                            </>
                          }
                          primaryTypographyProps={{
                            fontWeight: isLatest ? 'bold' : 500,
                            color: '#333',
                          }}
                          secondaryTypographyProps={{ color: 'text.secondary' }}
                        />
                      </Box>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </List>
          </>
        )}
      </Drawer>
    </>
  )
}

export default Page
