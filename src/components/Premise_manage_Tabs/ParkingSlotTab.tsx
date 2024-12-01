import React, { useEffect, useState } from 'react';
import { Button, Table, Form, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSession } from 'next-auth/react';
import moment from 'moment';
import ParkingModal from '../Modal/ParkingModal';
import Swal from 'sweetalert2';

const ParkingTab = ({
    form,
    handlePrev,
    handleNext,
    premiseId,
    subPremiseId,
    premiseUnitId
}: any) => {
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [length, setlength] = useState(1);

    const handleOpenModal = (record: any | null) => {
        setEditingRecord(record);
        setIsModalVisible(true);
    };

    const handleClose = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
    };


    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken || undefined;

    const ParkingColumns: ColumnsType<any> = [
        {
            title: 'Parking Area',
            dataIndex: 'parking_area_name',
            key: 'parking_area_name',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Parking Slot',
            dataIndex: 'parking_slot',
            key: 'parking_slot',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Vehicle Type',
            dataIndex: 'vehicle_type',
            key: 'vehicle_type',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
            render: (text) => (text === '2w' ? '2 Wheel' : text === '4w' ? '4 Wheel' : text),
        },        
        {
            title: 'Allocation Date',
            dataIndex: 'created_on',
            key: 'created_on',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
            render: (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A'),
        },
        {
            title: 'Action',
            key: 'action',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
            render: (_: any, record: any) => (
                <>
                    <Button onClick={() => handleOpenModal(record)} icon={<EditOutlined />} />
                    <Button
                        className="ml-2"
                        style={{
                            backgroundColor: 'red',
                            color: 'white'
                        }}
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.parking_id)}
                    />
                </>
            ),
        },
    ];

    const handleDelete = async (parkingId: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to delete this parking slot? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://139.84.166.124:8060/user-service/admin/parking/slot/delete`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to delete the parking slot.');
                    }

                    Swal.fire({
                        title: 'Success!',
                        text: `Parking slot has been deleted successfully!`,
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });
                    fetchParkingSlots();
                } catch (error: any) {
                    Swal.fire({
                        title: 'Error!',
                        text: `Failed to delete parking slot: ${error.message}`,
                        icon: 'error',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });

                }
            }
        });
    };


    const fetchParkingSlots = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://139.84.166.124:8060/user-service/admin/parking/slot/list', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
                    premise_unit_id: premiseUnitId
                }),
            });

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }
            setData(result.data);
            setlength(result.data.length());
        } catch (error: any) {
            console.error('Failed to fetch parking slots: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchParkingSlots();
        }
    }, [premiseId, subPremiseId, premiseUnitId]);
    return (
        <>
            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">
                    Existing Slots
                </h4>
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
                    Add new
                </Button>
            </div>
            <br />
            <Table
                columns={ParkingColumns}
                dataSource={data}
                loading={loading}
                scroll={{ x: 900 }}
                rowKey="_id"
                pagination={false}
            />

            {isModalVisible && (
                <ParkingModal
                    open={isModalVisible}
                    onClose={handleClose}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    record={editingRecord}
                    fetchParkingSlots={fetchParkingSlots}
                    data = {data}
                />
            )}

        </>
    );
};

export default ParkingTab;
