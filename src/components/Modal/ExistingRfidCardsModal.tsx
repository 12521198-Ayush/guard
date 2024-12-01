import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, message } from 'antd';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface ExistingRfidCardsModalProps {
    open: boolean;
    onClose: () => void;
    premiseId: string;
    subPremiseId: string;
    vno: string;
}

const ExistingRfidCardsModal: React.FC<ExistingRfidCardsModalProps> = ({
    open,
    onClose,
    premiseId,
    subPremiseId,
    vno,
}) => {
    const { data: session } = useSession();
    const [assignedTags, setAssignedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchAssignedTags();
        }
    }, [open]);

    const fetchAssignedTags = async () => {
        setLoading(true);
        try {
            const token = session?.user?.accessToken;
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/admin/rfid/subpremise/fetch_by_vehicle',
                {
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
                    vno,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.error) {
                message.error(response.data.error);
            } else {
                setAssignedTags(response.data.data || []);
            }
        } catch (error) {
            message.error('Failed to fetch assigned RFID tags');
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async (tag: string, seq: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to unassign RFID Tag: ${tag}`,
            icon: 'warning',
            showDenyButton: true,
            confirmButtonText: '<span style="color: white;">Unassign</span>',
            confirmButtonColor: '#007bff',
            denyButtonText: '<span style="color: white;">Cancel</span>',
            denyButtonColor: '#d33',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = session?.user?.accessToken;
                    const response = await axios.post(
                        'http://139.84.166.124:8060/user-service/admin/rfid/subpremise/deassociate',
                        {
                            premise_id: premiseId,
                            sub_premise_id: subPremiseId,
                            vno,
                            tag,
                            seq,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.data.error) {
                        message.error(response.data.error);
                    } else {
                        message.success(response.data.data);
                        fetchAssignedTags();
                    }
                } catch (error) {
                    message.error('Failed to unassign RFID tag');
                }
            }
        });
    };

    const columns = [
        {
            title: 'S. No.',
            dataIndex: 'index',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Card No.',
            dataIndex: 'tag',
            key: 'tag',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (

                <Button
                    key="cancel"
                    onClick={() => handleUnassign(record.tag, record.seq)}
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
                    Unassign
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title="RFID Cards"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Table
                dataSource={assignedTags}
                columns={columns}
                loading={loading}
                pagination={false}
                rowKey={(record: any) => record.seq}
                bordered
            />
            {!loading && assignedTags.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    No assigned RFID tags found.
                </div>
            )}
        </Modal>
    );
};

export default ExistingRfidCardsModal;
