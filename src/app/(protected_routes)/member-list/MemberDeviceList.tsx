'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Smartphone, Cpu, Globe2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from './skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { FaAndroid, FaApple } from 'react-icons/fa';

interface Device {
    _id: string;
    model: string;
    brand: string;
    versionRelease: string;
    sdkInt: string;
    board: string;
    hardware: string;
    ip: string;
    city: string;
    country: string;
    deviceID: string;
    operating_system: string;
    ts: string;

}

interface MemberDeviceListProps {
    mobile: string;
}

const MemberDeviceList: React.FC<MemberDeviceListProps> = ({ mobile }) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session } = useSession();

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const res = await axios.post('http://139.84.166.124:8060/user-service/family_member/devices/list', {
                premise_id: session?.user?.primary_premise_id,
                sub_premise_id: session?.user?.sub_premise_id,
                premise_unit_id: session?.user?.premise_unit_id,
                mobile,
            });
            setDevices(res.data.data || []);
        } catch (err) {
            console.error('Error fetching devices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mobile) fetchDevices();
    }, [mobile]);

    return (
        <div className="space-y-4 pb-6">
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            ) : devices.length === 0 ? (
                <p className="text-center text-gray-500">No devices found.</p>
            ) : (
                <AnimatePresence>
                    {devices.map((device) => (
                        <motion.div
                            key={`${device._id || device.deviceID || Math.random().toString(36).substr(2, 9)}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="rounded-2xl shadow-lg bg-white border-0">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-base font-medium text-gray-800">
                                                <Smartphone className="h-5 w-5 text-blue-600" />
                                                {device.model || 'Unknown Model'} ({device.brand || 'Unknown'})
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                {device.operating_system?.toLowerCase().includes('android') ? (
                                                    <FaAndroid className="text-green-600 w-4 h-4" />
                                                ) : device.operating_system?.toLowerCase().includes('ios') ? (
                                                    <FaApple className="text-gray-800 w-4 h-4" />
                                                ) : null}
                                                <span>
                                                {device.operating_system} {device.versionRelease || '?'} (SDK {device.sdkInt || '?'})
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Board: {device.board || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Location: {device.city || 'Unknown'}, {device.country || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Last Login: {device.ts ? new Date(device.ts).toLocaleString('en-IN', {
                                                    timeZone: 'Asia/Kolkata',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour12: true,
                                                }) : 'N/A'}
                                            </div>

                                        </div>
                                        <div className="text-xs text-gray-500 text-right space-y-1 pl-2">
                                            <div className="flex items-center gap-1">
                                                <Cpu className="h-4 w-4 text-purple-500" />
                                                <span>{device.hardware || 'Unknown ID'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Globe2 className="h-4 w-4 text-green-600" />
                                                <span className="truncate max-w-[100px]">{device.ip || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>
    );
};

export default MemberDeviceList;
