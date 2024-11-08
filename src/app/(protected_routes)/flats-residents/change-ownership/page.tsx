'use client'
import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spin, Tag } from 'antd';
import { Space, Input, message, Grid, Select } from 'antd';
import { SearchOutlined, EditOutlined, TagsOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Swal from 'sweetalert2';
import Link from 'next/link';

interface Helper {
  _id: string;
  maid_name: string;
  maid_mobile: number;
  father_name: string;
  maid_address: string;
  profession: string;
  permanent_address: string;
  maid_qr_url: string;
  maid_picture_url: string;
}

const { useBreakpoint } = Grid;
const { Option } = Select;

const HelpersTab = ({ form, handleFinish, editMode, toggleEditMode }: any) => {
  const screens = useBreakpoint();

  const [helpersData, setHelpersData] = useState<Helper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const response = await fetch(
          'https://www.servizing.com/service/societies/fecb427b-18f9-b04e-b1ab-130811d898af/maids'
        );
        const result = await response.json();
        if (!result.error) {
          setHelpersData(result.data);
        }
      } catch (error) {
        console.error('Error fetching helper data:', error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchHelpers();
  }, []);

  const unTag = async (card_no: any) => {
    console.log(card_no)
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to remove the associated flat ${card_no.maid_name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then(async (result) => {
      console.log(card_no)
    });
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Helpers',
      key: 'helpers',
      responsive: ['xs', 'sm', 'md', 'lg'],
      width: 300,
      render: (record: any) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          <img
            src={record.maid_picture_url}
            alt="Maid"
            style={{
              width: '80px',
              height: '80px',
              marginRight: '16px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              objectFit: 'cover'
            }}
          />
          <div style={{ color: '#333' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>Card No: {record.card_no}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>Name: {record.maid_name}</p>
            <p style={{ margin: 0, color: '#555' }}>Mobile: {record.maid_mobile}</p>
            <p style={{ margin: 0, color: '#555' }}>Profession: {record.profession}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Father Name',
      dataIndex: 'father_name',
      key: 'father_name',
      responsive: ['xs', 'sm', 'md', 'lg'],
      width: 150,
    },
    {
      title: 'Local Address',
      dataIndex: 'maid_address',
      key: 'maid_address',
      responsive: ['xs', 'sm', 'md', 'lg'],
      width: 150,
    },
    {
      title: 'Permanent Address',
      dataIndex: 'permanent_address',
      key: 'permanent_address',
      responsive: ['xs', 'sm', 'md', 'lg'],
      width: 150,
    },
    {
      title: 'Tagged by',
      dataIndex: 'resident_associated_with',
      key: 'resident_associated_with',
      responsive: ['xs', 'sm', 'md', 'lg'],
      width: 150,
      render: (resident_associated_with) => {
        if (resident_associated_with && resident_associated_with.length > 0) {
            return resident_associated_with.map((resident, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{resident.customer_name}</p>
                    <p style={{ margin: 0, color: '#888' }}>{resident.customer_mobile}</p>
                </div>
            ));
        }
        return '-';
      },
    },
    {
      title: 'Action',
      key: 'action',
      responsive: ['xs', 'sm', 'md', 'lg'],
      width: 150,
      render: (_: any, record: any) => (
        <>
          <Button
            className="ml-2"
            style={{
              background: 'linear-gradient(90deg, #ff4e50, #f9d423)', // Gradient background
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '16px', // Rounded button for a tag-like appearance
              padding: '5px 12px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            type="default"
            icon={<TagsOutlined style={{ marginRight: '4px' }} />} // Icon with a bit of margin
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => unTag(record)}
          >
            UnTag
          </Button>
        </>
      )
    },

  ];

  const globalSearch = () => {
    console.log("search")
  }

  return (
    <div>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h4 className="font-small text-xl text-black dark:text-white">Helpers Management</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Space style={{ flexWrap: 'wrap' }}>
                {/* <Input
                      placeholder="Enter Unit id"
                      type="text"
                      allowClear
                      style={{ width: screens.xs ? '100%' : 'auto' }}
                    />
                    <SearchOutlined onClick={globalSearch} /> */}
                {/* <Button
                            onClick={globalSearch}
                            icon={<SearchOutlined />}
                            disabled={isButtonDisabled}
                            style={{ width: screens.xs ? '100%' : 'auto' }}
                        /> */}
              </Space>

              <Link href="/flats-residents/add-flats">
                <Button
                  style={{
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
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Add New
                </Button>
              </Link>
            </div>

          </div>

          <br />

          <Form form={form} onFinish={handleFinish}>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={helpersData}
                scroll={{ x: 900 }}
                rowKey="_id"
                pagination={false}
              />
            </Spin>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default HelpersTab;
