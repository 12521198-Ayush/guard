"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ProfileCard from "../Header/ProfileCard";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const sidebar = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Handle window resize safely
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Retrieve stored sidebar state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSidebarExpanded = localStorage.getItem("sidebar-expanded") === "true";
      setSidebarExpanded(storedSidebarExpanded);
    }
  }, []);

  // Close sidebar on click outside
  useEffect(() => {
    if (!sidebarOpen) return;

    const clickHandler = (event: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (sidebar.current.contains(event.target as Node) || trigger.current.contains(event.target as Node)) {
        return;
      }
      setSidebarOpen(false);
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen]);

  // Close sidebar on Escape key press
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen]);

  // Store sidebar expanded state
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
      document.body.classList.toggle("sidebar-expanded", sidebarExpanded);
    }
  }, [sidebarExpanded]);


  return (
    <>

      <aside
        ref={sidebar}
        className={`absolute left-0 top-0 z-9999 flex h-screen w-82.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >

        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2">

          {!isMobile && (
            <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
              <div className="text-white flex text-md justify-center items-center">
                <Link href="/dashboard">
                  <Image
                    width={52}
                    height={52}
                    src="/images/logo/logo.png"
                    alt="Logo"
                    priority
                  />
                </Link>
                &ensp;&ensp; SERVIZING
              </div>
            </div>
          )}

          {/* Mobile header */}
          {isMobile && (
            <aside className="w-64 bg-gray-900 text-white">
              <ProfileCard
                name="Test Resident"
                email="test.res@servizing.com"
                location="000, NA, JGP"
              />
            </aside>
          )}
        </div>
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-1 px-1 py-0 lg:mt-0 lg:px-6">
            {/* <!-- Menu Group --> */}
            <div>


              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <Link
                    href="/home"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="48" src="https://img.icons8.com/doodle/48/ringing-phone.png" alt="ringing-phone" />
                    Update landline
                  </Link>
                </li>

                <li>
                  <Link
                    href="/add-photo"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="40" src="https://img.icons8.com/office/40/family--v3.png" alt="family--v3" />
                    Add Family Members Photo
                  </Link>
                </li>

                <li>
                  <Link
                    href="/emergency-contacts"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="50" src="https://img.icons8.com/stickers/50/new-contact.png" alt="new-contact" />
                    Add Emergency Contact
                  </Link>
                </li>

                <li>
                  <Link
                    href="/my-visitors"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="48" src="https://img.icons8.com/color/48/tourist-guide-skin-type-1.png" alt="tourist-guide-skin-type-1" />
                    My Visitors
                  </Link>
                </li>

                <li>
                  <Link
                    href="/search-vehicle"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="50" src="https://img.icons8.com/arcade/64/traffic-jam.png" alt="traffic-jam" />
                    Search any Vehicle
                  </Link>
                </li>
                <li>
                  <Link
                    href="/registered-vehicle"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="50" src="https://img.icons8.com/dusk/64/licence.png" alt="licence" />
                    Registered Vehicle
                  </Link>
                </li>
                <li>
                  <Link
                    href="/flat-switch"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="50" src="https://img.icons8.com/plasticine/100/replace.png" alt="replace" />
                    Switch Flat
                  </Link>
                </li>

                <li>
                  <Link
                    href="/add-member"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <img width="30" height="50" src="https://img.icons8.com/arcade/64/plus-math.png" alt="plus-math" />
                    Add a Member
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
                      <path fill="#2196F3" d="M37,40H11l-6,6V12c0-3.3,2.7-6,6-6h26c3.3,0,6,2.7,6,6v22C43,37.3,40.3,40,37,40z"></path><path fill="#FFF" d="M22 20H26V31H22zM24 13A2 2 0 1 0 24 17 2 2 0 1 0 24 13z"></path>
                    </svg>
                    About Servizing
                  </Link>
                </li>


              </ul>
            </div>
          </nav>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
