'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Modal } from "antd";
const Register = dynamic(() => import('./Register'), { ssr: false });

export default function Registration() {
    const [new_registration_token, setnew_registration_token] = useState<string | null>(null);
    const [mobile, setmobile] = useState<string | null>(null);
    const [data, setData] = useState<any | null>({});

    useEffect(() => {

        const handleMessage = async (event: MessageEvent) => {
            if (!event.data || typeof event.data !== "object") {
                console.warn("⚠️ Invalid event data:", event.data);
                return;
            }

            const { new_registration_token, mobile } = event.data;
            setData(event.data);

            // Make sure these values are strings or numbers, not objects
            setnew_registration_token(typeof new_registration_token === 'string' ? new_registration_token : null);
            setmobile(typeof mobile === 'string' ? mobile : null);
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <>
            {new_registration_token && mobile ? (
                <Register />
            ) : (
                <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                </div>
            )}
        </>
    );
}
