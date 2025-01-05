"use client";
import React, { useState, ReactNode } from "react";
import Mail_Sidebar from "@/components/Mail_Sidebar";
import MailHeader from "@/components/Header/MailHeader";
import Providers from "@/components/Providers";
import { motion, AnimatePresence } from 'framer-motion'

export default function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <AnimatePresence>
          {/* <!-- ===== Page Wrapper Start ===== --> */}
          <div className=" position-absolute bg-white flex h-screen overflow-hidden">
            {/* <!-- ===== Sidebar Start ===== --> */}
            <Mail_Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {/* <!-- ===== Sidebar End ===== --> */}

            {/* <!-- ===== Content Area Start ===== --> */}
            <div className=" flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              {/* <!-- ===== Header Start ===== --> */}
              <MailHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              {/* <!-- ===== Header End ===== --> */}

              {/* <!-- ===== Main Content Start ===== --> */}
              <main>
                <motion.div
                  className="mx-auto max-w-screen-2xl  "
                  initial={{opacity:0,y:15}}
                  animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:15}}
                  transition={{delay:0.5}}
                  >
                  {children}
                </motion.div>
              </main>
              {/* <!-- ===== Main Content End ===== --> */}
            </div>
            {/* <!-- ===== Content Area End ===== --> */}
          </div>
          {/* <!-- ===== Page Wrapper End ===== --> */}
      </AnimatePresence>
    </>
  );
}
