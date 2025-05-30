import { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
} from '@mui/material';
import { Star, StarHalf, StarBorder, Close } from '@mui/icons-material';
import axios from 'axios';

interface Feedback {
    _id: string;
    card_no: number;
    premise_id: string;
    premise_unit_id: string;
    qr_code: string;
    comment: string;
    rating: number;
}

interface FeedbackHistoryDrawerProps {
    open: boolean;
    onClose: () => void;
    cardNo: number;
    premiseId: string;
    qrCode: string;
}

export default function FeedbackHistoryDrawer({
    open,
    onClose,
    cardNo,
    premiseId,
    qrCode,
}: FeedbackHistoryDrawerProps) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.post(
                'http://139.84.166.124:8060/staff-service/feedback/read',
                {
                    card_no: cardNo,
                    premise_id: premiseId,
                    qr_code: qrCode,
                }
            );
            setFeedbacks(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch feedbacks', err);
            setFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    // Use useEffect to fetch data when 'open' changes to true
    useEffect(() => {
        if (open) {
            setLoading(true);
            fetchFeedbacks();
        }
    }, [open]);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        return (
            <>
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={i} sx={{ color: '#facc15' }} />
                ))}
                {halfStar && <StarHalf sx={{ color: '#facc15' }} />}
                {[...Array(5 - fullStars - (halfStar ? 1 : 0))].map((_, i) => (
                    <StarBorder key={i} sx={{ color: '#facc15' }} />
                ))}
            </>
        );
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    p: 2,
                    height: '60vh',
                    background: '#fff',
                },
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Feedback History</Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            {loading ? (
                <Box textAlign="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : feedbacks.length === 0 ? (
                <Typography textAlign="center" mt={4} color="text.secondary">
                    No feedback found.
                </Typography>
            ) : (
                <List>
                    {feedbacks.map((fb) => (
                        <Box key={fb._id} px={1} py={1}>
                            <ListItem alignItems="flex-start" disableGutters>
                                <Box display="flex" flexDirection="column" width="100%">
                                    {/* Rating Row */}
                                    <Box display="flex" alignItems="center" mb={0.5}>
                                        <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                                            <Box display="flex">{renderStars(fb.rating)}</Box>
                                        </ListItemIcon>
                                        
                                    </Box>

                                    {/* Comment */}
                                    <Typography variant="body1" fontSize={15} gutterBottom>
                                        {fb.comment}
                                    </Typography>

                                    {/* Unit Info */}
                                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                                        Unit: {fb.premise_unit_id}
                                    </Typography>
                                </Box>
                            </ListItem>
                            <Divider />
                        </Box>

                    ))}
                </List>
            )}
        </Drawer>
    );
}
