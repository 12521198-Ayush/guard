'use client';

import {
    Box,
    Typography,
    IconButton,
    Snackbar,
    Backdrop,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import PendingVisitorList from './PendingVisitorList';

interface Visitor {
    id: number;
    name: string;
    flat: string;
    status: 'pending' | 'approved' | 'rejected' | string;
}

interface VisitorDrawerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    drawerHeight?: number;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
    var webkitSpeechRecognition: any;

    interface SpeechRecognitionEvent extends Event {
        results: SpeechRecognitionResultList;
    }
}

export default function VisitorDrawer({ open, setOpen, drawerHeight = 0.6 }: VisitorDrawerProps) {

    return (
        <>
            {/* Blur background when drawer is open */}
            <Backdrop open={open} sx={{ zIndex: 1200, backdropFilter: 'blur(4px)' }} />

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) setOpen(false);
                        }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '60vh',
                            backgroundColor: '#fff',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                            zIndex: 1301,
                            padding: '16px 16px 24px',
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {/* Drag handle */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 4,
                                    bgcolor: 'grey.400',
                                    borderRadius: 2,
                                }}
                            />
                        </Box>

                        {/* Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <IconButton onClick={() => setOpen(false)} size="small">
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                                Visitors list
                            </Typography>
                        </Box>

                        <PendingVisitorList />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
