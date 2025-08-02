'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from 'antd';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import AnimatedStatusIcon from './AnimatedStatusIcon';
import { useRouter } from 'next/navigation';

interface Visitor {
  visit_id: string;
  visitor_info_json: any;
  resident_json_array: any[];
  resident_status: Record<string, string | boolean>;
  resident_status_type?: Record<string, string>; // added
}

interface MessageData {
  premise_id: string;
  visit_id: string;
  premise_unit_id: string;
  approval_status: string;
  type: string;
}

export default function PendingVisitorList({ socketMessages }: { socketMessages: any[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [visitorList, setVisitorList] = useState<Visitor[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [premise, setPremise] = useState('c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af');

  useEffect(() => {
    setPremise(localStorage.getItem('selected_premise_id') || 'c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af');
  }, [])

  async function fetchImageUrl(fileKey: string): Promise<string | null> {
    if (!fileKey) return null;
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL+'/staff-service/upload/get_presigned_url',
        {
          premise_id: premise,
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
  }

  useEffect(() => {
    const stored = localStorage.getItem('pending_visitor_list');
    if (stored) {
      const parsedList = JSON.parse(stored);
      setVisitorList(parsedList);
      parsedList.forEach(async (v: Visitor) => {
        const fileKey = v.visitor_info_json.pic_url;
        if (fileKey && !imageUrls[fileKey]) {
          const url = await fetchImageUrl(fileKey);
          if (url) setImageUrls((prev) => ({ ...prev, [fileKey]: url }));
        }
      });
    }
  }, [session]);

  useEffect(() => {
    if (socketMessages.length === 0) return;
    const lastMessage = socketMessages[socketMessages.length - 1];
    setDebugLog((prev) => [`📥 Received: ${JSON.stringify(lastMessage)}`, ...prev.slice(0, 20)]);

    try {
      const parsed = JSON.parse(lastMessage.message) as MessageData;
      const { visit_id, premise_unit_id, approval_status, type } = parsed;

      let matchFound = false;
      const updated = visitorList.map((visitor) => {
        if (visitor.visit_id === visit_id) {
          matchFound = true;
          return {
            ...visitor,
            resident_status: {
              ...visitor.resident_status,
              [premise_unit_id]: approval_status,
            },
            resident_status_type: {
              ...(visitor.resident_status_type || {}),
              [premise_unit_id]: type,
            },
          };
        }
        return visitor;
      });

      if (matchFound) {
        localStorage.setItem('pending_visitor_list', JSON.stringify(updated));
        setVisitorList(updated);
        setDebugLog((prev) => [`✅ Updated ${visit_id} → ${approval_status} @ ${premise_unit_id}`, ...prev]);
      } else {
        setDebugLog((prev) => [`⚠️ No matching visit_id: ${visit_id}`, ...prev]);
      }
    } catch (e) {
      console.error("Error parsing message:", e);
      setDebugLog((prev) => [`❌ Parsing error: ${e}`, ...prev]);
    }
  }, [socketMessages]);

  return (
    <div className="p-4">
     

      <div className="grid gap-4">
        {visitorList.length === 0 && (
          <div className="text-gray-500">No pending visitors.</div>
        )}

        {visitorList.map((visitor) => (
          <motion.div
            key={visitor.visit_id}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-4 flex flex-col gap-2 cursor-pointer transition hover:shadow-lg"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedVisitor(visitor);
              setOpenDrawer(true);
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{visitor.visitor_info_json.name}</div>
                <div className="text-xs text-gray-500">
                  {visitor.visitor_info_json.mobile} • {visitor.visitor_info_json.type}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {visitor.resident_json_array.map((unit) => {
                const status = typeof visitor.resident_status[unit.premise_unit_id] === 'string'
                  ? visitor.resident_status[unit.premise_unit_id]
                  : 'pending';

                return (
                  <div
                    key={unit.premise_unit_id}
                    className="flex items-center gap-1 text-xs border border-yellow-50 bg-yellow-50 rounded-full px-2 py-0.5"
                  >
                    <AnimatedStatusIcon type={status} />
                    <span>{unit.premise_unit_id}</span>
                    <span className="capitalize text-gray-600">({status})</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
        {/* <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push('/visitors-list')}
            className="px-5 py-2.5 rounded-full bg-blue-500 text-white text-sm font-medium shadow-md hover:bg-blue-600 active:scale-95 transition-transform duration-200 ease-out"
          >
            See List
          </button>
        </div>
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push('/ls')}
            className="px-5 py-2.5 rounded-full bg-blue-500 text-white text-sm font-medium shadow-md hover:bg-blue-600 active:scale-95 transition-transform duration-200 ease-out"
          >
            local storage
          </button>

        </div> */}
      </div>

      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title={<span className="font-semibold text-gray-700">{`Resident Status - ${selectedVisitor?.visitor_info_json.name}`}</span>}
        placement="bottom"
        height="65%"
        styles={{
          body: {
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem',
          },
        }}
      >
        {selectedVisitor && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              {imageUrls[selectedVisitor.visitor_info_json.pic_url] ? (
                <img
                  src={imageUrls[selectedVisitor.visitor_info_json.pic_url]}
                  alt="Visitor"
                  className="w-30 h-30 rounded-full object-cover border shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
              )}

              <div className="flex flex-col text-sm">
                <span className="font-semibold text-gray-800">{selectedVisitor.visitor_info_json.name}</span>
                <span className="text-gray-500">{selectedVisitor.visitor_info_json.mobile}</span>
                <span className="capitalize text-gray-500">{selectedVisitor.visitor_info_json.type}</span>
              </div>
            </div>

            {selectedVisitor.visitor_info_json.type === 'delivery' && (
              <div className="bg-blue-100 p-3 rounded-xl shadow-sm text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <img src={selectedVisitor.visitor_info_json.brand_logo_url} alt="Brand" className="w-6 h-6 rounded" />
                  <span className="font-medium">{selectedVisitor.visitor_info_json.brand}</span>
                </div>
                <div>Persons: {selectedVisitor.visitor_info_json.total_no_of_person}</div>
                <div>Vehicle: {selectedVisitor.visitor_info_json.vehicle_type?.toUpperCase()} - {selectedVisitor.visitor_info_json.vehicle_number}</div>
              </div>
            )}

            <div className=" pt-2">
              {selectedVisitor.resident_json_array.map((unit) => {
                const status = typeof selectedVisitor.resident_status[unit.premise_unit_id] === 'string'
                  ? selectedVisitor.resident_status[unit.premise_unit_id]
                  : 'pending';
                const type = selectedVisitor.resident_status_type?.[unit.premise_unit_id] || '';

                return (
                  <div
                    key={unit.premise_unit_id}
                    className="flex items-center justify-between py-3 border-gray-100 hover:bg-rose-50 transition rounded px-2"
                  >
                    <div className="text-sm font-medium">{unit.premise_unit_id}</div>
                    <div className="flex flex-col items-end text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <AnimatedStatusIcon type={status} />
                        <span className="capitalize text-gray-600 text-sm">{status}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">{type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
