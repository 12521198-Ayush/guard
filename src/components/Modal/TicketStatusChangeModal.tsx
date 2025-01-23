import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { Modal, Form, Input, Select, Button, DatePicker, Rate, ConfigProvider } from 'antd';


const { Option } = Select;
const ratingDescription = ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful'];

const getDisplayStatus = function(status: String) {
    if (status === 'order_initiate') return "Request Raised";
    if (status === 'picked') return "Assigned";
    if (status === 'temporarily_parked') return "Parked by Service Provider";
    if (status === 'cancelled_by_customer') return "Cancelled By Customer";
    if (status === 'pending') return "Pending";
    if (status === 'complete') return "Closed";
    if (status === 'complete_without_otp') return "Closed";
    if (status === 'customer_not_available') return "Customer Not Available";
    if (status === 'door_locked') return "Door Locked";
    return "Unknown";
};

const parkReasonList: any[] = [
    { value: 'Staff - Staff is busy in emergency work', displayValue: 'Staff - Staff is busy in emergency work' },
    { value: 'Staff - Concerned staff is not available', displayValue: 'Staff - Concerned staff is not available' },
    { value: 'Third Party - Delay due to expert opinion', displayValue: 'Third Party - Delay due to expert opinion' },
    { value: 'Third Party - Delay due to Business Partner End', displayValue: 'Third Party - Delay due to Business Partner End' },
    { value: 'Material - Pending due to material not available in the project', displayValue: 'Material - Pending due to material not available in the project' },
    { value: 'Material - Pending due to delay in supply of material by resident', displayValue: 'Material - Pending due to delay in supply of material by resident' },
    { value: 'Others - Work is done but under observation', displayValue: 'Others - Work is done but under observation' },
    { value: 'Others - Seepage work attended, waiting for dry', displayValue: 'Others - Seepage work attended, waiting for dry' },
    { value: 'Others - Discussion is pending with Station Head end', displayValue: 'Others - Discussion is pending with Station Head end' },
    { value: 'Others - Discussion is pending with resident about observation', displayValue: 'Others - Discussion is pending with resident about observation' }
];

const TicketStatusChangeModal = ({ open, onClose, premiseId, ticketDetails, newStatus, refetchLogs }: any) => {

    const [form] = Form.useForm();
    
    const handleSubmit = async (values: any) => {

        let comment = "";
        let compWithoutOtp = 0;
        let newTicketStatus = newStatus;

        let spName = values.sp_name;
        let closureOtp = values.closure_otp;
        let closureComment = values.closure_reason;
        let residentRating = values.customer_rating;
        let residentFeedback = values.optional_comment;
        let expClosureDate = values.exp_closure_date && dayjs(values.exp_closure_date).format('DD-MM-YYYY');;
        let reasonComment = values.status_change_reason;
        let vendorStatusChangeReason = values.vendor_status_change_reason;

        if (ticketDetails && !ticketDetails.updated_by) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Service provider not assigned to this ticket`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        // Status change checks
        if ( !(newTicketStatus == "temporarily_parked" || newTicketStatus == "complete_without_otp" || newTicketStatus == "complete") && !reasonComment) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Please enter reason for status change`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        // Park related checks
        if ( newTicketStatus === "temporarily_parked" && !vendorStatusChangeReason) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Please enter reason for parking the request`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        if ( newTicketStatus === "temporarily_parked" && !expClosureDate) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Please enter expected closure date`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        // Closure related checks
        if(newTicketStatus === 'complete_without_otp'){
            compWithoutOtp = 1;
            closureOtp = '9876543210';
            newTicketStatus = 'complete';
        }

        if (newTicketStatus === 'complete' && !closureOtp) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Closure otp not entered`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        if ( (newTicketStatus == "complete_without_otp" || newTicketStatus == "complete") && !closureComment) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Please enter reason for closure`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        if (newTicketStatus === 'complete' && closureOtp) {
            if (ticketDetails.closure_otp === closureOtp || closureOtp == '9876543210') {
                if(closureOtp == '9876543210'){
                    compWithoutOtp = 1;
                }
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: `Error: Incorrect Otp provided`,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });
                return;
            }
        }

        if (!residentRating && newTicketStatus === 'complete') {
            Swal.fire({
                title: 'Error!',
                text: `Error: Resident rating not provided`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        if (residentRating && newTicketStatus === 'complete' && !spName) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Please enter service provider name`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        if ( !(newTicketStatus == "temporarily_parked" || newTicketStatus == "complete_without_otp" || newTicketStatus == "complete") ) {
            comment = reasonComment;
        }

        if ( newTicketStatus === "temporarily_parked" ) {
            comment = vendorStatusChangeReason + ". Expected Closure Date: " + expClosureDate;
        }

        if ( newTicketStatus == "complete_without_otp" || newTicketStatus == "complete" ) {
            comment = closureComment;
        }
    
        const requestData = {
            premise_id: premiseId,
            order_id: ticketDetails.order_id,
            premise_unit_id: ticketDetails.premise_unit_id,
            service_type: ticketDetails.service_type,
            
            customer_mobile: ticketDetails.customer_mobile,
            status_to_update: newTicketStatus,
            updated_by: ticketDetails.updated_by,
            updated_by_name: ticketDetails.updated_by_name,

            comment: comment,
            expected_closure_date: expClosureDate,
            complete_without_otp: compWithoutOtp,

            sp_name: spName,
            resident_rating: residentRating,
            resident_feedback: residentFeedback
        };

        const result = await Swal.fire({
            title: 'Confirm Change',
            text: 'Are you sure you want to change the status?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update!',
        });

        if (result.isConfirmed) {
            try {

                console.log("Status Update Details:", requestData);
                
                /*
                // var URL = ConfigURL.baseURL + 'service/society/status/update';
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

                844 85 88 528 - IGL Control Number Paschim Vihar

                await response.json();
                */

                Swal.fire({
                    title: 'Success!',
                    text: 'Status changed successfully.',
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
                    text: `Failed to change status: ${error}`,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    form.resetFields();
    
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
                title="Status Change Confirmation"
                open={open}
                onCancel={onClose}
                footer={null}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
                    className='mt-0 p-0'
                >
                    <div className="flex flex-wrap justify-start">
                        <p>Are you sure you want to change ticket status to <b>{getDisplayStatus(newStatus)}</b> ?</p>
                    </div>
                    { !(newStatus == "temporarily_parked" || newStatus == "complete_without_otp" || newStatus == "complete") && 
                    <Form.Item
                        name="status_change_reason"
                        rules={[{ required: true, message: 'Please enter reason for status change!' }]}
                        className='p-0 mt-3 w-full'
                    >
                        <Input placeholder="Enter reason for status change" allowClear />
                    </Form.Item>
                    }

                    {/* Reason when vendor canceled */}
                    { (newStatus == "temporarily_parked" ) && 
                    <>
                        <Form.Item
                            name="vendor_status_change_reason"
                            rules={[{ required: true, message: 'Please enter reason for status change!' }]}
                            className='p-0 mt-3 w-full'
                        >
                            <Select placeholder="Choose Reason" allowClear>
                                {parkReasonList.map((parkedReason) => (
                                    <Option key={parkedReason.displayValue} value={parkedReason.value}>
                                        {parkedReason.displayValue}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>     
                        <Form.Item 
                            name="exp_closure_date" 
                            className='p-0 m-0 w-full'
                            rules={[{ required: true, message: 'Please enter expected closure date!' }]}
                        >
                            <DatePicker
                                placeholder="Expected Closure Date"
                                format="YYYY-MM-DD"
                                className="w-full"
                            />
                        </Form.Item>
                    </>
                    }

                    {/* Ticket closed */}
                    { (newStatus == "complete_without_otp" || newStatus == "complete") &&  
                    <>
                        <Form.Item
                            name="closure_otp"
                            className='p-0 mt-3 w-full'
                        >
                            <Input placeholder="Enter Closure OTP" allowClear />
                        </Form.Item>

                        <Form.Item
                            name="closure_reason"
                            rules={[{ required: true, message: 'Please enter reason for status change!' }]}
                            className='p-0 mt-3 w-full'
                        >
                            <Input placeholder="Reason for the status change" allowClear />
                        </Form.Item>

                        <div className="my-6 rounded-lg border grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-0">
                            <div className="p-3 w-full rounded-t-md border-b-2 bg-[#112040] flex gap-2 items-left text-bodydark1 ">   
                                <p className="text-left text-title font-bold dark:text-white">
                                    Resident Feedback Form
                                </p>
                            </div>
                            <div className="m-3">
                                <div className="flex flex-wrap justify-start">
                                    <p>Please rate the resident behavior</p>
                                </div>
                                <Form.Item
                                    name="customer_rating"
                                    className='p-0 w-full'
                                    rules={[{ required: true, message: 'Please provide rating!' }]}
                                >
                                    <Rate tooltips={ratingDescription} allowHalf allowClear className='p-0 mt-2 w-full' />
                                </Form.Item>
                                <Form.Item
                                    name="optional_comment"
                                    className='p-0 mt-3 w-full'
                                >
                                    <Input placeholder="Other Comments (optional)" allowClear />
                                </Form.Item>
                                <Form.Item
                                    name="sp_name"
                                    className='p-0 mt-3 w-full'
                                    rules={[{ required: true, message: 'Please enter service provider name!' }]}
                                >
                                    <Input placeholder="Service Provider Name" allowClear />
                                </Form.Item>
                            </div>
                        </div>
                    </>
                    }
                    
                    {/* Button to save or cancel */}
                    <Form.Item>
                        <div className="flex flex-wrap mt-3 justify-end">
                            <Button
                                type="primary"
                                key="submit"
                                htmlType="submit"
                                style={{
                                    marginLeft: '8px',
                                    borderRadius: '4px',
                                    background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Gradient from green to dark green
                                    color: 'white',
                                    // padding: '6px 16px',
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

export default TicketStatusChangeModal;
