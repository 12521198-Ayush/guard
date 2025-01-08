import { Button, Table, Form } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import EditModal from '../Modal/Modal';

const GuardiansTab = ({
    guardianColumns,
    guardiansData,
    isModalVisible,
    selectedUnitId,
    id,
    initialData,
    handleNew,
    handleClose,
    handleEdit,
    handleDelete,
    handlePrev,
    handleNext,
    loadingGuardians,
}: any) => {
    return (
        <>
            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">
                    Owner
                </h4>
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
                    onClick={() => handleNew(null)}
                >
                    Add new
                </Button>

            </div>
            <br />
            <Table
                columns={guardianColumns}
                dataSource={guardiansData.filter((item: any) => item.association_type === 'Owner')}
                scroll={{ x: 900 }}
                loading={loadingGuardians}
                rowKey="_id"
                pagination={false}
                bordered
            />

            <EditModal
                open={isModalVisible}
                guardian_id={selectedUnitId}
                id={id}
                onClose={handleClose}
                sub_premise_id={initialData.sub_premise_id}
            />

            <br /><br />

            <div className="flex items-center justify-between">
                <h4 className="font-small text-xl text-black dark:text-white">
                    Tenant
                </h4>
            </div>
            <br />

            <Table
                columns={[
                    {
                        title: 'Name',
                        dataIndex: 'name',
                        key: 'name',
                        responsive: ['xs', 'sm', 'md', 'lg'],
                        width: 150,
                    },
                    {
                        title: 'Mobile',
                        dataIndex: 'mobile',
                        key: 'mobile',
                        responsive: ['xs', 'sm', 'md', 'lg'],
                        width: 150,
                    },
                    {
                        title: 'Email',
                        dataIndex: 'email',
                        key: 'email',
                        responsive: ['xs', 'sm', 'md', 'lg'],
                        width: 200,
                    },
                    {
                        title: 'Lease Start Date',
                        dataIndex: 'lease_start_date',
                        key: 'lease_start_date',
                        width: 150,
                        render: (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A'),
                    },
                    {
                        title: 'Lease End Date',
                        dataIndex: 'lease_end_date',
                        key: 'lease_end_date',
                        width: 150,
                        render: (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A'),
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 150,
                        render: (_, record) => (
                            <>
                                <Button onClick={() => handleEdit(record)} icon={<EditOutlined />} />
                                <Button
                                    className="ml-2"
                                    onClick={() => handleDelete(record)}
                                    style={{ backgroundColor: 'red', color: 'white' }}
                                    icon={<DeleteOutlined />}
                                />
                            </>
                        ),
                    },
                ]}
                dataSource={guardiansData.filter((item: any) => item.association_type === 'Tenant')}
                loading={loadingGuardians}
                rowKey="_id"
                pagination={false}
                scroll={{ x: 900 }}
                bordered
            />

            <br />

        </>
    );
};

export default GuardiansTab;
