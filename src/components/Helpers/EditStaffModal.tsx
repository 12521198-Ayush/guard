import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Spin, Row, Col } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import axios from 'axios';

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

  useEffect(() => {
    if (cardNumber) {
      fetchStaffDetails(cardNumber);
    }
  }, [cardNumber, premiseId]);

  // Fetch staff details based on the card number
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

      // Pre-fill form with the fetched data
      form.setFieldsValue({
        name: staffData.name,
        mobile: staffData.mobile,
        address: staffData.address,
        skill: staffData.skill,
        father_name: staffData.father_name,
      });

      // Fetch file URLs
      fetchFileUrls(staffData);
    } catch (error) {
      message.error('Failed to fetch staff details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch URLs for files (picture, ID proof, address proof, PV)
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

  return (
    <Modal
      title="Edit Staff Details"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" form="editForm" htmlType="submit" loading={loading}>
          Save
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
            console.log('Form Values:', values);
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
              <Form.Item name="skill" label="Skill">
                <Input />
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
          <Form.Item label="Picture" extra="Click to view">
            <a href={fileUrls.pictureUrl} target="_blank" rel="noopener noreferrer">
              {fetchingFiles ? <Spin /> : 'View Picture'}
            </a>
          </Form.Item>
          <Form.Item label="ID Proof" extra="Click to view">
            <a href={fileUrls.idProofUrl} target="_blank" rel="noopener noreferrer">
              {fetchingFiles ? <Spin /> : 'View ID Proof'}
            </a>
          </Form.Item>
          <Form.Item label="Address Proof" extra="Click to view">
            <a href={fileUrls.addressProofUrl} target="_blank" rel="noopener noreferrer">
              {fetchingFiles ? <Spin /> : 'View Address Proof'}
            </a>
          </Form.Item>
          <Form.Item label="PV URL" extra="Click to view">
            <a href={fileUrls.pvUrl} target="_blank" rel="noopener noreferrer">
              {fetchingFiles ? <Spin /> : 'View PV'}
            </a>
          </Form.Item>
        </Form>
      ) : (
        <Spin />
      )}
    </Modal>
  );
};

export default EditStaffModal;
