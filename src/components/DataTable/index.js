import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button, Table, Form, Space, Input, message, Grid, Select } from 'antd';
import { SearchOutlined, UserAddOutlined, MailOutlined, WhatsAppOutlined, MessageOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";

const { useBreakpoint } = Grid;
const { Option } = Select;

const DataTable = () => {
    const router = useRouter();
    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortedInfo, setSortedInfo] = useState({});
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [premiseId, setPremiseId] = useState("");
    const [form] = Form.useForm();
    const { data: session } = useSession();
    const subpremise_arr = [session.user.subpremiseArray[0]];

    const screens = useBreakpoint();
    let accessToken = session?.user?.accessToken || undefined;
    useEffect(() => {
        if (session?.user?.primary_premise_id) {
            setPremiseId(session.user.primary_premise_id);
        }
    }, [session?.user?.primary_premise_id]);

    useEffect(() => {
        if (premiseId) {
            loadData(currentPage, limit);
        }
    }, [premiseId, currentPage, limit]);

    const loadData = async (page, limit) => {
        setLoading(true);
       
        try {
            const response = await axios.post(
                "http://139.84.166.124:8060/user-service/admin/premise_unit/list",
                {
                    premise_id: premiseId,
                    page: page,
                    limit: limit,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const { data } = response.data;
            setGridData(data);
            setHasNextPage(data.length === limit);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        
        if (e.target.value === "") {
            loadData(currentPage, limit);
        }
    };

    const globalSearch = async () => {
        console.log(searchText);
    };

    const handleNext = () => {
        if (hasNextPage) setCurrentPage(currentPage + 1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleLimitChange = (value) => {
        setLimit(value);
        setCurrentPage(1);
    };

    // const handleReset = () => {
    //     setSearchText("");
    //     loadData(currentPage, limit);
    // };

    const handleView = (record) => {
        return `/premise-unit-form?id=${record.id}`;
    };

    const findSubpremiseName = (premise_id) => {
        for (let i = 0; i < session.user.subpremiseArray.length; i++) {
            if (session.user.subpremiseArray[i].subpremise_id === premise_id) {
                return session.user.subpremiseArray[i].subpremise_name;
            }
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            responsive: ['md'],
        },
        {
            title: "Subpremise Name",
            dataIndex: "sub_premise_id",
            align: "center",
            render: (sub_premise_id) => findSubpremiseName(sub_premise_id),
        },
        {
            title: "Occupancy Status",
            dataIndex: "occupancy_status",
            align: "center",
        },
        {
            title: "Ownership Type",
            dataIndex: "ownership_type",
            align: "center",
        },
        {
            title: "2W/4W Parkings",
            dataIndex: "parking",
            align: "center",
            render: (_, record) => {
                const twParkingCount = record.tw_parking_count || 0;
                const fwParkingCount = record.fw_parking_count || 0;
                return <span>{`${twParkingCount}/${fwParkingCount}`}</span>;
            }
        },
        {
            title: "Notifications",
            dataIndex: "notifications",
            align: "center",
            render: (_, record) => (
                <span>
                    <MailOutlined
                        style={{
                            fontSize: '16px',
                            color: record.email_notification === "yes" ? '#1890ff' : '#bfbfbf',
                            marginRight: '8px'
                        }}
                    />
                    <WhatsAppOutlined
                        style={{
                            fontSize: '16px',
                            color: record.wa_notification === "yes" ? '#25D366' : '#bfbfbf',
                            marginRight: '8px'
                        }}
                    />
                    <MessageOutlined
                        style={{
                            fontSize: '16px',
                            color: record.sms_notification === "yes" ? '#faad14' : '#bfbfbf',
                            marginRight: '8px'
                        }}
                    />
                </span>
            ),
        },
        {
            title: "Action",
            dataIndex: "action",
            align: "center",
            render: (_, record) => (
                <Link href={handleView(record)}>
                    <Button>View</Button>
                </Link>
            ),
        },
    ];

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h4 className="font-medium text-xl text-black dark:text-white">
                    Manage Premise Unit
                </h4>
            </div>
            <div style={{ padding: screens.xs ? '10px' : '20px' }}>
                <ToastContainer />
                <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                    <Input
                        placeholder='Enter Unit id'
                        onChange={handleSearch}
                        type='text'
                        allowClear
                        value={searchText}
                        style={{ width: screens.xs ? '100%' : 'auto' }}
                    />
                    <Button onClick={globalSearch} icon={<SearchOutlined />} style={{ width: screens.xs ? '100%' : 'auto' }}>
                        Search
                    </Button>
                    <Link href="/flats-residents/add-flats" >
                        <Button icon={<UserAddOutlined />} style={{ width: screens.xs ? '100%' : 'auto' }}>
                            Add New
                        </Button>
                    </Link>
                </Space>
                <Form form={form} component={false}>
                    <Table
                        columns={columns}
                        dataSource={gridData.map(item => ({ ...item, key: item.id }))} // Adding key prop
                        bordered
                        loading={loading}
                        pagination={false}
                        scroll={{ x: screens.xs ? 600 : undefined }}
                    />
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                            <Button onClick={handlePrevious} disabled={currentPage === 1}>
                                Previous
                            </Button>
                            <Button onClick={handleNext} disabled={!hasNextPage}>
                                Next
                            </Button>
                        </Space>
                        <Select defaultValue={10} onChange={handleLimitChange} style={{ width: 120 }}>
                            <Option value={10}>10</Option>
                            <Option value={50}>50</Option>
                            <Option value={100}>100</Option>
                        </Select>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default DataTable;
