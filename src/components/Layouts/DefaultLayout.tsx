'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Snackbar, Alert, Slide } from '@mui/material';
import VisitorDrawer from './VisitorDrawer';

import {
  Grid3x3,
  RefreshCcw,
  Users,
  Bell,
  User,
  Package,
  Car,
  MoreHorizontal,
  ScanQrCode,
  LogOut,
  DoorOpen
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const drawerHeight = 0.7; // 60% of screen height
//@ts-ignore
const mockFetchVisitors = async () => {
  return [
    { id: 1, name: 'Ayush', flat: 'A-203', status: 'pending' },
    { id: 2, name: 'Ankit', flat: 'B-101', status: 'pending' },
    { id: 3, name: 'Gaurav', flat: 'B-101', status: 'pending' },
    { id: 4, name: 'Hritik', flat: 'B-101', status: 'pending' },
    { id: 5, name: 'Saurabh', flat: 'B-101', status: 'pending' },
    { id: 6, name: 'Nobita', flat: 'B-101', status: 'pending' },
    { id: 7, name: 'Shinchan', flat: 'B-101', status: 'pending' },
  ];
};

function SlideDown(props: any) {
  return <Slide {...props} direction="down" />;
}
export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragY, setDragY] = useState(0);
  const [visitors, setVisitors] = useState([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Alice Smith' },
    { id: 3, name: 'Bob Johnson' },
  ]);
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);
  const [currentVisitor, setCurrentVisitor] = useState<string | null>(null);

  useEffect(() => {
    if (visitors.length === 0) return;
    const interval = setInterval(() => {
      const visitor = visitors[currentVisitorIndex];
      setCurrentVisitor(visitor.name);
      setCurrentVisitorIndex((prev) => (prev + 1) % visitors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [visitors, currentVisitorIndex]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await mockFetchVisitors();
      setVisitors(data);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

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
  //@ts-ignore
  function onVoiceInputResult(text) {
    console.log("Recognized:", text);
    //@ts-ignore
    document.getElementById("inputField").value = text;
  }

  function startVoice() {
    //@ts-ignore
    AndroidInterface.startVoiceInput();
  }

  return (
    <>
      <Box sx={{ pb: open ? `${drawerHeight * 100}vh` : 10 }}>
        <Box component="main">{children}</Box>
      </Box>

      {/* Notification */}
      {/* <Snackbar
        open={!!currentVisitor}
        autoHideDuration={2800}
        onClose={() => setCurrentVisitor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideDown}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{
            bgcolor: '#4CAF50',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          }}
        >
          {currentVisitor} has been approved by the resident. Please allow entry.
        </Alert>
      </Snackbar> */}

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="relative bg-white shadow-xl rounded-t-2xl px-4 pt-3 pb-6">
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

          {/* Navigation Icons */}
          <div className="grid grid-cols-4 gap-1 items-center text-xs text-gray-700">
            <div onClick={startScan} className="flex flex-col items-center space-y-1">
              <ScanQrCode className="h-6 w-6 text-indigo-500" />
              <span className="font-medium">Scan Entry</span>
            </div>
            <div onClick={() => router.push('/manual-entry')} className="flex flex-col items-center space-y-1">
              <User className="h-6 w-6 text-green-500" />
              <span className="font-medium">Manual Entry</span>
            </div>
            <div onClick={startVoice} className="flex flex-col items-center space-y-1">
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

      <VisitorDrawer
        open={open}
        setOpen={setOpen}
        //@ts-ignore
        visitors={visitors}
        loading={loading}
      />

    </>
  );
}
