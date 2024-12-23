import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spin, Breakpoint, Space, Select } from 'antd';
import Swal from 'sweetalert2';
import HelperModal from '../Modal/HelperModal';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const { Option } = Select;

interface Helper {
    sub_premise_id_array: string[];
    card_no: number;
    name: string;
    mobile: string;
    address: string;
    qr_code: string;
    skill: string;
    father_name: string;
    premise_unit_associated_with: { premise_unit_id: string }[];
    picture_url: string;
    created_on: string;
}

const HelpersTab = ({
    form,
    handleFinish,
    premiseId,
    subPremiseId,
    premiseUnitId,
}: any) => {
    const [helpersData, setHelpersData] = useState<Helper[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        if (premiseId) {
            fetchHelpers(currentPage, limit);
        }
    }, [premiseId, subPremiseId, premiseUnitId, currentPage, limit]);
    


    const fetchHelpers = async (page: number, limit: number) => {
        setLoading(true);

        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/staff-service/list',
                {
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
                    premise_unit_id: premiseUnitId,
                    page: page,
                    limit: limit,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );

            const { data } = response.data;

            setHasNextPage(data.length === limit);
            setHelpersData(data);
        } catch (error) {
            console.error('Error fetching helpers:', error);
            Swal.fire('Error', 'Failed to fetch helpers data.', 'error');
        } finally {
            setLoading(false);
        }
    };



    const unTag = async (record: any) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you really want to remove ${record.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'No, cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(
                        'http://139.84.166.124:8060/staff-service/untag/premise_unit',
                        {
                            premise_id: premiseId,
                            qr_code: record,
                            premise_unit_id: premiseUnitId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${session?.user?.accessToken}`,
                            },
                        }
                    );
                    Swal.fire({
                        title: 'Success',
                        text: `${record.name} has been untagged.`,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600'  // Custom blue color
                        }
                    });
                    fetchHelpers(currentPage, limit);
                } catch (error) {
                    console.error('Error untagging helper:', error);
                    Swal.fire('Error', 'Failed to untag the helper.', 'error');
                }
            }
        });
    };


    const columns = [
        {
            title: 'Helpers',
            key: 'helpers',
            responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            width: 300,
            render: (record: Helper) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={record.picture_url !== '-' ? record.picture_url : ''}
                        alt="Helper"
                        style={{
                            width: '80px',
                            height: '80px',
                            marginRight: '16px',
                            borderRadius: '8px',
                            border: '2px solid #ddd',
                        }}
                    />
                    <div>
                        <p>Card No: {record.card_no}</p>
                        <p>Name: {record.name}</p>
                        <p>Mobile: {record.mobile}</p>
                        <p>Profession: {record.skill}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Local Address',
            dataIndex: 'address',
            key: 'address',
            responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            width: 300,
        },

        {
            title: 'Action',
            key: 'action',
            responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            width: 100,
            render: (record: Helper) => (
                <Button
                    style={{
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #f44336, #e57373)', // Gradient from dark red to light red
                        color: 'white',
                        padding: '6px 16px',
                        border: 'none',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; // Slight scale on hover
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Shadow effect
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                    onClick={() => unTag(record.qr_code)}>UnTag</Button>
            ),
        },
    ];
    const handleNext = () => {
        if (hasNextPage) {
            setHelpersData([]); // Clear current data
            setCurrentPage((prevPage) => prevPage + 1); // Move to the next page
        }
    };
    const handlePrevious = () => {
        if (currentPage > 1) {
            setHelpersData([]); // Clear current data
            setCurrentPage((prevPage) => prevPage - 1); // Move to the previous page
        }
    };
        
    const handleLimitChange = (value: number) => {
        setLimit(value);
        setCurrentPage(1);
        fetchHelpers(1, value); // Fetch data for the first page with new limit
    };
    
    const [tagNewHelperModal, settagNewHelperModal] = useState(false);


    return (
        <div>
            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">My Helpers</h4>
                <Button
                    style={{
                        marginBottom: '8px',
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
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                    onClick={() => settagNewHelperModal(true)}>Tag New</Button>
            </div>
            <br />
            {tagNewHelperModal && (
                <HelperModal
                    visible={tagNewHelperModal}
                    onClose={() => settagNewHelperModal(false)}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    fetchHelpers={() => fetchHelpers(currentPage, limit)}
                />
            )}
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={helpersData}
                    rowKey={(record) => record.sub_premise_id_array[0]}
                    pagination={false}
                    scroll={{ x: 900 }}
                    className="w-full"
                />

            </Spin>
            {helpersData.length > 1 && (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                        <Button onClick={handlePrevious} disabled={currentPage === 1}>
                            Previous
                        </Button>
                        <Button onClick={handleNext} disabled={!hasNextPage}>
                            Next
                        </Button>
                    </Space>
                    <Select defaultValue={limit} onChange={handleLimitChange} value={limit}>
                        <Option value={10}>10</Option>
                        <Option value={20}>20</Option>
                        <Option value={50}>50</Option>
                    </Select>
                </div>

            )}
        </div>
    );
};

export default HelpersTab;
