'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Skeleton } from 'antd';
import { UserOutlined, PhoneOutlined, ToolOutlined } from '@ant-design/icons';

interface Vendor {
    _id: string;
    recommended_by_name: string;
    vendor_name: string;
    vendor_mobile: string;
    skill: string;
    sub_skill: string;
    premise_unit_id: string;
}

const VendorsList: React.FC = () => {
    const { data: session } = useSession();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchVendors = async () => {
            if (!session?.user?.primary_premise_id) return;
            try {
                const res = await axios.post('http://139.84.166.124:8060/user-service/misc/yellow_pages/read', {
                    premise_id: session.user.primary_premise_id,
                });
                setVendors(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch vendors', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, [session]);

    return (
        <div className="bg-white font-sans">
            <div className="p-4 max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Recommended Vendors</h2>

                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
                    {loading ? (
                        <Skeleton active paragraph={{ rows: 4 }} />
                    ) : vendors.length === 0 ? (
                        <p className="text-center text-gray-500">No vendors recommended yet.</p>
                    ) : (
                        vendors.map((vendor) => (
                            <div
                                key={vendor._id}
                                className="rounded-2xl shadow-md p-4 bg-white text-gray-800 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-indigo-700">{vendor.vendor_name}</h3>
                                    <span className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full shadow-sm">
                                        {vendor.skill}
                                    </span>
                                </div>

                                <div className="text-sm flex items-center gap-2">
                                    <UserOutlined className="text-gray-500" />
                                    Recommended by: <span className="font-medium">{vendor.recommended_by_name}</span>
                                </div>

                                <div className="text-sm flex items-center gap-2">
                                    <PhoneOutlined className="text-gray-500" />
                                    {vendor.vendor_mobile}
                                </div>

                                <div className="text-sm flex items-center gap-2">
                                    <ToolOutlined className="text-gray-500" />
                                    {vendor.sub_skill}
                                </div>

                                <div className="text-xs text-gray-500">Unit: {vendor.premise_unit_id}</div>
                            </div>

                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorsList;
