// app/layout.tsx

"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import Provider from "@/components/Providers"; // Adjust the import path as needed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Provider>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {loading ? <Loader /> : children}
          </div>
        </Provider>
      </body>
    </html>
  );
}
