"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useWebViewAuth() {
  const { data: session, update } = useSession();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!session?.user?.accessTokenExpires) return;

      const timeLeft = session.user.accessTokenExpires - Date.now();

      if (timeLeft < 30 * 1000) {
        console.log("Access token is about to expire, refreshing...");
        try {
          await update(); // triggers jwt callback with trigger='update'
        } catch (err) {
          console.error("Manual refresh failed", err);
        }
      }
    }, 15 * 1000); // check every 30s

    return () => clearInterval(interval);
  }, [session, update]);
}