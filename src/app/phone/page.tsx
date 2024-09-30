'use client'

import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface PremiseUnit {
  _id: string;
  id: string;
  size: number;
  size_unit: string;
  occupancy_status: string;
  sub_premise_id: string;
  delivery_location_pref: string;
  electricity_meter_vendor: string;
  electricity_meter_id: string;
  ownership_type: string;
  email_notification: string;
  wa_notification: string;
  sms_notification: string;
  maid_notification: string;
  vehicle_notification: string;
  // Add other fields if needed
}

const PremiseUnitTable: React.FC = () => {
  const [data, setData] = useState<PremiseUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [premiseId] = useState<string>('0a8e1070-6b21-11ef-b2cb-13f201b16993');
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = ''; // Replace with actual token

      const response = await axios.post(
        'http://139.84.166.124:8060/user-service/admin/premise_unit/list',
        {
          premise_id: premiseId,
          page: page,
          limit: limit,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { data: fetchedData, total } = response.data;
      setData(fetchedData);
      setTotalRecords(total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleNextPage = () => {
    if (data.length === limit) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleView = (record: PremiseUnit) => {
    const queryParams = new URLSearchParams(record as any).toString();
    router.push(`/premise-unit-form?${queryParams}`);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Occupancy Status',
      dataIndex: 'occupancy_status',
      key: 'occupancy_status',
    },
    {
      title: 'Sub Premise ID',
      dataIndex: 'sub_premise_id',
      key: 'sub_premise_id',
    },
    {
      title: 'Electricity Meter Vendor',
      dataIndex: 'electricity_meter_vendor',
      key: 'electricity_meter_vendor',
    },
    {
      title: 'Ownership Type',
      dataIndex: 'ownership_type',
      key: 'ownership_type',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: PremiseUnit) => (
        <Button onClick={() => handleView(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={false}
        loading={loading}
      />
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <Button onClick={handlePreviousPage} disabled={page === 1} style={{ marginRight: '8px' }}>
          Previous
        </Button>
        <Button onClick={handleNextPage} disabled={data.length < limit}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default PremiseUnitTable;
