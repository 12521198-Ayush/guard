import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button } from 'antd';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import axios from 'axios';

interface ParkingModalProps {
    open: boolean;
    onClose: () => void;
    premiseId: string;
    subPremiseId: string;
    premiseUnitId: string;
    record: any | null;
    fetchParkingSlots: () => void;
    data: any;
}

interface ParkingArea {
    _id: string;
    parking_area_name: string;
    parking_area_id: string;
    count: string;
}

const ParkingModal: React.FC<ParkingModalProps> = ({
    open,
    onClose,
    premiseId,
    subPremiseId,
    premiseUnitId,
    record,
    fetchParkingSlots,
    data
}) => {
    const [form] = Form.useForm();
    const { data: session } = useSession();
    const [parkingArea, setParkingArea] = useState<ParkingArea[]>([]);
    const [parkingAreaId, setParkingAreaId] = useState("");
    const accessToken = session?.user?.accessToken;
    const [loadingSlots, setLoadingSlots] = useState(true);

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                parking_area_id: record.parking_area_id,
                parking_slot: record.parking_slot,
            });
        } else {
            form.resetFields();
        }
    }, [record, form]);

    useEffect(() => {
        fetchParkingArea();
        generateParkingSlot();
        fetchParkingSlots();
    }, []);

    const generateParkingSlot = () => {
        if (data.length > 0) {
            const lastParkingSlot = data[data.length - 1].parking_slot;
            const lastNumber = parseInt(lastParkingSlot.split('-').pop(), 10);
            const newNumber = lastNumber + 1;
            const generatedSlot = `${premiseUnitId}-${newNumber}`;
            form.setFieldsValue({ parking_slot: generatedSlot });
        } else {
            const generatedSlot = `${premiseUnitId}-1`;
            form.setFieldsValue({ parking_slot: generatedSlot });
        }
    };
    

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log(values.parking_area_name);
            console.log(parkingAreaId);
            
            Swal.fire({
                title: 'Are you sure?',
                text: `You are about to ${record ? 'update' : 'create'} this parking slot!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, proceed!',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await axios.post(
                        'http://139.84.166.124:8060/user-service/admin/parking/slot/create',
                        {
                            premise_unit_id: premiseUnitId,
                            premise_id: premiseId,
                            sub_premise_id: subPremiseId,
                            parking_area_id: parkingAreaId,
                            parking_slot: values.parking_slot,
                            parking_area_name: values.parking_area_name,
                            vehicle_type: values.vehicle_type
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    Swal.fire({
                        title: 'Success!',
                        text: `Parking slot ${record ? 'updated' : 'added'} successfully!`,
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });
                    fetchParkingSlots();
                    onClose();
                }
            });
        } catch (error: any) {
            Swal.fire({
                title: 'Error!',
                text: `Failed to ${record ? 'update' : 'create'} parking slot: ${error.message}`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
        }
    };

    const fetchParkingArea = async () => {
        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/admin/parking/premises/parking_area/list',
                {
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const uniqueArea = response.data.data.filter(
                (area: ParkingArea, index: number, self: ParkingArea[]) =>
                    index === self.findIndex(s => s.parking_area_name === area.parking_area_name)
            );
            setParkingArea(uniqueArea);
        } catch (error) {
            console.error('Error fetching parking areas:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleAreaChange = (selectedArea: string) => {
        const selectedAreaData = parkingArea.find(area => area.parking_area_name === selectedArea);
        if (selectedAreaData) {
            form.setFieldsValue({ parking_area_name: selectedAreaData.parking_area_name });
            console.log(selectedAreaData.parking_area_id);
            setParkingAreaId(selectedAreaData.parking_area_id);
        }
    };

    return (
        <Modal
            title={record ? 'Edit Parking Slot' : 'Add Parking Slot'}
            open={open}
            onCancel={onClose}
            footer={[
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    style={{
                        background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
                        color: 'white',
                        padding: '6px 16px',
                        border: 'none',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {record ? 'Submit' : 'Add'}
                </Button>,
                <Button
                    key="cancel"
                    onClick={onClose}
                    style={{
                        background: 'linear-gradient(90deg, #f44336, #e57373)',
                        color: 'white',
                        padding: '6px 16px',
                        border: 'none',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    Cancel
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Parking Slot"
                    name="parking_slot"
                    rules={[{ required: true, message: 'Please enter the parking slot!' }]}
                >
                    <Input disabled={true} placeholder="Enter Parking Slot" />
                </Form.Item>
                <Form.Item
                    label="Parking Area"
                    name="parking_area_name"
                    rules={[{ required: true, message: 'Please enter Parking Area' }]}
                >
                    <Select
                        placeholder="Select Parking Area"
                        loading={loadingSlots}
                        options={parkingArea.map(area => ({
                            label: area.parking_area_name,
                            value: area.parking_area_name,
                        }))}
                        onChange={handleAreaChange}
                        showSearch
                        filterOption={(input, option) =>
                            option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
                        }
                    />
                </Form.Item>
                <Form.Item
                    label="Vehicle Type"
                    name="vehicle_type"
                    rules={[{ required: true, message: 'Please select vehicle type!' }]}
                >
                    <Select placeholder="Select Vehicle type">
                        <Select.Option value="2w">2 Wheel</Select.Option>
                        <Select.Option value="4w">4 Wheel</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ParkingModal;
