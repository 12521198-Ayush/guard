// components/SocketClient.tsx
"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

let socket: Socket | null = null;

export default function SocketClient() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.phone) return;

    const premise = localStorage.getItem("selected_premise_id");
    const subpremise = localStorage.getItem("selected_subpremise_id");
    if (!premise || !subpremise) return;

    const security_guard_id = `${premise}[${subpremise}]${session.user.phone}`;

    if (!socket || !socket.connected) {
      socket = io("https://api.servizing.app:4561", {
        query: { userId: security_guard_id },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected!");
      });

      socket.on("disconnect", (reason) => {
        console.warn("❌ Socket disconnected:", reason);
      });

      socket.on("connect_error", (err) => {
        console.error("🚨 Connection error:", err.message);
      });

      socket.on("new_message", (msg) => {
        console.log("📩 New message:", msg);
      });
    }

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [session]);

  return null;
}
