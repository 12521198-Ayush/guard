import React, { useState } from 'react';
import { Modal, Input, Button } from 'antd';
import Swal from 'sweetalert2';
import axios from 'axios';

interface NewPremiseTagHMProps {
    premise_id: string;
    modalData: any;
    isModalVisible: boolean;
    setIsModalVisible: any;
    session: any;
    fetchHelpers: (currentPage: number, limit: number) => void;
    currentPage: any;
    limit: any;
}

const NewPremiseTagHM: React.FC<NewPremiseTagHMProps> = ({ premise_id, modalData, isModalVisible, setIsModalVisible, session, fetchHelpers, currentPage, limit }) => {
    const [premiseUnitId, setPremiseUnitId] = useState('');

    // Handle the submit action (API call)
    const handleTag = async () => {
        const qr_code = modalData.qr_code;
        if (!modalData || !modalData.qr_code) {
            // Handle case where qr_code is not available
            Swal.fire('Error', 'QR code is missing or invalid', 'error');
            return;
        }

        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL+'/staff-service/tag/premise_unit',
                {
                    premise_id,
                    qr_code,
                    premise_unit_id: premiseUnitId,
                }, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            }
            );

            if (response.status === 201) {
                fetchHelpers(currentPage, limit);
                setPremiseUnitId('');
                Swal.fire({
                    title: 'Success',
                    text: 'Premise tagged successfully',
                    icon: 'success',
                    customClass: {
                        confirmButton: 'bg-blue-500 text-white hover:bg-blue-600',
                    },
                });
                setIsModalVisible(false); // Close the modal on success
            }
        } catch (error) {
            Swal.fire('Error', 'Something went wrong. Please try again', 'error');
        }
    };

    return (
        <Modal
            title="Tag Premise Unit"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Enter Premise Unit ID:</label>
                    <Input
                        value={premiseUnitId}
                        onChange={(e) => setPremiseUnitId(e.target.value)}
                        placeholder="Premise Unit ID"
                        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none "
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        type="primary"
                        onClick={handleTag}
                        disabled={!premiseUnitId}
                        style={{
                            marginBottom: '8px',
                            background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Blue gradient background
                            color: 'white', // White text color
                            border: 'none', // No border
                            borderRadius: '4px', // Rounded corners
                            padding: '8px 16px', // Padding for a more substantial look
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                            cursor: 'pointer', // Pointer cursor on hover
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Transition for hover effects
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        Tag
                    </Button>
                    
                </div>
            </div>
        </Modal>
    );
};

export default NewPremiseTagHM;
