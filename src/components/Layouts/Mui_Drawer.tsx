'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const drawerHeight = 0.6; // 60% of screen height

const mockFetchVisitors = async () => {
  return [
    { id: 1, name: 'Ravi Kumar', flat: 'A-203', status: 'Waiting' },
    { id: 2, name: 'Neha Singh', flat: 'B-101', status: 'Waiting' },
  ];
};

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await mockFetchVisitors();
      setVisitors(data);
      setLoading(false);
      if (data.length > 0) setOpen(true);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id: number) => {
    setVisitors((prev) => prev.filter((v) => v.id !== id));
  };

  const handleReject = (id: number) => {
    setVisitors((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <>
      <Box sx={{ pb: open ? `${drawerHeight * 100}vh` : 4 }}>
        <Box component="main">{children}</Box>
      </Box>

      {/* Swipe-Up Handle */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#fff',
              borderRadius: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1300,
            }}
          >
            <IconButton onClick={() => setOpen(true)}>
              <KeyboardArrowUpIcon />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Bottom Drawer */}
      <AnimatePresence>
        {open && (
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
              height: `${drawerHeight * 100}vh`,
              backgroundColor: '#fefefe',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
              zIndex: 1300,
              padding: '16px',
              overflowY: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton onClick={() => setOpen(false)}>
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Visitors Waiting at Gate
            </Typography>
            <Divider sx={{ mb: 1 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : visitors.length === 0 ? (
              <Typography color="text.secondary" mt={2}>
                No visitors currently waiting.
              </Typography>
            ) : (
              visitors.map((visitor) => (
                <Box
                  key={visitor.id}
                  sx={{
                    bgcolor: '#fff',
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography fontWeight="600">{visitor.name}</Typography>
                  <Typography color="text.secondary" fontSize={13}>
                    Flat {visitor.flat} • {visitor.status}
                  </Typography>

                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={() => handleApprove(visitor.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleReject(visitor.id)}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
