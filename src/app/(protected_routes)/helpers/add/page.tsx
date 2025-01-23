'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Row, Col, message, Upload } from 'antd';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const { Dragger } = Upload;

type SubPremise = {
    sub_premise_id: string;
    subpremise_name: string;
};

const HelperCreationForm = () => {

    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const [skills, setSkills] = useState<string[]>([]);
    const premiseId = session?.user.primary_premise_id;

    const [uploadedProfile, setUploadedProfile] = useState(null);
    const [uploadedID, setUploadedID] = useState(null);
    const [uploadedAddress, setUploadedAddress] = useState(null);
    const [uploadedPV, setUploadedPV] = useState(null);

    const [ProfilefileKey, setProfileFileKey] = useState('');
    const [IDfileKey, setIdFileKey] = useState('');
    const [AddressfileKey, setAddressFileKey] = useState('');
    const [PVfileKey, setPVFileKey] = useState('');

    const [form] = Form.useForm();

    const handleFileUpload = (file: any, type: any) => {
        const reader = new FileReader();

        if (type === 'profile') {
            setUploadedProfile(file);
        } else if (type === 'id') {
            setUploadedID(file);
        } else if (type === 'Address') {
            setUploadedAddress(file);
        } else if (type === 'PV') {
            setUploadedPV(file);
        }

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
                if (type === 'profile') {
                    setProfileFileKey(fileKey);
                } else if (type === 'id') {
                    setIdFileKey(fileKey);
                } else if (type === 'Address') {
                    setAddressFileKey(fileKey);
                } else if (type === 'PV') {
                    setPVFileKey(fileKey);
                }


            } catch (error) {
                message.error(`Failed to upload.`);
                console.error(error);
            }
        };
        reader.readAsDataURL(file);
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



    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/skills',
                    {},
                    { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
                );

                const fetchedSkills = response.data?.data?.map((item: any) => item.skill) || [];
                setSkills(fetchedSkills);
            } catch (error) {
                message.error('Failed to fetch skills.');
                console.error(error);
            }
        };

        if (session?.user.accessToken) {
            fetchSkills();
        }
    }, [session?.user.accessToken]);


    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                premise_id: premiseId,
                sub_premise_id_array: values.sub_premise_id_array,
                name: values.name,
                address: values.address,
                skill: values.skill,
                mobile: values.mobile,
                father_name: values.father_name || '',
                picture_obj: ProfilefileKey,
                id_proof_obj: IDfileKey,
                address_proof_obj: AddressfileKey,
                pv_obj: PVfileKey,
            };

            console.log(payload);
            await axios.post('http://139.84.166.124:8060/staff-service/create', payload, {
                headers: { Authorization: `Bearer ${session?.user.accessToken}` },
            });

            message.success('Helper created successfully.');
            form.resetFields();
            setUploadedProfile(null);
            setUploadedID(null);
            setUploadedAddress(null);
            setUploadedPV(null);
            setProfileFileKey('');
            setIdFileKey('');
            setAddressFileKey('');
            setPVFileKey('');

        } catch (error) {
            message.error('Failed to create helper.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h4 className="font-medium text-xl text-black dark:text-white">
                    Add Helpers
                </h4>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 'full', margin: '0 auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
            >

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="sub_premise_id_array"
                            label="Sub-Premises"
                            rules={[{ required: true, message: 'Please select at least one sub-premise!' }]}
                        >
                            <Select mode="multiple" placeholder="Select Sub-Premises">
                                {subPremiseArray.map((sub) => (
                                    <Select.Option key={sub.sub_premise_id} value={sub.sub_premise_id}>
                                        {sub.subpremise_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Please enter the helper name!' }]}
                        >
                            <Input placeholder="Enter helper name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="address"
                            label="Address"
                            rules={[{ required: true, message: 'Please enter the address!' }]}
                        >
                            <Input placeholder="Enter address" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="skill"
                            label="Skill"
                            rules={[{ required: true, message: 'Please select a skill!' }]}
                        >
                            <Select placeholder="Select a skill">
                                {skills.length > 0 ? (
                                    skills.map((skill) => (
                                        <Select.Option key={skill} value={skill}>
                                            {skill}
                                        </Select.Option>
                                    ))
                                ) : (
                                    <Select.Option disabled>Loading skills...</Select.Option>
                                )}
                            </Select>
                        </Form.Item>

                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="mobile"
                            label="Mobile Number"
                            rules={[{ required: true, message: 'Please enter a mobile number!' }]}
                        >
                            <Input placeholder="Enter mobile number" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="father_name" label="Father's Name">
                            <Input placeholder="Enter father name (optional)" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Upload Profile"
                            name="upload"
                            rules={[
                                { required: true, message: "Please upload profile!" },
                                () => ({
                                    validator(_, value) {
                                        if (uploadedProfile) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(""));
                                    },
                                }),
                            ]}
                        >
                            <Upload.Dragger
                                listType="picture"
                                showUploadList={{ showRemoveIcon: true }}
                                accept=".png,.jpeg"
                                maxCount={1}
                                beforeUpload={(file) => {
                                    const isImage = file.type.startsWith("image/");
                                    if (!isImage) {
                                        message.error("You can only upload image files!");
                                    }
                                    const type = 'profile';
                                    return isImage ? handleFileUpload(file, type) : false;
                                }}
                                fileList={uploadedProfile ? [uploadedProfile] : []}
                                onRemove={() => setUploadedProfile(null)}
                            >

                                <img
                                    width="60"
                                    height="60"
                                    className="mx-auto "
                                    src="https://img.icons8.com/?size=100&id=7820&format=png&color=000000"
                                    alt="upload-to-cloud--v1"
                                />
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Only images (JPG, PNG) are allowed </p>
                                <br />
                            </Upload.Dragger>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Upload ID"
                            name="upload"
                            rules={[
                                { required: true, message: "Please upload id!" },
                                () => ({
                                    validator(_, value) {
                                        if (uploadedID) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(""));
                                    },
                                }),
                            ]}
                        >
                            <Upload.Dragger
                                listType="picture"
                                showUploadList={{ showRemoveIcon: true }}
                                accept=".jpg,.jpeg,.png,.pdf"
                                maxCount={1}
                                beforeUpload={(file) => {
                                    const isValidType =
                                        file.type.startsWith("image/") || file.type === "application/pdf";
                                    if (!isValidType) {
                                        message.error("You can only upload image or PDF files!");
                                    }
                                    const type = 'id'
                                    return isValidType ? handleFileUpload(file, type) : false;
                                }}
                                fileList={uploadedID ? [uploadedID] : []}
                                onRemove={() => setUploadedID(null)}
                            >
                                <img
                                    width="60"
                                    height="60"
                                    className="mx-auto"
                                    src="https://img.icons8.com/?size=100&id=39595&format=png&color=000000"
                                    alt="upload-to-cloud--v1"
                                />
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Only images (JPG, PNG) or PDFs are allowed</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Col>


                    <Col span={12}>
                        <Form.Item
                            label="Upload Address Proof"
                            name="upload"
                            rules={[
                                { required: true, message: "Please upload Address Proof!" },
                                () => ({
                                    validator(_, value) {
                                        if (uploadedAddress) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(""));
                                    },
                                }),
                            ]}
                        >
                            <Upload.Dragger
                                listType="picture"
                                showUploadList={{ showRemoveIcon: true }}
                                accept=".png,.jpeg"
                                maxCount={1}
                                beforeUpload={(file) => {
                                    const isValidType =
                                        file.type.startsWith("image/") || file.type === "application/pdf";
                                    if (!isValidType) {
                                        message.error("You can only upload image or PDF files!");
                                    }
                                    const type = 'Address';
                                    return isValidType ? handleFileUpload(file, type) : false;
                                }}
                                fileList={uploadedAddress ? [uploadedAddress] : []}
                                onRemove={() => setUploadedAddress(null)}
                            >
                                <img
                                    width="60"
                                    height="60"
                                    className="mx-auto"
                                    src="https://img.icons8.com/?size=100&id=53383&format=png&color=000000"
                                    alt="upload-to-cloud--v1"
                                />
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Only images (JPG, PNG) or PDFs are allowed</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Col>


                    <Col span={12}>
                        <Form.Item
                            label="Upload Police Verification"
                            name="upload"
                            rules={[
                                { required: true, message: "Please upload Police Verification!" },
                                () => ({
                                    validator(_, value) {
                                        if (uploadedPV) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(""));
                                    },
                                }),
                            ]}
                        >
                            <Upload.Dragger
                                listType="picture"
                                showUploadList={{ showRemoveIcon: true }}
                                accept=".png,.jpeg"
                                maxCount={1}
                                beforeUpload={(file) => {
                                    const isValidType =
                                        file.type.startsWith("image/") || file.type === "application/pdf";
                                    if (!isValidType) {
                                        message.error("You can only upload image or PDF files!");
                                    }
                                    const type = 'PV'
                                    return isValidType ? handleFileUpload(file, type) : false;
                                }}
                                fileList={uploadedPV ? [uploadedPV] : []}
                                onRemove={() => setUploadedPV(null)}
                            >
                                <img
                                    width="60"
                                    height="60"
                                    className="mx-auto"
                                    src="https://img.icons8.com/?size=100&id=iWXaTX0OHmpB&format=png&color=000000"
                                    alt="upload-to-cloud--v1"
                                />
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Only images (JPG, PNG) or PDFs are allowed</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
                    <Button
                        htmlType="submit"
                        style={{
                            marginBottom: '8px',
                            background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Blue gradient background
                            color: 'white', // White text color
                            border: 'none', // No border
                            borderRadius: '4px', // Rounded corners
                            padding: '8px 16px', // Padding for a more substantial look
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                            cursor: 'pointer', // Pointer cursor on hover
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Transition for hover effects
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        Create
                    </Button>
                </Form.Item>

            </Form>

        </div>
    );
};

export default HelperCreationForm;
