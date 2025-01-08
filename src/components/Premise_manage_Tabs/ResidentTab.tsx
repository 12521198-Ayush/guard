import { Button, Table, Form } from 'antd';
import { EditOutlined, DeleteOutlined, PhoneOutlined, RobotOutlined, ToolOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { MailOutlined, WhatsAppOutlined, MessageOutlined, UserOutlined, CarOutlined } from '@ant-design/icons';
import ResidentModal from '../Modal/ResidentModal';
import NewResidentModal from '../Modal/NewResidentModal';
import type { ColumnType } from 'antd/es/table';

const ResidentTab = ({
    form,
    handlePrev,
    handleNext,
    premiseId,
    subPremiseId,
    premiseUnitId,
    editMode,
}: any) => {
    const [residentData, setResidentData] = useState([]);
    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken || undefined;

    const fetchResidentData = async () => {
        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/admin/residents/fetch',
                {
                    premise_unit_id: premiseUnitId,
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const filteredData = response.data.data.filter((resident: any) => resident.is_active === 'yes');
            setResidentData(filteredData || []);
        } catch (error) {
            console.error('Error fetching resident data:', error);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchResidentData();
        }
    }, [premiseId, subPremiseId, premiseUnitId]);

    const handleDelete = (record: any) => {

        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete resident ${record.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                console.log(record.mobile);
                axios
                    .post(
                        'http://139.84.166.124:8060/user-service/admin/resident/delete',
                        {
                            premise_id: premiseId,
                            sub_premise_id: subPremiseId,
                            premise_unit_id: premiseUnitId,
                            mobile: record.mobile,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    )
                    .then(() => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: `Resident ${record.name} has been deleted.`,
                            icon: 'success',
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK',
                        });
                        fetchResidentData();
                    })
                    .catch((error) => {
                        console.error('Error deleting resident:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Failed to remove vehicle. Please try again.',
                            icon: 'error',
                            confirmButtonColor: '#3085d6', // Custom color for the 'OK' button
                            confirmButtonText: 'OK', // Custom text for the button
                        });
                    });
            }
        });
    };
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedResidentData, setSelectedResidentData] = useState(null);


    const handleEdit = (resident: any) => {
        setSelectedResidentData(resident);
        setIsModalVisible(true);
    };

    const Residentcolumns: ColumnType<any>[] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
            render: (text) => {
                const formattedMobile = text ? text.replace(/^0+/, '') : '';
                return formattedMobile;
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Type',
            dataIndex: 'association_type',
            key: 'association_type',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Notification',
            key: 'notification',
            responsive: ['xs', 'sm', 'md', 'lg'],
            render: (record: any) => (
                <span>
                    <MailOutlined
                        style={{
                            fontSize: '16px',
                            color: record.email_notification === 'yes' ? '#1890ff' : '#bfbfbf',
                            marginRight: '8px',
                        }}
                    />
                    <WhatsAppOutlined
                        style={{
                            fontSize: '16px',
                            color: record.wa_notification === 'yes' ? '#25D366' : '#bfbfbf',
                            marginRight: '8px',
                        }}
                    />
                    <MessageOutlined
                        style={{
                            fontSize: '16px',
                            color: record.sms_notification === 'yes' ? '#faad14' : '#bfbfbf',
                            marginRight: '8px',
                        }}
                    />
                    <UserOutlined
                        style={{
                            fontSize: '16px',
                            color: record.maid_notification === 'yes' ? '#722ed1' : '#bfbfbf',
                            marginRight: '8px',
                        }}
                    />
                    <CarOutlined
                        style={{
                            fontSize: '16px',
                            color: record.vehicle_notification === 'yes' ? '#52c41a' : '#bfbfbf',
                        }}
                    />
                </span>
            ),
            width: 550,
        },
        {
            title: 'VMS',
            key: 'vms',
            responsive: ['xs', 'sm', 'md', 'lg'],
            render: (record: any) => (
                <span>
                    <PhoneOutlined
                        style={{
                            fontSize: '16px',
                            color: record.vms_voip === 'yes' ? '#1890ff' : '#bfbfbf',
                            marginRight: '8px',
                        }}
                    />
                    <RobotOutlined
                        style={{
                            fontSize: '16px',
                            color: record.vms_ivrs === 'yes' ? '#722ed1' : '#bfbfbf',
                            marginRight: '8px',
                        }}
                    />
                    <ToolOutlined
                        style={{
                            fontSize: '16px',
                            color: record.vms_manual === 'yes' ? '#faad14' : '#bfbfbf',
                        }}
                    />
                </span>
            ),
            width: 500,
        },
        {
            title: 'Action',
            key: 'action',
            responsive: ['xs', 'sm', 'md', 'lg'],
            render: (record: any) => (
                <>
                    <Button onClick={() => handleEdit(record)} icon={<EditOutlined />} />

                    <Button
                        className="ml-2"
                        style={{
                            backgroundColor: 'red',
                            color: 'white',
                        }}
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </>
            ),
            width: 450,
        },
    ];


    const [isNewModalVisible, setIsNewModalVisible] = useState(false);
    const handlenew = () => {
        if (isNewModalVisible == false) {
            setIsNewModalVisible(true);
        } else {
            setIsNewModalVisible(false);
        }
    }


    return (
        <>
            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">Existing Residents</h4>
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
                    onClick={() => handlenew()}
                >
                    Add new
                </Button>

                <NewResidentModal
                    open={isNewModalVisible}
                    onClose={() => setIsNewModalVisible(false)}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    refetchResidents={fetchResidentData}
                />
                <ResidentModal
                    open={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    residentData={selectedResidentData}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    refetchResidents={fetchResidentData}
                />
            </div>
            <br />
            <Table
                columns={Residentcolumns}
                dataSource={residentData}
                scroll={{ x: 900 }}
                rowKey="_id"
                pagination={false}
                bordered
            />


        </>
    );
};

export default ResidentTab;
