import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { message, Form, Input, Button, Rate } from 'antd';
import { motion } from 'framer-motion';
import { Box, TextField, FormControl, InputLabel, MenuItem, Select, Rating } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import StarIcon from '@mui/icons-material/Star';


const labels: { [index: string]: string } = {
    0.5: 'Useless',
    1: 'Useless+',
    1.5: 'Poor',
    2: 'Poor+',
    2.5: 'Ok',
    3: 'Ok+',
    3.5: 'Good',
    4: 'Good+',
    4.5: 'Excellent',
    5: 'Excellent+',
};

function getLabelText(value: number) {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const getDisplayStatus = function(status: String) {
    if (status === 'order_initiate') return "Request Raised";
    if (status === 'picked') return "Assigned";
    if (status === 'temporarily_parked') return "Parked by Service Provider";
    if (status === 'cancelled_by_customer') return "Cancelled By Customer";
    if (status === 'pending') return "Pending";
    if (status === 'complete') return "Closed";
    if (status === 'complete_without_otp') return "Closed";
    if (status === 'customer_not_available') return "Customer Not Available";
    if (status === 'door_locked') return "Door Locked";
    return "Unknown";
};

const parkReasonList: any[] = [
    { value: 'Staff - Staff is busy in emergency work', displayValue: 'Staff - Staff is busy in emergency work' },
    { value: 'Staff - Concerned staff is not available', displayValue: 'Staff - Concerned staff is not available' },
    { value: 'Third Party - Delay due to expert opinion', displayValue: 'Third Party - Delay due to expert opinion' },
    { value: 'Third Party - Delay due to Business Partner End', displayValue: 'Third Party - Delay due to Business Partner End' },
    { value: 'Material - Pending due to material not available in the project', displayValue: 'Material - Pending due to material not available in the project' },
    { value: 'Material - Pending due to delay in supply of material by resident', displayValue: 'Material - Pending due to delay in supply of material by resident' },
    { value: 'Others - Work is done but under observation', displayValue: 'Others - Work is done but under observation' },
    { value: 'Others - Seepage work attended, waiting for dry', displayValue: 'Others - Seepage work attended, waiting for dry' },
    { value: 'Others - Discussion is pending with Station Head end', displayValue: 'Others - Discussion is pending with Station Head end' },
    { value: 'Others - Discussion is pending with resident about observation', displayValue: 'Others - Discussion is pending with resident about observation' }
];

type FormData = {
    changeReason: string;
    vendorReason: string;
    expectedDate: Dayjs | null;
    closureReason: string;
    closureOTP: string;
    customerRating: number;
    optionalComment: string;
};


const TicketStatusChange = ({ onClose, premiseId, ticketDetails, newStatus, session, refetchTickets }: any) => {

    const [hover, setHover] = React.useState(-1);
    const [form, setForm] = useState<FormData>({
        changeReason: '',
        vendorReason: '',
        expectedDate: null,
        closureReason: '',
        closureOTP: '',
        customerRating: 2.5,
        optionalComment: ''
    })

    const handleChange = (key: string, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        console.log(form);
        let comment = "";
        let compWithoutOtp = 0;
        let newTicketStatus = newStatus;
        let spName = ticketDetails.sp_name;
        let spMobile = ticketDetails.sp_mobile;
        let closureOtp = form.closureOTP;
        let closureComment = form.closureReason;
        let residentRating = form.customerRating;
        let residentFeedback = form.optionalComment;
        let expClosureDate = form.expectedDate && dayjs(form.expectedDate).format('DD-MM-YYYY');;
        let reasonComment = form.changeReason;
        let vendorStatusChangeReason = form.vendorReason;

        
        ////////////////////////////////////////////////////////////////////////////////////////////////
        // Service provider check
        ////////////////////////////////////////////////////////////////////////////////////////////////
        if (ticketDetails && !ticketDetails.sp_name) {
            message.error("Service provider not assigned to this ticket.");
            return;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////
        // Status change checks
        ////////////////////////////////////////////////////////////////////////////////////////////////
        if ( !(newTicketStatus == "temporarily_parked" || newTicketStatus == "complete_without_otp" || newTicketStatus == "complete") && !reasonComment) {
            message.error("Please enter reason for status change");
            return;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////
        // Park related checks
        ////////////////////////////////////////////////////////////////////////////////////////////////
        if ( newTicketStatus === "temporarily_parked" && !vendorStatusChangeReason) {
            message.error("Please enter reason for parking the request");
            return;
        }

        if ( newTicketStatus === "temporarily_parked" && !expClosureDate) {
            message.error("Please enter expected closure date");
            return;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////
        // Closure related checks
        ////////////////////////////////////////////////////////////////////////////////////////////////
        if(newTicketStatus === 'complete_without_otp'){
            compWithoutOtp = 1;
            closureOtp = '9876543210';
            newTicketStatus = 'complete';
        }

        if (newTicketStatus === 'complete' && !closureOtp) {
            message.error("Closure otp not entered");
            return;
        }

        if ( (newTicketStatus == "complete_without_otp" || newTicketStatus == "complete") && !closureComment) {
            message.error("Please enter reason for closure");
            return;
        }

        if (newTicketStatus === 'complete' && closureOtp) {
            if (ticketDetails.closure_otp === closureOtp || closureOtp == '9876543210') {
                if(closureOtp == '9876543210'){
                    compWithoutOtp = 1;
                }
            } else {
                message.error("Incorrect Otp provided");
                return;
            }
        }

        if (!residentRating && newTicketStatus === 'complete') {
            message.error("Resident rating not provided");
            return;
        }

        if (residentRating && newTicketStatus === 'complete' && !spName) {
            message.error("Please enter service provider name");
            return;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////

        if ( !(newTicketStatus == "temporarily_parked" || newTicketStatus == "complete_without_otp" || newTicketStatus == "complete") ) {
            comment = reasonComment;
        }

        if ( newTicketStatus === "temporarily_parked" ) {
            comment = vendorStatusChangeReason + ". Expected Closure Date: " + expClosureDate;
        }

        if ( newTicketStatus == "complete_without_otp" || newTicketStatus == "complete" ) {
            comment = closureComment;
        }
    
        let requestData: any = {
            premise_id: premiseId,
            order_id: ticketDetails.order_id,
            order_status: newTicketStatus,
            comment_on_status_change: comment,
            expected_closure_date: expClosureDate,
            complete_without_otp: compWithoutOtp,
            resident_rating: residentRating,
            resident_feedback: residentFeedback
        };

        if (newTicketStatus == "picked"){
            requestData['sp_name'] = spName;
            requestData['sp_mobile'] = spMobile;
        }

        console.log(requestData);
        if (true) {
            try {
                console.log("Status Update Details:", requestData);
                // var URL = ConfigURL.baseURL + 'service/society/status/update';
                const response = await fetch('http://139.84.166.124:8060/order-service/update', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await response.json();

                message.info('Status changed successfully.');

                refetchTickets();
                onClose();
            } catch (error) {
                message.error(`Failed to change status: ${error}`);
            }
        }
    };
    
    return (
        <>
        <Box p={2} overflow="auto" flexGrow={1} >
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md mx-auto px-2 py-0 space-y-4 bg-white rounded-2xl"
            >
                {/* Header */}
                <div className="text-center space-y-1">
                    <motion.h2
                        className="text-2xl font-semibold text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        Change Ticket Status
                    </motion.h2>
                    <motion.p
                        className="text-sm text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        to {getDisplayStatus(newStatus)}
                    </motion.p>                    
                </div> 

                {/* Reason other then complete and park */}
                { !(newStatus == "temporarily_parked" || newStatus == "complete_without_otp" || newStatus == "complete") && 
                    <Box>
                        <TextField
                            id="status_change_reason"
                            label="Change Reason"
                            placeholder="Enter reason for status change"
                            fullWidth
                            variant="outlined"
                            value={form.changeReason}
                            onChange={(e) => handleChange('changeReason', e.target.value)}
                        />
                    </Box>
                }

                {/* Reason when vendor parked */}
                { (newStatus == "temporarily_parked" ) && 
                <>
                    <FormControl fullWidth >
                        <InputLabel id="vendor_status_change_reason">Reason</InputLabel>
                        <Select fullWidth
                            labelId="vendor_status_change_reason"
                            value={form.vendorReason}
                            label="Priority"
                            onChange={(e) => handleChange('vendorReason', e.target.value)}
                        >
                        {parkReasonList.map((parkedReason) => (
                            <MenuItem key={parkedReason.displayValue} value={parkedReason.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                                {parkedReason.displayValue}
                            </Box>
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <FormControl fullWidth >
                            <DatePicker
                                label="Expected Closure Date"
                                format="DD/MM/YYYY"
                                value={form.expectedDate}
                                onChange={(newValue) =>
                                    setForm((prev) => ({ ...prev, expectedDate: newValue }))
                                }
                                //renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </FormControl>
                    </LocalizationProvider>
                </>
                }

                {/* Ticket closed */}
                { (newStatus == "complete_without_otp" || newStatus == "complete") &&  
                <>
                    <Box>
                        <TextField
                            id="closure_otp"
                            label="Closure OTP"
                            placeholder="Enter Closure OTP"
                            fullWidth
                            variant="outlined"
                            value={form.closureOTP}
                            onChange={(e) => handleChange('closureOTP', e.target.value)}
                        />
                    </Box>   
                    <Box>
                        <TextField
                            id="closure_reason"
                            label="Closure Reason"
                            placeholder="Enter reason for status change"
                            fullWidth
                            variant="outlined"
                            value={form.closureReason}
                            onChange={(e) => handleChange('closureReason', e.target.value)}
                        />
                    </Box>
                    <Box className="my-0 rounded-lg border grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-0">
                        <Box className="p-3 w-full rounded-t-md border-b-2 bg-[#112040] flex gap-2 items-left text-bodydark1 ">   
                            <p className="text-left text-title font-bold dark:text-white">
                                Resident Feedback Form
                            </p>
                        </Box>
                        <Box p={2} className="space-y-3">     
                            <motion.p>Please rate the resident behavior</motion.p>
                            <Box sx={{ width: 200, display: 'flex', alignItems: 'center' }}>
                                <Rating
                                    name="customer_rating"
                                    value={form.customerRating}
                                    precision={0.5}
                                    getLabelText={getLabelText}
                                    onChange={(event, newValue) => {
                                        handleChange('customerRating', newValue);
                                    }}
                                    onChangeActive={(event, newHover) => {
                                    setHover(newHover);
                                    }}
                                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                                {form.customerRating !== null && (
                                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : form.customerRating]}</Box>
                                )}
                            </Box>

                            <Box>
                                <TextField
                                    id="optional_comment"
                                    label="Comment"
                                    placeholder="Other Comments (optional)"
                                    fullWidth
                                    variant="outlined"
                                    value={form.optionalComment}
                                    onChange={(e) => handleChange('optionalComment', e.target.value)}
                                    />
                            </Box>   
                            <Box>
                                <TextField
                                    id="sp_name"
                                    fullWidth
                                    variant="outlined"                                        
                                    defaultValue={ticketDetails.sp_name || "" }
                                    disabled
                                />
                            </Box>
                        </Box>
                    </Box>                    
                </>
                }

                {/* Submit Button */}
                <div className="flex gap-3 mt-4">
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                    >
                        Update
                    </motion.button>
                    <motion.button
                        key="cancel"
                        onClick={onClose}
                        whileTap={{ scale: 0.97 }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-1/2 bg-gradient-to-r from-red to-red text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                    >
                        Cancel
                    </motion.button>  
                </div>              

            </motion.form>
        </Box>

        </>
    );
};

export default TicketStatusChange;
