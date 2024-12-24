'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Row, Col, message, Upload } from 'antd';
import axios from 'axios';
import { useSession } from 'next-auth/react';
const { Dragger } = Upload;

type SubPremise = {
  subpremise_id: string;
  subpremise_name: string;
};

const HelperCreationForm = () => {


  const { data: session } = useSession();
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileKeys, setFileKeys] = useState({
    profile_pic: '',
    id_proof: '',
    address_proof: '',
    police_verification: '',
  });
  const user = session?.user || {};
  const premiseId = session?.user.primary_premise_id;
  const [form] = Form.useForm();

  const handleFileUpload = async (file: File, type: keyof typeof fileKeys) => {
    const reader = new FileReader();
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

        // Log current fileKeys for debugging
        console.log('Before update:', fileKeys);

        setFileKeys((prev) => {
          const updatedKeys = { ...prev, [type]: fileKey };
          console.log('After update:', updatedKeys); // Log updated keys
          return updatedKeys;
        });

        // message.success(`${type.replace('_', ' ')} uploaded successfully.`);
      } catch (error) {
        message.error(`Failed to upload ${type.replace('_', ' ')}.`);
        console.error(error);
      }
    };
    reader.readAsDataURL(file);
  };


  const subPremiseArray: SubPremise[] = (session?.user.subpremiseArray || []).map((sub) => {
    if (typeof sub === 'string') {
      return {
        subpremise_id: sub,
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
        picture_obj: fileKeys.profile_pic,
        id_proof_obj: fileKeys.id_proof,
        address_proof_obj: fileKeys.address_proof,
        pv_obj: fileKeys.police_verification,
      };

      console.log("payload**************************");
      console.log(payload);

      await axios.post('http://139.84.166.124:8060/staff-service/create', payload, {
        headers: { Authorization: `Bearer ${session?.user.accessToken}` },
      });


      message.success('Helper created successfully.');
      form.resetFields();
      setFileKeys({
        profile_pic: '',
        id_proof: '',
        address_proof: '',
        police_verification: '',
      });
    } catch (error) {
      message.error('Failed to create helper.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState({
    profile_pic: false,
    id_proof: false,
    address_proof: false,
    police_verification: false,
  });

  const handleUploadChange = (info: any, key: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} uploaded successfully!`);
      setUploadedFiles((prev) => ({ ...prev, [key]: info.file }));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} failed to upload.`);
    }
  };

  const handleRemove = (key: any) => {
    setUploadedFiles((prev) => ({ ...prev, [key]: null }));
    message.info(`${key.replace('_', ' ')} file removed.`);
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
                  <Select.Option key={sub.subpremise_id} value={sub.subpremise_id}>
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
            <Form.Item label="Profile Picture">
              <Dragger
                accept=".jpg,.jpeg,.png"
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    message.error("You can only upload image files!");
                  }
                  return isImage ? handleFileUpload(file, 'profile_pic') : false;
                }}
                disabled={uploadedFiles.profile_pic}
                onChange={(info) => handleUploadChange(info, 'profile_pic')}
                showUploadList={{ showRemoveIcon: true }}
                multiple={false}
              >
                <p className="ant-upload-drag-icon">
                  <i className="anticon anticon-upload" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">Only image files (JPG, PNG) are allowed</p>
              </Dragger>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="ID Proof">
              <Dragger
                accept=".jpg,.jpeg,.png,.pdf"
                beforeUpload={(file) => {
                  const isValidType =
                    file.type.startsWith("image/") ||
                    file.type === "application/pdf";
                  if (!isValidType) {
                    message.error("You can only upload image or PDF files!");
                  }
                  return isValidType ? handleFileUpload(file, 'id_proof') : false;
                }}
                disabled={uploadedFiles.id_proof}
                onChange={(info) => handleUploadChange(info, 'id_proof')}
                showUploadList={{ showRemoveIcon: true }}
                multiple={false}
              >
                <p className="ant-upload-drag-icon">
                  <i className="anticon anticon-upload" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">Only images (JPG, PNG) or PDFs are allowed</p>
              </Dragger>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Address Proof">
              <Dragger
                accept=".jpg,.jpeg,.png,.pdf"
                beforeUpload={(file) => {
                  const isValidType =
                    file.type.startsWith("image/") ||
                    file.type === "application/pdf";
                  if (!isValidType) {
                    message.error("You can only upload image or PDF files!");
                  }
                  return isValidType ? handleFileUpload(file, 'address_proof') : false;
                }}
                disabled={uploadedFiles.address_proof}
                onChange={(info) => handleUploadChange(info, 'address_proof')}
                showUploadList={{ showRemoveIcon: true }}
                multiple={false}
              >
                <p className="ant-upload-drag-icon">
                  <i className="anticon anticon-upload" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">Only images (JPG, PNG) or PDFs are allowed</p>
              </Dragger>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Police Verification">
              <Dragger
                accept=".jpg,.jpeg,.png,.pdf"
                beforeUpload={(file) => {
                  const isValidType =
                    file.type.startsWith("image/") ||
                    file.type === "application/pdf";
                  if (!isValidType) {
                    message.error("You can only upload image or PDF files!");
                  }
                  return isValidType ? handleFileUpload(file, 'police_verification') : false;
                }}
                // disabled={uploadedFiles.police_verification}
                onChange={(info) => handleUploadChange(info, 'police_verification')}
                showUploadList={{ showRemoveIcon: true }}
                multiple={false}
              >
                <p className="ant-upload-drag-icon">
                  <i className="anticon anticon-upload" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">Only images (JPG, PNG) or PDFs are allowed</p>
              </Dragger>
            </Form.Item>
          </Col>
        </Row>


        <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>

          {/* <Button type="primary" htmlType="submit" loading={loading} style={{ padding: '0 40px' }}>
          Submit
          </Button> */}
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

          <Button
            href='/dashboard'
            style={{
              background: 'linear-gradient(90deg, #ff6f61, #d50032)', // Red gradient for Cancel
              color: 'white',
              marginLeft: '8px',
              border: 'none',
              marginRight: '4px',
              borderRadius: '4px',
              padding: '5px 12px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HelperCreationForm;
