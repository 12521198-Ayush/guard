'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from '@mui/material';
import { CheckCircle, Clock, XCircle, Smartphone, Car, Footprints, Home, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface VisitorInfo {
    visit_id: string;
    guest_type: string;
    vehicle_type: string;
    vehicle_registration_number: string;
    guest_mobile_no: string;
    visitor_name: string;
    pic_url: string;
    guest_reference: string;
    listed_type: string;
}

interface VisitorEntry {
    visitor_info_json: VisitorInfo;
    resident_array: string[];
    approval_status: 'pending' | 'approved' | 'rejected';
}

const PendingVisitorList = () => {
    const [entries, setEntries] = useState<VisitorEntry[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerUnits, setDrawerUnits] = useState<string[]>([]);
    const { data: session } = useSession()
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchAllPresignedUrls = async () => {
            const urls: Record<string, string> = {};

            for (const entry of entries) {
                const fileKey = entry.visitor_info_json.pic_url;
                const visitId = entry.visitor_info_json.visit_id;

                const url = await fetchPresignedUrl(fileKey);
                if (url) urls[visitId] = url;
            }

            setImageUrls(urls);
        };

        if (entries.length > 0) {
            fetchAllPresignedUrls();
        }
    }, [entries]);

    useEffect(() => {
        const saved = localStorage.getItem('pending_visitors');
        if (saved) setEntries(JSON.parse(saved));
    }, []);

    const updateStatus = (visit_id: string, status: 'approved' | 'rejected') => {
        const updated = entries.map((entry) =>
            entry.visitor_info_json.visit_id === visit_id ? { ...entry, approval_status: status } : entry
        );
        setEntries(updated);
        localStorage.setItem('pending_visitors', JSON.stringify(updated));
    };

    const fetchPresignedUrl = async (file_key: string): Promise<string | null> => {
        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL+'/staff-service/upload/get_presigned_url',
                {
                    premise_id: '348afcc9-d024-3fe9-2e85-bf5a9694ea19',
                    file_key,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            return response.data?.data ?? null
        } catch (error) {
            console.error('Presigned URL error:', error)
            return null
        }
    }

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold pb-2 text-gray-900">Pending Visitor Approvals</h2>

            {entries.length === 0 ? (
                <p className="px-4 text-sm text-gray-500">No pending approvals.</p>
            ) : (
                <div className="overflow-x-auto whitespace-nowrap px-4 py-2 space-x-4 flex">
                    {entries.map((entry) => {
                        const visitId = entry.visitor_info_json.visit_id;
                        const resolvedUrl = imageUrls[visitId] ?? '/placeholder.jpg';

                        return (
                            <div
                                key={visitId}
                                className="w-full max-w-[900px] min-w-[360px] bg-white rounded-2xl shadow-md flex flex-row items-center gap-6 p-6 active:scale-[0.97] transition-transform"
                            >
                                {/* Left: Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={resolvedUrl}
                                        alt="Visitor"
                                        className="w-20 h-20 rounded-xl object-cover border border-gray-300"
                                    />
                                </div>

                                {/* Right: Details */}
                                <div className="flex flex-col justify-between w-full space-y-1">
                                    <p className="text-base font-semibold text-gray-900">
                                        {entry.visitor_info_json.visitor_name}
                                    </p>

                                    <p className="text-sm text-gray-600 flex items-center">
                                        <Smartphone size={14} className="mr-1" />
                                        {entry.visitor_info_json.guest_mobile_no}
                                    </p>

                                    <p className="text-sm text-gray-600 flex items-center capitalize">
                                        <Footprints size={14} className="mr-1" />
                                        {entry.visitor_info_json.guest_type}
                                    </p>

                                    <p className="text-sm text-gray-600 flex items-center capitalize">
                                        <Car size={14} className="mr-1" />
                                        {entry.visitor_info_json.vehicle_type} ({entry.visitor_info_json.vehicle_registration_number})
                                    </p>

                                    <button
                                        className="text-sm text-blue-600 hover:underline mt-1 text-left"
                                        onClick={() => {
                                            setDrawerUnits(entry.resident_array);
                                            setDrawerOpen(true);
                                        }}
                                    >
                                        <Home size={14} className="inline-block mr-1" />
                                        View Premise Units
                                    </button>

                                    <div className="text-sm font-medium flex items-center gap-2 mt-1">
                                        {entry.approval_status === 'pending' && (
                                            <span className="text-yellow-600 flex items-center">
                                                <Clock size={14} /> Pending
                                            </span>
                                        )}
                                        {entry.approval_status === 'approved' && (
                                            <span className="text-green-600 flex items-center">
                                                <CheckCircle size={14} /> Approved
                                            </span>
                                        )}
                                        {entry.approval_status === 'rejected' && (
                                            <span className="text-red-600 flex items-center">
                                                <XCircle size={14} /> Rejected
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-3 mt-3">
                                        <button
                                            onClick={() => updateStatus(visitId, 'approved')}
                                            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg shadow active:scale-95"
                                        >
                                            Approve
                                        </button>
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => updateStatus(visitId, 'rejected')}
                                            className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg shadow active:scale-95"
                                        >
                                            Reject
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                        );
                    })}
                </div>

            )}

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                anchor="bottom"
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        padding: '16px',
                        maxHeight: '90vh',
                    },
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800"> Resident Unit Approval Status</h2>
                    <button onClick={() => setDrawerOpen(false)} className="text-blue-600 font-medium flex items-center gap-1">
                        <ChevronLeft size={18} /> Close
                    </button>
                </div>
                <div className="bg-gray-100 rounded-t-2xl w-full">
                    {/* Grabber */}
                    <div className="w-full flex justify-center pt-3">
                        <div className="w-10 h-1.5 bg-gray-400 rounded-full" />
                    </div>

                    {/* Content Wrapper */}
                    <div className="px-5 pb-5"> {/* Bottom padding for button */}
                        {drawerUnits.length === 0 ? (
                            <p className="text-gray-500 text-sm">No resident units found.</p>
                        ) : (
                            <ul className="space-y-2">
                                {drawerUnits.map((unit, index) => (
                                    <li
                                        key={index}
                                        className="bg-white px-4 py-2 rounded-xl text-sm text-gray-800 flex items-center justify-between shadow-sm"
                                    >
                                        <span>{unit}</span>
                                        <span className="text-yellow-600 flex items-center text-xs">
                                            <Clock size={14} className="mr-1" /> Pending
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </Drawer>


        </div>
    );
};

export default PendingVisitorList;
