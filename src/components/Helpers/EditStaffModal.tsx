import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Spin, Row, Col, Upload, Select } from 'antd';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  cardNumber: number;
  premiseId: string;
  fetchHelpers: (currentPage: number, limit: number) => void;
  currentPage: any;
  limit: any;
}

const EditStaffModal: React.FC<ModalProps> = ({ visible, onClose, cardNumber, premiseId, fetchHelpers, currentPage, limit }) => {
  const [form] = Form.useForm();
  const [staffDetails, setStaffDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [skills, setSkills] = useState<string[]>([]);

  const [uploadedProfile, setUploadedProfile] = useState(null);
  const [uploadedID, setUploadedID] = useState(null);
  const [uploadedAddress, setUploadedAddress] = useState(null);
  const [uploadedPV, setUploadedPV] = useState(null);

  const [ProfilefileKey, setProfileFileKey] = useState('');
  const [IDfileKey, setIdFileKey] = useState('');
  const [AddressfileKey, setAddressFileKey] = useState('');
  const [PVfileKey, setPVFileKey] = useState('');

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
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
      );
      const staffData = response.data.data?.array[0];
      setStaffDetails(staffData);

      form.setFieldsValue({
        name: staffData.name,
        mobile: staffData.mobile,
        address: staffData.address,
        skill: staffData.skill,
        father_name: staffData.father_name,
      });
    } catch (error) {
      message.error('Failed to fetch staff details');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    // Construct the payload
    const payload: any = {
      premise_id: premiseId,
      card_no: cardNumber,
      name: values.name,
      address: values.address,
      skill: values.skill,
      mobile: values.mobile,
      father_name: values.father_name,
      picture_obj: ProfilefileKey,
      id_proof_obj: IDfileKey,
      address_proof_obj: AddressfileKey,
      pv_obj: PVfileKey,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null && value !== '')
    );

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update the helper details?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      console.log(filteredPayload);
      try {
        // Send the request to the API
        const response = await axios.post(
          'http://139.84.166.124:8060/staff-service/update',
          filteredPayload,
          { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
        );

        if (response.status === 201) {
          fetchHelpers(currentPage, limit);
          setUploadedProfile(null);
          setUploadedID(null);
          setUploadedAddress(null);
          setUploadedPV(null);
          setProfileFileKey('');
          setIdFileKey('');
          setAddressFileKey('');
          setPVFileKey('');
          onClose();
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
    setUploadedProfile(null);
    setUploadedID(null);
    setUploadedAddress(null);
    setUploadedPV(null);
    setProfileFileKey('');
    setIdFileKey('');
    setAddressFileKey('');
    setPVFileKey('');
    onClose();
  }


  return (
    <Modal
      title="Edit Helper Details"
      visible={visible}
      style={{zIndex: '10000'}}
      className='top-2 m-auto p-auto'
      onCancel={onExit}
      footer={[
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
      width={1200}
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Upload Profile"
                name="upload"
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
                    className="mx-auto"
                    src="https://img.icons8.com/?size=100&id=7820&format=png&color=000000"
                    alt="upload-to-cloud--v1"
                  />
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">Only images (JPG, PNG) are allowed</p>
                </Upload.Dragger>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Upload ID"
                name="upload"
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
        </Form>
      ) : (
        <Spin />
      )}
    </Modal>

  );
};

export default EditStaffModal;
