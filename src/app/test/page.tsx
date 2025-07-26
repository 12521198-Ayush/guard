'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Input, Select, Tooltip, Progress } from 'antd';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Clock,
  UserCheck,
  UserX,
  Loader,
  Search,
  ChevronUp,
} from 'lucide-react';
import Image from 'next/image';
import classNames from 'classnames';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const { Option } = Select;

type Visitor = {
  visit_id: string;
  visitor_info_json: {
    visitor_name: string;
    guestType: string;
    pic_url: string;
  };
  resident_json_array: string[];
  resident_status: { [flat: string]: boolean | 'rejected' | 'no_response_30s' };
  timestamp: number;
};

const STATUS_COLORS = {
  pending: 'text-yellow-500',
  approved: 'text-green-500',
  rejected: 'text-red-500',
  timeout: 'text-red-400',
};

export default function VisitorList() {
  const { data: session } = useSession();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPresignedUrl = async (fileKey: string): Promise<string | null> => {
    if (!fileKey) return null;
    try {
      const response = await axios.post(
        'http://139.84.166.124:8060/staff-service/upload/get_presigned_url',
        {
          premise_id: '348afcc9-d024-3fe9-2e85-bf5a9694ea19',
          file_key: fileKey,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data?.data ?? null;
    } catch (error) {
      console.error('Presigned URL fetch failed:', error);
      return null;
    }
  };

  const getStatus = (visitor: Visitor) => {
    const values = Object.values(visitor.resident_status);
    if (values.every((v) => v === true)) return 'approved';
    if (values.some((v) => v === 'rejected')) return 'rejected';
    if (values.some((v) => v === 'no_response_30s')) return 'timeout';
    return 'pending';
  };

  const updateLocalStorage = (list: Visitor[]) => {
    localStorage.setItem('pending_visitor_list', JSON.stringify(list));
  };

  const markNoResponse = (list: Visitor[]) => {
    const now = Date.now();
    return list.map((v: Visitor) => {
      const elapsed = Math.floor((now - v.timestamp) / 1000);
      const updatedStatus = { ...v.resident_status };
      if (elapsed >= 30) {
        for (const flat of v.resident_json_array) {
          if (updatedStatus[flat] !== true && updatedStatus[flat] !== 'rejected') {
            updatedStatus[flat] = 'no_response_30s';
          }
        }
      }
      return { ...v, resident_status: updatedStatus };
    });
  };

  const retryVisitor = async (v: Visitor) => {
    const updated = await Promise.all(
      visitors.map(async (item) => {
        if (item.visit_id === v.visit_id) {
          const fileKey = item.visitor_info_json.pic_url;
          const newUrl = await fetchPresignedUrl(fileKey);
          return {
            ...item,
            timestamp: Date.now(),
            resident_status: Object.fromEntries(
              Object.entries(item.resident_status).map(([flat]) => [flat, false])
            ),
            visitor_info_json: {
              ...item.visitor_info_json,
              pic_url: newUrl || '/default-avatar.png',
            },
          };
        }
        return item;
      })
    );
    updateLocalStorage(updated);
    setVisitors(updated);
  };

  const timeLeft = (visitor: Visitor) => {
    if (getStatus(visitor) === 'timeout') return 0;
    const elapsed = Math.floor((Date.now() - visitor.timestamp) / 1000);
    return Math.max(30 - elapsed, 0);
  };

  const timePercent = (visitor: Visitor) => {
    const elapsed = Math.floor((Date.now() - visitor.timestamp) / 1000);
    return Math.min((elapsed / 30) * 100, 100);
  };

  const ageText = (visitor: Visitor) => {
    const diffSec = Math.floor((Date.now() - visitor.timestamp) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    return `${Math.floor(diffSec / 60)}m ago`;
  };

  const reloadExpiredImage = async (v: Visitor) => {
    const updated = await Promise.all(
      visitors.map(async (item) => {
        if (item.visit_id === v.visit_id) {
          const newUrl = await fetchPresignedUrl(item.visitor_info_json.pic_url);
          return {
            ...item,
            visitor_info_json: {
              ...item.visitor_info_json,
              pic_url: newUrl || '/default-avatar.png',
            },
          };
        }
        return item;
      })
    );
    updateLocalStorage(updated);
    setVisitors(updated);
  };

  useEffect(() => {
    const loadVisitors = async () => {
      const raw = localStorage.getItem('pending_visitor_list');
      if (!raw) return;

      const list = JSON.parse(raw);
      const now = Date.now();

      const marked = markNoResponse(list);
      const enhancedList = await Promise.all(
        marked.map(async (v: Visitor) => {
          const fileKey = v.visitor_info_json.pic_url;
          const url = await fetchPresignedUrl(fileKey);
          return {
            ...v,
            timestamp: v.timestamp || now,
            visitor_info_json: {
              ...v.visitor_info_json,
              pic_url: url || '/default-avatar.png',
            },
          };
        })
      );

      updateLocalStorage(enhancedList);
      setVisitors(enhancedList);
    };

    loadVisitors();
  }, [session]);

  useEffect(() => {
    let data = [...visitors];
    if (searchTerm) {
      data = data.filter((v) =>
        v.visitor_info_json.visitor_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((v) => getStatus(v) === statusFilter);
    }
    setFilteredVisitors(data);
  }, [searchTerm, statusFilter, visitors]);

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 pt-4 relative min-h-screen">
      {/* Header */}
      <div className="px-4 pb-2 sticky top-0 z-10 bg-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Gate Guest List</h2>
        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Search name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="flex-1 shadow-sm rounded-lg"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-28"
            options={[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Timeout', value: 'timeout' },
            ]}
          />
        </div>
      </div>

      {/* Visitor Cards */}
      <div className="space-y-3 px-4 mt-2 pb-5">
        {filteredVisitors.map((v, i) => {
          const status = getStatus(v);
          const time = timeLeft(v);
          const isTimeout = status === 'timeout';

          return (
            <motion.div
              key={v.visit_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={classNames(
                "flex items-center bg-white rounded-2xl p-3 shadow-xl hover:shadow-md transition-transform active:scale-[0.97] cursor-pointer border border-gray-200",
                { 'ring-2 ring-red-200': isTimeout }
              )}
              onClick={() => {
                setSelectedVisitor(v);
                setDrawerOpen(true);
              }}
            >
              <Image
                src={v.visitor_info_json.pic_url}
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full w-[50px] h-[50px] object-cover border shadow"
                onError={() => reloadExpiredImage(v)}
              />

              <div className="ml-4 flex-1">
                <div className="font-semibold text-gray-800 text-base">{v.visitor_info_json.visitor_name}</div>
                <div className="text-sm text-gray-500 capitalize">{v.visitor_info_json.guestType}</div>
                <div className="text-xs text-gray-400">{ageText(v)}</div>

                {!isTimeout && (
                  <div className="pt-2">
                    <Progress
                      percent={100 - timePercent(v)}
                      showInfo={false}
                      size="small"
                      strokeColor="#3b82f6"
                      trailColor="#e5e7eb"
                    />
                  </div>
                )}
              </div>

              <div className="text-right space-y-1 ml-2">
                {isTimeout ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      retryVisitor(v);
                    }}
                    className="text-blue-600 text-xs flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                ) : (
                  <Tooltip title="Time left to auto-resend">
                    <span className="flex items-center text-xs text-gray-500 gap-1">
                      <Clock size={14} /> {time}s
                    </span>
                  </Tooltip>
                )}
                <div className={classNames("text-xs font-semibold", STATUS_COLORS[status])}>
                  {status}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Drawer */}
      <Drawer
        placement="bottom"
        height="60%"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Resident Response"
        closeIcon={<ChevronUp />}
        className="rounded-t-3xl overflow-hidden"
        bodyStyle={{ paddingBottom: 60 }}
      >
        {selectedVisitor && (
          <div className="space-y-3">
            {selectedVisitor.resident_json_array.map((flat) => {
              const resStatus = selectedVisitor.resident_status[flat];
              let icon = <Loader size={16} className="animate-spin" />;
              let color = 'text-yellow-500';
              let label = 'Pending';
              if (resStatus === true) {
                icon = <UserCheck size={16} />;
                color = 'text-green-500';
                label = 'Approved';
              } else if (resStatus === 'rejected') {
                icon = <UserX size={16} />;
                color = 'text-red-500';
                label = 'Rejected';
              } else if (resStatus === 'no_response_30s') {
                icon = <Clock size={16} />;
                color = 'text-red-400';
                label = 'Timeout';
              }

              return (
                <div
                  key={flat}
                  className="flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50 shadow-sm"
                >
                  <span className="font-medium text-gray-700">{flat}</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${color}`}>
                    {icon} {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>

      {/* Refresh FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => location.reload()}
        className="fixed bottom-5 right-5 bg-blue-600 text-white rounded-full p-4 shadow-xl hover:bg-blue-700"
      >
        <RefreshCw size={20} />
      </motion.button>
    </div>
  );
}
