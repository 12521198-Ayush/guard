'use client'

import React, { useEffect, useState } from 'react'
import {
    ChevronDown, ChevronUp, PhoneCall, ScrollText, CarFront,
    UserCircle, Clock, CheckCircle, XCircle
} from 'lucide-react'
import clsx from 'clsx'
import axios from 'axios'
import { useSession } from 'next-auth/react'

type GuestStatus = 'all' | 'pending' | 'approved' | 'rejected';

interface Guest {
    approval_status: string
    name: string;
    phone: string;
    purpose: string;
    vehicleType: string;
    reason: string;
    status: GuestStatus;
    imageUrl: string;
}

const statusTabs: GuestStatus[] = ['all', 'pending', 'approved', 'rejected'];

const statusIcon = {
    all: UserCircle,
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
};

const statusStyles: Record<GuestStatus, string> = {
    all: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const GateGuestList = () => {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [filter, setFilter] = useState<GuestStatus>('pending');
    const [expanded, setExpanded] = useState<number | null>(null);
    const { data: session } = useSession();

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
            console.error('Failed to fetch image URL:', error);
            return null;
        }
    };

    const loadGuestList = async () => {
        const stored = localStorage.getItem('pending_visitor_list');
        if (!stored) return;

        const parsed = JSON.parse(stored);
        console.log('Loaded guest data:', parsed);

        const guestPromises = parsed.map(async (entry: any) => {
            const fileKey = entry.visitor_info_json.pic_url;
            const imageUrl = await fetchPresignedUrl(fileKey);

            return {
                name: entry.visitor_info_json.visitor_name,
                phone: entry.visitor_info_json.guest_mobile_no,
                approval_status: entry.approval_status,
                purpose: entry.visitor_info_json.guest_type,
                vehicleType: `${entry.visitor_info_json.vehicle_type} (${entry.visitor_info_json.vehicle_registration_number})`,
                reason: entry.visitor_info_json.guest_reference || 'N/A',
                status: entry.approval_status,
                imageUrl: imageUrl ?? '/placeholder.jpg',
            };
        });

        const resolvedGuests = await Promise.all(guestPromises);
        setGuests(resolvedGuests);
    };

    useEffect(() => {
        if (session?.user?.accessToken) {
            loadGuestList();
        }
    }, [session]);

    // 🔁 Listen to custom event for external refresh trigger
    useEffect(() => {
        const handleUpdate = () => {
            loadGuestList();
        };

        window.addEventListener('visitorListUpdated', handleUpdate);
        return () => window.removeEventListener('visitorListUpdated', handleUpdate);
    }, []);

    const filteredGuests = filter === 'all' ? guests : guests.filter((guest) => guest.status === filter);

    return (
        <div className="mt-6 px-4 pb-6">
            <h2 className="text-lg font-semibold pb-2 text-gray-900">Gate Guest List</h2>

            <div className="flex gap-2 pb-3 overflow-x-auto">
                {statusTabs.map((tab) => (
                    <button
                        key={tab}
                        className={clsx(
                            'text-sm px-3 py-1 rounded-full font-medium shadow-sm',
                            filter === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        )}
                        onClick={() => setFilter(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="overflow-y-auto max-h-[250px] space-y-3">
                {filteredGuests.length === 0 ? (
                    <p className="text-sm text-gray-500 px-2">No entries found.</p>
                ) : (
                    filteredGuests.map((guest, idx) => {
                        const Icon = statusIcon[guest.status];
                        const isOpen = expanded === idx;

                        return (
                            <div key={idx} className="rounded-2xl shadow-md bg-white p-4 flex flex-col gap-2">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={guest.imageUrl}
                                        alt="Guest"
                                        className="w-14 h-14 rounded-xl object-cover border border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-gray-800">
                                                {/* <UserCircle className="w-4 h-4" /> */}
                                                <span className="font-medium">{guest.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium ${statusStyles[guest.status]}`}>
                                                    <Icon className="w-4 h-4" />
                                                    {guest.approval_status}
                                                </span>
                                                <button onClick={() => setExpanded(isOpen ? null : idx)}>
                                                    {isOpen ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {isOpen && (
                                            <div className="space-y-2 text-sm text-gray-700 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <PhoneCall className="w-4 h-4 text-gray-500" />
                                                    <span>{guest.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ScrollText className="w-4 h-4 text-gray-500" />
                                                    <span>{guest.purpose}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CarFront className="w-4 h-4 text-gray-500" />
                                                    <span>{guest.vehicleType}</span>
                                                </div>
                                                <div className="pl-6 text-gray-600">{guest.reason}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GateGuestList;
