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
                        {/* Replaced Edit text with EditOutlined icon */}
                    </Button>
                    <Button
                        className="ml-2"
                        onClick={() => handleDelete(record)}
                        style={{
                            backgroundColor: 'red',
                            color: 'white'
                        }}
                        type="default"
                        icon={<DeleteOutlined />} // DeleteOutlined icon for delete button
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
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (record: any) => {

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
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'accessToken': 'your-access-token-here',
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
            children: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Sub-premise"
                                name="sub_premise_id"
                                rules={[
                                    { required: true, message: 'Please select a sub-premise' },
                                    { validator: (_, value) => value !== "none" ? Promise.resolve() : Promise.reject(new Error('None is not a valid option.')) }
                                ]}
                            >
                                <Select placeholder="Select Sub-premise" disabled={true}>
                                    <Select.Option value="none">None</Select.Option>
                                    {session?.user?.subpremiseArray?.map((subpremise: any) => (
                                        <Select.Option key={subpremise.subpremise_id} value={subpremise.subpremise_id}>
                                            {subpremise.subpremise_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Unit ID"
                                name="unit_id"
                                rules={[{ required: true, message: 'Please enter the Unit ID' }]}
                            >
                                <Input placeholder="Unit ID" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Size" name="size">
                                <Input placeholder="Size" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Occupancy Status"
                                name="occupancy_status"
                                rules={[
                                    { required: true, message: 'Please select occupancy status' },
                                    { validator: (_, value) => value !== "none" ? Promise.resolve() : Promise.reject(new Error('None is not a valid option.')) }
                                ]}
                            >
                                <Select placeholder="Select Occupancy Status" disabled={!editMode}>
                                    <Select.Option value="none">None</Select.Option>
                                    <Select.Option value="Tenant">Tenant</Select.Option>
                                    <Select.Option value="Owner">Owner</Select.Option>
                                    <Select.Option value="Vacant">Vacant</Select.Option>
                                    <Select.Option value="Locked">Locked</Select.Option>
                                    <Select.Option value="Blocked">Blocked</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Extension No." name="extension_no">
                                <Input placeholder="Extension No." disabled={!editMode} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Direct Dial" name="direct_dial">
                                <Input placeholder="Direct Dial" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="2W Parking Count" name="tw_parking_count">
                                <Input placeholder="2W Parking Count" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="4W Parking Count" name="fw_parking_count">
                                <Input placeholder="4W Parking Count" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>

                            <Button
                                style={{
                                    marginRight: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0e0e0',
                                    color: '#333',
                                    border: 'none',
                                }}
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        </div>
                    </Form.Item>
                    {/* <Form.Item>
                        <Button
                            style={{
                                backgroundColor: editMode ? 'green' : '#d3d3d3',
                                color: 'white',
                            }}
                            htmlType="submit"
                            loading={loading}
                            disabled={!editMode}
                        >
                            Submit
                        </Button>

                        <Button
                            style={{
                                backgroundColor: '#808080',
                                color: 'white',
                                marginLeft: '8px',
                            }}
                            onClick={handleReset}
                            disabled={!editMode}
                        >
                            Reset
                        </Button>

                        <Button
                            style={{
                                backgroundColor: editMode ? 'red' : 'blue',
                                color: 'white',
                                marginLeft: '8px',
                            }}
                            onClick={toggleEditMode}
                        >
                            {editMode ? 'Cancel' : 'Edit'}
                        </Button>
                    </Form.Item> */}
                </Form>
            ),
        },
        {
            label: 'Connections',
            key: '2',
            disabled: true,
            children: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    disabled={true}

                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Water Meter ID"
                                name="water_meter_id"
                            >
                                <Input placeholder="Water Meter ID" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Electricity Meter Vendor"
                                name="electricity_meter_vendor"
                                rules={[{ required: true, message: 'Please enter electricity meter vendor' }]}
                            >
                                <Input placeholder="Electricity Meter Vendor" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Electricity Meter ID"
                                name="electricity_meter_id"
                            >
                                <Input placeholder="Electricity Meter ID" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Gas Connection ID"
                                name="gas_connection_id"
                            >
                                <Input placeholder="Gas Connection ID" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Direct Sanction Load"
                                name="direct_sanction_load"
                            >
                                <Input placeholder="Direct Sanction Load" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="DG Sanction Load"
                                name="dg_sanction_load"
                            >
                                <Input placeholder="DG Sanction Load" disabled={!editMode} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <Button
                                style={{
                                    marginRight: '8px',
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
                                    marginRight: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0e0e0',
                                    color: '#333',
                                    border: 'none',
                                }}
                                disabled={false}

                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        </div>
                    </Form.Item>
                    {/* <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                backgroundColor: editMode ? 'green' : '#d3d3d3', // Green when editable, gray when disabled
                                color: 'white',
                            }}
                            disabled={!editMode}
                            loading={loading}
                        >
                            Submit
                        </Button>

                        <Button
                            style={{
                                backgroundColor: '#808080', // Neutral gray color for reset
                                color: 'white',
                                marginLeft: '8px',
                            }}
                            onClick={handleReset}
                            disabled={!editMode}
                        >
                            Reset
                        </Button>

                        <Button
                            style={{
                                backgroundColor: editMode ? 'red' : 'blue', // Red for cancel, blue for edit
                                color: 'white',
                                marginLeft: '8px',
                            }}
                            onClick={toggleEditMode}
                        >
                            {editMode ? 'Cancel' : 'Edit'}
                        </Button>
                    </Form.Item> */}
                </Form>
            )
        },
        {
            label: 'Guardians',
            key: '3',
            disabled: true,
            children: (
                <>
                    <div className="flex items-center justify-between">
                        <h4 className="font-small text-xl text-black dark:text-white">
                            Owner
                        </h4>
                        <Button style={{ marginBottom: '8px' }} onClick={() => handleNew(null)} >
                            Add new
                        </Button>
                    </div>


                    <Table
                        columns={guardianColumns}
                        dataSource={guardiansData.filter((item) => item.association_type === 'Owner')}
                        scroll={{ x: 900 }}
                        loading={loadingGuardians}
                        rowKey="_id"
                        pagination={false}
                    />
                    <EditModal
                        visible={isModalVisible}
                        guardian_id={selectedUnitId}
                        id={id}
                        onClose={handleClose}
                        sub_premise_id={initialData.sub_premise_id}
                    />
                    <br />
                    <br />

                    <div className="flex items-center justify-between">
                        <h4 className="font-small text-xl text-black dark:text-white">
                            Tenant
                        </h4>

                        <EditModal
                            visible={isModalVisible}
                            guardian_id={selectedUnitId}
                            id={id}
                            onClose={handleClose}
                            sub_premise_id={initialData.sub_premise_id}
                        />
                    </div>


                    <Table
                        columns={[
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
                                title: 'Lease Start Date',
                                dataIndex: 'lease_start_date',
                                key: 'lease_start_date',
                                responsive: ['xs', 'sm', 'md', 'lg'],
                                width: 150,
                                render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
                            },
                            {
                                title: 'Lease End Date',
                                dataIndex: 'lease_end_date',
                                key: 'lease_end_date',
                                responsive: ['xs', 'sm', 'md', 'lg'],
                                width: 150,
                                render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
                            },
                            {
                                title: 'Action',
                                key: 'action',
                                responsive: ['xs', 'sm', 'md', 'lg'],
                                width: 150,
                                render: (_: any, record: any) => (
                                    <>
                                        <Button onClick={() => handleEdit(record)} icon={<EditOutlined />}>
                                            {/* Replaced Edit text with EditOutlined icon */}
                                        </Button>
                                        <Button
                                            className="ml-2"
                                            onClick={() => handleDelete(record)}
                                            style={{
                                                backgroundColor: 'red',
                                                color: 'white'
                                            }}
                                            type="default"
                                            icon={<DeleteOutlined />} // DeleteOutlined icon for delete button
                                        />
                                    </>
                                ),
                            },
                        ]}
                        dataSource={guardiansData.filter((item) => item.association_type === 'tenant')}
                        loading={loadingGuardians}
                        rowKey="_id"
                        pagination={false}
                        scroll={{ x: 900 }}
                    />


                    <br />

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <Button
                                style={{
                                    marginRight: '8px',
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
                                    marginRight: '8px',
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

            )
        },
        {
            label: 'Preferences',
            key: '4',
            disabled: true,
            children: (
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', backgroundColor: '#f9f9f9' }}>
                        <Row gutter={[8, 8]}>
                            <Col xs={24} sm={6}>
                                <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Notification Type</h4>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Form.Item name="maid_notification" valuePropName="checked">
                                    <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                        Maid Notifications
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Form.Item name="vehicle_notification" valuePropName="checked">
                                    <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                        Vehicle Notifications
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[8, 8]}>
                            <Col xs={24} sm={6}>
                                <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Services</h4>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Form.Item name="email_notification" valuePropName="checked">
                                    <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                        Email Notifications
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Form.Item name="wa_notification" valuePropName="checked">
                                    <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                        WhatsApp Notifications
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Form.Item name="sms_notification" valuePropName="checked">
                                    <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                        SMS Notifications
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                            return (
                                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', marginTop: '16px', backgroundColor: '#f9f9f9' }}>
                                    <Row gutter={[8, 8]}>
                                        <Col xs={24} sm={6}>
                                            <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Visitors</h4>
                                        </Col>
                                        <Col xs={24} sm={6}>
                                            <Form.Item name="pre_invite" valuePropName="checked">
                                                <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                                    Pre Invite
                                                </Checkbox>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[8, 8]}>
                                        <Col xs={24} sm={6}>
                                            <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Mode</h4>
                                        </Col>
                                        <Col xs={24} sm={4}>
                                            <Form.Item name="vms_voip" valuePropName="checked">
                                                <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                                    VOIP
                                                </Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={4}>
                                            <Form.Item name="vms_ivrs" valuePropName="checked">
                                                <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                                    IVRS
                                                </Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={4}>
                                            <Form.Item name="vms_manual" valuePropName="checked">
                                                <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                                    Manual
                                                </Checkbox>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            );
                        }}
                    </Form.Item>

                    <Form.Item>
                        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', marginTop: '16px', backgroundColor: '#f9f9f9' }}>
                            <Row gutter={[8, 8]}>
                                <Col xs={24} sm={6}>
                                    <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Other</h4>
                                </Col>
                                <Col xs={24} sm={6}>
                                    <Form.Item name="service_centre" valuePropName="checked">
                                        <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                            Service Center
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={6}>
                                    <Form.Item name="billing" valuePropName="checked">
                                        <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                            Billing
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <Button
                                style={{
                                    marginRight: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e0e0e0',
                                    color: '#333',
                                    border: 'none',
                                }}
                                onClick={handlePrev}
                            >
                                Previous
                            </Button>

                            <Button
                                style={{
                                    borderRadius: '4px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                }}
                                disabled={!editMode}
                                htmlType="submit"
                            >
                                Submit
                            </Button>
                        </div>
                    </Form.Item>
                </Form>


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
