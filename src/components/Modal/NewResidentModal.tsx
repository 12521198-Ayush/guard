import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

const { Option } = Select;

const CreateResidentModal = ({ open, onClose, premiseId, subPremiseId, premiseUnitId, refetchResidents }: any) => {
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [phone, setPhone] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const handleSubmit = async (values: any) => {
        const requestData = {
            premise_unit_id: premiseUnitId,
            premise_id: premiseId,
            sub_premise_id: subPremiseId,
            mobile: username,
            association_type: values.association_type,
            name: values.name,
            email: values.email,
        };

        const result = await Swal.fire({
            title: 'Confirm Submission',
            text: 'Are you sure you want to create this resident?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, create!',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('http://139.84.166.124:8060/user-service/admin/resident/create', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await response.json();

                Swal.fire({
                    title: 'Success!',
                    text: 'Resident created successfully.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });

                form.resetFields();
                refetchResidents();
                onClose();
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: `Failed to Create Resident: ${error}`,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    const handlePhoneChange = (phone: string, country: any) => {
        setPhone(phone);
        const reducedPhone = phone.replace(country.dialCode, '');
        const paddedCountryCode = country.dialCode.padStart(5, '0');
        const uname = paddedCountryCode + reducedPhone;
        setUsername(uname);
    };

    return (
        <Modal
            title="Create New Resident"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter the name!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="mobile"
                //rules={[{ required: true, message: 'Please enter the mobile number!' }]}
                >
                    <br />
                    <PhoneInput
                        country={'in'}
                        onChange={handlePhoneChange}
                        inputStyle={{ width: '100%' }}
                        enableSearch={true}
                        value={phone}
                    />
                </Form.Item>
                <Form.Item
                    name="association_type"
                    label="Association Type"
                    rules={[{ required: true, message: 'Please select association type!' }]}
                >
                    <Select placeholder="Select type">
                        <Option value="Owner">Owner</Option>
                        <Option value="Tenant">Tenant</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    {/* <Button
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
                    </Button> */}
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

export default CreateResidentModal;
