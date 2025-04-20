// components/HelperDrawer.tsx
'use client'
import { Drawer, IconButton, Box, Divider, TextField, Button, Typography } from '@mui/material'
import { MdClose } from 'react-icons/md'
import { HelperProps } from './HelperCard'
import { FaStar, FaRegStar } from 'react-icons/fa';
import { motion } from 'framer-motion'
import { useState } from 'react';

type Props = {
    open: boolean
    onClose: () => void
    helper: HelperProps
}
const sectionStyle = {
    p: 2,
    mb: 3,
    borderRadius: 2,
    backgroundColor: '#f9f9f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
}
const MotionBox = motion(Box)

const HelperDrawer = ({ open, onClose, helper }: Props) => {
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const handleSubmit = () => {
        console.log('Rating:', rating);
        console.log('Feedback:', feedback);
        // Optionally send to API here
    };
    // @ts-ignore
    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    height: '85vh',
                    width: '100%',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {/* Close Button */}
            <Box sx={{ position: 'relative', p: 2 }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <MdClose size={24} />
                </IconButton>
                <Box sx={{ width: 40, height: 5, backgroundColor: 'gray', borderRadius: '4px', mx: 'auto', mb: 2 }} />
            </Box>

            {/* Profile Section */}

            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'gray',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 30,
                        fontWeight: 'bold',
                        margin: 'auto',
                        mb: 2,
                    }}
                >
                    {/* Profile Image or Initial */}
                    {helper.picture_url ? (
                        <img
                            // @ts-ignore
                            src={helper.picture_url}
                            alt="Profile"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%',
                            }}
                        />
                    ) : (
                        helper.name?.charAt(0) // Display initial if no profile picture is available
                    )}
                </Box>
                <Typography variant="h6">{helper.name}</Typography>
                <Typography variant="body2" color="textSecondary">{helper.skill}</Typography>
                <Typography variant="body2">{helper.mobile}</Typography>
                <Typography variant="body2">{helper.address}</Typography>
            </Box>

            <Divider />

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1 }}>

                {/* Section: Rating + Feedback */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Typography variant="subtitle1" gutterBottom textAlign="center">
                        Rate & Give Feedback
                    </Typography>

                    {/* Feedback Input */}
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Write your feedback here..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {/* Star Rating - Centered with outlined stars */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                        {[...Array(5)].map((_, i) =>
                            i < rating ? (
                                <FaStar
                                    key={i}
                                    onClick={() => setRating(i + 1)}
                                    style={{ cursor: 'pointer', fontSize: '1.8rem', color: '#facc15' }}
                                />
                            ) : (
                                <FaRegStar
                                    key={i}
                                    onClick={() => setRating(i + 1)}
                                    style={{ cursor: 'pointer', fontSize: '1.8rem', color: 'black' }}
                                />
                            )
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={rating === 0 && feedback.trim() === ''}
                    >
                        Submit
                    </Button>
                </MotionBox>
                {/* Section: Common Actions (Logs + Attendance) */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Typography variant="subtitle1" gutterBottom>Helper Activity</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button variant="text" color="primary">Tap to view work logs</Button>
                        <Button variant="text" color="primary">Check attendance records</Button>
                    </Box>
                </MotionBox>

                {/* Section: Work Location */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Typography variant="subtitle1" gutterBottom>Work Location</Typography>
                    <Typography variant="body2" color="text.secondary">Assigned to: D-0005</Typography>
                </MotionBox>

                {/* Section: Recommend Job */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Typography variant="subtitle1" gutterBottom>Recommend a New Job</Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter job recommendation"
                        sx={{ mb: 2 }}
                    />
                    <Button variant="contained" color="primary" fullWidth>
                        Recommend
                    </Button>
                </MotionBox>

                {/* Section: Notify Gate */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Typography variant="subtitle1" gutterBottom>Notify Gate about Gifts</Typography>
                    <Button variant="contained" color="secondary" fullWidth>
                        Notify Now
                    </Button>
                </MotionBox>

            </Box>
        </Drawer>
    )
}

export default HelperDrawer
