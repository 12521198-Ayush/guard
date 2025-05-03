'use client';
import Link from 'next/link';
import DropdownNotification from './DropdownNotification';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import DropdownUser from './DropdownUser';
import AddButton from '../Add-Modal/AddButton';
import StatusStory from '../Home/StatusStory'

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // set initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-[999] w-full bg-white shadow-md dark:bg-boxdark dark:shadow-none rounded-bl-3xl rounded-br-3xl">
      <div className="flex items-center justify-between px-4 py-4 md:px-6 2xl:px-11">

        {isMobile && (
          <div className="mr-auto text-black font-bold font-semibold flex text-md justify-center items-center">
            <div className="flex items-center gap-3 text-gray-800 font-semibold text-lg">
              <Link href="/dashboard">
                <Image
                  className="drop-shadow-2xl"
                  width={44}
                  height={44}
                  src="/images/logo/logo.png"
                  alt="Logo"
                  priority
                />
              </Link>
              <span className="text-base font-bold tracking-wide">SERVIZING</span>
            </div>
            </div>
         )}


            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">
              <ul className="flex items-center">
                {/* <div className="mr-4">
              <StatusStory
                imageUrl="https://www.nobroker.in/blog/wp-content/uploads/2024/03/best-society-in-delhi.jpg"
                title={session?.user?.primary_premise_name ?? 'Unnamed Society'}
                subtitle={session?.user?.premise_unit_id ?? 'Unknown Unit'}
              />
            </div> */}
                <DropdownNotification />
              </ul>

              {!isMobile && <DropdownUser />}

              {/* Hamburger for mobile */}
              <button
                aria-controls="sidebar"
                onClick={(e) => {
                  e.stopPropagation();
                  props.setSidebarOpen(!props.sidebarOpen);
                }}
                className="lg:hidden p-2 rounded-xl bg-white shadow-md dark:bg-boxdark transition duration-300 hover:shadow-lg active:scale-95"
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


            </div>
          </div>
    </header>
  );
};

export default Header;
