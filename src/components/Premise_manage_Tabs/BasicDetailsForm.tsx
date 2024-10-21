import { Form, Row, Col, Input, Select, Button } from 'antd';

const BasicDetailsForm = ({ form, handleNext, editMode, session, toggleEditMode }: any) => {
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleNext}
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
                    <Button
                        style={{
                            backgroundColor: editMode ? 'white' : '#597ef7',
                            color: editMode ? 'black' : 'white',
                            marginLeft: '8px',
                        }}
                        onClick={toggleEditMode}
                    >
                        {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                </div>

            </Form.Item>
        </Form>
    );
};

export default BasicDetailsForm;
