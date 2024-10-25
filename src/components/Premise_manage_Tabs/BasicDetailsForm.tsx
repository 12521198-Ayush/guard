import { Form, Row, Col, Input, Select, Button } from 'antd';
import GradientButton from '../Buttons/GradientButton';

const BasicDetailsForm = ({ form, handleNext,handleFinish, editMode, session, toggleEditMode }: any) => {
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
        >
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
                        <Select placeholder="Select Sub-premise" disabled={true}>
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
                        name="unit_id"
                        rules={[{ required: true, message: 'Please enter the Unit ID' }]}
                    >
                        <Input placeholder="Unit ID" disabled={!editMode} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Size" name="size">
                        <Input placeholder="Size" disabled={!editMode} />
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
                        <Select placeholder="Select Occupancy Status" disabled={!editMode}>
                            <Select.Option value="none">None</Select.Option>
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
                    <Form.Item label="Extension No." name="extension_no">
                        <Input placeholder="Extension No." disabled={!editMode} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Direct Dial" name="direct_dial">
                        <Input placeholder="Direct Dial" disabled={!editMode} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="2W Parking Count" name="tw_parking_count">
                        <Input placeholder="2W Parking Count" disabled={!editMode} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="4W Parking Count" name="fw_parking_count">
                        <Input placeholder="4W Parking Count" disabled={!editMode} />
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
                    >
                        {editMode ? 'Cancel' : '  Edit  '}
                    </Button>
                </div>

            </Form.Item>
        </Form>
    );
};

export default BasicDetailsForm;
