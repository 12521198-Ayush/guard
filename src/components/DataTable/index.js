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
    let Gdata = [];
    const [gridData, setGridData] = useState([]);
    const [newgridData, setnewGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [premiseId, setPremiseId] = useState("");
    const [form] = Form.useForm();
    const { data: session } = useSession();
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
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

            const responseData = response.data;
            if (responseData.error) {
                console.error("Error in response:", responseData.error);
                setGridData([]);
                setHasNextPage(false);
                return;
            }

            const array = responseData.data?.array;
            if (Array.isArray(array)) {
                setGridData(array);
                setHasNextPage(array.length === limit);
            } else {
                console.error("Unexpected data format:", array);
                setGridData([]);
                setHasNextPage(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
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
        if (!searchText) return;
        setLoading(true);
        setIsButtonDisabled(true);
        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL+'/user-service/admin/premise_unit/list',
                {
                    premise_id: (session?.user?.primary_premise_id),
                    id: searchText,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.data?.data?.array) {
                const dataObj = response.data?.data?.array;
                const dataArray = [dataObj];
                setGridData(dataArray);
            } else {
                setGridData([]);
                message.info('No matching records found.');
            }
        } catch (error) {
            console.error('Error searching for data:', error);
            message.error('No matching records found');
        } finally {
            setLoading(false);
        }
        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 2000);
    };

    const handleNext = () => {
        setCurrentPage((prevPage) => (hasNextPage ? prevPage + 1 : prevPage));
    };

    const handlePrevious = () => {
        setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

    const handleLimitChange = (value) => {
        setLimit(value);
        setCurrentPage(1);
    };

    const handleView = (record) => {
        return `/premise-unit-form?id=${record.id}`;
    };

    const findSubpremiseName = (premise_id) => {
        for (let i = 0; i < session.user.subpremiseArray.length; i++) {
            if (session.user.subpremiseArray[i].sub_premise_id === premise_id) {
                return session.user.subpremiseArray[i].subpremise_name;
            }
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",

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

                    <Button
                        className="ml-2"
                        style={{
                            background: 'linear-gradient(90deg, #4e92ff, #1e6fdd)', // Blue gradient background
                            color: 'white',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '16px', // Rounded button for a tag-like appearance
                            padding: '5px 12px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: 'pointer',
                        }}
                        type="default"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        View
                    </Button>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Space style={{ flexWrap: 'wrap' }}>
                        <Input
                            placeholder="Enter Unit id"
                            onChange={handleSearch}
                            type="text"
                            allowClear
                            value={searchText}
                            style={{ width: screens.xs ? '100%' : 'auto' }}
                        />
                        <SearchOutlined onClick={globalSearch} />
                    </Space>

                    <Link href="/manage-premise/add-flats">
                        <Button
                            style={{
                                background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Blue gradient background
                                color: 'white', // White text color
                                border: 'none', // No border
                                borderRadius: '4px', // Rounded corners
                                padding: '8px 16px', // Padding for a more substantial look
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                                cursor: 'pointer', // Pointer cursor on hover
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Transition for hover effects
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            Add New
                        </Button>
                    </Link>
                </div>

                <Form form={form} component={false}>
                    <Table
                        columns={columns}
                        dataSource={gridData.map(item => ({ ...item, key: item.id }))}
                        bordered
                        loading={loading}
                        pagination={false}
                        scroll={{ x: screens.xs ? 600 : undefined }}
                    />
                    {gridData.length > 1 && (
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                            <Space>
                                <Button onClick={handlePrevious} disabled={currentPage === 1}>
                                    Previous
                                </Button>
                                <Button onClick={handleNext} disabled={!hasNextPage}>
                                    Next
                                </Button>
                            </Space>
                            <Select defaultValue={10} onChange={handleLimitChange}>
                                <Option value={10}>10</Option>
                                <Option value={20}>20</Option>
                                <Option value={50}>50</Option>
                            </Select>
                        </div>
                    )}
                </Form>
            </div>
        </div>

    );
};

export default DataTable;
