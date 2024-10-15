import { Form, Row, Col, Input, Button } from 'antd';

const ConnectionsForm = ({ form, handlePrev, handleNext, editMode }: any) => {
  return (
    <Form
                form={form}
                layout="vertical"
                onFinish={handleNext}
                disabled={true}

            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Water Meter ID"
                            name="water_meter_id"
                        >
                            <Input placeholder="Water Meter ID" disabled={!editMode} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Electricity Meter Vendor"
                            name="electricity_meter_vendor"
                            rules={[{ required: true, message: 'Please enter electricity meter vendor' }]}
                        >
                            <Input placeholder="Electricity Meter Vendor" disabled={!editMode} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Electricity Meter ID"
                            name="electricity_meter_id"
                        >
                            <Input placeholder="Electricity Meter ID" disabled={!editMode} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Gas Connection ID"
                            name="gas_connection_id"
                        >
                            <Input placeholder="Gas Connection ID" disabled={!editMode} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Direct Sanction Load"
                            name="direct_sanction_load"
                        >
                            <Input placeholder="Direct Sanction Load" disabled={!editMode} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="DG Sanction Load"
                            name="dg_sanction_load"
                        >
                            <Input placeholder="DG Sanction Load" disabled={!editMode} />
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
                            disabled={false}
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
                            disabled={false}

                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    </div>
                </Form.Item>
                {/* <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            backgroundColor: editMode ? 'green' : '#d3d3d3', // Green when editable, gray when disabled
                            color: 'white',
                        }}
                        disabled={!editMode}
                        loading={loading}
                    >
                        Submit
                    </Button>

                    <Button
                        style={{
                            backgroundColor: '#808080', // Neutral gray color for reset
                            color: 'white',
                            marginLeft: '8px',
                        }}
                        onClick={handleReset}
                        disabled={!editMode}
                    >
                        Reset
                    </Button>

                    <Button
                        style={{
                            backgroundColor: editMode ? 'red' : 'blue', // Red for cancel, blue for edit
                            color: 'white',
                            marginLeft: '8px',
                        }}
                        onClick={toggleEditMode}
                    >
                        {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                </Form.Item> */}
            </Form>
  );
};

export default ConnectionsForm;
