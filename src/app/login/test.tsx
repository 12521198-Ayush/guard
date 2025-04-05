'use client';

import { useEffect, useState } from 'react';
import { signIn } from "next-auth/react";

export default function HomePage() {
    const [access, setAccess] = useState<string | null>(null);
    const [refresh, setRefresh] = useState<string | null>(null);

    useEffect(() => {
        console.log("🟢 useEffect triggered: Setting up message listener...");

        const handleMessage = async (event: MessageEvent) => {
            console.log("📩 Message received:", event);

            if (!event.data || typeof event.data !== "object") {
                console.warn("⚠️ Invalid event data:", event.data);
                return;
            }

            const { accessToken, refreshToken } = event.data;
            if (!accessToken || !refreshToken) {
                console.warn("⚠️ Missing tokens in message:", event.data);
                return;
            }

            console.log("✅ Tokens received:", { accessToken, refreshToken });

            setAccess(accessToken.toString());
            setRefresh(refreshToken.toString());

            await signIn("credentials", {
                access_token: accessToken.toString(),
                refresh_token: refreshToken.toString(),
                redirect: false,
            });

            window.location.href = '/menu';
        };

        window.addEventListener('message', handleMessage);

        setTimeout(() => {
            console.log("🚀 Simulating message event...");
            window.postMessage({ accessToken: "testAccess", refreshToken: "testRefresh" }, "*");
        }, 1000);

        return () => {
            console.log("🔴 Cleaning up: Removing message listener...");
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        // <div>
        //     <h2>Login Status</h2>
        //     {access && refresh ? (
        //         <>
        //             <p>✅ Access token: {access}</p>
        //             <p>✅ Refresh token: {refresh}</p>
        //         </>
        //     ) : (
        //         <p>⏳ Waiting for authentication...</p>
        //     )}
        // </div>


        <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
}