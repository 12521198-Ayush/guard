'use client'

import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Button,
} from '@mui/material';

import { useSession } from 'next-auth/react'
import {
    AiOutlinePaperClip,
    AiFillFilePdf,
    AiFillFileImage,
    AiFillFileExcel,
    AiFillFile
} from 'react-icons/ai';
import { AnimatePresence, motion } from 'framer-motion';

interface EmailDrawerProps {
    selectedEmail: any;
    onClose: () => void;
    handleAttachmentClick: (att: any) => void;
}

const EmailDrawer: React.FC<EmailDrawerProps> = ({ selectedEmail, onClose, handleAttachmentClick }) => {
    const [windowHeight, setWindowHeight] = useState(0);
    const { data: session } = useSession()
    const [viewingAttachment, setViewingAttachment] = useState<any>(null);

    useEffect(() => {
        // This runs only on client
        setWindowHeight(window.innerHeight);
        console.log(selectedEmail)
        // Optional: update on window resize
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Calculate dynamic height based on message length (approximate)
    const baseHeight = 150;
    const charCount = selectedEmail?.message?.length || 0;
    const [dynamicHeight, setDynamicHeight] = useState(400); // Default fallback

    useEffect(() => {
        const updateHeight = () => {
            const height = Math.min(window.innerHeight * 0.9, baseHeight + (selectedEmail?.message?.length || 0) * 0.3);
            setDynamicHeight(height);
        };

        updateHeight(); // Set initially
        window.addEventListener('resize', updateHeight);

        return () => window.removeEventListener('resize', updateHeight);
    }, [selectedEmail]);

    const premiseId = session?.user?.primary_premise_id;

    const handleAttachment = async (att: any) => {
        try {
            const res = await fetch("http://139.84.166.124:8060/staff-service/upload/get_presigned_url", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({ premise_id: premiseId, file_key: att.file_key }),
            });
            const result = await res.json();
            if (result?.data) {
                setViewingAttachment({ ...att, url: result.data });
            }
        } catch (error) {
            console.error("Error fetching attachment URL:", error);
        }
    };

    const getAttachmentIcons = (filetype: string) => {
        switch (filetype) {
            case 'pdf':
                return <AiFillFilePdf className="text-red-500 w-5 h-5" />;
            case 'image':
                return <AiFillFileImage className="text-blue-400 w-5 h-5" />;
            case 'excel':
                return <AiFillFileExcel className="text-green-500 w-5 h-5" />;
            default:
                return <AiFillFile className="text-gray-500 w-5 h-5" />;
        }
    };


    const buildAttachments = (objectIds: string[]) => {
        return objectIds.map((key) => {
            const parts = key.split('/');
            const filename = parts[parts.length - 1];
            const extension = filename.split('.').pop()?.toLowerCase();
            let filetype: 'image' | 'pdf' | 'excel' | 'other' = 'other';

            if (['jpg', 'jpeg', 'png', 'gif'].includes(extension!)) filetype = 'image';
            else if (extension === 'pdf') filetype = 'pdf';
            else if (['xls', 'xlsx', 'csv'].includes(extension!)) filetype = 'excel';

            return {
                file_key: key,
                filename,
                filetype,
            };
        });
    };

    if (!selectedEmail) return null;


    const attachments = selectedEmail
        ? selectedEmail.attachments ||
        (selectedEmail.object_id_attachment_array
            ? buildAttachments(selectedEmail.object_id_attachment_array)
            : [])
        : [];

    console.log(selectedEmail)

    return (

        <Drawer
            anchor="bottom"
            open={!!selectedEmail}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    px: 3,
                    pt: 2,
                    pb: 0,
                    background: 'linear-gradient(to top, #ffffff, #f7faff)',
                    maxHeight: '90vh',   // max height but no fixed height
                    height: 'auto',      // allow auto height
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {selectedEmail && (
                <>
                    {/* Drag handle */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box width={50} height={6} borderRadius={3} bgcolor="blue.200" />
                    </Box>

                    {/* Scrollable content */}
                    <Box
                        sx={{
                            overflowY: 'auto',
                            flexGrow: 1,
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} color="#222">
                            {selectedEmail.subject}
                        </Typography>
                        <p>
                            <span className="font-medium text-gray-700 dark:text-gray-300">To : </span>
                            {selectedEmail.recipients_array && Array.isArray(selectedEmail.recipients_array)
                                ? selectedEmail.recipients_array.join(', ')
                                : selectedEmail.recipient_type
                                    ? selectedEmail.recipient_type
                                        .replace(/_/g, ' ') // Replace underscores with spaces
                                        .replace(/^(.)/, (match: any) => match.toUpperCase()) // Capitalize the first letter
                                    : ''}

                        </p>
                        <Typography variant="body2" color="#666" mb={2}>
                            {selectedEmail.from}
                        </Typography>

                        <Box
                            className="prose max-w-none"
                            sx={{ color: '#555', fontSize: 14, mb: 3 }}
                            dangerouslySetInnerHTML={{ __html: selectedEmail.message }}
                        />

                        {attachments.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                    Attachments
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={1}>
                                    {attachments.map((att: any, index: number) => (
                                        <Box
                                            key={index}
                                            onClick={() => handleAttachment(att)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                px: 1,
                                                py: 0.5,
                                                cursor: 'pointer',
                                                borderRadius: 1,
                                                maxWidth: '100%',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                },
                                            }}
                                        >
                                            {getAttachmentIcons(att.filetype)}
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{ color: 'primary.main', fontWeight: 500 }}
                                            >
                                                {att.filename}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                    </Box>


                    <AnimatePresence>
                        {viewingAttachment && (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="fixed inset-0 z-[999999] flex flex-col bg-white overflow-hidden shadow-[0_-2px_16px_rgba(0,0,0,0.1)]"
                            >
                                {/* Header */}
                                <div className="relative bg-blue-600 text-white px-4 py-3 flex items-center justify-center shadow-sm">
                                    <div className="flex items-center gap-2 truncate max-w-[80%]">
                                        {getAttachmentIcons(viewingAttachment.filetype)}
                                        <span className="text-sm font-medium truncate">
                                            {viewingAttachment.filename}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setViewingAttachment(null)}
                                        className="absolute right-4 text-2xl font-bold text-white"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Viewer Content */}
                                <div className="flex-1 bg-gray-50">
                                    {(viewingAttachment.filetype === 'pdf' ||
                                        viewingAttachment.filetype === 'excel') ? (
                                        <iframe
                                            src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingAttachment.url)}&embedded=true`}
                                            className="w-full h-full border-none"
                                            title="Document Viewer"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-white">
                                            <img
                                                src={viewingAttachment.url}
                                                alt={viewingAttachment.filename}
                                                className="max-h-full max-w-full object-contain rounded-md shadow-md"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>



                    {/* Close Button fixed at bottom */}
                    <Box sx={{ pt: 2, pb: 2 }}>
                        {/* <Button
                            fullWidth
                            onClick={onClose}
                            variant="contained"
                            sx={{
                                py: 1.5,
                                borderRadius: 24,
                                backgroundColor: '#1e88e5',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                                fontWeight: 600,
                                fontSize: 16,
                                textTransform: 'none',
                                boxShadow: 'none',
                                transition: 'background-color 0.3s ease',
                            }}
                            disableElevation
                        >
                            Close
                        </Button> */}
                        <div className="mt-4 space-y-2 sticky bottom-0 bg-white">
                            <button
                                onClick={onClose}
                                className="w-full bg-blue-500 text-white py-3 rounded-xl shadow-md hover:blue-500 transition text-base font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </Box>
                </>
            )}
        </Drawer>

    );
};

export default EmailDrawer;
