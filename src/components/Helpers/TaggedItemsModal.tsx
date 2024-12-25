import React from 'react';
import { Modal, Table, Button } from 'antd';

interface TaggedItemsModalProps {
    isVisible: boolean;
    onClose: () => void;
    data: any[];
    type: 'subpremise' | 'premise_unit';
    onUntag: (id: string) => void;
    onTag: () => void; // Add this prop to handle the Tag button click
}

const TaggedItemsModal: React.FC<TaggedItemsModalProps> = ({ isVisible, onClose, data, type, onUntag, onTag }) => {
    const columns = [
        {
            title: type === 'subpremise' ? 'Sub-Premise Name' : 'Premise Unit ID',
            dataIndex: type === 'subpremise' ? 'name' : undefined,
            key: 'name',
            render: (_: any, item: any) => item.name || item,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, item: any) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => {
                        onUntag(type === 'subpremise' ? item.id : item);
                        onClose();
                    }}
                    style={{
                        background: 'linear-gradient(90deg, #ff6f61, #d50032)',
                        color: 'white',
                        marginLeft: '8px',
                        border: 'none',
                        marginRight: '4px',
                        borderRadius: '4px',
                        padding: '5px 12px',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                    }}
                >
                    Untag
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div className="flex justify-between items-center pt-7">
                    <span>{`Tagged ${type === 'subpremise' ? 'Sub-Premises' : 'Premise Units'}`}</span>
                    {type === 'premise_unit' && (
                        <Button
                            type="primary"
                            onClick={onTag}
                            style={{
                                marginBottom: '8px',
                                background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Blue gradient background
                                color: 'white', // White text color
                                border: 'none', // No border
                                borderRadius: '4px', // Rounded corners
                                padding: '8px 20px', // Padding for a more substantial look
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                                cursor: 'pointer', // Pointer cursor on hover
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Transition for hover effects
                            }}
                        >
                            Tag More
                        </Button>
                    )}
                </div>

            }
            visible={isVisible}
            onCancel={onClose}
            footer={null}
        >
            <Table dataSource={data} columns={columns} rowKey={(item) => item.id || item} pagination={false} />
        </Modal>
    );
};

export default TaggedItemsModal;
