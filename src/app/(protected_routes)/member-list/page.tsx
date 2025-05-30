'use client';

import { useEffect, useState } from 'react';
import { CircularProgress, Drawer } from '@mui/material';
import { Person, Phone, Mail, Badge } from '@mui/icons-material';
import MemberDeviceList from './MemberDeviceList'; // Adjust the path if needed
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

interface Member {
    _id: string;
    name: string;
    mobile: string;
    email: string;
    association_type: string;
    registration_status: string;
    is_active: string;
}

const MemberList = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { data: session } = useSession();
    const [selectedMobile, setSelectedMobile] = useState<string | null>(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('http://139.84.166.124:8060/user-service/family_member/list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        premise_id: session?.user?.primary_premise_id,
                        sub_premise_id: session?.user?.sub_premise_id,
                        premise_unit_id: session?.user?.premise_unit_id,
                        proposer_mobile: session?.user?.phone,
                    }),
                });

                const data = await res.json();
                if (data?.data) setMembers(data.data);
            } catch (err) {
                console.error('Error fetching members:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const formatPhone = (num: string) => num.slice(-10);

    const handleMemberClick = (mobile: string) => {
        setSelectedMobile(mobile);
        setDrawerOpen(true);
    };

    return (
        <div className="bg-white p-3 font-sans relative">
            <div className="flex justify-center mb-6">
                <h2
                    className="text-xl font-medium text-[#222] px-6 py-3 rounded-2xl bg-white"
                    style={{
                        textAlign: 'center',
                        width: '90%',
                        background: 'linear-gradient(to right, #ffffff, #f9fbfd)',
                        boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 -1px 3px rgba(0, 0, 0, 0.07)',
                    }}
                >
                    Member list
                </h2>
            </div>

            <div className="space-y-4 overflow-y-auto pb-20" style={{ height: '75vh' }}>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <CircularProgress />
                    </div>
                ) : members.length === 0 ? (
                    <p className="text-center text-gray-500">No members found.</p>
                ) : (
                    members.map((member) => (
                        <div
                            key={member._id}
                            onClick={() => handleMemberClick(member.mobile)}
                            className="bg-white rounded-2xl shadow-md p-4 space-y-2 transition hover:shadow-lg active:scale-[0.98] cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Person className="text-blue-500" />
                                <span className="text-lg font-semibold text-gray-800">{member.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <Phone className="text-green-500" fontSize="small" />
                                <span>{formatPhone(member.mobile)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <Mail className="text-red-500" fontSize="small" />
                                <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <Badge className="text-purple-500" fontSize="small" />
                                <span>{member.association_type}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <span className="inline-block text-xs bg-blue-100 text-blue-700 rounded-full px-3 py-1">
                                    Status: {member.registration_status}
                                </span>
                                {member.is_active === 'no' && (
                                    <span className="inline-block text-xs bg-yellow-100 text-yellow-700 rounded-full px-3 py-1">
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Drawer
                anchor="bottom"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    style: {
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        padding: '16px',
                        maxHeight: '90vh',
                    },
                }}
            >
                <div className="flex justify-end mb-2">
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {selectedMobile && <MemberDeviceList mobile={selectedMobile} />}
            </Drawer>
        </div>
    );
};

export default MemberList;
