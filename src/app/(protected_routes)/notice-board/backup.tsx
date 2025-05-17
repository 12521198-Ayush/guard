import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface EmailDrawerProps {
    selectedEmail: any;
    onClose: () => void;
    handleAttachmentClick: (att: any) => void;
    getAttachmentIcon: (filetype: string) => React.ReactNode;
}

const EmailDrawer: React.FC<EmailDrawerProps> = ({
    selectedEmail,
    onClose,
    handleAttachmentClick,
    getAttachmentIcon,
}) => {
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
                    pb: 4,
                    background: 'linear-gradient(to top, #ffffff, #f7faff)',
                    height: '85vh', // Set desired height
                    maxHeight: '100vh',
                    overflowY: 'auto',
                },
            }}
        >
            {selectedEmail && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box width={50} height={6} borderRadius={3} bgcolor="blue.200" />
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={600} color="#222">
                            {selectedEmail.subject}
                        </Typography>
                        <Typography variant="body2" color="#666" mb={2}>
                            {selectedEmail.from}
                        </Typography>

                        <div className="space-y-4 overflow-y-auto" style={{ height: '50vh' }}>
                            <Box
                                className="prose max-w-none"
                                sx={{ color: '#555', fontSize: 14 }}
                                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                            />
                        </div>

                        {/* Attachments */}
                        <div className="mt-4">
                            <h4 className="text-md font-medium mb-2">Attachments</h4>
                            <div className="flex flex-wrap gap-3">
                                {selectedEmail.attachments.map((att: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAttachmentClick(att)}
                                        className="flex items-center gap-2 bg-blue-50 p-2 px-3 rounded-xl shadow-sm hover:bg-blue-100"
                                    >
                                        {getAttachmentIcon(att.filetype)}
                                        <span className="text-sm text-[#444]">{att.filename}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Close Button */}
                        <Button
                            fullWidth
                            onClick={onClose}
                            variant="contained"
                            sx={{
                                mt: 4,
                                py: 1.5,
                                borderRadius: 4,
                                background: 'linear-gradient(to right, #4e92ff, #1e62d0)',
                                fontWeight: 500,
                                fontSize: 16,
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
};

export default EmailDrawer;
