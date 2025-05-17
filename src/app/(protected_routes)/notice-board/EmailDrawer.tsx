'use client'

import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Button,
} from '@mui/material';

interface EmailDrawerProps {
    selectedEmail: any;
    onClose: () => void;
    handleAttachmentClick: (att: any) => void;
    getAttachmentIcon: (filetype: string) => React.ReactNode;
}

const EmailDrawer: React.FC<EmailDrawerProps> = ({ selectedEmail, onClose, handleAttachmentClick, getAttachmentIcon }) => {
    const [windowHeight, setWindowHeight] = useState(0);

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
    const dynamicHeight = Math.min(window.innerHeight * 0.9, baseHeight + charCount * 0.3);
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

                        {Array.isArray(selectedEmail.attachments) && selectedEmail.attachments.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                    Attachments
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={2}>
                                    {selectedEmail.attachments.map((att: any, index: number) => (
                                        <Button
                                            key={index}
                                            onClick={() => handleAttachmentClick(att)}
                                            variant="outlined"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                maxWidth: 160,
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {getAttachmentIcon(att.filetype)}
                                            <span>{att.filename}</span>
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Close Button fixed at bottom */}
                    <Box sx={{ pt: 2, pb: 2 }}>
                        <Button
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
                        </Button>
                    </Box>
                </>
            )}
        </Drawer>

    );
};

export default EmailDrawer;
