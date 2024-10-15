'use client';
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, Checkbox, Select, Row, Col, Tabs, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import EditModal from '../../../components/Modal/Modal'
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import BasicDetailsForm from '../../../components/Premise_manage_Tabs/BasicDetailsForm';
import ConnectionsForm from '../../../components/Premise_manage_Tabs/ConnectionsForm';
import GuardiansTab from '../../../components/Premise_manage_Tabs/GuardiansTab';
import PreferencesTab from '../../../components/Premise_manage_Tabs/PreferencesTab';
import ParkingTab from '../../../components/Premise_manage_Tabs/ParkingSlotTab';
import ResidentTab from '../../../components/Premise_manage_Tabs/ResidentTab';


const PremiseUnitForm = () => {

    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = new URL(window.location.href).searchParams;
    const id = searchParams.get('id');
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [initialData, setInitialData] = useState<any>({});
    const [form] = Form.useForm();
    const [guardiansData, setGuardiansData] = useState<any[]>([]);
    const [loadingGuardians, setLoadingGuardians] = useState(false);
    // const [data,setdata] = useState<any>();
    const premiseId = session?.user?.primary_premise_id || '';

    const fetchGuardiansData = async () => {
        const accessToken = session?.user?.accessToken || undefined;
        const premiseId = session?.user?.primary_premise_id || '';
        const payload = {
            premise_id: premiseId,
            premise_unit_id: id
        }
        try {
            setLoadingGuardians(true);
            const response = await axios.post('http://139.84.166.124:8060/user-service/admin/premise_unit_guardian/list', payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const guardianList = response.data.data;
            setGuardiansData(guardianList);
        } catch (error) {
            console.error('Error fetching guardians data:', error);
        } finally {
            setLoadingGuardians(false);
        }
    };

    const fetchPremiseUnitData = async (premiseId: string, idToFind: string) => {

        const accessToken = session?.user?.accessToken || undefined;
        setLoading(true);
        try {

            const response = await axios.post('/api/premise_unit/list', {
                premise_id: premiseId,
                id
            },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const data = response.data.data;
            const unit = data;
            if (unit) {

                const formattedData = {
                    sub_premise_id: unit.sub_premise_id || '',
                    unit_id: unit.id || '',
                    size: unit.size || '',
                    ownership_type: unit.ownership_type || '',
                    // mobile: premise_unit_guardian.mobile || '' ,
                    // name: premise_unit_guardian.name || '' ,
                    // email: premise_unit_guardian.email || '' ,
                    // address: premise_unit_guardian.address || '' ,
                    // association_type: premise_unit_guardian.association_type || '' ,
                    direct_dial_landline: unit.direct_dial_landline || '',
                    pre_invite: unit.pre_invite === 'yes',
                    email_notification: unit.email_notification === 'yes',
                    sms_notification: unit.sms_notification === 'yes',
                    maid_notification: unit.maid_notification === 'yes',
                    service_centre: unit.service_centre === 'yes',
                    billing: unit.billing === 'yes',
                    vehicle_notification: unit.vehicle_notification === 'yes',
                    wa_notification: unit.wa_notification === 'yes',
                    occupancy_status: unit.occupancy_status || '',
                    vms_manual: unit.vms_manual === 'yes',
                    vms_ivrs: unit.vms_ivrs === 'yes',
                    vms_voip: unit.vms_voip === 'yes',
                    extension_no: unit.extension_no || '',
                    direct_dial: unit.direct_dial_landline || '',
                    water_meter_id: unit.water_meter_id || '',
                    gas_connection_id: unit.gas_connection_id || '',
                    electricity_meter_vendor: unit.electricity_meter_vendor || '',
                    electricity_meter_id: unit.electricity_meter_id || '',
                    direct_sanction_load: unit.direct_sanction_load || '',
                    dg_sanction_load: unit.dg_sanction_load || '',
                    tw_parking_count: unit.tw_parking_count || '',
                    fw_parking_count: unit.fw_parking_count || '',
                };
                form.setFieldsValue(formattedData);
                setInitialData(formattedData);

            }


        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to fetch Premise data',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }



    };

    // const handleAction = (record: any) => {
    // };

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState(null);

    const handleNew = (unit_id: any) => {
        setIsModalVisible(true);
    };
    const handleEdit = (unit_id: any) => {
        if (unit_id == null) {
            setSelectedUnitId(null);
        } else {
            setSelectedUnitId(unit_id._id);
        }
        setIsModalVisible(true);
    };

    const handleClose = () => {
        fetchGuardiansData();
        setIsModalVisible(false);
        setSelectedUnitId(null);
    };

    const handleDelete = async (record: any) => {
        const accessToken = session?.user?.accessToken || undefined;

        if (!accessToken) {
            Swal.fire({
                title: 'Error!',
                text: 'Access token is missing. Please log in again.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            const url = 'http://139.84.166.124:8060/user-service/admin/premise_unit_guardian/delete';

            const payload = {
                premise_unit_id: record.premise_unit_id,
                premise_id: record.premise_id,
                mobile: record.mobile
            };
            console.log(payload);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete guardian.');
                }

                const data = await response.json();
 
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The guardian has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                });
                fetchGuardiansData();

            } catch (error) {
                console.error('Error deleting guardian:', error);

                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete the guardian.',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const guardianColumns: ColumnsType<any> = [
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
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 200,
        },
        {
            title: 'Type',
            dataIndex: 'association_type',
            key: 'association_type',
            responsive: ['xs', 'sm', 'md', 'lg'],
            width: 150,
        },
        {
            title: 'Residing',
            dataIndex: 'is_residing',
            key: 'is_residing',
            render: (residing: string) => (residing === 'yes' ? 'Yes' : 'No'),
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
                    <Button onClick={() => handleEdit(record)} icon={<EditOutlined />}>
                    </Button>
                    <Button
                        className="ml-2"
                        onClick={() => handleDelete(record)}
                        style={{
                            backgroundColor: 'red',
                            color: 'white'
                        }}
                        type="default"
                        icon={<DeleteOutlined />}
                    />
                </>
            ),
        },
    ];




    useEffect(() => {
        const premiseId = session?.user?.primary_premise_id || '';

        if (premiseId && id) {
            fetchGuardiansData();
            fetchPremiseUnitData(premiseId, id);
        }
    }, [session, id]);


    function transformBooleans(obj: Record<string, any>): Record<string, any> {
        const transformedObject: Record<string, any> = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (obj[key] === true) {
                    transformedObject[key] = 'yes';
                } else if (obj[key] === false) {
                    transformedObject[key] = 'no';
                } else {
                    transformedObject[key] = obj[key];
                }
            }
        }

        return transformedObject;
    }
    const handleFinish = async (values: any) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                Apifetch(values);
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
            }

        });
    };

    const Apifetch = async (values: any) => {
        const updatedvalues = transformBooleans(values);
        const premiseId = session?.user?.primary_premise_id || '';
        const mandate = {
            id: id,
            premise_id: premiseId,
        }
        const accessToken = session?.user?.accessToken || undefined;
        const payload = { ...mandate, ...updatedvalues }

        try {

            const response = await axios.post('/api/premise_unit/upsert', payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = response.data.data;
            fetchPremiseUnitData(premiseId, payload.id || '');
            Swal.fire({
                title: "Updated!",
                text: "Details has been updated.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'bg-blue-500'
                },
            });
            router.push('/flats-residents/manage-flats')

        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update the details',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    }


    const [activeKey, setActiveKey] = useState('1');

    const handleNext = () => {
        const nextKey = (parseInt(activeKey, 10) + 1).toString();
        setActiveKey(nextKey);
    };

    const handlePrev = () => {
        const nextKey = (parseInt(activeKey, 10) - 1).toString();
        setActiveKey(nextKey);
    };

    const handleReset = () => {
        const premiseId = session?.user?.primary_premise_id || '';
        if (premiseId && id) {
            fetchPremiseUnitData(premiseId, id);
        }
    };

    const toggleEditMode = () => {
        if (editMode) {
            form.setFieldsValue(initialData);
        }
        setEditMode(!editMode);
    };

    if (!session) {
        return null;
    }

    const items = [
        {
            label: 'Basic',
            key: '1',
            disabled: true,
            children: <BasicDetailsForm form={form} handleNext={handleNext} editMode={editMode} session={session} />,
        },
        {
            label: 'Connections',
            key: '2',
            disabled: true,
            children: <ConnectionsForm form={form} handlePrev={handlePrev} handleNext={handleNext} editMode={editMode} />,
        },
        {
            label: 'Guardians',
            key: '3',
            disabled: true,
            children: (
                <GuardiansTab
                    guardianColumns={guardianColumns}
                    guardiansData={guardiansData}
                    isModalVisible={isModalVisible}
                    selectedUnitId={selectedUnitId}
                    id={id}
                    initialData={initialData}
                    handleNew={handleNew}
                    handleClose={handleClose}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                    loadingGuardians={loadingGuardians}
                />
            )
        },
        {
            label: 'Parking Slots',
            key: '4',
            disabled: true,
            children: (<ParkingTab form={form} handlePrev={handlePrev} handleNext={handleNext} editMode={editMode} premiseId={premiseId} subPremiseId={initialData.sub_premise_id} premiseUnitId={id} />)
        },
        {
            label: 'Residents',
            key: '5',
            disabled: true,
            children: (<ResidentTab form={form} handlePrev={handlePrev} handleNext={handleNext} editMode={editMode} premiseId={premiseId} subPremiseId={initialData.sub_premise_id} premiseUnitId={id} />)
        },
        {
            label: 'Preferences',
            key: '6',
            disabled: true,
            children: (
                <PreferencesTab
                    form={form}
                    handlePrev={handlePrev}
                    handleFinish={handleFinish}
                    editMode={editMode}
                />
            )
        },


    ];

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex justify-between items-center">

                <h4 className="font-medium text-xl text-black dark:text-white">
                    Manage Premise Unit
                </h4>

                <div>
                    <div
                        style={{
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                            opacity: editMode ? 1 : 0,
                            transform: editMode ? 'translateX(0)' : 'translateX(20px)',
                            visibility: editMode ? 'visible' : 'hidden',
                            display: 'inline-block',
                            marginLeft: '8px',
                        }}
                    >
                        <Button
                            style={{
                                backgroundColor: '#808080',
                                color: 'white',
                            }}
                            onClick={handleReset}
                            disabled={!editMode}
                        >
                            Reset
                        </Button>
                    </div>
                    <Button
                        style={{
                            backgroundColor: editMode ? 'white' : '#597ef7',
                            color: editMode ? 'black' : 'white',
                            marginLeft: '8px',
                        }}
                        onClick={toggleEditMode}
                    >
                        {editMode ? 'Cancel' : 'Edit'}
                    </Button>

                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={setActiveKey} size="large" items={items} />
            </div>
        </div>


    );
};

export default PremiseUnitForm;
