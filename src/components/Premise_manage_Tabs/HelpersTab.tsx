import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spin } from 'antd';
import Swal from 'sweetalert2';
import HelperModal from '../Modal/HelperModal';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface Helper {
    sub_premise_id_array: string[];
    card_no: number;
    name: string;
    mobile: string;
    address: string;
    qr_code: string;
    skill: string;
    father_name: string;
    premise_unit_associated_with: { premise_unit_id: string }[];
    picture_url: string;
    created_on: string;
}

const HelpersTab = ({
    form,
    handleFinish,
    premiseId,
    subPremiseId,
    premiseUnitId,
}: any) => {
    const [helpersData, setHelpersData] = useState<Helper[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { data: session } = useSession();

    const fetchHelpers = async () => {
        setLoading(true);
        let page = 1;
        const limit = 10;
        let fetchedData: Helper[] = [];

        try {
            while (true) {
                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/list',
                    {
                        premise_id: premiseId,
                        sub_premise_id: subPremiseId,
                        premise_unit_id: premiseUnitId,
                        page,
                        limit,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                        },
                    }
                );

                const { data } = response.data;

                if (!data || data.length === 0) break;

                fetchedData = [...fetchedData, ...data];
                page++;
            }

            setHelpersData(fetchedData);
        } catch (error) {
            console.error('Error fetching helpers:', error);
            Swal.fire('Error', 'Failed to fetch helpers data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const unTag = async (record: Helper) => {
        const qrCode = `[staff]${record.sub_premise_id_array[0]}`;
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you really want to remove ${record.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'No, cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(
                        'http://139.84.166.124:8060/staff-service/untag/premise_unit',
                        {
                            premise_id: premiseId,
                            qr_code: helpersData[0].qr_code,
                            premise_unit_id: premiseUnitId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${session?.user?.accessToken}`,
                            },
                        }
                    );
                    Swal.fire({
                        title: 'Success',
                        text: `${record.name} has been untagged.`,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                          confirmButton: 'bg-blue-500 text-white hover:bg-blue-600'  // Custom blue color
                        }
                      });
                    fetchHelpers();
                } catch (error) {
                    console.error('Error untagging helper:', error);
                    Swal.fire('Error', 'Failed to untag the helper.', 'error');
                }
            }
        });
    };

    useEffect(() => {
        fetchHelpers();
    }, [premiseId, subPremiseId, premiseUnitId]);

    const columns = [
        {
            title: 'Helpers',
            key: 'helpers',
            render: (record: Helper) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={record.picture_url !== '-' ? record.picture_url : 'data:image/jpeg;base64,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'}
                        alt="Helper"
                        style={{
                            width: '80px',
                            height: '80px',
                            marginRight: '16px',
                            borderRadius: '8px',
                            border: '2px solid #ddd',
                        }}
                    />
                    <div>
                        <p>Card No: {record.card_no}</p>
                        <p>Name: {record.name}</p>
                        <p>Mobile: {record.mobile}</p>
                        <p>Profession: {record.skill}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Local Address',
            dataIndex: 'address',
            key: 'address',
        },
        
        {
            title: 'Action',
            key: 'action',
            render: (record: Helper) => (
                <Button 
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
                onClick={() => unTag(record)}>UnTag</Button>
            ),
        },
    ];
    const [tagNewHelperModal, settagNewHelperModal] = useState(false);


    return (
        <div>
            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">My Helpers</h4>
                <Button 
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
                onClick={() => settagNewHelperModal(true)}>Tag New</Button>
            </div>
            <br />
            {tagNewHelperModal && (
                <HelperModal
                    visible={tagNewHelperModal}
                    onClose={() => settagNewHelperModal(false)}
                    premiseId={premiseId}
                    subPremiseId={subPremiseId}
                    premiseUnitId={premiseUnitId}
                    fetchHelpers = {()=>fetchHelpers()}
                />
            )}
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={helpersData}
                    rowKey={(record) => record.sub_premise_id_array[0]}
                    pagination={false}
                />
            </Spin>
        </div>
    );
};

export default HelpersTab;
