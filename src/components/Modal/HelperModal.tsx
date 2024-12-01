import React, { useState } from 'react';
import { Modal, Form, Select, Input, Checkbox, Button, Table, Space, Avatar } from 'antd';
import { SearchOutlined, IdcardOutlined, UserOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';


interface HelperModalProps {
    open: boolean;
    onClose: () => void;
    premiseId: string;
    subPremiseId: string;
    premiseUnitId: string;
}

interface SearchResult {
    key: string;
    photo: string;
    details: string;
    address: string;
    selected: boolean;
}

const   HelperModal: React.FC<HelperModalProps> = ({
    open,
    onClose,
    premiseId,
    subPremiseId,
    premiseUnitId,
}) => {
    const [form] = Form.useForm();
    const [searchResults, setSearchResults] = useState<SearchResult[]>([

    ]);

    const handleSearch = () => {
        setSearchResults([
            {
                key: '1',
                photo: '/path/to/photo.jpg',
                details: 'John Doe, Helper',
                address: '123 Main St, City',
                selected: false,
            },
        ]);
    };

    const toggleCheckbox = (recordKey: string) => {
        setSearchResults(prevResults =>
            prevResults.map(item =>
                item.key === recordKey ? { ...item, selected: !item.selected } : item
            )
        );
    };
    const columns = [
        {
            title: 'Photo',
            dataIndex: 'photo',
            key: 'photo',
            render: (text: string) => <Avatar src={text} />,
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Select',
            key: 'select',
            render: (_: any, record: SearchResult) => (
                <Checkbox
                    checked={record.selected}
                    onChange={() => toggleCheckbox(record.key)}
                    style={{ color: record.selected ? 'green' : 'inherit' }}
                />
            ),
        },
    ];

    return (
        <Modal
            title="Tag Helper"
            open={open}
            onCancel={onClose}
            width={800} // Increased modal width
            footer={[
                <Button
                    type="primary"
                    key="submit"
                    style={{
                        marginLeft: '8px',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #4e92ff, #1e62d0)',
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
                    Tag
                </Button>,
                <Button
                    key="cancel"
                    onClick={onClose}
                    style={{
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #f44336, #e57373)',
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
                    Cancel
                </Button>,
            ]}
        >
            <Form layout="inline" form={form} style={{ width: '100%', alignItems: 'center' }}>

                <div style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Space style={{ flexWrap: 'wrap' }}>
                            <Input
                                placeholder="Enter Unit id"
                                onChange={handleSearch}
                                type="text"
                                allowClear
                                // value={searchText}
                                style={{ width: 'auto' }}
                            /><Input
                                placeholder="Enter Unit id"
                                onChange={handleSearch}
                                type="text"
                                allowClear
                                // value={searchText}
                                style={{ width: 'auto' }}

                            /><Input
                                placeholder="Enter Unit id"
                                onChange={handleSearch}
                                type="text"
                                allowClear
                                // value={searchText}
                                style={{ width: 'auto' }}

                            />
                            <Button
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                                style={{
                                    backgroundColor: '#4e92ff',
                                    color: 'white',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    marginLeft: '8px',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                Search
                            </Button>
                        </Space>
                    </div>
                </div>


            </Form>

            <Table
                dataSource={searchResults}
                columns={columns}
                pagination={false}
                style={{ marginTop: '16px' }}
            />
        </Modal>
    );
};

export default HelperModal;
