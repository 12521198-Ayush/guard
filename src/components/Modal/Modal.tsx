import { Modal, Form, Input, Button, Select, Upload, Row, Col, DatePicker, message } from 'antd';
import { UploadOutlined, StarOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import GradientButton from '../Buttons/GradientButton';
import { recordTraceEvents } from 'next/dist/trace';


const EditModal = ({ open, guardian_id, onClose, id, sub_premise_id, association_type }: any) => {
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [guardianData, setGuardianData] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
    const [supportingDocuments, setSupportingDocuments] = useState<any[]>([]);
    const [selectedDocType, setSelectedDocType] = useState<string>('');
    const accessToken = session?.user?.accessToken || undefined;
    const premiseId = session?.user?.primary_premise_id || '';
    const [uploadedFile, setUploadedFile] = useState(null);

    useEffect(() => {
        if (open) {
            fetchGuardiansData();
        }
    }, [open]);

    const fetchGuardiansData = async () => {

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

            const guardianList = response.data.data?.array;
            const selectedGuardian = guardianList.find((guardian: any) => guardian._id === guardian_id);

            if (selectedGuardian) {
                // Editing existing record
                setGuardianData(selectedGuardian);
                form.setFieldsValue(selectedGuardian);
                setSupportingDocuments(selectedGuardian.supporting_documents || []);
                setIsEditMode(false);
                setIsNewRecord(false);
            } else {
                form.resetFields();
                // setSupportingDocuments([]);
                setIsEditMode(true);
                setIsNewRecord(true);
            }

        } catch (error) {
            console.error('Error fetching guardians data:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to fetch the guardians',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleEditToggle = () => {
        setIsEditMode((prevMode) => !prevMode);
    };

    const handleFileUpload = (file: any) => {
        const reader = new FileReader();
        setUploadedFile(file);
        reader.onload = async () => {

            try {
                const base64Data = (reader.result as string).split(',')[1];
                const payload = {
                    premise_id: premiseId,
                    filetype: file.type,
                    file_extension: file.name.split('.').pop(),
                    base64_data: base64Data,
                }
                console.log(payload);

                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/upload/async',
                    {
                        premise_id: premiseId,
                        filetype: file.type,
                        file_extension: file.name.split('.').pop(),
                        base64_data: base64Data,
                    },
                    { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
                );

                const fileKey = response.data?.data?.filekey;
                if (!fileKey) {
                    throw new Error('File key is missing in the response.');
                }
                setExistingDocuments([{
                    type: selectedDocType,
                    url: fileKey
                }])

                console.log('document array', existingDocuments);



                // message.success(`${type.replace('_', ' ')} uploaded successfully.`);
            } catch (error) {
                message.error(`Failed to upload.`);
                console.error(error);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFinish = async (values: any) => {
        Swal.fire({
            title: isNewRecord ? "Are you sure you want to save?" : "Are you sure you want to update?",
            text: isNewRecord ? "Do you want to save the new guardian?" : "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: isNewRecord ? "Yes, save it!" : "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                handleSave(values);
            }
        });
    };

    const handleSave = async (values: any) => {
        const accessToken = session?.user?.accessToken || undefined;
        const premiseId = session?.user?.primary_premise_id || '';

        const asso = guardianData ? guardianData.association_type : values.association_type;

        const payload = {
            premise_unit_id: id,
            premise_id: premiseId,
            sub_premise_id: sub_premise_id,
            association_type: asso,
            ...values,
            ...(existingDocuments.length > 0 && { supporting_documents: existingDocuments }),
        };

        console.log(payload)

        try {
            const res = await axios.post('http://139.84.166.124:8060/user-service/admin/premise_unit_guardian/upsert', payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log(res)

            Swal.fire({
                title: isNewRecord ? "Saved!" : "Updated!",
                text: isNewRecord ? "" : "Details have been updated.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'bg-blue-500',
                },
            });
            setIsEditMode(false);
            setUploadedFile(null);
            setExistingDocuments([]);
            onClose();
        } catch (error) {
            console.error('Error saving guardian data:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to save the guardian.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleUploadChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'done') {
            const newDocument = {
                // uid: `${existingDocuments.length + 1}`,
                name: info.file.name,
                status: 'done',
                url: info.file.response.url,
            };
            // setExistingDocuments((prevDocs) => [...prevDocs, newDocument]);
        }
    };

    const uploadProps: UploadProps = {
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        onChange: handleUploadChange,
        defaultFileList: existingDocuments,
        showUploadList: {
            showDownloadIcon: true,
            downloadIcon: 'Download',
            showRemoveIcon: true,
            removeIcon: <StarOutlined onClick={(e) => console.log(e, 'custom removeIcon event')} />,
        },
    };

    const closeModal = () => {
        setExistingDocuments([]);
        setUploadedFile(null);
        onClose();
    }

    return (
        <Modal
            title={isNewRecord ? "Create Guardian" : "Edit Guardian"}
            open={open}
            onCancel={closeModal}
            footer={null}
            width={900}
            style={{ top: 20, padding: '24px', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}
        >
            <Form
                form={form}
                onFinish={handleFinish}
                layout="vertical"
                style={{ marginTop: '16px' }}
            >
                <Form.Item label="Unit ID">
                    <Input value={id} disabled />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input the name!' }]}
                        >
                            <Input disabled={!isEditMode} placeholder="Enter Guardian's Name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Mobile"
                            name="mobile"
                            rules={[{ required: true, message: 'Please input the mobile number!' }]}
                        >
                            <Input disabled={!isEditMode} placeholder="Enter Mobile Number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
                        >
                            <Input disabled={!isEditMode} placeholder="Enter Email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Lease Start Date"
                            name="lease_start_date"
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : null,
                            })}
                        >
                            <DatePicker
                                disabled={!isEditMode}
                                placeholder="Select Lease Start Date"
                                format="YYYY-MM-DD"
                                style={{ width: '100%' }}
                                onChange={(date) => {
                                    form.setFieldValue('lease_start_date', date ? dayjs(date).toISOString() : null);
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Lease End Date"
                            name="lease_end_date"
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : null,
                            })}
                        >
                            <DatePicker
                                disabled={!isEditMode}
                                placeholder="Select Lease End Date"
                                format="YYYY-MM-DD"
                                style={{ width: '100%' }}
                                onChange={(date) => {
                                    form.setFieldValue('lease_end_date', date ? dayjs(date).toISOString() : null);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Association Type"
                            name="association_type"
                            initialValue={association_type}
                            rules={[{ required: true, message: 'Please select an association type!' }]}
                        >
                            <Select disabled={!isEditMode}>
                                <Select.Option value="Owner">Owner</Select.Option>
                                <Select.Option value="tenant">Tenant</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Is Residing" name="is_residing">
                            <Select disabled={!isEditMode}>
                                <Select.Option value="yes">Yes</Select.Option>
                                <Select.Option value="no">No</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Document Type"
                            name="document_type"
                            rules={[{ required: true }]}
                        //rules={[{ required: true, message: 'Please select document type!' }]}
                        >
                            <Select
                                onChange={(value) => setSelectedDocType(value)}
                                disabled={!isEditMode}
                            >
                                <Select.Option value="Document1">Document1</Select.Option>
                                <Select.Option value="Document2">Document2</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Upload Document"
                    name="upload"
                    rules={[
                        { required: true, message: "Please upload file!" },
                        () => ({
                            validator(_, value) {
                                if (uploadedFile) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(""));
                            },
                        }),
                    ]}
                >

                    <Upload.Dragger
                        listType="picture"
                        disabled={!isEditMode}
                        showUploadList={{ showRemoveIcon: true }}
                        accept=".png,.jpeg"
                        maxCount={1}
                        beforeUpload={(file) => {
                            const isImage = file.type.startsWith("image/");
                            if (!isImage) {
                                message.error("You can only upload image files!");
                            }
                            return isImage ? handleFileUpload(file) : false;
                        }}
                        fileList={uploadedFile ? [uploadedFile] : []}
                        onRemove={() => setUploadedFile(null)}
                    >
                        <img
                            width="100"
                            height="100"
                            className="mx-auto"
                            src="https://img.icons8.com/plasticine/100/upload-to-cloud--v1.png"
                            alt="upload-to-cloud--v1"
                        />
                        Click or drag file to this area to upload
                    </Upload.Dragger>
                </Form.Item>


                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <div
                        style={{
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                            opacity: isEditMode ? 1 : 0,
                            transform: isEditMode ? 'translateX(0)' : 'translateX(20px)',
                            visibility: isEditMode ? 'visible' : 'hidden',
                            display: 'inline-block',
                            marginLeft: '8px',
                        }}
                    >
                        <GradientButton
                            text="Submit"
                            gradientColors={['#4e92ff', '#1e62d0']} // Blue gradient
                            disabled={!isEditMode}
                            htmlType="submit"
                        />


                    </div>

                    <Button
                        style={{
                            background: isEditMode
                                ? 'linear-gradient(90deg, #ff6f61, #d50032)'  // Red gradient for Cancel
                                : 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Blue gradient for Edit
                            color: 'white',
                            marginLeft: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 12px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                        }}
                        onClick={isEditMode ? onClose : handleEditToggle} // Conditional onClick
                    >
                        {isEditMode ? 'Cancel' : 'Edit'}
                    </Button>

                </div>

                {/* <div style={{ display: 'flex' }}>
                    {isEditMode ? (
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                marginLeft: '8px',
                                borderRadius: '4px',
                                background: 'linear-gradient(90deg, #4CAF50, #2E7D32)', // Gradient from green to a darker green
                                color: 'white',
                                border: 'none', // Remove border for a cleaner look
                                padding: '8px 16px', // Add some padding
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Transition for hover effects
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; // Scale effect on hover
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Add shadow
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; // Reset scale
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; // Remove shadow
                            }}
                        >
                            Submit
                        </Button>

                    ) : null}

                    {!isEditMode ? (
                        <Button
                            type="primary"
                            onClick={handleEditToggle}
                            style={{
                                marginLeft: '8px',
                                borderRadius: '4px',
                                background: 'linear-gradient(90deg, #1890ff, #0056b3)', // Gradient from blue to a darker blue
                                color: 'white',
                                border: 'none', // Remove border for a cleaner look
                                padding: '8px 16px', // Add some padding
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Transition for hover effects
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; // Scale effect on hover
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Add shadow
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; // Reset scale
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; // Remove shadow
                            }}
                        >
                            {isEditMode ? 'Save' : 'Edit'}
                        </Button>
                    ) : null}
                </div> */}


                {/* {existingDocuments.length > 0 && (
                    <div>
                        <h4>Uploaded Documents:</h4>
                        <ul>
                            {existingDocuments.map((doc) => (
                                <li key={doc.uid}>
                                    {doc.name} <a href={doc.url} target="_blank" rel="noopener noreferrer">Download</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )} */}
            </Form>
        </Modal>
    );
};

export default EditModal;
