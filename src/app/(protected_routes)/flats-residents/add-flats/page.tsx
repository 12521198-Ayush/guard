'use client'
import { Form, Input, Button, Checkbox, message, Select, Row, Col, Tabs } from 'antd';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";

const MyForm = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState('1');
  const [loading, setLoading] = useState(false);


  const handleNext = () => {
    const nextKey = (parseInt(activeKey, 10) + 1).toString();
    setActiveKey(nextKey);
  };
  const handlePrev = () => {
    const nextKey = (parseInt(activeKey, 10) - 1).toString();
    setActiveKey(nextKey);
  };

  function transformBooleans(obj: Record<string, any>): Record<string, any> {
    const transformedObject: Record<string, any> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] === true) {
          transformedObject[key] = 'yes';
        } else if (obj[key] === false) {
          transformedObject[key] = 'no';
        } else if (obj[key] === undefined) {
          transformedObject[key] = '';
        } else {
          transformedObject[key] = obj[key];
        }
      }
    }
    console.log(transformedObject);

    return transformedObject;
  }

  const handleFinish = async (values: any) => {

    // Your SweetAlert2 configuration
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!"
    }).then((result) => {
      apiFetch(values);
    });

  };

  const apiFetch = async (values: any) => {
    const updatedvalues = transformBooleans(values);
    const premiseId = session?.user?.primary_premise_id || '';
    const mandate = {
      premise_id: premiseId,
    }
    const accessToken = session?.user?.accessToken || undefined;
    const payload = { ...mandate, ...updatedvalues }
    try {

      const response = await axios.post('/api/premise_unit/upsert', payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data.data;
      console.log(data)
      console.log("records updated");
      Swal.fire({
        title: "Saved!",
        text: "",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'bg-blue-500'
        },
        confirmButtonColor: '#007bff', // Blue color
      });
      router.push('/flats-residents/manage-flats')

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
    console.log('Form Values:', payload);
  }



  const items = [
    {
      label: 'Basic',
      key: '1',
      children: (
        <Form form={form}
          layout="vertical"
          onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Sub-premise"
                name="sub_premise_id"
                rules={[
                  { required: true, message: 'Please select a sub-premise' },
                  { validator: (_, value) => value !== "none" ? Promise.resolve() : Promise.reject(new Error('None is not a valid option.')) }
                ]}
              >
                <Select placeholder="Select Sub-premise">
                  <Select.Option value="none">None</Select.Option>
                  {session?.user?.subpremiseArray?.map((subpremise: any) => (
                    <Select.Option key={subpremise.subpremise_id} value={subpremise.subpremise_id}>
                      {subpremise.subpremise_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Unit ID"
                name="id"
                rules={[{ required: true, message: 'Please enter the Unit ID' }]}
              >
                <Input placeholder="Unit ID" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Size"
                name="size"
              >
                <Input placeholder="Size" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Occupancy Status"
                name="occupancy_status"
                rules={[
                  { required: true, message: 'Please select occupancy status' },
                  { validator: (_, value) => value !== "none" ? Promise.resolve() : Promise.reject(new Error('None is not a valid option.')) }
                ]}
              >
                <Select placeholder="Select Occupancy Status">
                  <Select.Option value="none">None</Select.Option> {/* None option added */}
                  <Select.Option value="Tenant">Tenant</Select.Option>
                  <Select.Option value="Owner">Owner</Select.Option>
                  <Select.Option value="Vacant">Vacant</Select.Option>
                  <Select.Option value="Locked">Locked</Select.Option>
                  <Select.Option value="Blocked">Blocked</Select.Option>
                </Select>
              </Form.Item>

            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Extension No."
                name="extension_no"
              >
                <Input placeholder="Extension No." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Direct Dial"
                name="direct_dial"
              >
                <Input placeholder="Direct Dial" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="2W Parking Count"
                name="tw_parking_count"
              >
                <Input placeholder="2W Parking Count" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="4W Parking Count"
                name="fw_parking_count"
              >
                <Input placeholder="4W Parking Count" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              
              <Button
                style={{
                  marginRight: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                }}
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      label: 'Connection',
      key: '2',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Water Meter ID"
                name="water_meter_id"
              >
                <Input placeholder="Water Meter ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Electricity Meter Vendor"
                name="electricity_meter_vendor"
                rules={[{ required: true, message: 'Please enter electricity meter vendor' }]}
              >
                <Input placeholder="Electricity Meter Vendor" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Electricity Meter ID"
                name="electricity_meter_id"
              >
                <Input placeholder="Electricity Meter ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Gas Connection ID"
                name="gas_connection_id"
              >
                <Input placeholder="Gas Connection ID" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Direct Sanction Load"
                name="direct_sanction_load"
              >
                <Input placeholder="Direct Sanction Load" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="DG Sanction Load"
                name="dg_sanction_load"
              >
                <Input placeholder="DG Sanction Load" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button
                style={{
                  marginRight: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                }}
                onClick={handlePrev}
              >
                Previous
              </Button>
              <Button
                style={{
                  marginRight: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                }}
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      label: 'Guardians',
      key: '3',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ownership Type"
                name="ownership_type"
                rules={[{ required: true, message: 'Please select an ownership type' }]}
              >
                <Select placeholder="Select Ownership Type">
                  <Select.Option value="Joint">Joint</Select.Option>
                  <Select.Option value="Single">Single</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Size"
                name="size"
                rules={[{ required: true, message: 'Please enter the size' }]}
              >
                <Input placeholder="Size" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Extension No."
                name="extension_no"
              >
                <Input placeholder="Extension No." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Direct Dial"
                name="direct_dial_landline"
              >
                <Input placeholder="Direct Dial" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button
                style={{
                  marginRight: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                }}
                onClick={handlePrev}
              >
                Previous
              </Button>
              <Button
                style={{
                  marginRight: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                }}
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      label: 'Preferences',
      key: '4',
      children: (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', backgroundColor: '#f9f9f9' }}>
          {/* <h3 style={{ fontSize: '18px', margin: '0 0 16px', fontWeight: '600', color: '#333' }}>Notifications</h3> */}
  
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={6}>
              <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Notification Type</h4>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="maid_notification" valuePropName="checked">
                <Checkbox style={{ fontSize: '14px', color: '#333' }}>Maid Notifications</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="vehicle_notification" valuePropName="checked">
                <Checkbox style={{ fontSize: '14px', color: '#333' }}>Vehicle Notifications</Checkbox>
              </Form.Item>
            </Col>
          </Row>
  
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={6}>
              <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Services</h4>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="email_notification" valuePropName="checked">
                <Checkbox style={{ fontSize: '14px', color: '#333' }}>Email Notifications</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="wa_notification" valuePropName="checked">
                <Checkbox style={{ fontSize: '14px', color: '#333' }}>WhatsApp Notifications</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="sms_notification" valuePropName="checked">
                <Checkbox style={{ fontSize: '14px', color: '#333' }}>SMS Notifications</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </div>
  
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            return (
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', marginTop: '16px', backgroundColor: '#f9f9f9' }}>
                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={6}>
                    <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Visitors</h4>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item name="pre_invite" valuePropName="checked">
                      <Checkbox style={{ fontSize: '14px', color: '#333' }}>Pre Invite</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
  
                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={6}>
                    <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Mode</h4>
                  </Col>
                  <Col xs={24} sm={4}>
                    <Form.Item name="vms_voip" valuePropName="checked">
                      <Checkbox style={{ fontSize: '14px', color: '#333' }}>VOIP</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={4}>
                    <Form.Item name="vms_ivrs" valuePropName="checked">
                      <Checkbox style={{ fontSize: '14px', color: '#333' }}>IVRS</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={4}>
                    <Form.Item name="vms_manual" valuePropName="checked">
                      <Checkbox style={{ fontSize: '14px', color: '#333' }}>Manual</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            );
          }}
        </Form.Item>
  
        <Form.Item>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', marginTop: '16px', backgroundColor: '#f9f9f9' }}>
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={6}>
                <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Other</h4>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item name="service_centre" valuePropName="checked">
                  <Checkbox style={{ fontSize: '14px', color: '#333' }}>Service Center</Checkbox>
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item name="billing" valuePropName="checked">
                  <Checkbox style={{ fontSize: '14px', color: '#333' }}>Billing</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form.Item>
  
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button
              style={{
                marginRight: '8px',
                borderRadius: '4px',
                backgroundColor: '#e0e0e0',
                color: '#333',
                border: 'none',
              }}
              onClick={handlePrev}
            >
              Previous
            </Button>
  
            <Button
              style={{
                borderRadius: '4px',
                backgroundColor: '#4CAF50',
                color: 'white',
              }}
              htmlType="submit"
            >
              Submit
            </Button>
          </div>
        </Form.Item>
      </Form>
      ),
    },
  ]
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h4 className="font-medium text-xl text-black dark:text-white">
          Add Premise Unit
        </h4>


        <div style={{ padding: '20px' }}>
          <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={setActiveKey} size="large" items={items} />
        </div>
      </div>
    </div>
  );
};

export default MyForm;
