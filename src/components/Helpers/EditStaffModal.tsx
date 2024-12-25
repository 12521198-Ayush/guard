import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Spin, Row, Col, Upload, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

const { Dragger } = Upload;

type SubPremise = {
  subpremise_id: string;
  subpremise_name: string;
};

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  cardNumber: number;
  premiseId: string;
}

const EditStaffModal: React.FC<ModalProps> = ({ visible, onClose, cardNumber, premiseId }) => {
  const [form] = Form.useForm();
  const [staffDetails, setStaffDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fileUrls, setFileUrls] = useState({
    pictureUrl: '',
    idProofUrl: '',
    addressProofUrl: '',
    pvUrl: '',
  });
  const [fetchingFiles, setFetchingFiles] = useState(false);

  const { data: session } = useSession();
  const [skills, setSkills] = useState<string[]>([]);
  const [fileKeys, setFileKeys] = useState({
    profile_pic: '',
    id_proof: '',
    address_proof: '',
    police_verification: '',
  });
  const user = session?.user || {};

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

  useEffect(() => {
    if (cardNumber) {
      fetchStaffDetails(cardNumber);
    }
  }, [cardNumber, premiseId]);


  const fetchStaffDetails = async (cardNumber: number) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://139.84.166.124:8060/staff-service/list',
        {
          premise_id: premiseId,
          card_no: cardNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Or use cookie headers
          },
        }
      );
      const staffData = response.data.data[0];
      setStaffDetails(staffData);

      form.setFieldsValue({
        name: staffData.name,
        mobile: staffData.mobile,
        address: staffData.address,
        skill: staffData.skill,
        father_name: staffData.father_name,
      });

      fetchFileUrls(staffData);
    } catch (error) {
      message.error('Failed to fetch staff details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileUrls = async (staffData: any) => {
    setFetchingFiles(true);
    try {
      const fileResponses = await Promise.all([
        axios.post('http://139.84.166.124:8060/staff-service/upload/get_presigned_url', {
          premise_id: premiseId,
          file_key: staffData.picture_url,
        }),
        axios.post('http://139.84.166.124:8060/staff-service/upload/get_presigned_url', {
          premise_id: premiseId,
          file_key: staffData.id_proof_url,
        }),
        axios.post('http://139.84.166.124:8060/staff-service/upload/get_presigned_url', {
          premise_id: premiseId,
          file_key: staffData.address_proof_url,
        }),
        axios.post('http://139.84.166.124:8060/staff-service/upload/get_presigned_url', {
          premise_id: premiseId,
          file_key: staffData.pv_url,
        }),
      ]);

      setFileUrls({
        pictureUrl: fileResponses[0].data.data.signedURL,
        idProofUrl: fileResponses[1].data.data.signedURL,
        addressProofUrl: fileResponses[2].data.data.signedURL,
        pvUrl: fileResponses[3].data.data.signedURL,
      });
    } catch (error) {
      message.error('Failed to fetch file URLs');
    } finally {
      setFetchingFiles(false);
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
        // console.log(payload);

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
        // console.log('Before update:', fileKeys);

        setFileKeys((prev) => {
          const updatedKeys = { ...prev, [type]: fileKey };
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

  const onFinish = async (values: any) => {
    // Construct the payload
    const payload: any = {
      name: values.name,
      address: values.address,
      skill: values.skill,
      mobile: values.mobile,
      father_name: values.father_name,
      ...(fileKeys.profile_pic && { picture_obj: fileKeys.profile_pic }),
      ...(fileKeys.id_proof && { id_proof_obj: fileKeys.id_proof }),
      ...(fileKeys.address_proof && { address_proof_obj: fileKeys.address_proof }),
      ...(fileKeys.police_verification && { pv_obj: fileKeys.police_verification }),
    };

    console.log(payload); // You can check the payload before sending the request
    // form.resetFields();
    // Show a confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update the helper details?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff', // Custom blue color for the confirm button
      cancelButtonColor: '#d33', // Red color for cancel button
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        // Send the request to the API
        const response = await axios.post(
          'http://139.84.166.124:8060/staff-service/update',
          payload,
          { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
        );

        if (response.status === 201) {
          // Show success message with SweetAlert2 on success
          Swal.fire({
            title: 'Helper Updated',
            text: 'The helper details have been successfully updated.',
            icon: 'success',
            confirmButtonColor: '#007bff', // Custom blue color for OK button
          });
        } else {
          message.error('Failed to update helper details.');
        }
      } catch (error) {
        console.error('Error updating helper:', error);
        message.error('An error occurred while updating helper details.');
      }
    }
  };

  const onExit = () => {
    setFileKeys({
      profile_pic: '',
      id_proof: '',
      address_proof: '',
      police_verification: '',
    });
    onClose();
  }


  return (
    <Modal
      title="Edit Helper Details"
      visible={visible}
      onCancel={onClose}
      footer={[
        // <Button key="cancel" onClick={onClose}>
        //   Cancel
        // </Button>,

        // <Button key="submit" type="primary" form="editForm" htmlType="submit" loading={loading}>
        //   Save
        // </Button>,
        <Button
          key="submit" form="editForm" htmlType="submit" loading={loading}
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
          Update
        </Button>,
        <Button
          key="cancel" onClick={onExit}
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
        </Button>,
      ]}
      confirmLoading={loading}
      width={900}
    >
      {staffDetails ? (
        <Form
          id="editForm"
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            onFinish(values)
            // Handle save logic here (e.g., API call to update details)
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mobile" label="Mobile">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="address" label="Address">
                <Input />
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
              <Form.Item name="father_name" label="Father's Name">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Document Preview URLs */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Profile Picture">
                <a href={fileUrls.pictureUrl} target="_blank" rel="noopener noreferrer">
                  {fetchingFiles ? <Spin /> : 'View Picture'}
                </a>
                <Dragger
                  accept=".jpg,.jpeg,.png"
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith("image/");
                    if (!isImage) {
                      message.error("You can only upload image files!");
                    }
                    return isImage ? handleFileUpload(file, 'profile_pic') : false;
                  }}
                  onChange={(info) => handleUploadChange(info, 'profile_pic')}
                  showUploadList={{ showRemoveIcon: true }}
                  maxCount={1}

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
                <a href={fileUrls.idProofUrl} target="_blank" rel="noopener noreferrer">
                  {fetchingFiles ? <Spin /> : 'View ID Proof'}
                </a>
                <Dragger
                  accept=".jpg,.jpeg,.png,.pdf"
                  beforeUpload={(file) => {
                    const isValidType =
                      file.type.startsWith("image/") || file.type === "application/pdf";
                    if (!isValidType) {
                      message.error("You can only upload image or PDF files!");
                    }
                    return isValidType ? handleFileUpload(file, 'id_proof') : false;
                  }}

                  onChange={(info) => handleUploadChange(info, 'id_proof')}
                  showUploadList={{ showRemoveIcon: true }}
                  maxCount={1}
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
                <a href={fileUrls.addressProofUrl} target="_blank" rel="noopener noreferrer">
                  {fetchingFiles ? <Spin /> : 'View Address Proof'}
                </a>
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

                  onChange={(info) => handleUploadChange(info, 'address_proof')}
                  showUploadList={{ showRemoveIcon: true }}
                  maxCount={1}
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
                <a href={fileUrls.pvUrl} target="_blank" rel="noopener noreferrer">
                  {fetchingFiles ? <Spin /> : 'View Police Verification'}
                </a>
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
                  maxCount={1}
                  onChange={(info) => handleUploadChange(info, 'police_verification')}
                  showUploadList={{ showRemoveIcon: true }}
                // multiple={false}
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
        </Form>
      ) : (
        <Spin />
      )}
    </Modal>
  );
};

export default EditStaffModal;
