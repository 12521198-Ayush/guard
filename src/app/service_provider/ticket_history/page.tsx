'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Drawer, Box } from '@mui/material';
import TicketCard from '../components/TicketCard';
import TicketTimeline from '../components/TicketTimeline';


export default function InProgressTickets() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  
  const fetchTickets = async () => {
    const service_type = session?.user?.skill || undefined;
    const res = await axios.post('http://139.84.166.124:8060/order-service/list', {
      premise_id: session?.user?.primary_premise_id,
      //sub_premise_id: session?.user?.sub_premise_id,
      //servicetype: service_type,
      //order_status: 'open',
    });

    const pendingData = res.data.data.array;
    setTickets(pendingData);
  }

  useEffect(() => {
    fetchTickets();
  }, [])

  return (
    <>
      <div className="py-3 px-2 font-sans">
          <div className="flex justify-center mb-3">
              <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Closed/Cancelled Tickets</h2>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ height: '77vh' }}>
            {tickets.map((ticket: any) => (
              <div
                key={ticket._id}
                className=" pr-2 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-start space-x-3"
                style={{
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                }}
                onClick={() => {
                  setDrawerOpen(true);
                  setTicketDetails(ticket);
                }}                
              >
                {/* Ticket Info */}
                <TicketCard ticket={ticket} showStatus={false} showVendor={true} showIcon={false} />
              </div>
            ))}
          </div>
      </div>
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        transitionDuration={200}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pt: 2,
            pb: 4,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
          },          
        }}
      >
      <Box
        sx={{
          height: 'fit-content',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle Bar */}
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%", height: 30 }}>
          <Box
            sx={{
              width: 40,
              height: 5,
              borderRadius: 3,
              backgroundColor: "#ccc",
            }}
          />
        </Box>
        {/* Content */}
        <TicketTimeline ticket={ticketDetails} />
        
      </Box>
    </Drawer>
  </>
  )
}
