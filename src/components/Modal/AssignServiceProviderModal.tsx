import dayjs from 'dayjs';
import Swal from 'sweetalert2';
//import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, ConfigProvider, Rate } from 'antd';


const { Option } = Select;

const AssignServiceProviderModal = ({ open, onClose, premiseId, ticketDetails, serviceProviders, refetchLogs }: any) => {

    const [form] = Form.useForm();
    //const [selectedServiceProvider, setSelectedServiceProvider] = useState(null);
    
    const handleAssignment = async (values: any) => {

        let serviceProvider = values.service_provider;
        if (!serviceProvider) {
            Swal.fire({
                title: 'Error!',
                text: `Error: Service provider not selected.`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
            return;
        }

        let sp = null;
        try{
            sp = JSON.parse(serviceProvider);
            const requestData = {
                premise_id: premiseId,
                order_id: ticketDetails.order_id,
                service_type: ticketDetails.servicetype,
                status_to_update: 'picked',
                customer_mobile: ticketDetails.customer_mobile,
                premise_unit_id: ticketDetails.premise_unit_id,
                updated_by: sp.mobile,
                updated_by_name: sp.firstname + ' ' + sp.lastname,
            };

            const result = await Swal.fire({
                title: 'Confirm Change',
                text: 'Are you sure you want to assign service provider?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#007bff',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, update!',
            });

            if (result.isConfirmed) {
                try {
                    console.log("Assign service provider details:", requestData);
                    
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
                    
                    await response.json();
                    */
                    
                    Swal.fire({
                        title: 'Success!',
                        text: 'Service Provider assigned to the ticket.',
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
                        text: 'Could not assign service provider.',
                        icon: 'error',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });
                }
            }
        }
        catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Error selecting service provider.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
            });
        }
    };

    const customerNameHelper = (serviceProvider: any) => {
        return `${serviceProvider?.firstname ?? ""} ${serviceProvider?.lastname ?? "Unkown"} - ${serviceProvider?.mobile ?? "Unknown"}`;
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
                title= {`Assign Service Provider - ${ticketDetails.servicetype}`} 
                open={open}
                onCancel={onClose}
                footer={null}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleAssignment}
                    className='mt-0 p-0'
                >
                    <div className="flex flex-wrap justify-start">
                        <p>Available Service Providers</p>
                    </div>
                    
                    <>
                        <Form.Item
                            name="service_provider"
                            rules={[{ required: true, message: 'Please select service provider!' }]}
                            className='p-0 mt-3 w-full'
                        >
                            <Select 
                                placeholder="Choose Service Provider" 
                                allowClear
                                showSearch
                                /*
                                value={customerNameHelper(selectedServiceProvider)} 
                                onChange={(_, selectedSP:any) => 
                                    {
                                        if (selectedSP && selectedSP.customValue) {                                    
                                            console.log("selectedSP", selectedSP.customValue);
                                            form.setFieldValue("service_provider", selectedSP.customValue);
                                            setSelectedServiceProvider(selectedSP.customValue);
                                        }
                                    }
                                }
                                */
                            >
                                {serviceProviders.map((serviceProvider: any) => (
                                    <Option key={serviceProvider.mobile} 
                                    value={JSON.stringify(serviceProvider)}
                                    //value={serviceProvider.mobile} customValue={serviceProvider}
                                    >
                                        {customerNameHelper(serviceProvider)}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>   

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
                                    Assign
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
                        
                    </>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default AssignServiceProviderModal;
