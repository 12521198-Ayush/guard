'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ScrollableMenu from "./ScrollableMenu";
import { Drawer, Button } from "antd";
import { Alert } from "antd";
import { useSession } from 'next-auth/react';
import StatusStory from './StatusStory'

const menuItems = [
  {
    name: "Billing & Payments",
    icon: <img width="100" height="80" src="https://img.freepik.com/free-vector/credit-card-payment-concept-landing-page_52683-24768.jpg?ga=GA1.1.1625333450.1739551380&semt=ais_authors_boost" alt="billing-payments" />,
    link: "/billing-payments",
    description: "Manage your invoices and payments easily.",
    alert: "Your payment of ₹1000 is pending",
  },
  {
    name: "Express Entry",
    icon: <img width="140" height="80" src="https://img.freepik.com/premium-vector/login-access-denied-vector-illustration-system-refuses-password-error-entry-computer-device-showing-user-does-have-permission-website-mobile-development_2175-1266.jpg" alt="express-entry" />,
    link: "/express-entry",
    description: "Quickly enter your details for access."
  },
  {
    name: "Helpers, Maid and Staff",
    icon: <img width="180" height="80" src="https://img.freepik.com/premium-vector/maid-service-home-concept-women-uniform-clean-apartment-staff-wash-floor-wipe-dust-wash-things-cleanliness-routine-household-chores-cartoon-flat-vector-illustration_118813-15503.jpg?semt=ais_hybrid" alt="helpers-maid-staff" />,
    link: "/helpers-maid-staff",
    description: "Find and manage your household staff."
  },
  {
    name: "Complaint Management",
    icon: <img width="140" height="80" src="https://mir-s3-cdn-cf.behance.net/projects/404/bdb00e101191511.Y3JvcCw2MzIsNDk0LDQ4LDE2NA.png" alt="complaint-management" />,
    link: "/complaint-management",
    description: "Submit and track your complaints easily."
  },
  {
    name: "Notice Board",
    icon: <img width="110" height="80" src="https://img.icons8.com/bubbles/100/man-with-notification-bell.png" alt="notice-board" />,
    link: "/notice-board",
    description: "Stay updated with important announcements."
  },
  {
    name: "Voting and Polls",
    icon: <img width="110" height="80" src="https://img.freepik.com/free-vector/voting-concept-illustration_114360-5972.jpg?t=st=1739624670~exp=1739628270~hmac=1fb6132ffda612d78830dbbaaecebefefb3bfadaf7e434e8d4538fcf76a3e87f&w=740" alt="voting-polls" />,
    link: "/voting-polls",
    description: "Participate in community votes and polls."
  },
];

const MobileMenu = () => {

  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

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
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 gap-4 p-2 bg-gray min-h-screen">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          <div className="mt-2 w-24 h-4 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>

      <div className="fixed bottom-5 left-5 z-50">
        <Link href="#" onClick={() => setOpen(true)}>
          <img width="70" height="70" src="https://img.icons8.com/plasticine/100/automatic.png" alt="automatic" />
        </Link>
      </div>
     
      {isLoading ? (
        <SkeletonLoader /> // Show skeleton loader while loading  
      ) : (
        <>
          {isMobile && (
            <>
              {/* <main className="flex justify-center items-center bg-gray-100">
                <StatusStory
                  imageUrl="https://www.nobroker.in/blog/wp-content/uploads/2024/03/best-society-in-delhi.jpg"
                  title={session?.user?.primary_premise_name ?? 'Unnamed Society'}
                  subtitle={session?.user?.premise_unit_id ?? 'Unknown Unit'}
                />
              </main> */}
              <div></div>
            </>
          )}
          <Drawer
            title={<h2 className="text-lg font-semibold text-gray-800">Collabarative Tool</h2>}
            placement="bottom"
            onClose={() => setOpen(false)}
            open={open}
            height={250}
          >
            <div className="flex items-center bg-gray-100">
              <div className="mx-5 bg-white border-gray-200 ">
                <ScrollableMenu />
              </div>
            </div>
          </Drawer>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 bg-gray-100'>
            {menuItems.map((item, index) => (
              <div key={index} className='mb-2'>
                <Link
                  href={item.link}
                  className='flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg hover:bg-gray-200 text-center'
                >
                  {item.icon}
                  <span className='mt-2 text-lg font-semibold'>{item.name}</span>
                  <span className='mt-1 text-sm'>{item.description}</span>
                </Link>
                {item.alert && (
                  <div className="mt-2 p-3 border-l-4 border-yellow-400 bg-yellow-50 shadow-sm rounded">
                    <span className="text-yellow-800 text-sm font-medium">⚠️ {item.alert}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default MobileMenu;
