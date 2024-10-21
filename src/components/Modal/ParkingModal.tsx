import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

interface ParkingModalProps {
    open: boolean;
    onClose: () => void;
    premiseId: string;
    subPremiseId: string;
    premiseUnitId: string;
    record: any | null;
    fetchParkingSlots: () => void;
}

const ParkingModal: React.FC<ParkingModalProps> = ({
    open,
    onClose,
    premiseId,
    subPremiseId,
    premiseUnitId,
    record,
    fetchParkingSlots
}) => {
    const [form] = Form.useForm();
    const { data: session } = useSession();

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                parking_id: record.parking_id,
                parking_slot: record.parking_slot,
            });
        } else {
            form.resetFields();
        }
    }, [record, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            Swal.fire({
                title: 'Are you sure?',
                text: `You are about to ${record ? 'update' : 'create'} this parking slot!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, proceed!',
            }).then(async (result: any) => {
                if (result.isConfirmed) {
                    const response = await fetch('http://139.84.166.124:8060/user-service/admin/parking/slot/create', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            premise_unit_id: premiseUnitId,
                            premise_id: premiseId,
                            sub_premise_id: subPremiseId,
                            parking_id: values.parking_id,
                            parking_slot: values.parking_slot,
                        }),
                    });

                    const result = await response.json();
                    if (result.error) {
                        throw new Error(result.error);
                    }

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
                text: `Failed to delete parking slot: ${error.message}`,
                icon: 'error',
                confirmButtonColor: '#3085d6',  
                confirmButtonText: 'OK', 
            });
        }
    };

    return (
        <Modal
            title={record ? 'Edit Parking Slot' : 'Add Parking Slot'}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                // <Button key="submit" type="primary" onClick={handleSubmit}>
                //     {record ? 'Update' : 'Add'}
                // </Button>,
                <Button
                    type="primary"
                    key="submit"
                    onClick={handleSubmit}
                    style={{
                        marginLeft: '8px',
                        borderRadius: '4px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                    }}
                >
                    {record ? 'Update' : 'Add'}
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Parking ID"
                    name="parking_id"
                    rules={[{ required: true, message: 'Please enter the parking ID!' }]}
                >
                    <Input placeholder="Enter Parking ID" />
                </Form.Item>

                <Form.Item
                    label="Parking Slot"
                    name="parking_slot"
                    rules={[{ required: true, message: 'Please enter the parking slot!' }]}
                >
                    <Input placeholder="Enter Parking Slot" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ParkingModal;
