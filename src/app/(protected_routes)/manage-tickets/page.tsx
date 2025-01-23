'use client'
import axios from 'axios';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {Form, Table, Input, Button, Popover, Tooltip, Select, DatePicker, Pagination, PaginationProps, message } from 'antd';
import { createStyles } from 'antd-style';

import { blueGrey, orange, lightGreen } from '@mui/material/colors';
import SearchIcon from '@mui/icons-material/Search';
import AddIcCallIcon from '@mui/icons-material/AddIcCall';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import InfoIcon from '@mui/icons-material/Info';

import NewTicketModal from '@/components/Modal/NewTicketModal';
import TicketTimeSeriesModal from '@/components/Modal/TicketTimeSeriesModal';
import TicketStatusChangeModal from '@/components/Modal/TicketStatusChangeModal';
import AssignServiceProviderModal from '@/components/Modal/AssignServiceProviderModal';


interface Subpremise {
    sub_premise_id: string;
    subpremise_name: string;
}

interface UserSession {
    primary_premise_id: string;
    accessToken: string;
    subpremiseArray: Subpremise[];
}

interface Session {
    user: UserSession;
}

interface Pagination {
    recordsPerPage: number;
    currentPageNo: number;
    isCountRequired: boolean;
}

const ticketStatus: any[] = [
    { value: 'pending', displayValue: 'Pending' },
    { value: 'complete', displayValue: 'Complete' },
    { value: 'customer_not_available', displayValue: 'Customer Not Available' },
    { value: 'door_locked', displayValue: 'Door Locked' },
    { value: 'cancelled_by_customer', displayValue: 'Cancelled By Customer' },
    { value: 'picked', displayValue: 'Assigned' },
    { value: 'temporarily_parked', displayValue: 'Parked by Service Provider' }
];

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
    return {shortMesg: "Unknown", detailedMsg: "Unknown Error! Please contact administrator", category: "ALERT"};
};

const getFormattedDate = function(date: dayjs.ConfigType) {
    let from_dt = date;
    try{
        if (from_dt){
            from_dt = dayjs(from_dt).format('ddd, MMM Do YYYY, h:mm:ss A');
        }
        else{
            from_dt = undefined;
        }
    }
    catch{
        from_dt = undefined;
    }
    return from_dt;
};

const ManageTickets = () => {

    const { Option } = Select;
    const [form] = Form.useForm();
    const [skills, setSkills] = useState<string[]>([]);
    const [logsData, setLogsData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRecords, setTotalRecords] = useState(10);
    const defaultPaginationData: Pagination = {recordsPerPage: 2, currentPageNo:1, isCountRequired: true};
    const [paginationData, setPaginationData] = useState<Pagination>(defaultPaginationData);
    const { data: session } = useSession() as unknown as { data: Session };

    const premiseId = session?.user?.primary_premise_id;
    const subPremises = session?.user?.subpremiseArray || [];
    const [newStauts, setNewStauts] = useState<string>("");

    const [selectedTicketData, setSelectedTicketData] = useState(null);
    const [availableVendors, setavailableVendors] = useState<any[]>([]);

    const [isNewModalVisible, setIsNewModalVisible] = useState(false);
    const [isViewTSModalVisible, setIsViewTSModalVisible] = useState(false);
    const [isStatusChangeModalVisible, setIsStatusChangeModalVisible] = useState(false);
    const [isAssignVendorModalVisible, setIsAssignVendorModalVisible] = useState(false);

    // onChange event called when page number or size is changed
    const onChange: PaginationProps['onChange'] = (pageNumber, pageSize) => {
        console.log('Page No, Size: ', pageNumber, pageSize);
        setLogsData([]);
        if(paginationData.recordsPerPage != pageSize){
            console.log('Page Size change');
            setPaginationData({...paginationData, recordsPerPage:pageSize, currentPageNo:1, isCountRequired: false});    
        }
        else{
            console.log('Page No change');
            setPaginationData({...paginationData, recordsPerPage:pageSize, currentPageNo:pageNumber, isCountRequired: false});
        }
    };    

    // fetchLogs method to fetch data from server
    const fetchLogs = async () => {
        setLoading(true);

        // Service Type handling
        let service_type = form.getFieldValue("service_type") ? form.getFieldValue("service_type").trim() : "";
        if (service_type == "" ){
            service_type = undefined;
        }

        // Unit ID
        let unit_id = form.getFieldValue("unit_id") ? form.getFieldValue("unit_id").trim() : "";
        if (unit_id == "" ){
            unit_id = undefined;
        }
        else{
            console.log("Unit ID:", unit_id);
        }
        
        // Sub Premise Id
        let sub_premise_id = form.getFieldValue("sub_premise_id") ? form.getFieldValue("sub_premise_id").trim() : "";
        if (sub_premise_id == "" ){
            sub_premise_id = undefined;
        }

        // From Date handling
        let from_dt = form.getFieldValue("from_dt");
        try{
            if (from_dt){
                from_dt = dayjs(from_dt).format('DD_MM_YYYY');
            }
            else{
                from_dt = undefined;
            }
        }
        catch{
            from_dt = undefined;
        }

        // To Date handling
        let to_dt = form.getFieldValue("to_dt");
        try{
            if (to_dt){
                to_dt = dayjs(to_dt).format('DD_MM_YYYY');
            }
            else{
                to_dt = undefined;
            }
        }
        catch{
            to_dt = undefined;
        }

        let count_reqd = paginationData.isCountRequired ? 'Yes' : 'No';

        console.log("^^^^^^^^^^^^^^^^^^^^^^");
        console.log(service_type);
        console.log(unit_id);
        console.log(sub_premise_id);
        console.log(from_dt);
        console.log(to_dt);
        console.log('Current Page:', paginationData.currentPageNo);
        console.log('Page Size   :', paginationData.recordsPerPage);
        console.log('Is Count Req:', paginationData.isCountRequired, count_reqd);
        console.log("^^^^^^^^^^^^^^^^^^^^^^");

        /*
        const payload = {
            premise_id: premiseId,
            card_no: service_type,
            sub_premise_id: sub_premise_id,
            premise_unit_id: from_dt,
            page: paginationData.currentPageNo,
            limit: paginationData.recordsPerPage,
            bCountNeeded: count_reqd,
        }
        */

        const payload = {
            society_id: '1f1e86c9-a7c0-86cb-21bc-897a03d10644'
        }

        try {
            const response = await axios.post(
                //'http://139.84.166.124:8060/staff-service/list',
                'https://servizing.com/service/society/handyman/request/list',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );
            console.log(payload);
            const { data } = response.data;
            //console.log(data);
            setLogsData(data);
            setTotalRecords(data.length);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch helpers data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (premiseId) {
            console.log('Calling fetchLogs');
            fetchLogs();
        }
    }, [premiseId, paginationData]);    

    useEffect(() => {
        const fetchSkills = async () => {
            try {    
                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/skills',
                    {},
                    { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
                );
                const fetchedSkills = response.data?.data?.map((item: any) => item.skill) || [];
                setSkills(fetchedSkills);
            } 
            catch (error) {
                message.error('Failed to fetch skills.');
                console.error(error);
            }
        };

        if (session?.user.accessToken) {
            fetchSkills();
        }
    }, [session?.user.accessToken]);

    // Handle Search Data button click
    const searchData = () => {
        setLogsData([]);
        setPaginationData({...paginationData, currentPageNo:1, isCountRequired: true});
    }

    // Handle Add Ticket button click
    const addTicket = () => {
        if (isNewModalVisible == false) {
            setIsNewModalVisible(true);
        } else {
            setIsNewModalVisible(false);
        }
    }    

    // Handle Reset button click
    const resetInputs = () => {
        form.resetFields();
        setLogsData([]);
        setPaginationData({...paginationData, currentPageNo:1, isCountRequired: true});
    }

    // Handle Status Change Event
    const handleStatusChange = (status: string, selectedTicket: any) => {
        setNewStauts(status);

        if (status && status.trim() != ""){
            setSelectedTicketData(selectedTicket);
            setIsStatusChangeModalVisible(true);
        }        
    };

    // Handle Status Change Event
    const handlAssignVendor = async (selectedTicket: any) => {
        
        const payload = {
            society_id: '1f1e86c9-a7c0-86cb-21bc-897a03d10644',
            servicetype: selectedTicket.servicetype
        }

        try {
            const response = await axios.post(
                //'http://139.84.166.124:8060/staff-service/list',
                'https://servizing.com/service/society/handyman/available/list',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );
            console.log(payload);
            const { data } = response.data;
            //console.log(data);

            setavailableVendors(data);
            setSelectedTicketData(selectedTicket);
            setIsAssignVendorModalVisible(true); 
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch available service providers.', 'error');
        }
    };    

    // Table structure
    const columns = [
        {
            title: "S.No.",
            dataIndex: "s_no",
            width: 40,
            align: "center" as const,
            render: (_: any, record: any, index:number) => {
                return <span>
                    {((paginationData.currentPageNo-1)*paginationData.recordsPerPage) + (index + 1)}
                </span>;
            }
        },
        {
            title: "Ticket No",
            width: 60,
            align: "center" as const,
            render: (_:any, record: any) => {
                return (
                    <div className="w-12/12 md:w-12/12 flex flex-wrap gap-2 justify-center">
                        <span>{record.order_id ? record.order_id : '9999'}</span>
                    </div>
                )
            },
        },
        {
            title: "Current Status",
            width: 60,
            align: "center" as const,
            render: (_:any, record: any) => {
                const status = getDisplayStatus(record.order_status);
                return (
                    <div className="w-full flex flex-wrap justify-center">
                        <Popover placement='right' color='#546e7a'
                            content={
                                <>
                                    <div className='bg-[#546e7a] text-meta-2'>
                                        <p>{status.detailedMsg}</p>
                                    </div>
                                </>
                            }
                        >
                            <div className="w-full">
                            { (status.category == 'INPROG') && 
                            <Button disabled className="w-full text-xs disabled:bg-cyan-400 disabled:cursor-pointer disabled:text-white"> 
                                {status.shortMesg}
                            </Button> 
                            }
                            { (status.category == 'COMPLETE') && 
                            <Button disabled className="w-full text-xs disabled:bg-lime-400 disabled:cursor-pointer disabled:text-white"> 
                                {status.shortMesg}
                            </Button> 
                            }
                            { (status.category == 'CANCEL') && 
                            <Button disabled className="w-full text-xs disabled:bg-slate-400 disabled:cursor-pointer disabled:text-white"> 
                                {status.shortMesg}
                            </Button> 
                            }
                            { (status.category == 'CUST_PEN') && 
                            <Button disabled className="w-full text-xs disabled:bg-yellow-500 disabled:cursor-pointer disabled:text-white"> 
                                {status.shortMesg}
                            </Button> 
                            }
                            { (status.category == 'PARKED') &&
                            <Button disabled className="w-full text-xs disabled:bg-orange-400 disabled:cursor-pointer disabled:text-white"> 
                                {status.shortMesg}
                            </Button> 
                            }
                            { (status.category == 'ALERT') && 
                            <Button disabled className="w-full text-xs disabled:bg-red disabled:cursor-pointer disabled:text-white"> 
                                {status.shortMesg}
                            </Button> 
                            } 
                            </div>                         
                        </Popover>
                    </div>
                )
            }
        },
        {
            title: "Ticket Details",
            width: 100,
            align: "center" as const,
            render: (_:any, record: any) => (
                <div className="w-full flex flex-wrap justify-between items-center">
                    <div className="w-10/12 md:w-12/12 flex flex-wrap items-center">
                        <span>{record.servicetype}</span>
                    </div>
                    <div className="w-2/12 md:w-12/12 flex flex-wrap justify-end">
                        <Popover color='#546e7a'
                            content={
                                <>
                                        <div className="flex flex-wrap items-center justify-center">
                                            <div className="py-1 w-full text-center text-white">
                                                <p className="text-title font-bold">
                                                    Problem Details
                                                </p>
                                                <div className="py-5 w-full text-left text-xs ">
                                                    <p>
                                                        Problem: {record.order_description}
                                                    </p>
                                                    <p>Raised By: {record.customer_address}</p>
                                                    <p>Raised On: {getFormattedDate(record.order_creation_ts) }</p> 
                                                    <br/>
                                                    <p>  </p>
                                                    <p>Assigned To: {record.updated_by_name? record.updated_by_name: 'To be Assigned'} ({record.updated_by? record.updated_by: 'XXXXXXXXXX'})</p>
                                                </div>
                                            </div>
                                        </div>
                                </>
                            }
                        >
                            <Button className='rounded-none border-0' icon={<InfoIcon sx={{ color: blueGrey[500] }}/>} /> 
                        </Popover>
                    </div>
                </div>
            )
        },
        {
            title: "Change Status",
            width: 120,
            align: "center" as const,
            render: (_:any, record: any) => (
                <Select
                    placeholder="Ticket Status"
                    className="min-w-55 md:min-w-55"
                    allowClear
                    onChange={(value) => handleStatusChange(value, record)}
                >
                    {ticketStatus.map((skill) => (
                        <Option key={skill.displayValue} value={skill.value}>
                            {skill.displayValue}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: "center" as const,
            //responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            width: 55,
            render: (_: any, record: any) => (
                <div className="flex flex-wrap justify-center">
                    <Tooltip placement="topLeft" title="Assign Service Provider">
                        <Button 
                            className='rounded-none border-0' 
                            icon={<AssignmentIndIcon sx={{ color: lightGreen[600] }} />}
                            onClick={() => {
                                handlAssignVendor(record);
                            }}
                        />
                    </Tooltip>
                    <Tooltip placement="topLeft" title="View Ticket Timeline">
                        <Button 
                            className='rounded-none border-0' 
                            icon={<TimelapseIcon sx={{ color: orange[600] }} />}
                            onClick={() => {
                                setSelectedTicketData(record);
                                setIsViewTSModalVisible(true); 
                            }}
                        />
                    </Tooltip>

                    
                </div>
            ),
        },        
    ];

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            
            <div className="border-b border-stroke p-4 dark:border-strokedark "> {/** bg-[#1a1633] */}
                <h4 className="font-medium text-xl dark:text-white">  {/**  text-[#efedf7] */}
                    Manage Tickets
                </h4>
            </div>

            <Form form={form}>
                <div className="px-4 py-4 w-full flex flex-wrap justify-between">
                    <div className="w-9/12 md:w-12/12 flex flex-wrap gap-2 justify-start">

                        {/* Sub-Premise Select */}
                        <Form.Item name="sub_premise_id" className='p-0 m-0'>
                            <Select
                                placeholder="Sub Premise"
                                className="w-45 min-w-45 md:min-w-45"
                                allowClear
                            >
                                {subPremises.map((subPremise) => (
                                    <Option key={subPremise.sub_premise_id} value={subPremise.sub_premise_id}>
                                        {subPremise.subpremise_name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Unit Id Input */}
                        <Form.Item name="unit_id" className='p-0 m-0'>
                            <Input
                                placeholder="Unit ID"
                                className="w-45 min-w-45 md:min-w-45"
                                allowClear
                            />
                        </Form.Item>

                        {/* Service Type Select */}
                        <Form.Item name="service_type" className='p-0 m-0'>
                            <Select
                                placeholder="Service Type"
                                className="w-45 min-w-45 md:min-w-45"
                                allowClear
                            >
                                {skills.map((skill) => (
                                    <Option key={skill} value={skill}>
                                        {skill}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>   

                        {/* Ticket Status Select */}
                        <Form.Item name="ticket_status" className='p-0 m-0'>
                            <Select
                                placeholder="Ticket Status"
                                className="w-55 min-w-55 md:min-w-55 text-[44px] hover:text-base"
                                allowClear
                            >
                                {ticketStatus.map((skill) => (
                                    <Option key={skill.displayValue} value={skill.value}>
                                        {skill.displayValue}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>                        

                        {/* From Date Input */}
                        <Form.Item name="from_dt" className='p-0 m-0'>
                            <DatePicker
                                placeholder="From Date"
                                format="YYYY-MM-DD"
                                className="w-45 min-w-45 md:min-w-45"
                            />
                        </Form.Item>

                        {/* To Date Input */}
                        <Form.Item name="to_dt" className='p-0 m-0'>
                            <DatePicker
                                placeholder="To Date"
                                format="YYYY-MM-DD"
                                className="w-45 min-w-45 md:min-w-45"
                            />
                        </Form.Item>
                    </div>
                    <div className="w-3/12 flex flex-wrap gap-2 justify-end pl-0 ">
                        {/* Search Button */}
                        <Button
                            onClick={searchData}
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '3px',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                minWidth: '40px'
                                
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <SearchIcon />
                        </Button>

                        {/* Reset Button */}
                        <Button
                            onClick={resetInputs}
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '3px',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                minWidth: '40px'
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <RestartAltIcon />
                        </Button>

                        {/* Download Button */}
                        <Button
                            onClick={searchData}
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '3px',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                minWidth: '40px'
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <FileDownloadIcon />
                        </Button>

                        {/* Add Button */}
                        <Button
                            onClick={addTicket}
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '3px',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                minWidth: '40px'
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                            }}
                        > 
                            <AddIcCallIcon />  
                        </Button>
                    </div>

                    { isNewModalVisible && 
                        <NewTicketModal
                            open={isNewModalVisible}
                            onClose={() => setIsNewModalVisible(false)}
                            premiseId={premiseId}
                            sericeTypes={skills}
                            refetchLogs={resetInputs}
                        />
                    }

                    { isStatusChangeModalVisible && 
                        <TicketStatusChangeModal
                            open={isStatusChangeModalVisible}
                            onClose={() => 
                                {
                                    setIsStatusChangeModalVisible(false);
                                    setSelectedTicketData(null);
                                }
                            }
                            premiseId={premiseId}
                            ticketDetails={selectedTicketData}
                            newStatus={newStauts}
                            refetchLogs={resetInputs}
                        />
                    }

                    { isAssignVendorModalVisible && 
                        <AssignServiceProviderModal
                            open={isAssignVendorModalVisible}
                            onClose={() => 
                                {
                                    setIsAssignVendorModalVisible(false);
                                    setSelectedTicketData(null);
                                    setavailableVendors([]);
                                }
                            }
                            premiseId={premiseId}
                            ticketDetails={selectedTicketData}
                            serviceProviders={availableVendors}
                            refetchLogs={resetInputs}
                        />
                    }

                    { isViewTSModalVisible && 
                        <TicketTimeSeriesModal
                            open={isViewTSModalVisible}
                            onClose={() => 
                                {
                                    setIsViewTSModalVisible(false);
                                }
                            }
                            ticketDetails={selectedTicketData}
                        />
                    }

                </div>
            </Form>

            <div className='px-4'>
                <Table
                    columns={columns}
                    dataSource={logsData}
                    rowKey={(record) => `${record._id}`}
                    pagination={false}
                    //scroll={{ x: 900 }}
                    scroll={{ x: 900, y: 65 * 5 }}    
                    //className={styles.customTable}
                    //className="w-full p-0"
                    bordered
                    loading={loading}
                />
                
                {logsData.length > 0 && (
                    <div className="w-12/12 flex flex-wrap justify-end my-5 " >
                        <Pagination 
                        //defaultCurrent={paginationData.currentPageNo}
                        defaultPageSize={paginationData.recordsPerPage} 
                        current={paginationData.currentPageNo} 
                        onChange={onChange} 
                        //onShowSizeChange={onShowSizeChange}
                        total={totalRecords} 
                        showSizeChanger
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                        pageSizeOptions = {[2, 5, 10, 15, 20, 25]}
                        />
                    </div>
                )}                
            </div>
        </div>

    );
};

export default ManageTickets;
