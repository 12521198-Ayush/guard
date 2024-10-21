import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface VehicleModalProps {
    visible: boolean;
    onClose: () => void;
    premiseId: string;
    subPremiseId: string;
    premiseUnitId: string;
    refetchVehicleData: () => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ visible, onClose, premiseId, subPremiseId, premiseUnitId, refetchVehicleData }) => {
    const [form] = Form.useForm();
    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken;

    const handleSubmit = async (values: any) => {
        const requestData = {
            premise_id: premiseId,
            sub_premise_id: subPremiseId,
            premise_unit_id: premiseUnitId,
            parking_id: values.parking_id,
            slot_id: values.slot_id,
            parking_area: values.parking_area,
            vno: values.vno,
        };

        try {
            Swal.fire({
                title: 'Add Vehicle?',
                text: `Do you want to add vehicle ${values.vno}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, add it!',
                cancelButtonText: 'Cancel',
            }).then(async (result: any) => {
                if (result.isConfirmed) {
                    await axios.post(
                        'http://139.84.166.124:8060/user-service/admin/parking/slot/add_vehicle',
                        requestData,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                    Swal.fire({
                        title: 'Success!',
                        text: `Vehicle ${values.vno} added successfully.`,
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });
                    refetchVehicleData();
                    onClose();
                    form.resetFields(); 
                }
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to add vehicle. Please try again.',
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
            });
            console.error('Error adding vehicle:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            title="Add New Vehicle"
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Parking ID"
                    name="parking_id"
                    rules={[{ required: true, message: 'Please enter Parking ID' }]}
                >
                    <Input placeholder="Enter Parking ID" />
                </Form.Item>

                <Form.Item
                    label="Slot ID"
                    name="slot_id"
                    rules={[{ required: true, message: 'Please enter Slot ID' }]}
                >
                    <Input placeholder="Enter Slot ID" />
                </Form.Item>

                <Form.Item
                    label="Parking Area"
                    name="parking_area"
                    rules={[{ required: true, message: 'Please enter Parking Area' }]}
                >
                    <Input placeholder="Enter Parking Area" />
                </Form.Item>

                <Form.Item
                    label="Vehicle Number"
                    name="vno"
                    rules={[{ required: true, message: 'Please enter Vehicle Number' }]}
                >
                    <Input placeholder="Enter Vehicle Number" />
                </Form.Item>

                <Form.Item>
                    {/* <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose} style={{ marginRight: '8px' }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </div> */}
                    <Button key="cancel" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            marginLeft: '8px',
                            borderRadius: '4px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                        }}
                    >
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VehicleModal;
