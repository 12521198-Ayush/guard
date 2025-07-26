'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import LockIcon from '@mui/icons-material/Lock'
import CancelIcon from '@mui/icons-material/Cancel'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { Box, List, ListItemIcon, ListItemText, Typography, } from '@mui/material';



type OrderStatusKey = keyof typeof statusTextMap

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

function normalizeStatus(status: string): OrderStatusKey {
    return status.toLowerCase().replace(/\s+/g, '_') as OrderStatusKey;
}

const TicketTimeline = ({ ticket }: any) => {

    return (
        <>
            {/* Header */}
            <div className="text-center space-y-1 mt-3">
                <motion.h2
                    className="text-2xl font-semibold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Ticket Timeline
                </motion.h2>
            </div>  

            <div className='ml-5'>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Order #{ticket.order_id} {ticket.premise_unit_id}
                    </Typography>

                </Box>
                <List dense>
                    <AnimatePresence>
                        {ticket.order_timeline.map((entry: any, index: any) => {
                            const normalized = normalizeStatus(entry.status)
                            const isLatest = index === ticket.order_timeline.length - 1

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
                                            mb: 0.5,
                                            px: 0,
                                            py: 0,
                                            boxShadow: isLatest ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
                                        }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <div className="ml-1 w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center shadow-inner">
                                                {statusIconMap[normalized as OrderStatusKey] || <AccessTimeIcon />}
                                            </div>
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
                                        </div>
                                    </Box>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </List>
            </div>        
        </>
    );
}

export default TicketTimeline;