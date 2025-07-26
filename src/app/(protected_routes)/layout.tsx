'use client';

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

let socket: Socket | null = null;
type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'error';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [security_guard_id, setGaurdId] = useState('');
  const [socketMessages, setSocketMessages] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('disconnected');

  let phone = '9999999999';

  useEffect(() => {
    const guardId = localStorage.getItem('security_guard_id') || '';
    setGaurdId(guardId);

    console.log("🔐 security_guard_id:", guardId);

    if (!socket || !socket.connected) {
      socket = io("http://139.84.166.124:4561", {
        query: { userId: guardId },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket?.id);
        setConnectionStatus("connected");
      });

      socket.on("disconnect", (reason) => {
        console.warn("❌ Socket disconnected:", reason);
        setConnectionStatus("disconnected");
      });

      socket.on("connect_error", (err) => {
        console.error("🚨 Socket connection error:", err.message);
        setConnectionStatus("error");
      });

      socket.on("reconnect_attempt", (attempt) => {
        console.log(`🔁 Reconnect attempt ${attempt}`);
        setConnectionStatus("reconnecting");
      });

      socket.on("reconnect", (attempt) => {
        console.log(`✅ Reconnected after ${attempt} attempts`);
        setConnectionStatus("connected");
      });

      socket.on("new_message", (msg) => {
        console.log("📥 New message received:", msg);
        setSocketMessages((prev) => [...prev, msg]);

        // Optional: Broadcast to window
        window.postMessage({ type: 'NEW_SOCKET_MESSAGE', payload: msg }, '*');

      });
    }

    return () => {
      console.log("🔌 Disconnecting socket...");
      socket?.disconnect();
      socket = null;
    };
  }, [session]);

  const statusColor = {
    connected: "text-green-600",
    disconnected: "text-red-600",
    reconnecting: "text-yellow-600",
    error: "text-orange-600",
  };

  return (
    <DefaultLayout>
      <div className="relative mt-20 w-full bg-[#f1f3f6] text-gray-800 font-medium">
        {/* 🔄 Connection Status */}
        <div className="p-4 flex items-center gap-2">
          <span className={`text-sm font-semibold ${statusColor[connectionStatus]}`}>
            🔌 Status: {connectionStatus}
          </span>
          {/* <span className="text-xs text-gray-500">(Guard ID: {security_guard_id || "..."})</span> */}
        </div>

        {/* 📩 WebSocket Messages */}
        {/* <div className="p-4 pt-0">
          <h2 className="text-lg font-semibold mb-2">📡 WebSocket Messages</h2>
          <div className="bg-white p-4 rounded shadow max-h-64 overflow-y-auto space-y-2 text-sm">
            {socketMessages.length === 0 ? (
              <p className="text-gray-500">No messages received yet.</p>
            ) : (
              socketMessages.map((msg, index) => (
                <pre
                  key={index}
                  className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap break-all"
                >
                  {JSON.stringify(msg, null, 2)}
                </pre>
              ))
            )}
          </div>
        </div> */}

        {children}
      </div>
    </DefaultLayout>
  );
}
