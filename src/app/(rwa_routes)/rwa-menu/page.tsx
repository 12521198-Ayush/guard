'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ManageAccounts,
  QrCodeScanner,
  ConnectedTv,
  NotificationsActive,
  DirectionsCar,
  Badge,
  AssignmentInd,
  CloudUpload,
  Logout,
} from '@mui/icons-material';
import Preference from './preference';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const menuItems = [
  {
    label: 'Manage Service',
    description: 'View or edit service configurations',
    icon: <ManageAccounts />,
    color: 'bg-blue-500',
    route: '/service_provider/supervisor',
  },
  {
    label: 'Pub Sub Scan',
    description: 'Scan QR to connect pub-sub devices',
    icon: <QrCodeScanner />,
    color: 'bg-green-500',
    route: '/pubsub-scan',
  },
  {
    label: 'Pub Sub Linking',
    description: 'Manually link pub-sub components',
    icon: <ConnectedTv />,
    color: 'bg-purple-500',
    route: '/pubsub-link',
  },
  {
    label: 'Send Notification',
    description: 'Broadcast custom alerts to residents',
    icon: <NotificationsActive />,
    color: 'bg-indigo-500',
    route: '/notifications-send',
  },
  {
    label: 'Add Vehicle',
    description: 'Register visitor or resident vehicle',
    icon: <DirectionsCar />,
    color: 'bg-yellow-500',
    route: '/vehicles-add',
  },
  {
    label: 'Tag Maid',
    description: 'Tag maid entry using QR or ID',
    icon: <Badge />,
    color: 'bg-pink-500',
    route: '/maid-tag',
  },
  {
    label: 'Add Helper (Partial)',
    description: 'Save basic details of a helper',
    icon: <AssignmentInd />,
    color: 'bg-teal-500',
    route: '/helpers-add-partial',
  },
  {
    label: 'Upload Helper PV',
    description: 'Upload police verification file',
    icon: <CloudUpload />,
    color: 'bg-orange-500',
    route: '/helpers-upload-pv',
  },
];


const Page = () => {
  const [showPreference, setShowPreference] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const isPreferenceTaken = localStorage.getItem('preferenceTaken');
    if (!isPreferenceTaken) {
      setShowPreference(true);
    }
  }, []);

  const handlePreferenceComplete = () => {
    localStorage.setItem('preferenceTaken', 'true');
    setShowPreference(false);
  };

  const logout = useCallback(() => {
    console.log("logout callback");

    const accessToken = session?.user?.accessToken || undefined

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      body: JSON.stringify({ accessToken })
    })
      .then(res => res.json())
      .then(data => {
      })
      .catch(error => {
      })
      .finally(async () => {
        await signOut({ callbackUrl: `${window.location.origin}/nativeRedirect/logout` })
      })
  }, [session])

  const handleLogoutConfirmed = () => {
    console.log('Logging out...');
    logout();
    setConfirmVisible(false);
  };

  if (showPreference) {
    return <Preference onComplete={handlePreferenceComplete} />;
  }


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex-1 px-4 py-6">
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Service Options
        </h1>

        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <Link href={item.route} key={index} passHref>
              <motion.div
                whileTap={{ scale: 0.96 }}
                className="rounded-xl shadow-md p-4 bg-white flex flex-col items-center justify-center text-center space-y-1 hover:shadow-lg transition cursor-pointer"
              >
                <div className={`text-white p-3 rounded-full ${item.color} shadow-inner`}>
                  {React.cloneElement(item.icon, { fontSize: 'medium' })}
                </div>
                <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                <span className="text-xs text-gray-500">{item.description}</span>
              </motion.div>
            </Link>
          ))}

        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => setConfirmVisible(true)}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-orange-600 text-white text-sm font-semibold py-5 shadow-inner hover:shadow-xl transition duration-300 ease-in-out"
      >
        <Logout fontSize="small" />
        Logout
      </motion.button>
      <AnimatePresence>
        {confirmVisible && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogoutConfirmed}
                  className="bg-rose-600 text-white px-4 py-2 rounded-xl shadow hover:bg-rose-700 transition"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setConfirmVisible(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl shadow hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
