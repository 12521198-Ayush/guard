import React, { useState,useEffect } from 'react';
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
}

interface ParkingArea{
    _id: string;
    parking_name: string;
    parking_id: string;
    count: string;
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
    const [parkingArea, setParkingArea] = useState<ParkingArea[]>([]);
    const [parkingAreaid, setparkingAreaid] = useState("");
    const accessToken = session?.user?.accessToken;
    const [loadingSlots, setLoadingSlots] = useState(true);


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

    useEffect(()=>{
        console.log(record);
        fetchParkingArea();
    },[])

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
                            parking_id: parkingAreaid,
                            parking_slot: values.parking_slot,
                            parking_area: values.parking_area,
                            vehicle_type: values.vehicle_type
                        }),
                    });

                    const result = await response.json();
                    console.log(result)
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
                    index === self.findIndex(s => s.parking_name === area.parking_name)
            );
            setParkingArea(uniqueArea);

        } catch (error) {
            console.error('Error fetching parking Area:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleAreaChange = (selectedArea: string) =>{
        console.log(selectedArea);
        const selectedAreaData = parkingArea.find(area => area.parking_name === selectedArea);
        if(selectedAreaData){
            form.setFieldsValue({ parking_area: selectedAreaData.parking_name});
            setparkingAreaid(selectedAreaData.parking_id);

        };
        console.log(parkingAreaid);
    }

    return (
        <Modal
            title={record ? 'Edit Parking Slot' : 'Add Parking Slot'}
            open={open}
            onCancel={onClose}
            footer={[
                // <Button key="cancel" onClick={onClose}>
                //     Cancel
                // </Button>,
                // // <Button key="submit" type="primary" onClick={handleSubmit}>
                // //     {record ? 'Update' : 'Add'}
                // // </Button>,
                // <Button
                //     type="primary"
                //     key="submit"
                //     onClick={handleSubmit}
                //     style={{
                //         marginLeft: '8px',
                //         borderRadius: '4px',
                //         backgroundColor: '#4CAF50',
                //         color: 'white',
                //     }}
                // >
                //     {record ? 'Update' : 'Add'}
                // </Button>


                <Button
                    type="primary"
                    key="submit"
                    onClick={handleSubmit}
                    style={{
                        marginLeft: '8px',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Gradient from green to dark green
                        color: 'white',
                        padding: '6px 16px', // Add padding
                        border: 'none',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                >
                    {record ? 'Submit' : 'Add'}
                </Button>,
                <Button
                    key="cancel"
                    onClick={onClose}
                    style={{
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #f44336, #e57373)', // Gradient from red to light red
                        color: 'white',
                        padding: '6px 16px', // Add padding
                        border: 'none',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; // Slight scale effect on hover
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Add shadow
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                >
                    Cancel
                </Button>

            ]}
        >
            <Form form={form} layout="vertical">
                {/* <Form.Item
                    label="Parking ID"
                    name="parking_id"
                    rules={[{ required: true, message: 'Please enter the parking ID!' }]}
                >
                    <Input placeholder="Enter Parking ID" />
                </Form.Item> */}

                <Form.Item
                    label="Parking Slot"
                    name="parking_slot"
                    rules={[{ required: true, message: 'Please enter the parking slot!' }]}
                >
                    <Input placeholder="Enter Parking Slot" />
                </Form.Item>

                <Form.Item
                    label="Parking Area"
                    name="parking_area"
                    rules={[{ required: true, message: 'Please enter Parking Area' }]}
                >
                     <Select
                        placeholder="Select Parking Area"
                        loading={loadingSlots}
                        options={parkingArea.map(area => ({
                            label: area.parking_name,
                            value: area.parking_name,
                        }))}
                        onChange={handleAreaChange}
                        showSearch
                        filterOption={(input, option) => {
                            return option ? option.label.toLowerCase().includes(input.toLowerCase()) : false;
                        }}
                    />
                    {/* <Input placeholder="Enter Parking Area" /> */}
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
