'use client'
import React, { useEffect, useState } from 'react';
import { Table, Spin, Button, Breakpoint } from 'antd';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import HelperCard from '../../../../components/Helpers/HelperCard';
import TaggedItems from '../../../../components/Helpers/TaggedItems';
import TaggedItemsModal from '../../../../components/Helpers/TaggedItemsModal';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Subpremise {
    subpremise_id: string;
    subpremise_name: string;
}

interface UserSession {
    primary_premise_id: string;
    accessToken: string;
    subpremiseArray: Subpremise[]; // Ensure this is correctly typed as Subpremise array  
}

interface Session {
    user: UserSession;
}

const HelpersTab = () => {
    const [helpersData, setHelpersData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [modalData, setModalData] = useState<any>(null);
    const { data: session } = useSession() as unknown as { data: Session }; // Ensure the session is properly typed  
    const premiseId = session?.user?.primary_premise_id;

    const fetchHelpers = async () => {
        setLoading(true);
        let page = 1;
        const limit = 10;
        let fetchedData: any = [];

        try {
            while (true) {
                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/list',
                    {
                        premise_id: premiseId,
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
            Swal.fire('Error', 'Failed to fetch helpers data.', 'error');
        } finally {
            setLoading(false);
        }
    };

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
            payload.qr_code = qr_code; // Include qr_code for premise_unit  
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

            fetchHelpers();
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
                const allAreDashes = ['picture_url', 'id_proof_url', 'address_proof_url'].every(
                    (docType) => record[docType] === '-'
                );

                return (
                    <div className="flex flex-col gap-1">
                        {['picture_url', 'id_proof_url', 'address_proof_url'].map((docType) => {
                            const url = record[docType];
                            const isClickable = url && url !== '-';

                            const textColor = allAreDashes
                                ? 'text-red'
                                : isClickable
                                    ? 'text-green-500'
                                    : 'text-red';

                            return (
                                <span
                                    key={docType}
                                    className={`${textColor} ${isClickable ? 'cursor-pointer' : ''}`}
                                >
                                    {isClickable ? (
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            {docType.replace('_', ' ').toUpperCase()}
                                        </a>
                                    ) : (
                                        docType.replace('_', ' ').toUpperCase()
                                    )}
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
                    <Button icon={<EditOutlined />} />
                    <Button
                        className="ml-2"
                        style={{ backgroundColor: 'red', color: 'white' }}
                        icon={<DeleteOutlined />}
                    />
                </div>
            ),
        },
    ];


    useEffect(() => {
        fetchHelpers();
    }, [premiseId]);

    return (
        <div className="p-4">
            <h4 className="font-small text-xl text-black dark:text-white mb-4">My Helpers</h4>

            <Table
                columns={columns}
                dataSource={helpersData}
                rowKey={(record) => record.sub_premise_id_array[0]}
                pagination={false}
                scroll={{ x: 900 }}
                className="w-full"
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
                />
            )}
        </div>
    );
};

export default HelpersTab;