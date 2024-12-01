import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, message } from 'antd';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const { Option } = Select;

interface Rfid {
    tag: string;
    seq: string;
    status?: string; // Add additional properties if needed
}

interface RfidCardsModalProps {
    open: boolean;
    onClose: () => void;
    premiseId: string;
    subPremiseId: string;
    vno: string;
}

const RfidCardsModal: React.FC<RfidCardsModalProps> = ({ open, onClose, premiseId, subPremiseId, vno }) => {
    const { data: session } = useSession();
    const [rfidList, setRfidList] = useState<Rfid[]>([]);
    const [selectedRfids, setSelectedRfids] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchRfidList();
        }
    }, [open]);

    const fetchRfidList = async () => {
        setLoading(true);
        try {
            const token = session?.user?.accessToken;
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/admin/rfid/subpremise/pre_list',
                {
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
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
                setRfidList(response.data.data.filter((rfid: Rfid) => rfid.status === 'UNASSIGNED'));
            }
        } catch (error) {
            message.error('Failed to fetch RFID data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (selectedRfids.length === 0) {
            message.warning('Please select at least one RFID to assign');
            return;
        }

        let assignments:any = [];
        try {
            assignments = selectedRfids.map((tag) => {
                const rfid = rfidList.find((rfid) => rfid.tag === tag);
                if (!rfid) {
                    throw new Error(`RFID with tag ${tag} not found in the list.`);
                }
                return {
                    premise_id: premiseId,
                    sub_premise_id: subPremiseId,
                    vno,
                    tag: rfid.tag,
                    seq: rfid.seq,
                };
            });
        } catch (error: any) {
            message.error(error.message);
            return; // Stop execution if an error occurs
        }

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to assign ${selectedRfids.length} RFID(s).`,
            icon: 'warning',
            showDenyButton: true,
            confirmButtonText: '<span style="color: white;">Assign</span>',
            confirmButtonColor: '#007bff',
            denyButtonText: '<span style="color: white;">Cancel</span>',
            denyButtonColor: '#d33',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = session?.user?.accessToken;

                    for (const assignment of assignments) {
                        await axios.post(
                            'http://139.84.166.124:8060/user-service/admin/rfid/subpremise/associate',
                            assignment,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                    }
                    message.success('RFID(s) assigned successfully!');
                    setSelectedRfids([]);
                    onClose();
                } catch (error) {
                    message.error('Failed to assign RFID(s)');
                }
            }
        });
    };

    return (
        <Modal
            title={<h2 className="text-lg font-semibold text-gray-800">Assign RFID Cards</h2>}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            zIndex={1000}
            className="rounded-lg shadow-lg"
            bodyStyle={{ padding: '1.5rem' }}
        >
            <div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select RFID Tags</label>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select RFID Tags"
                        value={selectedRfids}
                        onChange={setSelectedRfids}
                        loading={loading}
                        className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                    >
                        {rfidList.map((rfid) => (
                            <Option key={rfid.tag} value={rfid.tag}>
                                {rfid.tag}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div className="text-right">
                    <Button
                        type="primary"
                        key="submit"
                        onClick={handleAssign}
                        disabled={loading}
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
                        Assign
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RfidCardsModal;
