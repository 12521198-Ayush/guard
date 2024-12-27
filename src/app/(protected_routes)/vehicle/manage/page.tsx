'use client'

import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Tooltip, Input, Select, message } from 'antd';
import axios from 'axios';
import { DeleteOutlined, AppstoreAddOutlined, PlusOutlined, ProfileOutlined, SearchOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import type { ColumnType } from 'antd/es/table';
import { IdcardOutlined } from '@ant-design/icons';
import moment from 'moment';
import VehicleModal from '@/components/Modal/VehicleModal';
import RfidCardsModal from '@/components/Modal/RfidCardsModal';
import ExistingRfidCardsModal from '@/components/Modal/ExistingRfidCardsModal';
import NewVehicleModal from '@/components/Vehicle_manage/NewVehicleModal';


const { Search } = Input;


interface VehicleRecord {
    parking_id: string;
    slot_id: string;
    parking_area: string;
    vno: string;
    sub_premise_id: string;
}

const VehicleTab = ({
}: any) => {
    const [vehicleData, setVehicleData] = useState<VehicleRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
    const [AssignRFIDModal, setAssignRFIDModal] = useState(false);
    const [premiseUnit, setPremiseUnit] = useState('');
    const [subpremise_id, setsubpremis_id] = useState('');
    const [vno, setvno] = useState('');
    const [premiseUnitId, setpremiseUnitId] = useState<string[]>([]);
    const [ExistingRFIDsModal, setExistingRFIDsModal] = useState(false);
    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken || undefined;
    const premise_Id: string | undefined = session?.user.primary_premise_id as string | undefined;


    useEffect(() => {
        const fetchUnit_id = async () => {
            try {
                const response = await axios.post(
                    'http://139.84.166.124:8060/user-service/admin/premise_unit/list',
                    {
                        premise_id: premise_Id,
                    },
                    { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
                );

                const fetchedUnits = response.data?.data?.map((item: any) => item.id) || [];
                setpremiseUnitId(fetchedUnits);
            } catch (error) {
                message.error('Failed to fetch premiseUnitId.');
                console.error(error);
            }
        };

        if (session?.user.accessToken) {
            fetchUnit_id();
        }
    }, [session?.user.accessToken]);

    const fetchVehicleData = async () => {
        setLoading(true);

        const requestBody = {
            premise_id: premise_Id,
            ...(premiseUnit && { premise_unit_id: premiseUnit }),
            ...(vno && { vno: vno }),
        };

        // console.log(requestBody)

        // Check if we have at least premiseId or vno to proceed  
        if (!premiseUnit && !vno) {
            setVehicleData([]);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/admin/parking/slot/vehicle_list',
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.data?.data) {
                setVehicleData(response.data.data);
                setsubpremis_id(response.data.data)
            } else {
                setVehicleData([]);
            }
        } catch (error) {
            console.error('Error fetching vehicle data:', error);
            // Optional: Show user feedback or a notification about the error  
        } finally {
            setLoading(false);
        }
    };

    const [isNewModalVisible, setIsNewModalVisible] = useState(false);

    const handlenew = () => {
        setIsNewModalVisible(true);
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchVehicleData();
        }
    }, [premise_Id]);

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
                            premise_id: premise_Id,
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

    const AssignRfidModal = (value: any) => {
        setsubpremis_id(value);
        setAssignRFIDModal(true);
    }

    const existRfidCardsModal = (value: any) => {
        setsubpremis_id(value);
        setExistingRFIDsModal(true);
    }

    const columns: ColumnType<any>[] = [
        {
            title: 'Unit ID',
            dataIndex: 'premise_unit_id',
            key: 'premise_unit_id',
            width: 150,
        },
        {
            title: 'Parking Slot',
            dataIndex: 'parking_slot',
            key: 'parking_slot',
            width: 150,
        },
        {
            title: 'Parking Area',
            dataIndex: 'parking_area_name',
            key: 'parking_area_name',
            width: 150,
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
            width: 150,
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
            width: 50,
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
                                AssignRfidModal(record.sub_premise_id);
                                // setAssignRFIDModal(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="RFID Cards">
                        <Button
                            style={{ backgroundColor: '#1E90FF', color: 'white' }}
                            icon={<IdcardOutlined />}
                            onClick={() => {
                                setSelectedVehicle(record);
                                existRfidCardsModal(record.sub_premise_id);
                                // setExistingRFIDsModal(true);
                            }}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h4 className="font-medium text-xl text-black dark:text-white">
                    Manage Vehicles
                </h4>
            </div>

            <div className="p-4 bg-white ">
                <div className="flex gap-4 items-center ">
                    <Select
                        placeholder="Select a Premise Unit"
                        style={{ width: '200px' }}
                        onChange={setPremiseUnit}
                        value={premiseUnit || undefined} // Using undefined keeps the placeholder  
                        disabled={premiseUnitId.length === 0}
                    >
                        <Select.Option value="" disabled>
                            Select a Premise Unit
                        </Select.Option>
                        {premiseUnitId.length > 0 ? (
                            premiseUnitId.map((unit) => (
                                <Select.Option key={unit} value={unit}>
                                    {unit}
                                </Select.Option>
                            ))
                        ) : null}
                    </Select>
                    {/* <Input
                        value={premiseUnit}
                        onChange={(e) => setPremiseUnit(e.target.value)}
                        placeholder="Premise Unit ID"
                        className="w-50"
                    /> */}
                    <Input
                        value={vno}
                        onChange={(e) => setvno(e.target.value)}
                        placeholder="Vehicle Number"
                        className="w-50"
                    />
                    <Button
                        onClick={() => { fetchVehicleData() }}
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
                    >
                        Search
                    </Button>
                    <Button
                        className='ml-auto'
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
                    <NewVehicleModal
                        open={isNewModalVisible}
                        onClose={() => setIsNewModalVisible(false)}
                        refetchVehicleData={fetchVehicleData}
                    />

                </div>
            </div>
            {/* <h4>Vehicle Management</h4> */}
            <div className='pl-4 pr-4 '>

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
                            premiseId={premise_Id}
                            subPremiseId={subpremise_id}
                        />
                        <ExistingRfidCardsModal
                            open={ExistingRFIDsModal}
                            vno={selectedVehicle.vno}
                            onClose={() => setExistingRFIDsModal(false)}
                            premiseId={premise_Id}
                            subPremiseId={subpremise_id}
                        />
                    </>
                )}
            </div>
        </div>

    );
};

export default VehicleTab;

