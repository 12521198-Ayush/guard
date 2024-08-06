'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button, Table, Form, Space, Input, message, Popconfirm } from 'antd';
import { isEmpty } from 'lodash';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const showMessage = () => {
    message.success('Saved');
};

const DataTable = () => {
    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editRowKey, setEditRowKey] = useState(null);
    const [sortedInfo, setSortedInfo] = useState({});
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost/test/get-approval.php");
            setGridData(response.data);
            setFilteredData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const Approvedhandle = (value) => {
        const dataSource = [...filteredData];
        const filterData = dataSource.filter((item) => item.apartmentInfo !== value.apartmentInfo);
        setGridData(filterData);
        setFilteredData(filterData);
        message.success('Approved');
    };

    const handleDelete = (value) => {
        const dataSource = [...filteredData];
        const filterData = dataSource.filter((item) => item.apartmentInfo !== value.apartmentInfo);
        setGridData(filterData);
        setFilteredData(filterData);
        message.error('Rejected');
    };

    const isEditing = (record) => record.key === editRowKey;

    const cancel = () => {
        setEditRowKey(null);
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...filteredData];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setGridData(newData);
                setFilteredData(newData);
                setEditRowKey(null);
            } else {
                newData.push(row);
                setGridData(newData);
                setFilteredData(newData);
                setEditRowKey(null);
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const edit = (record) => {
        form.setFieldsValue({
            apartmentInfo: "",
            name: "",
            phoneNo: "",
            type: "",
            requestType: "",
            apartmentBillDue: "",
            idUploaded: "",
            creationDate: "",
        });
        setEditRowKey(record.key);
    };

    const handleChange = (pagination, filters, sorter) => {
        setSortedInfo(sorter);
    };

    const columns = [
        {
            title: "Apartment Info",
            dataIndex: "apartmentInfo",
            key: "apartmentInfo",
            sorter: (a, b) => a.apartmentInfo.localeCompare(b.apartmentInfo),
            sortOrder: sortedInfo.columnKey === 'apartmentInfo' && sortedInfo.order,
            editable: true,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        },
        {
            title: "Phone No",
            dataIndex: "phoneNo",
            key: "phoneNo",
            sorter: (a, b) => a.phoneNo.localeCompare(b.phoneNo),
            sortOrder: sortedInfo.columnKey === 'phoneNo' && sortedInfo.order,
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            sorter: (a, b) => a.type.localeCompare(b.type),
            sortOrder: sortedInfo.columnKey === 'type' && sortedInfo.order,
        },
        {
            title: "Request Type",
            dataIndex: "requestType",
            key: "requestType",
            sorter: (a, b) => a.requestType.localeCompare(b.requestType),
            sortOrder: sortedInfo.columnKey === 'requestType' && sortedInfo.order,
        },
        {
            title: "Apartment Bill Due",
            dataIndex: "apartmentBillDue",
            key: "apartmentBillDue",
            sorter: (a, b) => parseFloat(a.apartmentBillDue) - parseFloat(b.apartmentBillDue),
            sortOrder: sortedInfo.columnKey === 'apartmentBillDue' && sortedInfo.order,
        },
        {
            title: "ID Uploaded",
            dataIndex: "idUploaded",
            key: "idUploaded",
            sorter: (a, b) => new Date(a.idUploaded) - new Date(b.idUploaded),
            sortOrder: sortedInfo.columnKey === 'idUploaded' && sortedInfo.order,
        },
        {
            title: "Creation Date",
            dataIndex: "creationDate",
            key: "creationDate",
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            sortOrder: sortedInfo.columnKey === 'creationDate' && sortedInfo.order,
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => {
                const editable = isEditing(record);
                return filteredData.length >= 1 ? (
                    <Space>
                        <Popconfirm
                            title="Reject"
                            description="Are you sure want to reject?"
                            onConfirm={() => handleDelete(record)}
                            okType="default"
                            onCancel={cancel}
                            okText="Yes"
                            cancelText="No"

                        >

                            <Button type='primary' style={{ backgroundColor: 'red', color: 'white' }} disabled={editable}>Reject</Button>
                        </Popconfirm>
                        {editable ? (
                            <span>
                                <Space size="middle">
                                    <Button onClick={() => { save(record.key); showMessage(); }}>Save</Button>
                                    <Button onClick={cancel}>Cancel</Button>
                                </Space>
                            </span>
                        ) : (
                            <Space>
                                <Popconfirm
                                    title="Approve"
                                    description="Are you sure want to Approve?"
                                    onConfirm={() => Approvedhandle(record)}
                                    okType="default"
                                    onCancel={cancel}
                                    okText="Yes"
                                    cancelText="No"

                                >
                                    <Button style={{ backgroundColor: '#15b000', color: 'white' }}>Approve</Button>
                                </Popconfirm>
                                <Button onClick={() => edit(record)}>
                                    More
                                </Button>
                            </Space>
                        )}
                    </Space>
                ) : null;
            }
        }
    ];

    const mergedColumns = columns.map((col) => ({
        ...col,
        onCell: (record) => ({
            record,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
        }),
    }));

    const EditableCell = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        ...restProps
    }) => {
        return (
            <td {...restProps}>
                {editable ? (
                    <Form.Item
                        name={dataIndex}
                        style={{ margin: 0 }}
                        rules={[{
                            required: true,
                            message: `Please input ${title}!`,
                        }]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };

    const reset = () => {
        setSortedInfo({});
        setSearchText("");
        loadData();
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        if (e.target.value === "") {
            loadData();
        }
    };

    const globalSearch = () => {
        const filtered = gridData.filter((value) => {
            return (
                value.name.toLowerCase().includes(searchText.toLowerCase()) ||
                value.phoneNo.toLowerCase().includes(searchText.toLowerCase()) ||
                value.apartmentInfo.toLowerCase().includes(searchText.toLowerCase())
            );
        });
        setFilteredData(filtered);
    };

    return (
        <>
            <div className="action-buttons">
                <Space className='float-left'>
                    <Button style={{ backgroundColor: '#9ea4a9', color: 'white' }} >Pending</Button>
                    <Button >Approved</Button>
                    <Button >Rejected</Button>
                </Space>
            </div>
            <br></br>
            <br></br>

            <div className="search-container">
                <ToastContainer />
                <Space style={{ marginBottom: 16 }}>
                    <Input
                        placeholder='Enter Search Text'
                        onChange={handleSearch}
                        type='text'
                        allowClear
                        value={searchText}
                    />
                    <Button onClick={globalSearch} icon={<SearchOutlined />}>
                        Search
                    </Button>
                    <Button onClick={reset}>Reset</Button>
                    {/* <Link href="/flats-residents/add-flats">
                    <UserAddOutlined />
                </Link> */}
                </Space>

                <Form form={form} component={false}>
                    <Table
                        columns={mergedColumns}
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        dataSource={filteredData.length ? filteredData : gridData}
                        bordered
                        loading={loading}
                        onChange={handleChange}
                        scroll={{ x: 600 }}
                        pagination={{ pageSize: 10 }}
                    />
                </Form>
            </div>
        </>
    );
}

export default DataTable;

