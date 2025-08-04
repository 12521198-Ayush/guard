import dayjs from 'dayjs';
import LockIcon from '@mui/icons-material/Lock'
import CancelIcon from '@mui/icons-material/Cancel'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';

import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)

type OrderStatusKey = keyof typeof statusTextMap

const statusTextMap = {
    order_initiate: 'Order Initiated',
    picked: 'Picked by Service Provider',
    temporarily_parked: 'Parked by Service Provider',
    cancelled_by_customer: 'Cancelled by Customer',
    pending: 'Request Pending',
    complete: 'Request Completed',
    complete_without_otp: 'Request Completed without OTP',
    customer_not_available: 'Customer Not Available',
    door_locked: 'Door Locked',
}


const getDisplayStatus = function(status: String) {
    if (status === 'order_initiate') return {shortMesg: "Raised", detailedMsg: "Request Raised", category: "INPROG"};
    if (status === 'picked') return {shortMesg: "Assigned", detailedMsg: "Picked by Service Provider", category: "INPROG"};
    if (status === 'temporarily_parked') return {shortMesg: "Parked", detailedMsg: "Parked by Service Provider", category: "PARKED"};
    if (status === 'cancelled_by_customer') return {shortMesg: "Cancelled", detailedMsg: "Cancelled By Customer", category: "CANCEL"};
    if (status === 'pending') return {shortMesg: "Pending", detailedMsg: "Request Pending", category: "ALERT"};
    if (status === 'complete') return {shortMesg: "Closed", detailedMsg: "Request Complete", category: "COMPLETE"};
    if (status === 'complete_without_otp') return {shortMesg: "Closed", detailedMsg: "Request Complete", category: "COMPLETE"};
    if (status === 'customer_not_available') return {shortMesg: "On Hold", detailedMsg: "Customer Not Available", category: "CUST_PEN"};
    if (status === 'door_locked') return {shortMesg: "On Hold", detailedMsg: "Door Locked", category: "CUST_PEN"};
    if (status === 'NA') return {shortMesg: "Default", detailedMsg: "Default", category: "DEFAULT"};
    return {shortMesg: "Unknown", detailedMsg: "Unknown Error! Please contact administrator", category: "ALERT"};
};

const getColor = (status: String) => {
    const disStatus = getDisplayStatus(status);
    switch (disStatus.category) {
        case 'DEFAULT':
            return '#3b82f6'; // Tailwind blue-500
        case 'INPROG':
            return '#22d3ee'; // Tailwind blue-500
        case 'COMPLETE':
            return '#a3e635'; // Tailwind green-500
        case 'CUST_PEN':
            return '#eab308'; // Tailwind yellow-500
        case 'PARKED':
            return '#3b82f6'; // Tailwind blue-500
        case 'CANCEL':
            return '#d1d5db'; // Tailwind gray-300
        case 'ALERT':
            return '#ef4444'; // Tailwind red-500   
        default:
            return '#ef4444'; // Tailwind red-500
    }
};


const getTicketStatus = function(status: String, ticket_id: String) {
    return (
        <div
            className={`px-2 py-1 text-xs font-semibold text-white rounded-full`}
            style={{ backgroundColor: getColor(status) }}
        >
            {ticket_id}
        </div>
    )
};

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

type TicketCardProps = {
    ticket: any;
    showStatus?: boolean;
    showIcon?: boolean;
    showVendor?: boolean;
    showParked?: boolean;
};


const TicketCard = ({
    ticket,
    showStatus = false,
    showIcon = false,
    showVendor = false,
    showParked = false,
}: TicketCardProps) => {

    const lastParkedComment = [...ticket.order_timeline]
    .reverse()
    .find(entry => entry.status === "temporarily_parked")
    ?.comment_on_status_change;
    
    return (
        <div 
            className="flex-1 bg-white rounded-xl shadow-md p-4 mb-1 border-l-4 "
            style={{ borderLeftColor: getColor(ticket.order_status) }}
        >
            {/* Top Section: Priority, Unit, Timestamp */}
            <div className="flex flex-wrap justify-between items-start mb-3">
                <div className="flex items-center space-x-2 w-full">
                    {/* Priority Badge */}
                    {getTicketStatus('NA', ticket.order_id)}

                    <div className="flex justify-between w-full items-start">
                        {/* Unit ID + Emergency Icon */}
                        <div className="flex justify-left w-full items-start">
                            <p className="text-base font-semibold text-gray-800 mb-0 leading-snug">
                                {ticket.premise_unit_id}
                            </p>

                            {ticket.service_priority === 'Emergency' && (
                                <>
                                    <PriorityHighOutlinedIcon fontSize="small" className="text-red"/>
                                </>
                            )}                        
                        </div>

                        {/* Timestamp */}
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                            {dayjs(ticket.order_creation_ts).format('DD MMM YYYY, hh:mm A')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Row: Icon + Description */}
            <div className="flex items-start space-x-3">
                {/* Status Icon */}
                {showIcon && (
                    <div className="w-10 h-10 min-w-10 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
                        {statusIconMap[ticket.order_status as keyof typeof statusIconMap]}
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex justify-between items-start w-full gap-2">
                        {/* Order Description */}
                        <div className="flex-1 min-w-0">
                            <p className="text-base text-gray-700 mb-0 leading-snug truncate">
                                {ticket.order_description}
                            </p>
                        </div>

                        {/* Service Type */}
                        <div className="shrink-0 bg-blue-100 text-blue-500 border border-blue-300 text-xs px-2 py-0.5 rounded-md whitespace-nowrap">
                            {ticket.servicetype}
                        </div>
                    </div>

                    {/* Status Label (if enabled) */}
                    {(showStatus && !showParked ) && (
                        <span className="inline-block text-xs text-gray-500 mb-1">
                            {statusTextMap[ticket.order_status as keyof typeof statusTextMap] ?? ticket.order_status}
                        </span>
                    )}

                    {showParked && (
                        <span className="inline-block text-xs text-gray-500 mb-1">
                            {showParked && lastParkedComment}
                        </span>
                    )}                    

                    {/* Vendor Info (if enabled) */}
                    {showVendor && (
                        <p className="text-xs text-gray-500">
                        Assigned To: {ticket.sp_name || '-'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TicketCard;
