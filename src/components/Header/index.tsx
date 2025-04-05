"use client"
import Link from "next/link";
import DropdownNotification from "./DropdownNotification";
import Image from "next/image";
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from "react";
import DropdownUser from "./DropdownUser";
import AddButton from '../Add-Modal/AddButton';  


const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;

}) => {
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
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <header className="bg-white p-2">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {/* <HomeWorkIcon /> */}
            {/* &nbsp;&nbsp; */}
            {/* {session?.user?.current_premise_name || 'User'} */}
            {/* " "
            {session?.user?.primary_premise_id || 'User'} */}
          </h1>
        </header>

        {isMobile && (
          <div className="text-black font-bold font-semibold flex text-md justify-center items-center">
            <Link href="/dashboard">
              <Image
                className="drop-shadow-xl"
                width={52}
                height={52}
                src="/images/logo/logo.png"
                alt="Logo"
                priority
              />
            </Link>
            &ensp;&ensp;  SERVIZING
          </div>
        )}
        {/* <div>

          {session?.user?.primary_premise_name || 'User'}
        </div> */}
        {/* <DropdownNotification /> */}
        {/* <div className="p-2 ml-17 bg-white border-gray-300 rounded-xl shadow-lg w-12 h-12 flex items-center justify-center"> */}
        {/* <img width="30" className="ml-20" height="30" src="https://img.icons8.com/ios/50/qr-code--v1.png" alt="qr-code--v1"/> */}
        {/* </div> */}
        <div className="ml-auto mr-auto flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!w-full delay-300"
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "delay-400 !w-full"
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!w-full delay-500"
                    }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!h-0 !delay-[0]"
                    }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!h-0 !delay-200"
                    }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}


        </div>
        

        {/* <DropdownNotification /> */}

        <div className="flex items-center gap-3 ml-auto mr-2 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-">
            <DropdownNotification />
          </ul>
          <DropdownUser />
          {/* {!isMobile && (
            <DropdownUser />
          )} */}
        </div>
      </div>
    </header>
  );
};

export default Header;
 