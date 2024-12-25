import React, { useState } from 'react';
import { Input, Select, Button, Spin } from 'antd';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Subpremise {
    subpremise_id: string;
    subpremise_name: string;
}

interface UserSession {
    primary_premise_id: string;
    accessToken: string;
    subpremiseArray: Subpremise[];
}

interface Session {
    user: UserSession;
}

const { Option } = Select;

const HelperFilter: React.FC<{ helpersData: (data: any) => void }> = ({ helpersData }) => {
    const [cardNo, setCardNo] = useState<string | undefined>();
    const [subPremiseId, setSubPremiseId] = useState<string | undefined>();
    const [premiseUnitId, setPremiseUnitId] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const { data: session } = useSession() as unknown as { data: Session };

    const premiseId = session?.user?.primary_premise_id;
    const subPremises = session?.user?.subpremiseArray || [];
    const accessToken = session?.user?.accessToken;

    const handleFilter = async () => {
        if (!accessToken || !premiseId) {
            Swal.fire('Error', 'Session or access token is missing.', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                premise_id: premiseId,
                card_no: cardNo,
                sub_premise_id: subPremiseId,
                premise_unit_id: premiseUnitId,
                page: 1,
                limit: 20,
            };

            const response = await axios.post(
                'http://139.84.166.124:8060/staff-service/list',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log('Filter Response:', response.data);
            helpersData(response.data?.data || []);
            Swal.fire('Success', 'Filter applied successfully!', 'success');
        } catch (error: any) {
            console.error('Filter Error:', error);
            Swal.fire(
                'Error',
                error.response?.data?.message || 'Failed to apply filter',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex gap-4 items-center mb-4">
                {/* Card Number Input */}
                <Input
                    placeholder="Enter Card Number"
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value)}
                    className="flex-1"
                />
                {/* Sub-Premise Select */}
                <Select
                    placeholder="Select Sub-Premise"
                    onChange={(value) => setSubPremiseId(value || undefined)} // Set undefined if "None" is selected
                    className="flex-1"
                    loading={!subPremises.length}
                    allowClear
                >
                    <Option value="">None</Option> {/* None option to remove the filter */}
                    {subPremises.map((subPremise) => (
                        <Option key={subPremise.subpremise_id} value={subPremise.subpremise_id}>
                            {subPremise.subpremise_name}
                        </Option>
                    ))}
                </Select>
                {/* Premise Unit ID Input */}
                <Input
                    placeholder="Enter Premise Unit ID"
                    value={premiseUnitId}
                    onChange={(e) => setPremiseUnitId(e.target.value)}
                    className="flex-1"
                />
                {/* Filter Button */}
                {/* <Button
                    onClick={handleFilter}
                    disabled={loading}
                    className={`w-auto ${loading ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'} rounded`}
                >
                    {loading ? <Spin /> : 'Filter'}
                </Button> */}

                <Button
                    onClick={handleFilter}
                    disabled={loading}
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
                    {loading ? <Spin /> : 'Filter'}
                </Button>

            </div>
        </div>

    );
};

export default HelperFilter;
