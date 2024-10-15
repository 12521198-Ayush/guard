import { Form, Row, Col, Checkbox, Button } from 'antd';

const PreferencesTab = ({
    form,
    handlePrev,
    handleFinish,
    editMode,
}: any) => {
    return (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', backgroundColor: '#f9f9f9' }}>
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={6}>
                        <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Notification Type</h4>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item name="maid_notification" valuePropName="checked">
                            <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                Maid Notifications
                            </Checkbox>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item name="vehicle_notification" valuePropName="checked">
                            <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                Vehicle Notifications
                            </Checkbox>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={6}>
                        <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Services</h4>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item name="email_notification" valuePropName="checked">
                            <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                Email Notifications
                            </Checkbox>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item name="wa_notification" valuePropName="checked">
                            <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                WhatsApp Notifications
                            </Checkbox>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item name="sms_notification" valuePropName="checked">
                            <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                SMS Notifications
                            </Checkbox>
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
                                        <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                            Pre Invite
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[8, 8]}>
                                <Col xs={24} sm={6}>
                                    <h4 style={{ fontSize: '16px', margin: '0', color: '#555' }}>Mode</h4>
                                </Col>
                                <Col xs={24} sm={4}>
                                    <Form.Item name="vms_voip" valuePropName="checked">
                                        <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                            VOIP
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={4}>
                                    <Form.Item name="vms_ivrs" valuePropName="checked">
                                        <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                            IVRS
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={4}>
                                    <Form.Item name="vms_manual" valuePropName="checked">
                                        <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                            Manual
                                        </Checkbox>
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
                                <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                    Service Center
                                </Checkbox>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item name="billing" valuePropName="checked">
                                <Checkbox style={{ fontSize: '14px', color: '#333' }} disabled={!editMode}>
                                    Billing
                                </Checkbox>
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
                        disabled={!editMode}
                        htmlType="submit"
                    >
                        Submit
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default PreferencesTab;
