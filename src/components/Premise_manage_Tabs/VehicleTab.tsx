import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Tooltip } from 'antd';
import axios from 'axios';
import { DeleteOutlined, AppstoreAddOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import VehicleModal from "../Modal/VehicleModal";
import type { ColumnType } from 'antd/es/table';
import { IdcardOutlined } from '@ant-design/icons';
import AssignRFIDButton from '../Buttons/AssignRFIDButton';
import moment from 'moment';
import RfidCardsModal from '../Modal/RfidCardsModal';
import ExistingRfidCardsModal from '../Modal/ExistingRfidCardsModal';


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
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
    const [AssignRFIDModal, setAssignRFIDModal] = useState(false);
    const [ExistingRFIDsModal, setExistingRFIDsModal] = useState(false);
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

    const handleDelete = async (record: VehicleRecord) => {
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
                    Swal.fire('Deleted!', `Vehicle ${record.vno} has been removed.`, 'success');
                    setVehicleData(vehicleData.filter((vehicle) => vehicle.vno !== record.vno));
                } catch (error) {
                    console.error('Error removing vehicle:', error);
                    Swal.fire('Error', 'Failed to remove vehicle. Please try again.', 'error');
                }
            }
        });
    };

    const columns: ColumnType<any>[] = [
        {
            title: 'Parking Slot',
            dataIndex: 'parking_slot',
            key: 'parking_slot',
            width: 180,
        },
        {
            title: 'Parking Area',
            dataIndex: 'parking_area_name',
            key: 'parking_area_name',
            width: 180,
        },
        {
            title: 'Vehicle Number',
            dataIndex: 'vno',
            key: 'vno',
            width: 180,
        },
        {
            title: 'Vehicle Type',
            dataIndex: 'vehicle_type',
            key: 'vehicle_type',
            width: 180,
        },
        {
            title: 'Allocation Date',
            dataIndex: 'create_ts',
            key: 'create_ts',
            width: 150,
            render: (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A'),
        },
        {
            title: 'Action',
            key: 'action',
            width: 180,
            render: (record: VehicleRecord) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        className="ml-2"
                        style={{ backgroundColor: 'red', color: 'white', marginRight: '8px' }}
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                    <Tooltip title="Assign RFID Cards">
                        <Button
                            style={{ backgroundColor: '#4CAF50', color: 'white', marginRight: '8px' }}
                            icon={<AppstoreAddOutlined />}
                            onClick={() => {
                                setSelectedVehicle(record);
                                setAssignRFIDModal(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="RFID Cards">
                        <Button
                            style={{ backgroundColor: '#1E90FF', color: 'white' }}
                            icon={<IdcardOutlined />}
                            onClick={() => {
                                setSelectedVehicle(record);
                                setExistingRFIDsModal(true);
                            }}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h4>Vehicle Management</h4>
            <Table
                columns={columns}
                dataSource={vehicleData}
                rowKey="vno"
                pagination={false}
                scroll={{ x: 'max-content' }}
            />
            {selectedVehicle && (
                <>
                    <RfidCardsModal
                        open={AssignRFIDModal}
                        vno={selectedVehicle.vno}
                        onClose={() => setAssignRFIDModal(false)}
                        premiseId={premiseId}
                        subPremiseId={subPremiseId}
                    />
                    <ExistingRfidCardsModal
                        open={ExistingRFIDsModal}
                        vno={selectedVehicle.vno}
                        onClose={() => setExistingRFIDsModal(false)}
                        premiseId={premiseId}
                        subPremiseId={subPremiseId}
                    />
                </>
            )}
        </div>
    );
};

export default VehicleTab;

