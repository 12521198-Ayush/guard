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
            title: 'Parking Id',
            dataIndex: 'parking_id',
            key: 'parking_id',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Slot Name',
            dataIndex: 'parking_slot',
            key: 'parking_slot',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Premise Unit ID',
            dataIndex: 'premise_unit_id',
            key: 'premise_unit_id',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Created On',
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
        } catch (error: any) {
            message.error('Failed to fetch parking slots: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParkingSlots();
    }, [premiseId, subPremiseId, premiseUnitId]);

    return (
        <>
            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">
                    Existing Slots
                </h4>
                <Button style={{ marginBottom: '8px' }} onClick={() => handleOpenModal(null)}>
                    Add new
                </Button>
            </div>

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
                    visible={isModalVisible}
                    onClose={handleClose}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    record={editingRecord}
                    fetchParkingSlots={fetchParkingSlots}
                />
            )}
            <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button
                        style={{
                            borderRadius: '4px',
                            backgroundColor: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                        }}
                        onClick={handlePrev}
                        disabled={false}
                    >
                        Previous
                    </Button>

                    <Button
                        style={{
                            borderRadius: '4px',
                            backgroundColor: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                        }}
                        onClick={handleNext}
                        disabled={false}
                    >
                        Next
                    </Button>
                </div>
            </Form.Item>

        </>
    );
};

export default ParkingTab;
