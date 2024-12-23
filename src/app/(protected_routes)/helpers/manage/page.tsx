'use client'
import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, Button, Breakpoint, Space, Select } from 'antd';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import HelperCard from '../../../../components/Helpers/HelperCard';
import TaggedItems from '../../../../components/Helpers/TaggedItems';
import TaggedItemsModal from '../../../../components/Helpers/TaggedItemsModal';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import HelperFilter from '@/components/Helpers/HelperFilter';
import EditStaffModal from '@/components/Helpers/EditStaffModal';

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

const HelpersTab = () => {
    const [helpersData, setHelpersData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [iseditModalVisible, seteditIsModalVisible] = useState(false);
    const [selectedCardNumber, setSelectedCardNumber] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [modalData, setModalData] = useState<any>(null);
    const { data: session } = useSession() as unknown as { data: Session };
    const premiseId = session?.user?.primary_premise_id;
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [cardNo, setCardNo] = useState<number | undefined>();
    const [subPremiseId, setSubPremiseId] = useState<string | undefined>();
    const [premiseUnitId, setPremiseUnitId] = useState<string | undefined>();

    const { Option } = Select;

    const handleNext = () => {
        if (hasNextPage) {
            setHelpersData([]); 
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };
    const handlePrevious = () => {
        if (currentPage > 1) {
            setHelpersData([]);
            setCurrentPage((prevPage) => prevPage - 1); 
        }
    };

    const handleLimitChange = (value: number) => {
        setLimit(value);
        setCurrentPage(1);
        setHelpersData([]);
        fetchHelpers(1, value); 
    };

    const subPremises = session?.user?.subpremiseArray || [];


    const fetchHelpers = async (page: number, limit: number) => {
        setLoading(true);
        // console.log(cardNo);
        const payload = {
            premise_id: premiseId,
            card_no: cardNo,
            sub_premise_id: subPremiseId,
            premise_unit_id: premiseUnitId,
            page,
            limit,
        }

        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/staff-service/list',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );
            console.log(payload);


            const { data } = response.data;
            setHasNextPage(data.length === limit);
            setHelpersData(data);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch helpers data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (premiseId) {
            console.log('Fetching helpers for Page:', currentPage, 'Limit:', limit);
            fetchHelpers(currentPage, limit);
        }
    }, [premiseId, currentPage, limit]);


    const unTag = async (type: 'subpremise' | 'premise_unit', id: string, qr_code?: string) => {
        const apiEndpoint =
            type === 'subpremise'
                ? 'http://139.84.166.124:8060/staff-service/untag/premise_subpremise'
                : 'http://139.84.166.124:8060/staff-service/untag/premise_unit';

        const payload: Record<string, any> = { premise_id: premiseId };
        if (type === 'subpremise') {
            payload.sub_premise_id = id;
        } else if (type === 'premise_unit') {
            payload.premise_unit_id = id;
            payload.qr_code = qr_code; 
        }

        try {
            await axios.post(apiEndpoint, payload, {
                headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
            });
            Swal.fire({
                title: 'Success',
                text: `Successfully untagged ${type}.`,
                icon: 'success',
                customClass: {
                    confirmButton: 'bg-blue-500 text-white hover:bg-blue-600',
                },
            });

            fetchHelpers(currentPage, limit);
        } catch (error) {
            Swal.fire('Error', `Failed to untag ${type}.`, 'error');
        }
    };

    const showModal = (type: 'subpremise' | 'premise_unit', data: any[], qr_code?: string) => {
        setModalData({ type, data, qr_code });
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Helpers',
            key: 'helpers',
            responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            width: 250,
            render: (record: any) => (
                <HelperCard
                    cardNo={record.card_no}
                    name={record.name}
                    mobile={record.mobile}
                    skill={record.skill}
                    pictureUrl={record.picture_url}
                    address={record.address}
                />
            ),
        },
        {
            title: 'Associated with',
            key: 'taggedItems',
            responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            width: 200,
            render: (record: any) => (
                <TaggedItems
                    subPremiseCount={record.sub_premise_id_array.length}
                    premiseUnitCount={record.premise_unit_associated_with.length}
                    qr_code={record.qr_code}
                    onShowSubPremises={() => {
                        const subpremiseData = record.sub_premise_id_array.map((id: string) => {
                            const subpremise: Subpremise | undefined = session?.user?.subpremiseArray.find(
                                (sub) => sub.subpremise_id === id
                            );

                            return {
                                id,
                                name: subpremise ? subpremise.subpremise_name : 'Unknown',
                            };
                        });

                        showModal('subpremise', subpremiseData);
                    }}
                    onShowPremiseUnits={() =>
                        showModal(
                            'premise_unit',
                            record.premise_unit_associated_with.map((unit: any) => unit.premise_unit_id),
                            record.qr_code
                        )
                    }
                />
            ),
        },
        {
            title: 'Documents',
            responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            key: 'documents',
            width: 200,
            render: (record: any) => {
                const documentTypes = ['pv_url', 'id_proof_url', 'address_proof_url'];

                const fetchSignedUrl = async (fileKey: string) => {
                    // console.log(fileKey,premiseId);

                    const response = await fetch('http://139.84.166.124:8060/staff-service/upload/get_presigned_url', {
                        method: 'POST',
                        body: JSON.stringify({
                            premise_id: premiseId,
                            file_key: fileKey,
                        }),
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const data = await response.json();
                    console.log('API Response:', response.status, data);

                    return data?.data?.signedURL || null;
                };

                const handleClick = async (fileKey: string) => {
                    const url = await fetchSignedUrl(fileKey);
                    if (url) {
                        window.open(url, '_blank');
                    }
                };

                const allAreDashes = documentTypes.every((docType) => record[docType] === '-');

                return (
                    <div className="flex flex-col gap-1">
                        {documentTypes.map((docType) => {
                            const fileKey = record[docType];
                            const isClickable = fileKey && fileKey !== '-';

                            const textColor = allAreDashes
                                ? 'text-red'
                                : isClickable
                                    ? 'text-green-500'
                                    : 'text-red';

                            return (
                                <span
                                    key={docType}
                                    className={`${textColor} ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={() => isClickable && handleClick(fileKey)}
                                >
                                    {docType.replace('_', ' ').toUpperCase()}
                                </span>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            responsive: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[],
            width: 150,
            render: (_: any, record: any) => (
                <div className="flex flex-wrap gap-2">
                    <Button icon={<EditOutlined />}
                        onClick={() => {
                            console.log("open");
                            
                            setSelectedCardNumber(record.card_no); 
                            seteditIsModalVisible(true); 
                        }}
                    />
                    <Button
                        className="ml-2"
                        style={{ backgroundColor: 'red', color: 'white' }}
                        icon={<DeleteOutlined />}
                    />
                </div>
            ),
        },
    ];

    const fiterdata = () => {
        setCurrentPage(1);
        setLimit(10);
        setHelpersData([]);
        fetchHelpers(currentPage, limit);
    }


    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h4 className="font-medium text-xl text-black dark:text-white">
                    Manage Helpers
                </h4>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex gap-4 items-center mb-4">
                    {/* Card Number Input */}
                    <Input
                        placeholder="Enter Card Number"
                        value={cardNo?.toString() || ''}  
                        onChange={(e) => {
                            const value = e.target.value;
                            setCardNo(value ? Number(value) : undefined);
                        }}
                        className="flex-1"
                    />

                    {/* Sub-Premise Select */}
                    <Select
                        placeholder="Select Sub-Premise"
                        onChange={(value) => setSubPremiseId(value || undefined)} 
                        className="flex-1"
                        loading={!subPremises.length}
                        allowClear
                    >
                        <Option value="">None</Option>
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
                    <Button

                        onClick={fiterdata}
                        disabled={loading}
                        className="w-auto"
                    >
                        {loading ? <Spin /> : 'Filter'}
                    </Button>
                </div>
            </div>

            <div style={{ padding: '20px' }}>

                <Table
                    columns={columns}
                    dataSource={helpersData}
                    rowKey={(record, index) => `${record.sub_premise_id_array[0]}-${index}`}
                    pagination={false}
                    scroll={{ x: 900 }}
                    className="w-full"
                />
                <EditStaffModal
                    visible={iseditModalVisible}
                    onClose={() => seteditIsModalVisible(false)}
                    cardNumber={selectedCardNumber || 0}
                    premiseId={premiseId}
                />
                {helpersData.length > 1 && (
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                            <Button onClick={handlePrevious} disabled={currentPage === 1}>
                                Previous
                            </Button>
                            <Button onClick={handleNext} disabled={!hasNextPage}>
                                Next
                            </Button>
                        </Space>
                        <Select defaultValue={limit} onChange={handleLimitChange} value={limit}>
                            <Option value={10}>10</Option>
                            <Option value={20}>20</Option>
                            <Option value={50}>50</Option>
                        </Select>
                    </div>

                )}
            </div>


            {modalData && (
                <TaggedItemsModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    data={modalData.data}
                    type={modalData.type}
                    onUntag={(id) =>
                        unTag(modalData.type, id, modalData.type === 'premise_unit' ? modalData.qr_code : undefined)
                    }
                />
            )}
        </div>

    );
};

export default HelpersTab;
