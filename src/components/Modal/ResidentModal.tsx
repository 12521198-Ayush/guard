import { Modal, Form, Input, Button, DatePicker, Select, Row, Col } from 'antd';
import { useEffect } from 'react';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';



const { Option } = Select;

const notificationOptions = [
    { value: 'email', label: 'Email' },
    { value: 'wa', label: 'WhatsApp' },
    { value: 'sms', label: 'SMS' },
    { value: 'maid', label: 'Maid' },
    { value: 'vehicle', label: 'Vehicle' },
];

const vmsOptions = [
    { value: 'voip', label: 'VMS VOIP' },
    { value: 'ivrs', label: 'VMS IVRS' },
    { value: 'manual', label: 'VMS Manual' },
];

const ResidentModal = ({ open, onClose, residentData, premiseId, subPremiseId, premiseUnitId, refetchResidents }: any) => {
    const [form] = Form.useForm();
    const { data: session } = useSession();

    let {
        mobile = ''
    } = residentData || {};

    let countryCode = mobile.slice(0, 5);
    countryCode = parseInt(countryCode, 10).toString();

    const mobileNumber = mobile.slice(5);
    const combinedMobile = `${countryCode}${mobileNumber}`;


    // console.log('Country Code:', mobile);
    // console.log('Mobile Number:', mobileNumber);

    useEffect(() => {
        if (residentData) {
            form.setFieldsValue({
                name: residentData.name,
                mobile: residentData.mobile,
                email: residentData.email,
                association_type: residentData.association_type,
                start_date: residentData.start_date ? moment(residentData.start_date) : null,
                end_date: residentData.end_date !== '-' ? moment(residentData.end_date) : null,
                notifications: notificationOptions.filter(option =>
                    residentData[`${option.value}_notification`] === 'yes'
                ).map(option => option.value),
                vms: vmsOptions.filter(option => residentData[`vms_${option.value}`] === 'yes').map(option => option.value),
            });
        }
    }, [residentData, form]);

    let updatedData = {}

    const handleOk = async () => {
        form.validateFields().then((values) => {
            interface NotificationObj {
                email_notification?: string;
                sms_notification?: string;
                wa_notification?: string;
                maid_notification?: string;
                vehicle_notification?: string;
            }

            interface VMSObj {
                vms_voip?: string;
                vms_ivrs?: string;
                vms_manual?: string;
            }

            const notificationObj: NotificationObj = ['email', 'sms', 'wa', 'maid', 'vehicle'].reduce((acc, option) => {
                acc[`${option}_notification` as keyof NotificationObj] = values.notifications.includes(option) ? 'yes' : 'no';
                return acc;
            }, {} as NotificationObj);

            const vmsObj: VMSObj = ['voip', 'ivrs', 'manual'].reduce((acc, option) => {
                acc[`vms_${option}` as keyof VMSObj] = values.vms.includes(option) ? 'yes' : 'no';
                return acc;
            }, {} as VMSObj);

            updatedData = {
                premise_id: premiseId,
                sub_premise_id: subPremiseId,
                premise_unit_id: premiseUnitId,
                mobile: values.mobile,
                name: values.name || '',
                email: values.email || '',
                is_active: 'yes',
                end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : "",
                association_type: values.association_type,
                ...notificationObj,
                ...vmsObj
            };
            handleUpdate();
            //console.log('Updated resident data:', updatedData);
        }).catch((errorInfo) => {
            console.error('Validation Failed:', errorInfo);
        });
    };


    const handleUpdate = async () => {

        const result = await Swal.fire({
            title: 'Confirm Submission',
            text: 'Are you sure you want to update this resident?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update!',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('http://139.84.166.124:8060/user-service/admin/resident/update/preferences_n_personal_dtls', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await response.json();

                Swal.fire({
                    title: 'Success!',
                    text: 'Resident Updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });

                form.resetFields();
                refetchResidents();
                onClose();
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: `Failed to update Resident: ${error}`,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (

        <Modal
            title="Edit Resident"
            open={open}
            width={900}
            footer={[
                <Button
                    type="primary"
                    key="submit"
                    onClick={handleOk}
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
                    Submit
                </Button>,
                <Button
                key="cancel"
                onClick={handleCancel}
                style={{
                    borderRadius: '4px',
                    background: 'linear-gradient(90deg, #f44336, #e57373)', // Gradient from dark red to light red
                    color: 'white',
                    padding: '6px 16px',
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

            ]}

        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter the name' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="mobile" rules={[{ required: true, message: 'Please enter your mobile number' }]}>
                            <br />
                            <br />
                            <PhoneInput
                                disabled
                                value={combinedMobile}
                                inputStyle={{ width: '100%' }}
                            // onChange={(value) => {
                            //     form.setFieldsValue({ mobile: value });
                            // }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please enter the email' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Association Type"
                            name="association_type"
                            rules={[{ required: true, message: 'Please select the association type' }]}
                        >
                            <Select placeholder="Select association type">
                                <Option value="Owner">Owner</Option>
                                <Option value="Tenant">Tenant</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Start Date" name="start_date">
                            <DatePicker style={{ width: '100%' }} disabled format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="End Date" name="end_date">
                            <DatePicker style={{ width: '100%' }} disabled format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Notifications"
                            name="notifications"
                        // rules={[{ required: true, message: 'Please select at least one notification method' }]}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Select notification methods"
                            >
                                {notificationOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Visitor Management" name="vms">
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Select VMS options"
                            >
                                {vmsOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ResidentModal;
