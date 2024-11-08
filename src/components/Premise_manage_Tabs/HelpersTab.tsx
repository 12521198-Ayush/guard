import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spin, Tag } from 'antd';
import { EditOutlined, TagsOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Swal from 'sweetalert2';
import HelperModal from '../Modal/HelperModal';
import { useSession } from 'next-auth/react';

interface Helper {
    _id: string;
    maid_name: string;
    maid_mobile: number;
    father_name: string;
    maid_address: string;
    profession: string;
    permanent_address: string;
    maid_qr_url: string;
    maid_picture_url: string;
}


const HelpersTab = ({ form,
    handleFinish, 
    editMode, 
    toggleEditModepremiseId,
    premiseId,
    subPremiseId,
    premiseUnitId }: any) => {
    const [helpersData, setHelpersData] = useState<Helper[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { data: session } = useSession();

    const handleOpenModal = (record: any | null) => {
        setIsModalVisible(true);
    };
    const handleClose = () => {
        setIsModalVisible(false);
    };
    useEffect(() => {
        const fetchHelpers = async () => {
            try {
                const response = await fetch(
                    'https://www.servizing.com/service/societies/fecb427b-18f9-b04e-b1ab-130811d898af/maids'
                );
                const result = await response.json();
                if (!result.error) {
                    setHelpersData(result.data);
                }
            } catch (error) {
                console.error('Error fetching helper data:', error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchHelpers();
    }, []);

    const unTag = async (card_no: any) => {
        console.log(card_no)
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you really want to remove the associated flat ${card_no.maid_name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'No, cancel',
        }).then(async (result) => {
            console.log(card_no)
        });
    }

    const columns: ColumnsType<any> = [
        {
            title: 'Helpers',
            key: 'helpers',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 300,
            render: (record: any) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <img
                        src={record.maid_picture_url}
                        alt="Maid"
                        style={{
                            width: '80px',
                            height: '80px',
                            marginRight: '16px',
                            borderRadius: '8px',
                            border: '2px solid #ddd',
                            objectFit: 'cover'
                        }}
                    />
                    <div style={{ color: '#333' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>Card No: {record.card_no}</p>
                        <p style={{ margin: '4px 0', color: '#555' }}>Name: {record.maid_name}</p>
                        <p style={{ margin: 0, color: '#555' }}>Mobile: {record.maid_mobile}</p>
                        <p style={{ margin: 0, color: '#555' }}>Profession: {record.profession}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Father Name',
            dataIndex: 'father_name',
            key: 'father_name',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Local Address',
            dataIndex: 'maid_address',
            key: 'maid_address',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Permanent Address',
            dataIndex: 'permanent_address',
            key: 'permanent_address',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Action',
            key: 'action',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
            render: (_: any, record: any) => (
                <>
                    <Button
                        className="ml-2"
                        style={{
                            background: 'linear-gradient(90deg, #ff4e50, #f9d423)', // Gradient background
                            color: 'white',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '16px', // Rounded button for a tag-like appearance
                            padding: '5px 12px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: 'pointer'
                        }}
                        type="default"
                        icon={<TagsOutlined style={{ marginRight: '4px' }} />} // Icon with a bit of margin
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                        onClick={() => unTag(record)}
                    >
                        UnTag
                    </Button>
                </>
            )
        },

    ];

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
                    onClick={() => handleOpenModal(null)}
                >
                    Tag new
                </Button>
                {isModalVisible && (
                    <HelperModal
                        open={isModalVisible}
                        onClose={handleClose}
                        premiseId={premiseId}
                        subPremiseId={subPremiseId}
                        premiseUnitId={premiseUnitId}
                    />
                )}
            </div>
            <br />

            <Form form={form} onFinish={handleFinish}>
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={helpersData}
                        scroll={{ x: 900 }}
                        rowKey="_id"
                        pagination={false}
                    />
                </Spin>
            </Form>
        </div>
    );
};

export default HelpersTab;
