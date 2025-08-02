'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slide
} from '@mui/material';
import {
  motion,
  AnimatePresence
} from 'framer-motion';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  ScanLine,
  Search,
  FileClock,
  ShieldCheck,
  Briefcase,
  IdCard,
  UploadCloud,
  Settings,
  User,
  ScanQrCode,
  LogOut,
  DoorOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeaderBar from './HeaderBar';
import { signOut } from 'next-auth/react';

const drawerHeight = 0.8; // 80% of screen height

function SlideDown(props: any) {
  return <Slide {...props} direction="down" />;
}

export default function NewLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const name = "Ayush Sharma";
  const initials = name.split(' ').map(n => n[0]).join('');
  const { data: session } = useSession();

  const drawerOptions = [
    {
      key: 'pub-sub-scan',
      label: 'Pub Sub Scan',
      about: 'Scan and publish entries for verification.',
      icon: <ScanLine className="h-6 w-6 text-blue-600" />,
      route: '/pub-sub-scan',
      color: 'from-blue-100 to-blue-50',
    },
    {
      key: 'search-vehicle',
      label: 'Search Vehicle',
      about: 'Search vehicle details using plate or tags.',
      icon: <Search className="h-6 w-6 text-green-600" />,
      route: '/search-vehicle',
      color: 'from-green-100 to-green-50',
    },
    {
      key: 'helpers-logs',
      label: 'Helpers Logs',
      about: 'Track entry and exit logs of helpers.',
      icon: <FileClock className="h-6 w-6 text-purple-600" />,
      route: '/helpers-logs',
      color: 'from-purple-100 to-purple-50',
    },
    {
      key: 'verify-luggage',
      label: 'Verify Luggage',
      about: 'Confirm and verify visitor luggage.',
      icon: <ShieldCheck className="h-6 w-6 text-orange-600" />,
      route: '/verify-luggage',
      color: 'from-orange-100 to-orange-50',
    },
    {
      key: 'helper-employment',
      label: 'Helper Employment',
      about: 'Manage helper employment records.',
      icon: <Briefcase className="h-6 w-6 text-yellow-600" />,
      route: '/helper-employment',
      color: 'from-yellow-100 to-yellow-50',
    },
    {
      key: 'idcard-tagger',
      label: 'IdCard Tagger',
      about: 'Tag ID cards for verification and entry.',
      icon: <IdCard className="h-6 w-6 text-indigo-600" />,
      route: '/idcard-tagger',
      color: 'from-indigo-100 to-indigo-50', // visually close to Pub Sub Scan
    },
    {
      key: 'sync-attendance',
      label: 'Sync Attendance',
      about: 'Sync attendance data across devices.',
      icon: <UploadCloud className="h-6 w-6 text-teal-600" />,
      route: '/sync-attendance',
      color: 'from-teal-100 to-teal-50',
    },
    {
      key: 'settings',
      label: 'More Setting',
      about: 'Manage app preferences and settings.',
      icon: <Settings className="h-6 w-6 text-slate-600" />,
      route: '/settings',
      color: 'from-slate-100 to-slate-50',
    },
  ];



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

  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleLogoutConfirmed = () => {
    logout();
    setConfirmVisible(false);
  };

  const logoutConfirm = () => {
    setConfirmVisible(true); // show your modal instead of Swal
  };

  const [filteredDrawerOptions, setFilteredDrawerOptions] = useState(drawerOptions);
  const [modalOpen, setModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const storedDrawer = JSON.parse(localStorage.getItem('drawer_items') || '[]');

    if (storedDrawer.length > 0) {
      const storedKeys = storedDrawer.map((item: any) => item.key);
      const filtered = drawerOptions.filter((option) =>
        storedKeys.includes(option.key)
      );
      setFilteredDrawerOptions(filtered);
    } else {
      setFilteredDrawerOptions(drawerOptions);
    }
  }, []);

  const handleMenuClickAndOpenModal = () => {
    setModalOpen(true);
  };

  const startScan = () => {
    // Android
    // @ts-ignore
    if (window.AndroidInterface?.startQRScan) {
      // @ts-ignore
      window.AndroidInterface.startQRScan()
    }
    // iOS
    // @ts-ignore
    else if (window.webkit?.messageHandlers?.startQRScan) {
      // @ts-ignore
      window.webkit.messageHandlers.startQRScan.postMessage(null)
    } else {
      console.error('QR Scan interface not available')
    }
  }

  return (
    <>
      <HeaderBar logoutConfirm={logoutConfirm} />

      <Box sx={{ pb: open ? '50vh' : 0 }}>
        <Box component="main">{children}</Box>
      </Box>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="relative px-4 pt-3 pb-6 rounded-t-2xl shadow-[0_-6px_16px_rgba(0,0,0,0.08)] bg-white">
          {/* Swipe-up Button */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
            <AnimatePresence>
              {!open && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center"
                >
                  <IconButton onClick={() => setOpen(true)} size="large">
                    <KeyboardArrowUpIcon className="text-gray-700" />
                  </IconButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Nav Icons */}
          <div className="grid grid-cols-4 gap-1 items-center text-xs text-gray-700">
            <div onClick={startScan} className="flex flex-col items-center space-y-1">
              <ScanQrCode className="h-6 w-6 text-indigo-500" />
              <span className="font-medium">Scan Entry</span>
            </div>
            <div onClick={() => router.push('/manual-entry')} className="flex flex-col items-center space-y-1">
              <User className="h-6 w-6 text-green-500" />
              <span className="font-medium">Manual Entry</span>
            </div>
            <div onClick={startScan} className="flex flex-col items-center space-y-1">
              <LogOut className="h-6 w-6 text-orange-500" />
              <span className="font-medium">Scan Exit</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <DoorOpen className="h-6 w-6 text-gray-500" />
              <span className="font-medium">Manual Exit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Bottom Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Blur Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[1200] bg-black/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: dragY }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  setOpen(false);
                } else {
                  setDragY(0);
                }
              }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#fefefe',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
                zIndex: 1301,
                padding: '16px',
                overflowY: 'auto',
                maxHeight: '90vh',
                height: 'auto',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton onClick={() => setOpen(false)}>
                  <KeyboardArrowDownIcon />
                </IconButton>
              </Box>

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Action Tools
              </Typography>

              <Box className="grid grid-cols-1 gap-4 mt-4">
                {filteredDrawerOptions.map((option) => (
                  <div
                    key={option.key}
                    onClick={() => {
                      router.push(option.route);
                      setOpen(false);
                    }}
                    className={`rounded-xl p-4 bg-gradient-to-br ${option.color} cursor-pointer transition hover:scale-[1.02] shadow-sm`}
                  >
                    <div className="flex items-center space-x-4">
                      {option.icon}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">{option.label}</span>
                        <span className="text-xs text-gray-600">{option.about}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Box>
            </motion.div>

          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmVisible && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center px-4"
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
    </>
  );
}
