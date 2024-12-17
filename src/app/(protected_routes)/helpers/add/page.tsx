'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Row, Col, message } from 'antd';
import axios from 'axios';
import { useSession } from 'next-auth/react';

type SubPremise = {
  subpremise_id: string;
  subpremise_name: string;
};

const HelperCreationForm = () => {
  const { data: session } = useSession();
  const [skills, setSkills] = useState<string[]>([]); // Ensure skills is an array
  const [loading, setLoading] = useState(false);

  const user = session?.user || {};
  const premiseId = session?.user.primary_premise_id;
  const subPremiseArray: SubPremise[] = (session?.user.subpremiseArray || []).map((sub) => {
    if (typeof sub === 'string') {
      return {
        subpremise_id: sub, // Assuming the string is the ID
        subpremise_name: sub, // Use the string as the name, or replace with logic
      };
    }
    return sub;
  });

  const [form] = Form.useForm();

  // Fetch skills from the API
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

  // Handle form submission
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
        picture_obj: '-',
        id_proof_obj: '-',
        address_proof_obj: '-',
        pv_obj: '-',
      };

      await axios.post('http://139.84.166.124:8060/staff-service/create', payload, {
        headers: { Authorization: `Bearer ${session?.user.accessToken}` },
      });

      message.success('Helper created successfully.');
      form.resetFields();
    } catch (error) {
      message.error('Failed to create helper.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default HelperCreationForm;
