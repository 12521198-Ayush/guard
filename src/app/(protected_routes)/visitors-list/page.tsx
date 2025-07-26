'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Loader, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Modal } from 'antd';

const LIMIT = 5;

const statusMap: Record<string, { color: string; icon: JSX.Element }> = {
    approved: { color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> },
    pending: { color: 'text-yellow-600', icon: <Clock className="w-4 h-4" /> },
    rejected: { color: 'text-rose-600', icon: <XCircle className="w-4 h-4" /> },
};

export default function VisitorsListPage() {
    const { data: session } = useSession();
    const [visitorList, setVisitorList] = useState<any[]>([]);
    const [premise, setPremise] = useState('');
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortByLatest, setSortByLatest] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalUnits, setModalUnits] = useState<any[]>([]);
    const [expandedUnits, setExpandedUnits] = useState<string | null>(null);

    useEffect(() => {
        const selected = localStorage.getItem('selected_premise_id');
        setPremise(selected || '');
    }, []);

    const fetchImageUrl = async (fileKey: string): Promise<string | null> => {
        try {
            const res = await axios.post(
                'http://139.84.166.124:8060/staff-service/upload/get_presigned_url',
                {
                    premise_id: premise,
                    file_key: fileKey,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );
            return res.data?.data ?? null;
        } catch {
            return null;
        }
    };

    const fetchVisitors = async (pageNumber: number) => {
        setLoading(true);
        try {
            const res = await axios.post(
                'http://139.84.166.124:8060/vms-service-consumer/vms/records/by_visit_ids',
                {
                    premise_id: premise,
                    limit: LIMIT,
                    page: pageNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );

            const data = res.data?.data || [];
            if (data.length < LIMIT) setHasMore(false);

            for (const v of data) {
                const fileKey = v.pic_url;
                if (fileKey && !imageUrls[fileKey]) {
                    const url = await fetchImageUrl(fileKey);
                    if (url) setImageUrls((prev) => ({ ...prev, [fileKey]: url }));
                }
            }

            setVisitorList((prev) => [...prev, ...data]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (premise) fetchVisitors(page);
    }, [premise, page]);

    const filtered = visitorList.filter((v) => {
        const nameMatch = v.name.toLowerCase().includes(search.toLowerCase());
        const mobileMatch = v.mobile.includes(search);
        const typeMatch = typeFilter ? v.type === typeFilter : true;
        return (nameMatch || mobileMatch) && typeMatch;
    });

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="Search name or mobile"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mr-2 rounded-xl border border-gray-200 shadow-sm px-4 py-2"
                />
            </div>

            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500">
                    Showing {filtered.length} result{filtered.length !== 1 && 's'}
                </div>
                <button
                    onClick={() => setSortByLatest(!sortByLatest)}
                    className="text-sm text-rose-600 underline"
                >
                    Sort: {sortByLatest ? 'Latest ↓' : 'Oldest ↑'}
                </button>
            </div>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {['', 'delivery', 'guest', 'staff'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-4 py-1.5 text-sm rounded-full border ${
                            typeFilter === type
                                ? 'bg-rose-600 text-white'
                                : 'bg-white text-gray-600'
                        } shadow-sm`}
                    >
                        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {[...filtered]
                    .sort((a, b) => {
                        const aTime = new Date(a.ts).getTime();
                        const bTime = new Date(b.ts).getTime();
                        return sortByLatest ? bTime - aTime : aTime - bTime;
                    })
                    .map((v, idx) => (
                        <motion.div
                            key={idx}
                            className="rounded-2xl bg-white/90 backdrop-blur-md shadow-md p-4 flex flex-col gap-2 cursor-pointer"
                            whileHover={{ scale: 1.01 }}
                            onClick={() => {
                                setModalUnits(v.premise_unit_array);
                                setExpandedUnits(v.visit_id);
                                setModalVisible(true);
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={imageUrls[v.pic_url] || '/placeholder.jpg'}
                                    alt={v.name}
                                    className="w-16 h-16 rounded-full object-cover border shadow"
                                />
                                <div className="flex flex-col">
                                    <div className="text-base font-semibold">{v.name}</div>
                                    <div className="text-sm text-gray-500">{v.mobile} • {v.type}</div>
                                    <div className="text-xs text-gray-400">
                                        {v.vehicle_type?.toUpperCase()} • {v.vehicle_number}
                                    </div >
                                    <div className="text-xs text-gray-400">
                                        {new Date(v.ts).toLocaleString()}
                                    </div>
                                    {v.type === 'delivery' && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <img src={v.brand_logo_url} className="w-4 h-4 rounded" alt="brand" />
                                            <span className="text-xs font-medium text-blue-500">{v.brand}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {v.premise_unit_array.slice(0, 3).map((unit: any, i:any) => {
                                    const statusInfo = statusMap[unit.approval_status] || {};
                                    return (
                                        <div
                                            key={i}
                                            className={`px-2 py-1 bg-gray-50 rounded-full text-xs flex items-center gap-2 border ${statusInfo.color}`}
                                        >
                                            {statusInfo.icon}
                                            <span className="font-medium">{unit.premise_unit_id}</span>
                                            <span className="capitalize text-gray-500">({unit.approval_status})</span>
                                        </div>
                                    );
                                })}
                                {v.premise_unit_array.length > 3 && (
                                    <div className="text-xs text-rose-500 underline ml-2">
                                        +{v.premise_unit_array.length - 3} more
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
            </div>

            <Modal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                className="custom-android-modal"
                style={{
                    borderRadius: '20px',
                }}
            >
                <div className="p-2">
                    <div className="text-lg font-semibold mb-4">Unit Approval Statuses</div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {modalUnits.map((unit, i) => {
                            const statusInfo = statusMap[unit.approval_status] || {};
                            return (
                                    <div key={i} className="flex justify-between hide-scrollbar items-center p-3 bg-white rounded-xl shadow-sm ">
                                    <div className="text-sm font-medium">{unit.premise_unit_id}</div>
                                    <div className={`flex items-center gap-2 text-sm ${statusInfo.color}`}>
                                        {statusInfo.icon}
                                        <span className="capitalize">{unit.approval_status}</span>
                                        {unit.approval_method !== '-' && (
                                            <span className="text-gray-400 text-xs">({unit.approval_method})</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {!filtered.length && !loading && (
                <div className="text-center text-gray-500 text-sm mt-6">No visitor found</div>
            )}

            {hasMore && !loading && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-5 py-2 bg-rose-600 text-white text-sm rounded-full shadow hover:bg-rose-700"
                    >
                        Load More
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center mt-6 text-gray-400">
                    <Loader2 className="animate-spin" />
                </div>
            )}
        </div>
    );
}
