"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProfileCard from "../Header/ProfileCard";
import { useSession } from 'next-auth/react';
import SwitchSociety from "../SwitchSociety/SwitchSociety";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const sidebar = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const clickHandler = (event: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (sidebar.current.contains(event.target as Node) || trigger.current.contains(event.target as Node)) {
        return;
      }
      setSidebarOpen(false); // Close the sidebar if clicked outside
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen]);

  const handleMenuClick = () => {
    setSidebarOpen(false); // Close the sidebar when a menu item is clicked
  };

  const [modalOpen, setModalOpen] = useState(false);

  const handleMenuClickAndOpenModal = () => {
    handleMenuClick(); // close sidebar
    setModalOpen(true); // open modal
  };

  return (
    <>
      {/* Blur effect when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)} // Close the sidebar when clicking on the blur
        ></div>
      )}

      <aside
        ref={sidebar}
        className={`absolute left-0 top-0 z-9999 flex h-screen w-82.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* SIDEBAR HEADER */}
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
                name={session?.user?.name as string || 'User'}
                email={session?.user?.admin_email as string || 'admin@servizing.com'}
                role={session?.user?.role as string || 'role'}
              />
            </aside>
          )}
        </div>

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* Sidebar Menu */}
          <nav className="mt-1 px-1 py-0 lg:mt-0 lg:px-6">
            <div>
              <ul className="mb-6 flex flex-col gap-2">
                <li>
                  <Link
                    href="/menu"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/fluency/48/circled-menu.png" alt="circled-menu" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/fluency/48/combo-chart--v1.png" alt="combo-chart--v1" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.servizing.com/about.html"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/lollipop/48/about.png" alt="about" />
                    About Servizing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/premise"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/ultraviolet/40/front-gate-closed.png" alt="front-gate-closed" />
                    My Premise
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    onClick={handleMenuClickAndOpenModal}
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4`}
                  >
                    <img
                      width="25"
                      height="30"
                      src="https://img.icons8.com/external-febrian-hidayat-flat-febrian-hidayat/64/external-Reverse-user-interface-febrian-hidayat-flat-febrian-hidayat.png"
                      alt="Switch"
                    />
                    Switch Unit
                  </Link>
                </li>

                <SwitchSociety open={modalOpen} onClose={() => setModalOpen(false)} />


                <li>
                  <Link
                    href="/search-vehicle"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/fluency/48/car--v1.png" alt="car--v1" />
                    My Vehicles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/family-members"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-members-agile-flaticons-lineal-color-flat-icons.png" alt="external-members-agile-flaticons-lineal-color-flat-icons" />
                    My Family Members
                  </Link>
                </li>
                <li>
                  <Link
                    href="/add-society"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/arcade/64/plus-math.png" alt="plus-math" />
                    Add Premise
                  </Link>
                </li>
                <li>
                  <Link
                    href="/family-members"
                    onClick={handleMenuClick} // Close sidebar when clicking menu
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === "/dashboard" && "text-white"}`}
                  >
                    <img width="25" height="30" src="https://img.icons8.com/fluency/48/filled-trash.png" alt="filled-trash" />
                    Delete Account
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
