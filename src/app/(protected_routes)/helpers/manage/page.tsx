'use client'
import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, Button, Breakpoint, Space, Select, message } from 'antd';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import HelperCard from '../../../../components/Helpers/HelperCard';
import TaggedItems from '../../../../components/Helpers/TaggedItems';
import TaggedItemsModal from '../../../../components/Helpers/TaggedItemsModal';
import { EditOutlined, DeleteOutlined, SafetyOutlined, IdcardOutlined, HomeOutlined } from '@ant-design/icons';
import HelperFilter from '@/components/Helpers/HelperFilter';
import EditStaffModal from '@/components/Helpers/EditStaffModal';
import NewPremiseTagHM from '@/components/Helpers/NewPremiseTagHM';
import DocumentsColumn from './DocumentsColumn';
import { Modal, Image } from 'antd';

interface Subpremise {
    sub_premise_id: string;
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

            // Access the array directly
            const array = response.data.data?.array;

            if (Array.isArray(array)) {
                setHasNextPage(array.length === limit); // Check if the length matches the limit
                setHelpersData(array || []); // Update the helpers data
            } else {
                console.error('Unexpected response format:', response.data);
                Swal.fire('Error', 'Unexpected response format.', 'error');
            }
        } catch (error) {
            console.error('Error fetching helpers data:', error);
            Swal.fire('Error', 'Failed to fetch helpers data.', 'error');
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        if (premiseId) {
            // console.log('Fetching helpers for Page:', currentPage, 'Limit:', limit);
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
        // setIsModalVisible(true); 
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
                                (sub) => sub.sub_premise_id === id
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
            render: (record: any) => <DocumentsColumn record={record} />,
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
                            // console.log("open");

                            setSelectedCardNumber(record.card_no);
                            seteditIsModalVisible(true);
                        }}
                    />
                    <Button
                        className="ml-2"
                        style={{ backgroundColor: 'red', color: 'white' }}
                        icon={<DeleteOutlined />}
                        onClick={
                            () => {
                                DeleteHelper(record.card_no, record.sub_premise_id_array)
                            }
                        }
                    />
                </div>
            ),
        },
    ];

    const DeleteHelper = async (card: any, sub_premise_id_array: any) => {
        const subpremiseArray = session?.user?.subpremiseArray;

        const isMatch = sub_premise_id_array.every((id: string) =>
            subpremiseArray.some(subpremise => subpremise.sub_premise_id === id)
        );

        if (isMatch) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to delete the helper?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#007bff', // Custom blue color for the confirm button
                cancelButtonColor: '#d33', // Red color for cancel button
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
            });

            if (result.isConfirmed) {
                try {
                    const response = await axios.post(
                        'http://139.84.166.124:8060/staff-service/delete',
                        {
                            premise_id: premiseId,
                            card_no: card
                        },
                        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
                    );

                    if (response.status === 201) {
                        fetchHelpers(currentPage, limit);
                        Swal.fire({
                            title: 'Helper Deleted',
                            text: 'The helper deleted successfully.',
                            icon: 'success',
                            confirmButtonColor: '#007bff',
                        });
                    } else {
                        message.error('Failed to delete helper.');
                    }
                } catch (error) {
                    console.error('Error delete helper:', error);
                    message.error('An error occurred while deleting helper.');
                }
            }
        } else {
            Swal.fire({
                title: 'Sorry!',
                text: 'You cannot delete this Helper',
                icon: 'warning',
                confirmButtonColor: '#007bff',
            });
        }

    }

    const fiterdata = () => {
        setCurrentPage(1);
        setLimit(10);
        setHelpersData([]);
        fetchHelpers(currentPage, limit);
    }

    const [newPremiseModalVisible, setnewPremiseModalVisible] = useState(false);

    const newPremiseTag = () => {
        setIsModalVisible(false);
        setnewPremiseModalVisible(true);
    };

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h4 className="font-medium text-xl text-black dark:text-white">
                    Manage Helpers
                </h4>
            </div>
            <div className="p-4 bg-white">
                <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
                    {/* Card Number Input */}
                    <Input
                        placeholder="Enter Card Number"
                        value={cardNo?.toString() || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCardNo(value ? Number(value) : undefined);
                        }}
                        className="w-full md:flex-1"
                    />

                    {/* Sub-Premise Select */}
                    <Select
                        placeholder="Select Sub-Premise"
                        onChange={(value) => setSubPremiseId(value || undefined)}
                        className="w-full md:flex-1"
                        loading={!subPremises.length}
                        allowClear
                    >
                        <Option value="">None</Option>
                        {subPremises.map((subPremise) => (
                            <Option key={subPremise.sub_premise_id} value={subPremise.sub_premise_id}>
                                {subPremise.subpremise_name}
                            </Option>
                        ))}
                    </Select>

                    {/* Premise Unit ID Input */}
                    <Input
                        placeholder="Enter Premise Unit ID"
                        value={premiseUnitId}
                        onChange={(e) => setPremiseUnitId(e.target.value)}
                        className="w-full md:flex-1"
                    />

                    {/* Filter Button */}
                    <Button
                        onClick={fiterdata}
                        disabled={loading}
                        className="w-full md:w-auto"
                        style={{
                            marginBottom: '8px',
                            background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Blue gradient background
                            color: 'white', // White text color
                            border: 'none', // No border
                            borderRadius: '3px', // Rounded corners
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


            <div style={{ padding: '12px' }}>

                <Table
                    columns={columns}
                    dataSource={helpersData}
                    rowKey={(record, index) => `${record.sub_premise_id_array[0]}-${index}`}
                    pagination={false}
                    scroll={{ x: 900 }}
                    className="w-full"
                    bordered
                />
                <EditStaffModal
                    visible={iseditModalVisible}
                    onClose={() => seteditIsModalVisible(false)}
                    cardNumber={selectedCardNumber || 0}
                    premiseId={premiseId}
                    fetchHelpers={fetchHelpers}
                    currentPage={currentPage}
                    limit={limit}
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

            <NewPremiseTagHM
                premise_id={premiseId}
                modalData={modalData}
                isModalVisible={newPremiseModalVisible}
                setIsModalVisible={setnewPremiseModalVisible}
                session={session}
                fetchHelpers={fetchHelpers}
                currentPage={currentPage}
                limit={limit}
            />


            {modalData && (
                <TaggedItemsModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    data={modalData.data}
                    type={modalData.type}
                    onUntag={(id) =>
                        unTag(modalData.type, id, modalData.type === 'premise_unit' ? modalData.qr_code : undefined)
                    }
                    onTag={newPremiseTag}
                />
            )}
        </div>

    );
};

export default HelpersTab;
