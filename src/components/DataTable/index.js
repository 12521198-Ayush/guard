import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button, Popconfirm, Table, Form, Space, App, Input, message } from 'antd';
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
    const [editRowKey, setEditRowKey] = useState("");
    const [sortedInfo, setSortedInfo] = useState({});
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    let [filteredData] = useState();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const response = await axios.get("https://jsonplaceholder.typicode.com/comments");
        setGridData(response.data);
        setLoading(false);
    }

    const dateWithAge = gridData.map((item) => ({
        ...item,
        age: Math.floor(Math.random() * 6) + 20,
    }));

    const modifiedData = dateWithAge.map(({ body, ...item }) => ({
        ...item,
        key: item.id,
        message: isEmpty(body) ? item.message : body,
    }));

    const handleDelete = (value) => {
        const dataSource = [...modifiedData];
        const filterData = dataSource.filter((item) => item.id !== value.id);
        setGridData(filterData);
        toast.info('Flat deleted Suceessfully!', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
            });
    };

    const isEditing = (record) => {
        return record.key === editRowKey;
    }

    const cancel = () => {
        setEditRowKey("");
    }

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...modifiedData];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setGridData(newData);
                setEditRowKey("");
            } else {
                newData.push(row);
                setGridData(newData);
                setEditRowKey("");
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    }

    const edit = (record) => {
        form.setFieldsValue({
            name: "",
            email: "",
            message: "",
            ...record,
        });
        setEditRowKey(record.key);
    }

    const handleChange = (...sorter) => {
        const { order, field } = sorter[2];
        setSortedInfo({ columnKey: field, order });
    }

    const columns = [
        {
            title: "ID",
            dataIndex: "id"
        },
        {
            title: "Name",
            dataIndex: "name",
            align: "center",
            editable: true,
            sorter: (a, b) => a.name.length - b.name.length,
            sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,

        },
        {
            title: "Email",
            dataIndex: "email",
            align: "center",
            editable: true,
            sorter: (a, b) => a.email.length - b.email.length,
            sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
        },
        {
            title: "Age",
            dataIndex: "age",
            align: "center",
            editable: true,
            sorter: (a, b) => a.age.length - b.age.length,
            sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
        },
        {
            title: "Message",
            dataIndex: "message",
            align: "center",
            editable: true,
            sorter: (a, b) => a.message.length - b.message.length,
            sortOrder: sortedInfo.columnKey === 'message' && sortedInfo.order,
        },
        {
            title: "Action",
            dataIndex: "action",
            align: "center",
            render: (_, record) => {
                const editable = isEditing(record);
                return modifiedData.length >= 1 ? (
                    <Space>
                        {/* <Popconfirm title="Are you sure want to delete?" > */}
                        <Button danger type='primary' onClick={() => handleDelete(record)} disabled={editable}>Delete</Button>
                        {/* </Popconfirm> */}
                        {editable ? (
                            <span>
                                <Space size="middle">
                                    <Button onClick={() => { save(record.key); showMessage(); }}>Save</Button>
                                    <Button onClick={cancel}>Cancel</Button>
                                </Space>
                            </span>
                        ) : (
                            <Button onClick={() => edit(record)}>
                                Edit
                            </Button>
                        )}
                    </Space>
                ) : null;
            }
        }
    ];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    const EditableCell = ({ editing, dataIndex, title, record, children, ...restProps }) => {
        const input = <Input />;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{ margin: 0 }}
                        rules={[{
                            required: true,
                            message: `Please input some value in ${title}`
                        }]}>
                        {input}
                    </Form.Item>
                ) : (children)}
            </td>
        );
    };

    const reset = () => {
        setSortedInfo({});
        setSearchText("");
        loadData();
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value)
        if (e.target.value === "") {
            loadData();
        }
    }

    const globalSearch = () => {
        filteredData = modifiedData.filter((value) => {
            return (
                value.name.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
                value.email.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
                value.message.toLowerCase().includes(searchText.toLocaleLowerCase())
            );
        });
        setGridData(filteredData);
    };

    return (
        <div>
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
                <Link href="/flats-residents/add-flats">

                    <UserAddOutlined />

                </Link>
            </Space>
            <Form form={form} component={false}>
                <Table
                    columns={mergedColumns}
                    components={{
                        body: {
                            cell: EditableCell,
                        }
                    }}
                    dataSource={filteredData && filteredData.length ? filteredData : modifiedData}
                    bordered
                    loading={loading}
                    onChange={handleChange}
                />
            </Form>
        </div>
    )
}

export default DataTable;

