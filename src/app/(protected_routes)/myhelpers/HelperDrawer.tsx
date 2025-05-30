// components/HelperDrawer.tsx
'use client'
import { Drawer, IconButton, Box, Divider, TextField, Button, Typography } from '@mui/material'
import { MdClose } from 'react-icons/md'
import { HelperProps } from './HelperCard'
import { FaStar, FaRegStar } from 'react-icons/fa';
import { motion } from 'framer-motion'
import { useState } from 'react';
import AttendanceDrawer from './AttendanceModal';
import NotifyGiftSection from './NotifyGifts';
import { useSession } from 'next-auth/react';
import AttendanceSummary from './AttendanceSummary';
import axios from 'axios';
import { message } from 'antd';
import FeedbackHistoryDrawer from './FeedbackHistoryDrawer';

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
    const [modalOpen, setModalOpen] = useState(false);
    const [SummarymodalOpen, setSummaryModalOpen] = useState(false);
    const { data: session } = useSession();
    const [feedbackError, setFeedbackError] = useState(false);
    const [ratingError, setRatingError] = useState(false);
    const [FeedbackModal, setFeedbackModalOpen] = useState(false);

    const handleSubmit = async () => {
        const isFeedbackValid = feedback.trim().length > 0;
        const isRatingValid = rating > 0;

        setFeedbackError(!isFeedbackValid);
        setRatingError(!isRatingValid);

        if (isFeedbackValid && isRatingValid) {
            console.log('Submitting:', { feedback, rating });
            try {
                const res = await axios.post(
                    "http://139.84.166.124:8060/staff-service/feedback/write",
                    {
                        card_no: helper.card_no,
                        premise_id: session?.user?.primary_premise_id,
                        qr_code: helper.qr_code,
                        premise_unit_id: session?.user?.premise_unit_id,
                        rating,
                        comment: feedback
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                        }
                    }
                );
                setRating(0);
                setFeedback("");
                message.success('Feedback Subbmitted successfully!');
                console.log('Response:', res.data);
                return res.data;
            }
            catch (error) {
                message.info('Cannot submit Feedback');
                console.error('Error fetching data:', error);
                throw error;
            }
        }
        // console.log('Rating:', rating);
        // console.log('Feedback:', feedback);
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


                {/* Section: Common Actions (Logs + Attendance) */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Typography variant="subtitle1" gutterBottom>Helper Activity</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button variant="text" color="primary" onClick={() => setSummaryModalOpen(true)}>Tap to view work logs</Button>
                        <AttendanceSummary card_no={helper.card_no} open={SummarymodalOpen} onClose={() => setSummaryModalOpen(false)} />

                        <Button
                            variant="outlined"
                            color="success"
                            fullWidth
                            onClick={() => setModalOpen(true)}
                            sx={{ borderRadius: 2, py: 1.3, textTransform: 'none' }}
                        >
                            View Attendance
                        </Button>
                       
                        <AttendanceDrawer card_no={helper.card_no} open={modalOpen} onClose={() => setModalOpen(false)} />
                    </Box>
                </MotionBox>

                {/* Section: Work Location */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>Work Location</Typography>
                        <Typography variant="body2" color="text.secondary">Assigned to: {session?.user?.premise_unit_id}</Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            sx={{ borderRadius: 2, py: 1.3, textTransform: 'none' }}
                            onClick={() => setFeedbackModalOpen(true)}
                        >
                            Feedback History
                        </Button>

                       

                        <FeedbackHistoryDrawer
                            open={FeedbackModal}
                            onClose={() => setFeedbackModalOpen(false)}
                            cardNo={helper.card_no ?? 0}
                            premiseId={session?.user?.primary_premise_id || ""}
                            qrCode={helper.qr_code || ""}
                        />
                    </Box>
                </MotionBox>

                {/* Section: Recommend Job */}
                {/* <MotionBox
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
                </MotionBox> */}

                {/* Section: Notify Gate */}
                <MotionBox
                    sx={sectionStyle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <NotifyGiftSection
                        premise_id={session?.user?.primary_premise_id || ""}
                        premise_unit_id={session?.user?.premise_unit_id || "D-0005"}
                        card_no={helper.card_no ?? 0}
                        qr_code={helper.qr_code || ""}
                    />
                    {/* <Typography variant="subtitle1" gutterBottom>Notify Gate about Gifts</Typography> */}

                    {/* <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                    >
                        Notify Now
                    </Button> */}

                </MotionBox>

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
                        error={feedbackError}
                        helperText={feedbackError ? 'Feedback is required' : ''}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
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

                    {ratingError && (
                        <Typography variant="caption" color="error" display="block" textAlign="center" sx={{ mb: 2 }}>
                            Please provide a rating
                        </Typography>
                    )}

                    <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={rating === 0 && feedback.trim() === ''}
                        sx={{
                            borderRadius: 2,
                            py: 1.3,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Submit
                    </Button>
                    
                </MotionBox>

            </Box>
        </Drawer>
    )
}

export default HelperDrawer
