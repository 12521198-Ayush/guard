'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ScrollableMenu from './ScrollableMenu';
import { Drawer } from 'antd';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import DashboardImageCarousel from './DashboardImageCarousel';

type MenuItem = {
  name: string;
  link: string;
  icon?: string;
  description?: string;
  alert?: string;
};

const defaultMenuItems = [
  {
    name: "Billing & Payments",
    icon: "https://img.freepik.com/free-vector/credit-card-payment-concept-landing-page_52683-24768.jpg",
    link: "/billing-payments",
    description: "Manage your invoices and payments easily.",
    alert: "Your payment of ₹1000 is pending",
  },
  {
    name: "Express Entry",
    icon: "https://img.freepik.com/premium-vector/login-access-denied-vector-illustration-system-refuses-password-error-entry-computer-device-showing-user-does-have-permission-website-mobile-development_2175-1266.jpg",
    link: "/express-entry",
    description: "Quickly enter your details for access.",
  },
  {
    name: "Helpers, Maid and Staff",
    icon: "https://img.freepik.com/premium-vector/maid-service-home-concept-women-uniform-clean-apartment-staff-wash-floor-wipe-dust-wash-things-cleanliness-routine-household-chores-cartoon-flat-vector-illustration_118813-15503.jpg",
    link: "/helpers-maid-staff",
    description: "Find and manage your household staff.",
  },
  {
    name: "Complaint Management",
    icon: "https://mir-s3-cdn-cf.behance.net/projects/404/bdb00e101191511.Y3JvcCw2MzIsNDk0LDQ4LDE2NA.png",
    link: "/complaint-management",
    description: "Submit and track your complaints easily.",
  },
  {
    name: "Notice Board",
    icon: "https://img.icons8.com/bubbles/100/man-with-notification-bell.png",
    link: "/notice-board",
    description: "Stay updated with important announcements.",
  },
  {
    name: "Voting and Polls",
    icon: "https://img.freepik.com/free-vector/voting-concept-illustration_114360-5972.jpg",
    link: "/voting-polls",
    description: "Participate in community votes and polls.",
  },
];


const MobileMenu = () => {
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const premiseId = session?.user?.primary_premise_id;
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {

        if (!premiseId) throw new Error('Premise ID not found');

        // Step 2: Get menu_items
        const menuRes = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL+'/user-service/misc/dashboard/switch/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ premise_id: premiseId }),
        });

        const menuData = await menuRes.json();
        setMenuItems(menuData?.data?.menu_items?.length ? menuData.data.menu_items : defaultMenuItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 gap-4 p-2 bg-gray-100 min-h-screen">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl shadow-md animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
          <div className="mt-2 w-24 h-4 bg-gray-300 rounded mx-auto"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-5 left-5 z-50">
        <button onClick={() => setOpen(true)}>
          <img
            width="70"
            height="70"
            src="https://img.icons8.com/plasticine/100/automatic.png"
            alt="menu"
          />
        </button>
      </div>

      {/* Menu Drawer */}
      <Drawer
        title={<h2 className="text-lg font-semibold text-gray-800">Collaborative Tool</h2>}
        placement="bottom"
        onClose={() => setOpen(false)}
        open={open}
        height={250}
      >
        <div className="flex items-center bg-gray-100">
          <div className="mx-5 bg-white border-gray-200">
            <ScrollableMenu />
          </div>
        </div>
      </Drawer>

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 bg-gray-100">
          {/* Hero card */}

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative h-48 rounded-2xl overflow-hidden shadow-md"
          >
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 brightness-50"
              style={{
                backgroundImage:
                  'url("https://housing-images.n7net.in/4f2250e8/fa64e3b06decd9f205d463bfd0fb68f1/v5/large.jpg")',
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 h-full flex flex-col justify-center p-4 text-center">
              <h2 className="text-white text-2xl font-bold">
                {session?.user?.primary_premise_name || 'Your Premise'}
              </h2>
              <p className="text-white text-sm italic mt-1">
                “A peaceful home starts with respectful hands.”
              </p>
            </div>
          </motion.div> */}

          <DashboardImageCarousel premiseId={premiseId || ''} />


          {/* Menu items */}
          {menuItems.map((item, idx) => (
            <div key={idx} className="mb-2">
              <Link
                href={item.link}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:bg-gray-100 text-center"
              >
                {item.icon && (
                  <img
                    width="100"
                    height="80"
                    src={item.icon}
                    alt={item.name}
                    className="mb-2"
                  />
                )}
                <span className="text-lg font-semibold">{item.name}</span>
                {item.description && (
                  <span className="text-sm text-gray-600">{item.description}</span>
                )}
              </Link>
              {item.alert && (
                <div className="mt-2 p-3 border-l-4 border-yellow-400 bg-yellow-50 shadow rounded">
                  <span className="text-yellow-800 text-sm font-medium">
                    ⚠️ {item.alert}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MobileMenu;
