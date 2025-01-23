import dayjs from 'dayjs';
import { Modal, Table, ConfigProvider } from 'antd';
import { pink } from '@mui/material/colors';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';

import NoAccountsOutlinedIcon from '@mui/icons-material/NoAccountsOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import NotInterestedOutlinedIcon from '@mui/icons-material/NotInterestedOutlined';
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined';

import relativeTime from 'dayjs/plugin/relativeTime';
import Header from '../Header';

dayjs.extend(relativeTime);


const getStatus = function(status: String) {
    if (status === 'order_initiate') return 'Order Raised';
    if (status === 'picked') return 'Picked by Service Provider';
    if (status === 'temporarily_parked') return 'Parked by Service Provider';
    if (status === 'cancelled_by_customer') return 'Cancelled by Customer';
    if (status === 'pending') return 'Order Pending';
    if (status === 'complete') return 'Order Complete';
    if (status === 'complete_without_otp') return 'Order Complete';
    if (status === 'customer_not_available') return 'Customer not available';
    if (status === 'door_locked') return 'Door Locked';
    return 'Unknown Error! Please contact administrator';
};

const getReactStatus = function(status: String) {
    if (status === 'order_initiate') return <AccessTimeIcon color="primary" fontSize="large" />;
    if (status === 'picked') return <CheckCircleOutlineIcon sx={{ color: pink[500] }} fontSize="large" />;
    if (status === 'complete') return <SentimentSatisfiedAltIcon color="success" fontSize="large" />;
    if (status === 'door_locked') return <NoAccountsOutlinedIcon color="secondary" fontSize="large" />;
    if (status === 'pending') return <SentimentDissatisfiedOutlinedIcon sx={{ color: pink[500] }} fontSize="large" />;
    if (status === 'temporarily_parked') return <PauseCircleOutlineIcon color="secondary" fontSize="large" />;
    if (status === 'customer_not_available') return <NoAccountsOutlinedIcon color="secondary" fontSize="large" />;
    if (status === 'complete_without_otp') return <SentimentSatisfiedAltIcon color="success" fontSize="large" />;
    if (status === 'cancelled_by_customer') return <NotInterestedOutlinedIcon color="disabled" fontSize="large" />;
    
    return <ErrorOutlineOutlinedIcon fontSize="large" />;
};

const getFormattedDate = function(date: dayjs.ConfigType) {
    
    let as_on_dt = 'N/A';
    let format_dt = 'N/A';

    try{
        if (date){
            as_on_dt = dayjs(date).fromNow();
            format_dt = dayjs(date).format('Do MMM YYYY, h:mm A');
        }
    }
    catch{
        as_on_dt = 'N/A';
        format_dt = 'N/A';
    }
    return {as_on_dt, format_dt};
};


const TicketTimeSeriesModal = ({ open, onClose, ticketDetails }: any) => {

    // Table structure
    const columns = [
        {
            title: "Timestamp",
            width: 180,
            align: "center" as const,
            render: (_:any, record: any) => {

                const eventDate = getFormattedDate(record.time);

                return (
                    <>
                        <div className="w-full flex flex-wrap justify-center text-sm capitalize">
                            {eventDate.as_on_dt}
                        </div>
                        <div className="w-full flex flex-wrap justify-center text-xs text-slate-500">
                            ({eventDate.format_dt})
                        </div>
                    </>
                )
            },
        },
        {
            title: "Status",
            width: 180,
            align: "center" as const,
            render: (_:any, record: any) => {
                return (
                    <div className="w-full flex-wrap justify-center">
                        <div> { getReactStatus(record.status) } </div>
                        <div className='text-xs' >{ getStatus(record.status) }</div>
                    </div>
                )
            }
        },
        {
            title: "Details",
            width: 200,
            align: "center" as const,
            render: (_:any, record: any) => {
                return (
                    <div className="w-full flex flex-wrap justify-center text-xs">
                        {record.comment_on_status_change ? record.comment_on_status_change : 'N/A'}
                    </div>
                )
            }
        },     
    ];    
    
    return (
        <ConfigProvider
            theme={{
                components: {
                Modal: {
                    wireframe: true,
                    headerBg: '#1a1633',
                    colorIcon: 'rgba(255, 255, 255, 0.88)',
                    titleColor: 'rgba(255, 255, 255, 0.88)',
                    colorIconHover: 'rgba(255, 255, 255, 0.57)',
                },
                Table: {
                    //borderColor: '#f0f0f0',
                    borderRadius: 8,
                    //headerColor: 'rgba(255, 255, 255, 0.68)',
                    headerBg: '#efedf7',
                    headerSplitColor: '#1a1633',
                    lineWidth: 1
                }
                }
            }}
        >
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={700}
                title={"Ticket Timeline"}  // className="text-[#faf7f7] font-bold"
            >
                <div className="flex flex-wrap justify-start ">      
                    <Table
                        columns={columns}
                        dataSource={ticketDetails.order_timeline}
                        rowKey={(record: any) => `${record.time}`}
                        pagination={false}
                        scroll={{ y: 80 * 5 }}
                        className="w-full p-0"
                        bordered
                    />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default TicketTimeSeriesModal;
