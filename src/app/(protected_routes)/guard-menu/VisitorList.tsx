'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, UserCheck, UserX, Loader } from 'lucide-react';
import Image from 'next/image';
import classNames from 'classnames';

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
  rejected: 'text-red-500',
};

export default function VisitorList() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('pending_visitor_list');
    if (raw) {
      const list = JSON.parse(raw);
      const now = Date.now();
      const withTimestamps = list.map((v: any) => ({
        ...v,
        timestamp: v.timestamp || now,
      }));
      setVisitors(withTimestamps);
    }
  }, []);

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

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen">
      <h1 className="text-xl font-bold text-center text-gray-800 mb-4">Pending Visitors</h1>
      {visitors.map((v, i) => {
        const status = getStatus(v);
        const time = timeLeft(v);
        return (
          <motion.div
            key={v.visit_id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => {
              setSelectedVisitor(v);
              setDrawerOpen(true);
            }}
            className="flex items-center bg-white rounded-2xl shadow-md px-4 py-3 cursor-pointer hover:shadow-lg transition"
          >
            <Image
              src={v.visitor_info_json.pic_url}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full border"
            />
            <div className="ml-4 flex-1">
              <div className="text-gray-800 font-semibold">{v.visitor_info_json.visitor_name}</div>
              <div className="text-sm text-gray-500 capitalize">{v.visitor_info_json.guestType}</div>
            </div>
            <div className="flex flex-col items-end">
              {time > 0 ? (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={14} /> {time}s
                </span>
              ) : (
                <button className="text-blue-600 text-xs flex items-center gap-1 hover:underline">
                  <RefreshCw size={14} /> Retry
                </button>
              )}
              <span className={classNames("text-xs mt-1 font-medium", STATUS_COLORS[status])}>
                {status}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Drawer for Detail View */}
      <Drawer
        placement="bottom"
        height="60%"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Resident Response"
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
              }
              return (
                <div key={flat} className="flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50 shadow-sm">
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
    </div>
  );
}
