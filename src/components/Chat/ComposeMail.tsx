'use client'

import React, { useState } from 'react';
import { Form, Input, Button, message, Upload, Select, Col, Row } from 'antd';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const toolbarOptions: any = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image', 'video', 'formula'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    ['clean']                                         // remove formatting button
];

const predefinedTemplates = [
    {
        label: 'Welcome Email',
        subject: 'Welcome to Our Service!',
        message: 'Dear [Name],<br/><br/>Thank you for joining our service. We’re excited to have you on board!',
    },
    {
        label: 'Reminder Email',
        subject: 'Reminder: Upcoming Appointment',
        message: 'Dear [Name],<br/><br/>This is a reminder for your appointment scheduled on [Date].',
    },
    {
        label: 'Thank You Email',
        subject: 'Thank You for Your Support!',
        message: 'Dear [Name],<br/><br/>We sincerely appreciate your support and look forward to serving you again.',
    },
];

const recipientGroups = [
    { label: 'Admin', emails: ['admin@example.com'] },
    { label: 'Support', emails: ['support@example.com'] },
    { label: 'Custom', emails: [] },
];

const ComposeMail: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [recipients, setRecipients] = useState<string[]>([]);
    const [form] = Form.useForm();

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

    const handleSendMail = (values: { recipient: string; subject: string }) => {
        if (!messageContent.trim()) {
            message.error('Please enter your message.');
            return;
        }

        setLoading(true);
        const mailDetails = { ...values, message: messageContent };

        // Mock API call
        setTimeout(() => {
            setLoading(false);
            message.success('Mail sent successfully!');
            console.log('Mail Details:', mailDetails);
        }, 1000);
    };

    const handleFailed = (errorInfo: any) => {
        message.error('Please complete all required fields.');
        console.error('Form Validation Error:', errorInfo);
    };

    const handleTemplateChange = (templateIndex: number) => {
        const template = predefinedTemplates[templateIndex];
        if (template) {
            form.setFieldsValue({ subject: template.subject });
            setMessageContent(template.message);
        }
    };

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSendMail}
                onFinishFailed={handleFailed}
                initialValues={{ recipient: '', subject: '' }}
            >
                <Form.Item label="To" rules={[{ required: true, message: 'Please enter a mail.' }]}>
                    <Row gutter={16}>
                        {/* Recipient Group Dropdown */}
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

                        {/* Custom Email Input */}
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
                    <Input placeholder="Subject" className="border-gray-300 rounded-md" />
                </Form.Item>

                <Form.Item label="Templates">
                    <Select
                        placeholder="Select a template"
                        onChange={handleTemplateChange}
                    >
                        {predefinedTemplates.map((template, index) => (
                            <Select.Option key={index} value={index}>
                                {template.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Message Body Field */}
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
                <Form.Item>
                    <Upload.Dragger
                        listType="picture"
                        showUploadList={{ showRemoveIcon: true }}
                        accept=".png,.jpeg"
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

                {/* Send Button */}
                <Form.Item>
                    <Button
                        htmlType="submit"
                        loading={loading}
                        className="ml-auto"
                        style={{
                            background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
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
                        Send Mail
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ComposeMail;
