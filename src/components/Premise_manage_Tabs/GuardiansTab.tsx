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
                <Button style={{ marginBottom: '8px' }} onClick={() => handleNew(null)}>
                    Add new
                </Button>
            </div>

            <Table
                columns={guardianColumns}
                dataSource={guardiansData.filter((item: any) => item.association_type === 'Owner')}
                scroll={{ x: 900 }}
                loading={loadingGuardians}
                rowKey="_id"
                pagination={false}
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
                dataSource={guardiansData.filter((item: any) => item.association_type === 'tenant')}
                loading={loadingGuardians}
                rowKey="_id"
                pagination={false}
                scroll={{ x: 900 }}
            />

            <br />

            <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button
                        style={{
                            borderRadius: '4px',
                            backgroundColor: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                        }}
                        onClick={handlePrev}
                        disabled={false}
                    >
                        Previous
                    </Button>

                    <Button
                        style={{
                            borderRadius: '4px',
                            backgroundColor: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                        }}
                        onClick={handleNext}
                        disabled={false}
                    >
                        Next
                    </Button>
                </div>
            </Form.Item>

        </>
    );
};

export default GuardiansTab;
