import React, { useState, useEffect } from 'react';
import { Button, Table, Form } from 'antd';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import VehicleModal from "../Modal/VehicleModal";
import type { ColumnType } from 'antd/es/table';

interface VehicleRecord {
    parking_id: string;
    slot_id: string;
    parking_area: string;
    vno: string;
}

const VehicleTab = ({
    form,
    handlePrev,
    handleNext,
    premiseId,
    subPremiseId,
    premiseUnitId,
    editMode,
}: any) => {
    const [vehicleData, setVehicleData] = useState<VehicleRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken || undefined;

    const fetchVehicleData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/admin/parking/slot/vehicle_list',
                {
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
                    premise_unit_id: premiseUnitId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.data?.data) {
                setVehicleData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicle data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchVehicleData();
        }
    }, [premiseId, subPremiseId, premiseUnitId]);

    const handleDelete = (record: VehicleRecord) => {

        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to remove the vehicle ${record.vno}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {

                try {
                    await axios.post(
                        'http://139.84.166.124:8060/user-service/admin/parking/slot/remove_vehicle',
                        {
                            premise_id: premiseId,
                            vno: record.vno,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                    Swal.fire({
                        title: 'Deleted!',
                        text: `Vehicle ${record.vno} has been removed.`,
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });

                    setVehicleData(vehicleData.filter((vehicle) => vehicle.vno !== record.vno));
                } catch (error) {
                    console.error('Error removing vehicle:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to remove vehicle. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });
                }
            }
        });
    };

    const columns: ColumnType<any>[] = [
        {
            title: 'Parking ID',
            dataIndex: 'parking_id',
            key: 'parking_id',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 200,
        },
        {
            title: 'Parking Slot',
            dataIndex: 'slot_id',
            key: 'slot_id',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 200,
        },
        {
            title: 'Parking Area',
            dataIndex: 'parking_area',
            key: 'parking_area',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 200,
        },
        {
            title: 'Vehicle Number',
            dataIndex: 'vno',
            key: 'vno',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 200,
        },
        {
            title: 'Action',
            key: 'action',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 200,
            render: (record: VehicleRecord) => (
                <>
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

        },
    ];


    const [isNewModalVisible, setIsNewModalVisible] = useState(false);
    const handlenew = () => {
        setIsNewModalVisible(true);
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">Vehicle Management</h4>
                
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

                <VehicleModal
                    open={isNewModalVisible}
                    onClose={() => setIsNewModalVisible(false)}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    refetchVehicleData={fetchVehicleData}
                />
            </div>
            <br />

            <Table
                columns={columns}
                dataSource={vehicleData}
                rowKey="_id"
                pagination={false}
                scroll={{ x: 'max-content' }}
                style={{
                    whiteSpace: 'nowrap',
                }}
            />

        </div>
    );
};

export default VehicleTab;
