import { Form, Row, Col, Input, Button } from 'antd';
import GradientButton from '../Buttons/GradientButton';

const ConnectionsForm = ({ form, handleFinish, handleNext, editMode, toggleEditMode }: any) => {
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
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
                    <div
                        style={{
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                            opacity: editMode ? 1 : 0,
                            transform: editMode ? 'translateX(0)' : 'translateX(20px)',
                            visibility: editMode ? 'visible' : 'hidden',
                            display: 'inline-block',
                            marginLeft: '8px',
                        }}
                    >
                        <GradientButton
                            text="Submit"
                            gradientColors={['#4e92ff', '#1e62d0']} // Blue gradient
                            disabled={!editMode}
                            htmlType="submit"
                        />


                    </div>

                    <Button
                        style={{
                            background: editMode
                                ? 'linear-gradient(90deg, #ff6f61, #d50032)' 
                                : 'linear-gradient(90deg, #4e92ff, #1e62d0)', 
                            color: editMode ? 'white' : 'white',
                            marginLeft: '8px',
                            border: 'none',
                            borderRadius: '4px', 
                            padding: '5px 12px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                        }}
                        onClick={toggleEditMode}
                        disabled={false}
                    >
                        {editMode ? 'Cancel' : '  Edit  '}
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
