import React, { useState, useEffect } from 'react';
import { Button, Table, Form } from 'antd';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import VehicleModal from "../Modal/VehicleModal"

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

        fetchVehicleData();
        if (accessToken) {
            fetchVehicleData();
        }
    }, [premiseId, subPremiseId, premiseUnitId, session]);

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

    const columns = [
        {
            title: 'Parking ID',
            dataIndex: 'parking_id',
            key: 'parking_id',
            width: 150,
        },
        {
            title: 'Slot ID',
            dataIndex: 'slot_id',
            key: 'slot_id',
            width: 150,
        },
        {
            title: 'Parking Area',
            dataIndex: 'parking_area',
            key: 'parking_area',
            width: 150,
        },
        {
            title: 'Vehicle Number',
            dataIndex: 'vno',
            key: 'vno',
            width: 150,
        },
        {
            title: 'Action',
            key: 'action',
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
            width: 200,
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
                <Button style={{ marginBottom: '8px' }} onClick={() => handlenew()}>
                    Add new
                </Button>
                <VehicleModal
                    visible={isNewModalVisible}
                    onClose={() => setIsNewModalVisible(false)}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    refetchVehicleData={fetchVehicleData}
                />
            </div>
            <Table
                columns={columns}
                dataSource={vehicleData}
                loading={loading}
                rowKey="_id"
                pagination={false}
            />

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
        </div>
    );
};

export default VehicleTab;
