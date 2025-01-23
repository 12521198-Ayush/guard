import Swal from 'sweetalert2';
import { Modal, Form, Input, Select, Button, ConfigProvider } from 'antd';


const { Option } = Select;

const NewTicketModal = ({ open, onClose, premiseId, sericeTypes, refetchLogs }: any) => {

    const [form] = Form.useForm();
    
    const handleSubmit = async (values: any) => {
        
        const requestData = {
            premise_id: premiseId,
            premise_unit_id: values.premise_unit_id,
            service_type: values.service_type,
            service_priority: values.service_priority,
            problem_description: values.problem_description,         
        };

        const result = await Swal.fire({
            title: 'Confirm Submission',
            text: 'Are you sure you want to create this ticket?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, create!',
        });

        if (result.isConfirmed) {
            try {

                console.log("Ticket Details:", requestData);
                
                /*
                // var URL = ConfigURL.baseURL + 'service/society/order';
                const response = await fetch('http://139.84.166.124:8060/user-service/admin/resident/create', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await response.json();
                */


                Swal.fire({
                    title: 'Success!',
                    text: 'Ticket created successfully.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });

                form.resetFields();
                refetchLogs();
                onClose();
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: `Failed to Create Ticket: ${error}`,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });
            }
        }
    };
    
    return (
        <ConfigProvider
            theme={{
                components: {
                    Modal: {
                        wireframe: true,
                        headerBg: '#1a1633',
                        colorIcon: 'rgba(255, 255, 255, 0.88)',
                        titleColor: 'rgba(255, 255, 255, 0.88)',
                        colorIconHover: 'rgba(255, 255, 255, 0.57)',
                    },
                }
            }}
        >
            <Modal
                title="Create New Ticket"
                open={open}
                onCancel={onClose}
                footer={null}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
                    className='mt-0'
                >    
                    <Form.Item
                        name="service_type"
                        label="Service Type"
                        rules={[{ required: true, message: 'Please select service type!' }]}
                    >
                        <Select placeholder="Select Service Type">
                            {sericeTypes.map((sericeType: any) => (
                                <Option key={sericeType} value={sericeType}>
                                    {sericeType}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="service_priority"
                        label="Service Priority"
                        rules={[{ required: true, message: 'Please select service priority!' }]}
                    >
                        <Select placeholder="Select Service Priority">
                            <Option value="Normal">Normal</Option>
                            <Option value="Emergency">Emergency</Option>
                        </Select>
                    </Form.Item>                    
                    <Form.Item
                        name="problem_description"
                        label="Problem Description"
                        rules={[{ required: true, message: 'Please enter problem description!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="premise_unit_id"
                        label="Premise Unit Id"
                        rules={[{ required: true, message: 'Please enter premise unit id!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="primary"
                                key="submit"
                                htmlType="submit"
                                style={{
                                    marginLeft: '8px',
                                    borderRadius: '4px',
                                    background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Gradient from green to dark green
                                    color: 'white',
                                    padding: '6px 16px',
                                    border: 'none',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                key="cancel"
                                onClick={onClose}
                                style={{
                                    borderRadius: '4px',
                                    background: 'linear-gradient(90deg, #f44336, #e57373)', // Gradient from dark red to light red
                                    color: 'white',
                                    padding: '6px 16px',
                                    marginLeft: '8px',
                                    border: 'none',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; // Slight scale on hover
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Shadow effect
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default NewTicketModal;
