'use client'
import axios from 'axios';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {Form, Table, Input, Button, Space, Select, DatePicker, Pagination, PaginationProps, message } from 'antd';
import { createStyles } from 'antd-style';

/*
const useStyle = createStyles(({ css, token }) => {
    const { antCls } = token;
    return {
      customTable: css`
        ${antCls}-table {
          ${antCls}-table-container {
            ${antCls}-table-body,
            ${antCls}-table-content {
              scrollbar-width: thin;
              scrollbar-color: #eaeaea transparent;
              scrollbar-gutter: stable;
            }
          }
        }
      `,
    };
});
*/

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


const ServiceProviderLogs = () => {

    //const { styles } = useStyle();
    const { Option } = Select;
    const [form] = Form.useForm();
    const [skills, setSkills] = useState<string[]>([]);
    const [logsData, setLogsData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRecords, setTotalRecords] = useState(10);
    const defaultPaginationData: Pagination = {recordsPerPage: 10, currentPageNo:1, isCountRequired: true};
    const [paginationData, setPaginationData] = useState<Pagination>(defaultPaginationData);
    const { data: session } = useSession() as unknown as { data: Session };

    const premiseId = session?.user?.primary_premise_id;
    const subPremises = session?.user?.subpremiseArray || [];    


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

        // Service Provider Name
        let sp_name = form.getFieldValue("sp_name") ? form.getFieldValue("sp_name").trim() : "";
        if (sp_name == "" ){
            sp_name = undefined;
        }
        else{
            console.log("Service Provider Name:", sp_name);
        }

        // Card Number
        let card_number = form.getFieldValue("card_number") ? form.getFieldValue("card_number").trim() : "";
        if (card_number == "" ){
            card_number = undefined;
        }
        else{
            console.log("Card Number:", card_number);
        }
        
        // Service Type
        let service_type = form.getFieldValue("service_type") ? form.getFieldValue("service_type").trim() : "";
        if (service_type == "" ){
            service_type = undefined;
        }
        else{
            console.log("Service Type:", service_type);
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

        let count_reqd = paginationData.isCountRequired ? 'yes' : 'no';

        console.log("^^^^^^^^^^^^^^^^^^^^^^");
        console.log(sp_name);
        console.log(card_number);
        console.log(service_type);
        console.log(from_dt);
        console.log(to_dt);
        console.log('Current Page:', paginationData.currentPageNo);
        console.log('Page Size   :', paginationData.recordsPerPage);
        console.log('Is Count Req:', paginationData.isCountRequired);
        console.log('Is Count Req:', paginationData.isCountRequired, count_reqd);
        console.log("^^^^^^^^^^^^^^^^^^^^^^");

        const payload = {
            premise_id: premiseId,
            //sub_premise_id: '', // optional
            skill: service_type, //optional
            ///card_no: card_number, ??
            name: sp_name,
            page: paginationData.currentPageNo,
            limit: paginationData.recordsPerPage,
            from_date_dd_mm_yyyy: from_dt, // optional
            to_date_dd_mm_yyyy: to_dt, // optional
            bCountNeeded: count_reqd
        }

        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/staff-service/logs/read',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );
            console.log(payload);
            const { data } = response.data;
            setLogsData(data.array);
            if(paginationData.isCountRequired){
                setTotalRecords(data?.count || 0);
            }
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

    const searchData = () => {
        setLogsData([]);
        setPaginationData({...paginationData, currentPageNo:1, isCountRequired: true});
    }

    const resetInputs = () => {
        form.resetFields();
        setLogsData([]);
        setPaginationData({...paginationData, currentPageNo:1, isCountRequired: true});
    }

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            width: 120,
            align: "center" as const,
        },
        {
            title: "Card No",
            dataIndex: "card_no",
            width: 80,
            align: "center" as const,
        },
        {
            title: "Type",
            dataIndex: "skill",
            width: 80,
            align: "center" as const,
        },
        {
            title: "Scan Location",
            dataIndex: "scan_location",
            width: 80,
            align: "center" as const,
        },
        {
            title: "Entry/Exit",
            dataIndex: "scan_type",
            width: 80,
            align: "center" as const,
        },
        {
            title: "Date Time",
            dataIndex: "date",
            width: 120,
            align: "center" as const,
            render: (_: any, record: any, index:number) => {
                let from_dt = dayjs(record.date).format('Do MMM YYYY, h:mm A');
                return <span>
                    {from_dt}
                </span>;
            }
        },
        {
            title: "Mode",
            width: 80,
            dataIndex: "mode",
            align: "center" as const,
        },
    ];

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            
            <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h4 className="font-medium text-xl text-black dark:text-white">
                    Service Provider Logs
                </h4>
            </div>

            <Form form={form}>
                <div className="px-4 py-4 w-full flex flex-wrap justify-between">
                    <div className="w-8/12 md:w-12/12 flex flex-wrap gap-3 justify-start">
                        {/* Name Input */}
                        <Form.Item name="sp_name" className='p-0 m-0'>
                            <Input
                                placeholder="Name"
                                className="w-30 min-w-30 md:min-w-30"
                                allowClear
                            />
                        </Form.Item>
                        
                        {/* Card No Input */}
                        <Form.Item name="card_number" className='p-0 m-0'>
                            <Input
                                placeholder="Card No"
                                className="w-30 min-w-30 md:min-w-30"
                                allowClear
                            />
                        </Form.Item>                        

                        {/* Service Type Select */}
                        <Form.Item name="service_type" className='p-0 m-0'>
                            <Select
                                placeholder="Service Type"
                                className="w-35 min-w-35 md:min-w-35"
                                allowClear
                            >
                                {skills.map((skill) => (
                                    <Option key={skill} value={skill}>
                                        {skill}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        
                        {/* From Date Input */}
                        <Form.Item name="from_dt" className='p-0 m-0'>
                            <DatePicker
                                placeholder="From Date"
                                format="YYYY-MM-DD"
                                className="w-5 min-w-35 md:min-w-35"
                            />
                        </Form.Item>

                        {/* To Date Input */}
                        <Form.Item name="to_dt" className='p-0 m-0'>
                            <DatePicker
                                placeholder="To Date"
                                format="YYYY-MM-DD"
                                className="w-5 min-w-35 md:min-w-35"
                            />
                        </Form.Item>
                    </div>

                    <div className="w-4/12 flex flex-wrap gap-3 justify-end pl-6">
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
                                minWidth: '100px'
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
                            Search
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
                                minWidth: '100px'
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
                            Reset
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
                                minWidth: '100px'
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
                            Download
                        </Button>
                    </div>
                </div>
            </Form>

            <div className='px-4'>
                <Table
                    columns={columns}
                    dataSource={logsData}
                    rowKey={(record, index) => `${index}`}
                    pagination={false}
                    scroll={{ x: 900, y: 80 * 5 }}    
                    //className={styles.customTable}
                    //className="w-full p-0"
                    bordered
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
                        pageSizeOptions = {[10, 25, 50]}
                        />
                    </div>
                )}
            </div>
        </div>

    );
};

export default ServiceProviderLogs;
