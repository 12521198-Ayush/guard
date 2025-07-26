'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Input, Select, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, UserCheck, UserX, Loader, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import classNames from 'classnames';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const { Option } = Select;

let renderTick = 0; // External trigger to refresh UI every second

type Visitor = {
  visit_id: string;
  visitor_info_json: {
    visitor_name: string;
    guestType: string;
    pic_url: string;
  };
  resident_json_array: string[];
  resident_status: { [flat: string]: boolean | 'rejected' };
  timestamp: number;
};

const STATUS_COLORS = {
  pending: 'text-yellow-500',
  approved: 'text-green-500',
  rejected: 'text-rose-500',
};

export default function VisitorList() {
  const { data: session } = useSession();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tick, setTick] = useState(0); // Force re-render

  const fetchPresignedUrl = async (fileKey: string): Promise<string | null> => {
    if (!fileKey) return null;

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL+'/staff-service/upload/get_presigned_url',
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
      console.error('Failed to fetch image URL:', error);
      return null;
    }
  };

  const updateVisitorStatus = (list: Visitor[]) => {
    const now = Date.now();
    let changed = false;
    const updated = list.map((v) => {
      const elapsed = Math.floor((now - v.timestamp) / 1000);
      if (elapsed >= 30 && getStatus(v) === 'pending') {
        changed = true;
        const newStatus = { ...v.resident_status };
        Object.keys(newStatus).forEach(flat => {
          if (newStatus[flat] !== true && newStatus[flat] !== 'rejected') {
            newStatus[flat] = 'rejected';
          }
        });
        return { ...v, resident_status: newStatus };
      }
      return v;
    });
    if (changed) {
      localStorage.setItem('pending_visitor_list', JSON.stringify(updated));
      setVisitors(updated);
    }
  };

  useEffect(() => {
    const loadVisitors = async () => {
      const raw = localStorage.getItem('pending_visitor_list');
      if (!raw) return;

      const list = JSON.parse(raw);
      const now = Date.now();

      const enhancedList = await Promise.all(
        list.map(async (v: any) => {
          const fileKey = v.visitor_info_json.pic_url;
          const url = await fetchPresignedUrl(fileKey);

          return {
            ...v,
            timestamp: v.timestamp || now,

          };
        })
      );

      setVisitors(enhancedList);
    };

    loadVisitors();
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateVisitorStatus(visitors);
      setTick(t => t + 1); // Trigger re-render
    }, 1000);
    return () => clearInterval(interval);
  }, [visitors]);

  useEffect(() => {
    let data = [...visitors];
    if (searchTerm) {
      data = data.filter(v =>
        v.visitor_info_json.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.resident_json_array.some(flat => flat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter(v => getStatus(v) === statusFilter);
    }
    setFilteredVisitors(data);
  }, [searchTerm, statusFilter, visitors, tick]);

  const getStatus = (visitor: Visitor) => {
    const values = Object.values(visitor.resident_status);
    if (values.every(v => v === true)) return 'approved';
    if (values.some(v => v === 'rejected')) return 'rejected';
    return 'pending';
  };

  const timeLeft = (visitor: Visitor) => {
    const elapsed = Math.floor((Date.now() - visitor.timestamp) / 1000);
    return Math.max(30 - elapsed, 0);
  };

  const ageText = (visitor: Visitor) => {
    const diffSec = Math.floor((Date.now() - visitor.timestamp) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    return `${Math.floor(diffSec / 60)}m ago`;
  };

  return (
    <div className="bg-gray-100 pt-4 relative">
      {/* Header & Search */}
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
            ]}
          />
        </div>
      </div>

      {/* Visitor Cards */}
      <div className="space-y-3 px-4 mt-2 pb-5">
        {filteredVisitors.map((v, i) => {
          const status = getStatus(v);
          const time = timeLeft(v);

          const handleImageError = async (e: any) => {
            const newUrl = await fetchPresignedUrl(v.visitor_info_json.pic_url);
            if (newUrl) {
              e.target.src = newUrl;
            }
          };

          return (
            <motion.div
              key={v.visit_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => {
                setSelectedVisitor(v);
                setDrawerOpen(true);
                navigator.vibrate?.(50);
              }}
              className="flex items-center bg-white rounded-xl p-3 shadow hover:shadow-md transition-transform active:scale-[0.98] cursor-pointer"
            >
              <img
                src={v.visitor_info_json.pic_url}
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full w-[50px] h-[50px] object-cover border"
                onError={handleImageError}
              />

              <div className="ml-4 flex-1">
                <div className="font-medium text-gray-800 text-base">{v.visitor_info_json.visitor_name}</div>
                <div className="text-sm text-gray-500 capitalize">{v.visitor_info_json.guestType}</div>
                <div className="text-xs text-gray-400">{ageText(v)}</div>
              </div>

              <div className="text-right space-y-1">
                <div className="relative w-10 h-10">
                  <svg className="transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background ring */}
                    <circle
                      className="text-gray-300"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                    />
                    {/* Foreground animated ring */}
                    <circle
                      className={classNames(
                        "transition-all duration-1000 ease-linear",
                        time > 0 ? "text-yellow-400" : // Yellow when active
                          status === "approved" ? "text-green-500" : "text-rose-500"
                      )}
                      strokeWidth="3"
                      strokeDasharray="100, 100"
                      strokeDashoffset={100 - (30 - time) * (100 / 30)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                    />
                  </svg>

                  {/* Center content (timer or status icon) */}
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {time > 0 ? (
                      <span>{time}s</span>
                    ) : status === "approved" ? (
                      <UserCheck size={16} className="text-green-500" />
                    ) : (
                      <UserX size={16} className="text-rose-500" />
                    )}
                  </div>
                </div>

                {/* Status text below the ring */}
                <div className={classNames("text-xs font-semibold", STATUS_COLORS[status])}>
                  {status}
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Bottom Drawer */}
      <Drawer
        placement="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Resident Response"
        closeIcon={<ChevronUp />}
        className="rounded-t-3xl overflow-hidden"
        bodyStyle={{
          paddingBottom: 60,
          maxHeight: '70vh', // ✅ Prevent it from going off screen
          overflowY: 'auto',  // ✅ Make it scroll if needed
        }}
      >

        {selectedVisitor && (
          <>
            <Input
              placeholder="Search unit ID"
              allowClear
              onChange={(e) => {
                const val = e.target.value.toLowerCase();
                if (!selectedVisitor) return;
                const filteredFlats = selectedVisitor.resident_json_array.filter(flat =>
                  flat.toLowerCase().includes(val)
                );
                setSelectedVisitor({ ...selectedVisitor, resident_json_array: filteredFlats });
              }}
              className="mb-3"
            />
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
          </>
        )}
      </Drawer>

      {/* Floating Refresh Button */}
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
