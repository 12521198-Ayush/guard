import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Select, Row, Col, message } from 'antd';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { InputRef } from 'antd/es/input';
import { values } from 'lodash';


type SubPremise = {
    sub_premise_id: string;
    subpremise_name: string;
};

interface NewVehicleModalProps {
    open: boolean;
    onClose: () => void;
    refetchVehicleData: () => void;
}

interface ParkingSlot {
    _id: string;
    parking_area_id: string;
    parking_area_name: string;
    parking_slot: string;
}

interface ParkingArea {
    _id: string;
    parking_name: string;
    count: string;
}

const NewVehicleModal: React.FC<NewVehicleModalProps> = ({
    open,
    onClose,
    refetchVehicleData,
}) => {


    const [form] = Form.useForm();
    const { data: session } = useSession();
    const premiseId = session?.user.primary_premise_id;
    const accessToken = session?.user?.accessToken;
    const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
    const [parkingArea, setParkingArea] = useState<ParkingArea[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [parkingAreaid, setparkingAreaid] = useState("");
    const [subPremiseId, setsubPremiseId] = useState("");
    const [unitID, setUnitID] = useState(null);
    const [premiseUnitId, setpremiseUnitId] = useState<string[]>([]);
    const [parkArea, setparkArea] = useState("");
    const [stateCode, setStateCode] = useState('');
    const [stateNumber, setStateNumber] = useState('');
    const [cityCode, setCityCode] = useState('');
    const [vehicleCode, setVehicleCode] = useState('');
    const stateCodeRef = useRef<InputRef | null>(null);
    const stateNumberRef = useRef<InputRef | null>(null);
    const cityCodeRef = useRef<InputRef | null>(null);
    const vehicleCodeRef = useRef<InputRef | null>(null);

    const handleStateCodeChange = (e: any) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z]*$/.test(value) && value.length <= 2) {
            setStateCode(value);
            if (value.length === 2 && stateNumberRef.current) {
                stateNumberRef.current.focus(); // Move focus to next input
            }
        }
    };

    const handleStateNumberChange = (e: any) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 2) {
            setStateNumber(value);
            if (value.length === 2 && cityCodeRef.current) {
                cityCodeRef.current.focus(); // Move focus to next input
            }
        }
    };

    // Handle city code change and focus shift
    const handleCityCodeChange = (e: any) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z]*$/.test(value) && value.length <= 2) {
            setCityCode(value);
            if (value.length === 2 && vehicleCodeRef.current) {
                vehicleCodeRef.current.focus(); // Move focus to next input
            }
        }
    };

    // Handle vehicle code change
    const handleVehicleCodeChange = (e: any) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 4) {
            setVehicleCode(value);
        }
    };



    useEffect(() => {
        const fetchParkingSlots = async () => {

            try {
                const response = await axios.post(
                    'http://139.84.166.124:8060/user-service/admin/parking/slot/list',
                    {
                        premise_id: premiseId,
                        sub_premise_id: subPremiseId,
                        premise_unit_id: unitID
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                const uniqueSlots = response.data.data.filter(
                    (slot: ParkingSlot, index: number, self: ParkingSlot[]) =>
                        index === self.findIndex(s => s.parking_slot === slot.parking_slot)
                );
                setParkingSlots(uniqueSlots);
            } catch (error) {
                console.error('Error fetching parking slots:', error);
            } finally {
                setLoadingSlots(false);
            }
        };
        if (session?.user.accessToken) {
            fetchParkingSlots();
        }
    }, [subPremiseId, unitID]);

    const fetchParkingArea = async () => {
        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/admin/parking/premises/parking_area/list',
                {
                    premise_id: premiseId,
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

    useEffect(() => {
        const fetchUnit_id = async () => {
            try {
                const response = await axios.post(
                    'http://139.84.166.124:8060/user-service/admin/premise_unit/list',
                    {
                        premise_id: premiseId,
                        sub_premise_id: subPremiseId
                    },
                    { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
                );

                // console.log(response.data); // Inspect the full response for debugging

                const fetchedUnits = Array.isArray(response.data?.data?.array)
                    ? response.data.data.array.map((item: any) => item.id)
                    : [];
                setpremiseUnitId(fetchedUnits);
            } catch (error) {
                console.error("Failed to fetch premiseUnitId:", error);
            }
        };

        if (session?.user.accessToken) {
            fetchUnit_id();
        }
    }, [session?.user.accessToken, subPremiseId]);


    useEffect(() => {
        if (open) {
            fetchParkingArea();
        }
    }, [open, premiseId, accessToken]);

    const handleSlotChange = (selectedSlot: string) => {
        const selectedSlotData = parkingSlots.find(slot => slot.parking_slot === selectedSlot);
        if (selectedSlotData) {
            form.setFieldsValue({ parking_id: selectedSlotData.parking_area_id });
            setparkingAreaid(selectedSlotData.parking_area_id);
            setparkArea(selectedSlotData.parking_area_name);
            console.log(selectedSlotData);
        }
    };

    // const handleAreaChange = (selectedArea: string) => {
    //     console.log(selectedArea);
    //     const selectedAreaData = parkingArea.find(area => area.parking_name === selectedArea)
    //     if (selectedAreaData) {
    //         form.setFieldsValue({ parking_area: selectedAreaData.parking_name })
    //     }
    // }

    const handleSubmit = async (values: any) => {
        const vehicleNumber = `${stateCode}${stateNumber}${cityCode}${vehicleCode}`;
        setVehicleCode('');
        setCityCode('');
        setStateNumber('');
        setStateCode('');
        const requestData = {
            premise_id: premiseId,
            sub_premise_id: values.sub_premise_id_array,
            premise_unit_id: values.premiseUnit,
            parking_area_id: parkingAreaid,
            parking_slot: values.slot_id,
            parking_area_name: parkArea,
            vno: vehicleNumber,
            vehicle_type: values.vehicle_type
        };
        console.log(requestData)

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

    const subPremiseArray: SubPremise[] = (session?.user.subpremiseArray || []).map((sub) => {
        if (typeof sub === 'string') {
            return {
                sub_premise_id: sub,
                subpremise_name: sub,
            };
        }
        return sub;
    });

    const handleSubPremiseChange = (value: any) => {
        setsubPremiseId(value);
        setUnitID(null);
        form.setFieldsValue({ premiseUnit: '' });
        form.setFieldsValue({ slot_id: '' });
    };

    const handleUnitChange = (value: any) => {
        setUnitID(value);
        form.setFieldsValue({ slot_id: '' });

    };


    return (
        <Modal
            open={open}
            title="Add New Vehicle"
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                {/* <Form.Item
                    label="Parking ID"
                    name="parking_id"
                    rules={[{ required: true, message: 'Please select a parking slot to populate Parking ID' }]}
                >
                    <Input placeholder="Parking ID" disabled />
                </Form.Item> */}

                <Form.Item
                    name="sub_premise_id_array"
                    label="Sub-Premises"
                    rules={[{ required: true, message: 'Please select at least one sub-premise!' }]}
                >
                    <Select
                        placeholder="Select Sub-Premises"
                        onChange={handleSubPremiseChange}
                    >
                        {subPremiseArray.map((sub) => (
                            <Select.Option key={sub.sub_premise_id} value={sub.sub_premise_id}>
                                {sub.subpremise_name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="premiseUnit"
                    label="Unit"
                    rules={[{ required: true, message: 'Please select a Premise Unit!' }]}
                >
                    <Select
                        onChange={handleUnitChange}
                        placeholder="Select a Premise Unit"
                        value={unitID}
                        disabled={premiseUnitId.length === 0}
                    >
                        {Array.isArray(premiseUnitId) && premiseUnitId.length > 0 ? (
                            premiseUnitId.map((unit) => (
                                <Select.Option key={unit} value={unit}>
                                    {unit}
                                </Select.Option>
                            ))
                        ) : (
                            <Select.Option disabled>No Premise Units Available</Select.Option>
                        )}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Parking Slot"
                    name="slot_id"
                    rules={[{ required: true, message: 'Please select a Slot ID' }]}
                >
                    <Select
                        placeholder="Select Slot ID"
                        loading={loadingSlots}
                        options={parkingSlots.map(slot => ({
                            label: slot.parking_slot,
                            value: slot.parking_slot,
                        }))}
                        onChange={handleSlotChange}
                        showSearch
                        filterOption={(input, option) => {
                            return option ? option.label.toLowerCase().includes(input.toLowerCase()) : false;
                        }}
                    />
                </Form.Item>



                {/* <Form.Item
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
                </Form.Item> */}

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



                <Form.Item
                    label="Vehicle Number"
                    name="vno"
                    rules={[{ required: true, message: 'Please enter Vehicle Number' }]}
                >
                    <Row gutter={8}>
                        <Col span={4}>
                            <Input
                                ref={stateCodeRef}
                                placeholder="State Code"
                                value={stateCode}
                                onChange={handleStateCodeChange}
                                maxLength={2}
                            />
                        </Col>
                        <Col span={4}>
                            <Input
                                ref={stateNumberRef}
                                placeholder="State Number"
                                value={stateNumber}
                                onChange={handleStateNumberChange}
                                maxLength={2}
                            />
                        </Col>
                        <Col span={4}>
                            <Input
                                ref={cityCodeRef}
                                placeholder="City Code"
                                value={cityCode}
                                onChange={handleCityCodeChange}
                                maxLength={2}
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                ref={vehicleCodeRef}
                                placeholder="Vehicle Code"
                                value={vehicleCode}
                                onChange={handleVehicleCodeChange}
                                maxLength={4}
                            />
                        </Col>
                    </Row>
                </Form.Item>

                <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="primary"
                            key="submit"
                            htmlType="submit"
                            style={{
                                marginLeft: '8px',
                                borderRadius: '4px',
                                background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Gradient from green to dark green
                                color: 'white',
                                padding: '6px 16px',
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
                            Add
                        </Button>
                        <Button
                            key="cancel"
                            onClick={onClose}
                            style={{
                                borderRadius: '4px',
                                background: 'linear-gradient(90deg, #f44336, #e57373)', // Gradient from dark red to light red
                                color: 'white',
                                padding: '6px 16px',
                                marginLeft: '8px',
                                border: 'none',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; // Slight scale on hover
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Shadow effect
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default NewVehicleModal;
