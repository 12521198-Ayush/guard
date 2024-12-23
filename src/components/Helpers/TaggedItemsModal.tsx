import React from 'react';
import { Modal, Table, Button } from 'antd';

interface TaggedItemsModalProps {
    isVisible: boolean;
    onClose: () => void;
    data: any[];
    type: 'subpremise' | 'premise_unit';
    onUntag: (id: string) => void;
}

const TaggedItemsModal: React.FC<TaggedItemsModalProps> = ({ isVisible, onClose, data, type, onUntag }) => {
    const columns = [
        {
            title: type === 'subpremise' ? 'Sub-Premise Name' : 'Premise Unit ID',
            dataIndex: type === 'subpremise' ? 'name' : undefined,
            key: 'name',
            render: (_:any, item:any) => item.name || item,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_:any, item:any) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => {
                        onUntag(type === 'subpremise' ? item.id : item);
                        onClose();
                    }}
                >
                    Untag
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title={`Tagged ${type === 'subpremise' ? 'Sub-Premises' : 'Premise Units'}`}
            visible={isVisible}
            onCancel={onClose}
            footer={null}
        >
           
            <Table dataSource={data} columns={columns} rowKey={(item) => item.id || item} pagination={false} />
        </Modal>
    );
};

export default TaggedItemsModal;
