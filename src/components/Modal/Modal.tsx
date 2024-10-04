import { Modal, Form, Input, Button, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Swal from 'sweetalert2';

const EditModal = ({ visible, guardian_id, onClose, id, sub_premise_id, association_type }: any) => {
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [guardianData, setGuardianData] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchGuardiansData();
        }
    }, [visible]);

    const fetchGuardiansData = async () => {
        const accessToken = session?.user?.accessToken || undefined;
        const premiseId = session?.user?.primary_premise_id || '';

        const payload = {
            premise_id: premiseId,
            premise_unit_id: id,
        };

        try {
            const response = await axios.post('http://139.84.166.124:8060/user-service/admin/premise_unit_guardian/list', payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const guardianList = response.data.data;
            const selectedGuardian = guardianList.find((guardian: any) => guardian._id === guardian_id);

            if (selectedGuardian) {
                setGuardianData(selectedGuardian);
                form.setFieldsValue(selectedGuardian);
                setIsEditMode(false);
                setIsNewRecord(false);
            } else {
                setGuardianData({
                    name: '',
                    mobile: '',
                    email: '',
                    lease_start_date: '',
                    lease_end_date: '',
                    is_residing: ''
                });
                form.resetFields();
                setIsEditMode(true);
                setIsNewRecord(true);
            }

        } catch (error) {
            console.error('Error fetching guardians data:', error);
        }
    };

    const handleEditToggle = () => {
        setIsEditMode((prevMode) => !prevMode);
    };

    const handleFinish = async (values: any) => {
        if (isNewRecord) {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to save?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, save it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    handleSave();
                } else if (result.isDenied) {
                    Swal.fire("informations are not saved", "", "info");
                }
    
            });
        } else {
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
                    handleSave();
                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                }

            });
        }

    };

    const handleSave = async () => {
        const accessToken = session?.user?.accessToken || undefined;
        const premiseId = session?.user?.primary_premise_id || '';

        const values = form.getFieldsValue();

        const payload = {
            premise_unit_id: id,
            premise_id: premiseId,
            sub_premise_id: sub_premise_id,
            association_type: association_type,
            ...values,
        };

        const payload2 = {
            premise_unit_id: id,
            premise_id: premiseId,
            sub_premise_id: sub_premise_id,
            ...values,
        };

        try {
            if (isNewRecord) {
                await axios.post('http://139.84.166.124:8060/user-service/admin/premise_unit_guardian/upsert', payload, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                Swal.fire({
                    title: "Saved!",
                    text: "",
                    icon: "success",
                    confirmButtonText: "OK",
                    customClass: {
                      confirmButton: 'bg-blue-500'
                    },
                    confirmButtonColor: '#007bff', 
                  });

            } else {
                await axios.post(`http://139.84.166.124:8060/user-service/admin/premise_unit_guardian/upsert`, payload2, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                Swal.fire({
                    title: "Updated!",
                    text: "Details has been updated.",
                    icon: "success",
                    confirmButtonText: "OK",
                    customClass: {
                        confirmButton: 'bg-blue-500'
                    },
                });

            }

            setIsEditMode(false);
            onClose();
        } catch (error) {
            console.error('Error saving guardian data:', error);
        }
    };



    return (
        <Modal
            title={isNewRecord ? "Create Guardian" : "Edit Guardian"}
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} onFinish={handleFinish}>
                <Form.Item label="Unit ID">
                    <Input value={id} disabled />
                </Form.Item>

                <Form.Item label="Name" name="name">
                    <Input disabled={!isEditMode} />
                </Form.Item>

                <Form.Item label="Mobile" name="mobile">
                    <Input disabled={!isEditMode} />
                </Form.Item>

                <Form.Item label="Email" name="email">
                    <Input disabled={!isEditMode} />
                </Form.Item>

                <Form.Item label="Lease Start Date" name="lease_start_date">
                    <Input disabled={!isEditMode} />
                </Form.Item>

                <Form.Item label="Lease End Date" name="lease_end_date">
                    <Input disabled={!isEditMode} />
                </Form.Item>


                <Form.Item label="Is Residing" name="is_residing">
                    <Select
                        disabled={!isEditMode}
                        onChange={(value) => setGuardianData({ ...guardianData, is_residing: value })}
                    >
                        <Select.Option value="yes">Yes</Select.Option>
                        <Select.Option value="no">No</Select.Option>
                    </Select>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    {isEditMode ? (
                        <>

                        </>
                    ) : (
                        <Button type="default" onClick={handleEditToggle}>
                            Edit
                        </Button>
                    )}

                    {isEditMode ? (
                        <Button
                            style={{
                                marginLeft: '8px',
                                borderRadius: '4px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                            }}
                            htmlType="submit"
                            disabled={!isEditMode}
                        >
                            Submit
                        </Button>
                    ) : (
                        <>
                        </>
                    )}


                </div>


            </Form>
        </Modal>
    );
};

export default EditModal;
