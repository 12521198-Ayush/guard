'use client'

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Upload, Select, Col, Row } from 'antd';
import dynamic from 'next/dynamic';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const recipientGroups = [
    { label: 'All Admins', emails: ['admin@example.com', 'admin@example.com', 'admin@example.com'] },
    { label: 'All Owners', emails: ['admin@example.com'] },
    { label: 'All Tenants', emails: ['admin@example.com'] },
    { label: 'All Residents', emails: ['admin@example.com'] },
    { label: 'Tower A', emails: ['admin@example.com'] },
    { label: 'Tower B', emails: ['admin@example.com'] },
    { label: 'Admin', emails: ['admin@example.com'] },
    { label: 'Support', emails: ['support@example.com'] },
    { label: 'Custom', emails: [] },
];

const ComposeMail: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [recipients, setRecipients] = useState<string[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchEmailTemplates();
    }, []);

    // fetch templates here
    const fetchEmailTemplates = async () => {
        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL+'/communication-service-producer/communication/email/template/read',
                { test: 'test' }
            );
            const templates = response.data.data || [];
            setEmailTemplates(templates);
        } catch (error) {
            message.error('Failed to fetch email templates.');
            console.error('Error fetching templates:', error);
        }
    };

    const handleRecipientsChange = (value: string[]) => {
        setRecipients(value);
    };

    const handleGroupSelect = (group: string) => {
        if (group === 'Custom') {
            setRecipients([]);
        } else {
            const selectedGroup = recipientGroups.find((g) => g.label === group);
            if (selectedGroup) {
                setRecipients(selectedGroup.emails);
            }
        }
    };

    // send mail function
    const handleSendMail = async (values: { subject: string }) => {
        if (!messageContent.trim()) {
            message.error('Please enter your message.');
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL+'/communication-service-producer/communication/email/send',
                {
                    recipient_email: recipients,
                    recipient_type: 'individual',
                    premise_id: null,
                    message: messageContent,
                    subject: values.subject,
                    object_id_attachment_array: [],
                }
            );
            message.success('Mail sent successfully!');
        } catch (error) {
            message.error('Failed to send email.');
            console.error('Error sending mail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateChange = (templateId: string) => {
        const template = emailTemplates.find((t) => t._id === templateId);
        if (template) {
            form.setFieldsValue({ subject: template.template_description });
            setMessageContent(template.template);
        }
    };

    const handleFailed = (errorInfo: any) => {
        message.error('Please complete all required fields.');
        console.error('Form Validation Error:', errorInfo);
    };

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSendMail}
                onFinishFailed={handleFailed}
                initialValues={{ subject: '' }}
            >
                {/* Recipient Selection */}
                <Form.Item label="To" rules={[{ required: true, message: 'Please enter a recipient.' }]}>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Select
                                placeholder="Select recipient group"
                                onSelect={handleGroupSelect}
                                style={{ marginBottom: '8px', width: '100%' }}
                            >
                                {recipientGroups.map((group) => (
                                    <Select.Option key={group.label} value={group.label}>
                                        {group.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Select
                                mode="tags"
                                placeholder="Enter email addresses"
                                value={recipients}
                                onChange={handleRecipientsChange}
                                tokenSeparators={[',']}
                                style={{ width: '100%' }}
                            />
                        </Col>
                    </Row>
                </Form.Item>

                {/* Subject Field */}
                <Form.Item
                    label="Mail Subject"
                    name="subject"
                    rules={[{ required: true, message: 'Please enter a subject.' }]}
                >
                    <Input placeholder="Subject" />
                </Form.Item>

                {/* Templates */}
                <Form.Item label="Templates">
                    <Select
                        placeholder="Select a template"
                        onChange={handleTemplateChange}
                        style={{ width: '100%' }}
                    >
                        {emailTemplates.map((template) => (
                            <Select.Option key={template._id} value={template._id}>
                                {template.template_description}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Message Body */}
                <Form.Item
                    label="Message"
                    rules={[{ required: true }]} // Validation handled separately
                >
                    <ReactQuill
                        value={messageContent}
                        onChange={setMessageContent}
                        placeholder="Write your message here..."
                        className="h-60"
                    />
                </Form.Item>

                <br />
                <br />
                <br />

                {/* Send Button */}
                <Form.Item>
                    <Button
                        // className='w-full'
                        htmlType="submit"
                        loading={loading}
                        style={{
                            background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
                            color: 'white',
                            border: 'none',
                            marginRight: '4px',
                            borderRadius: '4px',
                            padding: '5px 12px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                        }}
                    >
                        Send Mail
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ComposeMail;
