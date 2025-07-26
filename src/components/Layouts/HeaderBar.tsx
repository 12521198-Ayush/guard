'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, IconButton } from '@mui/material';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

const STATIC_AVATAR =
    'https://cdn1.iconfinder.com/data/icons/professions-filled-line/160/21-512.png';

export default function HeaderBar({ logoutConfirm }: { logoutConfirm: () => void }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [Uname, setName] = useState<any>('');
    const [premise, setPremise] = useState('');

    useEffect(() => {
        const name = localStorage.getItem('selected_name') || '';
        setName(name);
        const premiseName = localStorage.getItem('selected_premise_name') || '';
        setPremise(premiseName);
    }, []);



    return (
        <Box className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 rounded-b-2xl">
            <div className="flex items-center justify-between">
                {/* Avatar + Info */}
                <div className="flex items-center space-x-4">
                    <img
                        src={STATIC_AVATAR}
                        alt="User Avatar"
                        className="h-9 w-9 rounded-full object-cover shadow"
                    />
                    <div className="flex flex-col">
                        <span className="text-base font-semibold text-gray-900">
                            Hi, {Uname}
                        </span>
                        <span className="text-sm text-gray-500">{premise}</span>
                    </div>
                </div>

                {/* Logout Button */}
                <IconButton
                    onClick={logoutConfirm}
                    className="text-rose-600 hover:text-rose-700 transition"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </IconButton>
            </div>
        </Box>
    );
}
