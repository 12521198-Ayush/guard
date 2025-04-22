'use client'
import React from 'react'
import {
    Drawer,
    Typography,
    Box,
    Divider,
    List,
    ListItemText,
    ListItemIcon,
    useTheme,
    Avatar, Grid
} from '@mui/material'
import {
    AccessTime as AccessTimeIcon,
    DirectionsRun as DirectionsRunIcon,
    DoneAll as DoneAllIcon,
    HourglassBottom as HourglassBottomIcon,
    NotInterested as NotInterestedIcon,
    PauseCircleOutline as PauseCircleOutlineIcon,
    DoorFront as DoorFrontIcon,
    Block as BlockIcon,
    PersonAdd as PersonAddIcon,
    LocalParking as LocalParkingIcon,
} from '@mui/icons-material'
import { orange, green, red, blue, purple } from '@mui/material/colors'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion, AnimatePresence } from 'framer-motion'
import WarningAmberIcon from '@mui/icons-material/WarningAmber' // Emergency
import LabelImportantIcon from '@mui/icons-material/LabelImportant' // Normal
import NewTicketForm from './NewTicketForm'
import { useSession } from 'next-auth/react';

dayjs.extend(relativeTime)

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const handleCloseOrCompleteTicket = async (
    ticket: any,
    session: any,
    onClose: () => void
) => {
    onClose();
    const latestStatus = normalizeStatus(ticket?.order_timeline?.slice(-1)[0]?.status || '');
    const isPending = latestStatus === 'order_initiate';
    const buttonText = isPending ? 'Close Ticket' : 'Mark as Done';

    const confirmed = await Swal.fire({
        title: `Are you sure you want to ${buttonText.toLowerCase()}?`,
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'cancel',
        confirmButtonText: 'Close Ticket',
        width: '350px',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
    });

    if (!confirmed.isConfirmed) return;

    let comment = '';

    if (isPending) {
        const { value: reason } = await Swal.fire({
            title: 'Reason for closing the ticket',
            input: 'text',
            inputLabel: 'Please provide a reason',
            inputPlaceholder: 'Enter reason here...',
            showCancelButton: true,
            width: '350px',
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to write something!';
                }
            }
        });

        if (!reason) return;
        comment = reason;
    }

    try {
        const res = await fetch('http://139.84.166.124:8060/order-service/update', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session?.user?.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: ticket.order_id,
                premise_id: 'c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af',
                sub_premise_id: '0aad0a20-6b21-11ef-b2cb-13f201b16993',
                premise_unit_id: 'D-0005',
                order_status: isPending ? 'cancelled_by_customer' : 'complete',
                ...(isPending && { comment_on_status_change: comment }),
            }),
        });

        if (!res.ok) throw new Error('Failed to update ticket status.');

        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Ticket has been updated.',
            width: '350px',
            confirmButtonColor: "#3085d6"
        });

        // Optionally refresh data or UI
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong while updating the ticket.',
            width: '350px',
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        });
    }
};



const priorityIconMap: Record<string, JSX.Element> = {
    emergency: <WarningAmberIcon sx={{ color: red[600] }} />,
    normal: <LabelImportantIcon sx={{ color: blue[500] }} />,
}

const priorityColorMap: Record<string, string> = {
    emergency: red[50],
    normal: blue[50],
}

const formattedPhone = (phone: string) => {
    return `+91-${phone.slice(3, 13)}`; // Format phone number
};

const statusIconMap: Record<string, JSX.Element> = {
    order_initiate: <AccessTimeIcon sx={{ color: blue[500] }} />,
    picked: <DirectionsRunIcon sx={{ color: orange[500] }} />,
    complete: <DoneAllIcon sx={{ color: green[600] }} />,
    pending: <HourglassBottomIcon sx={{ color: purple[500] }} />,
    customer_not_available: <NotInterestedIcon sx={{ color: red[400] }} />,
    temporarily_parked: <PauseCircleOutlineIcon sx={{ color: purple[300] }} />,
    door_locked: <DoorFrontIcon sx={{ color: red[300] }} />,
    cancelled_by_customer: <BlockIcon sx={{ color: red[500] }} />,
    assigned: <PersonAddIcon sx={{ color: blue[600] }} />,
    parked_by_service_provider: <LocalParkingIcon sx={{ color: orange[400] }} />,
}

const statusTextMap: Record<string, string> = {
    order_initiate: 'Order Raised',
    picked: 'Picked by Service Provider',
    complete: 'Order Complete',
    pending: 'Pending',
    customer_not_available: 'Customer Not Available',
    temporarily_parked: 'Temporarily Parked',
    door_locked: 'Door Locked',
    cancelled_by_customer: 'Cancelled by Customer',
    assigned: 'Assigned',
    parked_by_service_provider: 'Parked by Service Provider',
}

interface TicketBottomDrawerProps {
    open: boolean
    onClose: () => void
    skill: string | null
    tickets: any[]
}

const normalizeStatus = (status: string) =>
    status.toLowerCase().replace(/ /g, "_")

const TicketBottomDrawer: React.FC<TicketBottomDrawerProps> = ({ open, onClose, skill, tickets }) => {
    const theme = useTheme()
    const { data: session } = useSession();


    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            transitionDuration={200}
            PaperProps={{
                sx: {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    overflow: 'hidden',
                }
            }}
        >
            <Box
                height="auto"
                maxHeight="80vh"
                minHeight="auto"
                display="flex"
                flexDirection="column"
            >
                {/* Handle Bar */}
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%", height: 30 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: "#ccc",
                        }}
                    />
                </Box>

                {/* Content */}
                <Box p={3} overflow="auto" flexGrow={1}>
                    {/* <Typography variant="h6" gutterBottom>
                        Ticket #{tickets.order_id} - {skill}
                    </Typography> */}


                    {tickets.length === 0 ? (
                        <NewTicketForm skill={skill || ""} onClose={onClose} />
                    ) : (
                        tickets.map((ticket) => (
                            <motion.div
                                key={ticket._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ marginBottom: theme.spacing(4) }}
                            >
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1} // optional spacing below this row
                                >
                                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                                        Ticket #{ticket.order_id} - {ticket.servicetype}
                                    </Typography>

                                    {(() => {
                                        const latestStatus = normalizeStatus(ticket?.order_timeline?.slice(-1)[0]?.status || '');

                                        if (['complete', 'cancelled_by_customer'].includes(latestStatus)) return null;

                                        const isPending = latestStatus === 'order_initiate';
                                        const buttonText = isPending ? 'Close Ticket' : 'Mark as Done';
                                        const buttonColor = isPending
                                            ? 'linear-gradient(135deg, #f44336, #e53935)' // Red
                                            : 'linear-gradient(135deg, #4caf50, #43a047)' // Green

                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Box
                                                    component="button"
                                                    onClick={() => handleCloseOrCompleteTicket(ticket, session, onClose)}
                                                    sx={{
                                                        background: buttonColor,
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 30,
                                                        px: 3,
                                                        py: 0.7,
                                                        boxShadow: 2,
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            boxShadow: 4,
                                                            transform: 'translateY(-1px)',
                                                        },
                                                        transition: 'all 0.3s ease-in-out',
                                                    }}
                                                >
                                                    {buttonText}
                                                </Box>
                                            </motion.div>
                                        );
                                    })()}



                                </Box>

                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                    Description: {ticket.order_description}
                                </Typography>

                                <Grid
                                    container
                                    alignItems="center"
                                    justifyContent="space-between"
                                    spacing={2}
                                    sx={{ mb: 2 }}
                                >
                                    {/* Customer Info */}
                                    <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: '#3f51b5', mr: 2 }}>
                                            {ticket.customer_name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {ticket.customer_name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Ticket Raised by
                                            </Typography>
                                            <Typography variant="body2">
                                                {formattedPhone(ticket.customer_mobile)}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Priority Badge */}
                                    <Grid item>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                                px={2}
                                                py={1}
                                                borderRadius={2}
                                                sx={{
                                                    backgroundColor:
                                                        priorityColorMap[ticket.service_priority?.toLowerCase()] || blue[50],
                                                    display: 'inline-flex',
                                                }}
                                            >
                                                {priorityIconMap[ticket.service_priority?.toLowerCase()] || (
                                                    <LabelImportantIcon sx={{ color: blue[400] }} />
                                                )}
                                                <Typography fontWeight="bold" color="text.primary">
                                                    {ticket.service_priority}
                                                </Typography>
                                            </Box>
                                        </motion.div>
                                    </Grid>
                                </Grid>



                                <List dense sx={{ mt: 2 }}>
                                    <AnimatePresence>
                                        {ticket.order_timeline.map((entry: any, index: number) => {
                                            const normalized = normalizeStatus(entry.status)
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
                                                            backgroundColor: index === ticket.order_timeline.length - 1 ? "#e3f2fd" : "transparent",
                                                            borderRadius: 1,
                                                            mb: 1,
                                                            px: 1,
                                                            py: 0.1,
                                                            boxShadow: index === ticket.order_timeline.length - 1 ? 1 : 0,
                                                        }}
                                                    >
                                                        <ListItemIcon>
                                                            {statusIconMap[normalized] || <AccessTimeIcon />}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={statusTextMap[normalized] || entry.status}
                                                            secondary={
                                                                <>
                                                                    {dayjs(entry.time).format("DD MMM YYYY, hh:mm A")} (
                                                                    {dayjs(entry.time).fromNow()})
                                                                    <br />
                                                                    {entry.comment_on_status_change}
                                                                </>
                                                            }
                                                            primaryTypographyProps={{
                                                                fontWeight: index === ticket.order_timeline.length - 1 ? "bold" : "normal",
                                                            }}
                                                        />
                                                    </Box>
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </List>

                                <Divider sx={{ mt: 2 }} />
                            </motion.div>
                        ))
                    )}
                </Box>
            </Box>
        </Drawer>
    )
}

export default TicketBottomDrawer
