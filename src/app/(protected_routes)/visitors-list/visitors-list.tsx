'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Drawer, Modal } from 'antd';
import { ArrowLeft } from 'lucide-react';

interface Visitor {
  visit_id: string;
  visitor_info_json: any;
  resident_json_array: any[];
  ts?: string;
}

export default function VisitorsListPage() {
  const { data: session } = useSession();
  const [visitorList, setVisitorList] = useState<Visitor[]>([]);
  const [filtered, setFiltered] = useState<Visitor[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [sortByLatest, setSortByLatest] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentStatusList, setCurrentStatusList] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchApiVisitors(page);
  }, [session]);

  const fetchApiVisitors = async (pg: number) => {
    try {
      const response = await axios.post(
        'http://139.84.166.124:8060/vms-service-consumer/vms/records/by_visit_ids',
        {
          premise_id: 'your-premise-id',
          limit: 10,
          page: pg,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data?.data ?? [];
      const parsed = data.map((v: any) => ({
        visit_id: v.visit_id,
        visitor_info_json: v,
        resident_json_array: v.premise_unit_array,
        ts: v.ts,
      }));
      setVisitorList((prev) => [...prev, ...parsed]);
      setFiltered((prev) => [...prev, ...parsed]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const q = query.toLowerCase();
    const results = visitorList.filter((v) => {
      const name = v.visitor_info_json.name?.toLowerCase() || '';
      const mobile = v.visitor_info_json.mobile || '';
      return name.includes(q) || mobile.includes(q);
    });
    setFiltered(results);
  };

  const showStatuses = (list: any[]) => {
    if (list.length <= 4) return null;
    setCurrentStatusList(list);
    setShowStatusModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => router.back()}
          className="text-rose-600 flex items-center gap-1"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <input
          type="text"
          placeholder="Search by name or mobile"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-full shadow bg-white border border-gray-200"
        />
        <button
          onClick={() => setSortByLatest(!sortByLatest)}
          className="text-sm text-rose-600 underline ml-4"
        >
          Sort: {sortByLatest ? 'Latest ↓' : 'Oldest ↑'}
        </button>
      </div>

      <div className="space-y-4">
        {[...filtered].sort((a, b) => {
          const aTime = new Date(a.ts || '').getTime();
          const bTime = new Date(b.ts || '').getTime();
          return sortByLatest ? bTime - aTime : aTime - bTime;
        }).map((v, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.01 }}
            className="bg-white shadow rounded-2xl p-4"
            onClick={() => setSelectedVisitor(v)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-medium text-gray-800">
                {v.visitor_info_json.name}
              </div>
              <div className="text-xs text-gray-500">
                {v.ts && formatTime(v.ts)}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Mobile: {v.visitor_info_json.mobile}
            </div>
            {v.visitor_info_json.type === 'delivery' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Image
                  src={v.visitor_info_json.brand_logo_url}
                  alt={v.visitor_info_json.brand}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                {v.visitor_info_json.brand}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {v.resident_json_array.slice(0, 4).map((unit, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-full text-xs text-white ${
                    unit.approval_status === 'approved'
                      ? 'bg-green-500'
                      : unit.approval_status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                >
                  {unit.premise_unit_id}: {unit.approval_status}
                </span>
              ))}
              {v.resident_json_array.length > 4 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showStatuses(v.resident_json_array);
                  }}
                  className="text-xs underline text-blue-500"
                >
                  See more
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchApiVisitors(next);
          }}
          className="px-5 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow"
        >
          Load More
        </button>
      </div>

      <Modal
        open={showStatusModal}
        onCancel={() => setShowStatusModal(false)}
        footer={null}
        title="All Unit Statuses"
      >
        <div className="space-y-2">
          {currentStatusList.map((unit, i) => (
            <div
              key={i}
              className="flex justify-between border-b pb-1 text-sm"
            >
              <span>{unit.premise_unit_id}</span>
              <span>{unit.approval_status}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
