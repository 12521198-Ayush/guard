'use client';

import axios from 'axios';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Drawer, Box } from '@mui/material';
import TicketCard from '../components/TicketCard';
import AssignVendor from '../components/AssignVendor';


export default function AssignTicket() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [availableVendors, setavailableVendors] = useState<any[]>([]);

  const handleAssignment = async (selectedVendor: any) => {

    if (!selectedVendor) {
      message.error("Please select service provider.");
      return;
    }

    let sp = null;
    try {
      sp = JSON.parse(selectedVendor);
      const requestData = {
        premise_id: session?.user?.primary_premise_id,
        order_id: ticketDetails?.order_id,
        sp_name: sp.name,
        sp_mobile: sp.mobile,
        order_status: 'picked',
      };
      console.log("Assign service provider details:", requestData);
      // var URL = ConfigURL.baseURL + 'service/society/status/update';
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/order-service/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json()
      if (response.status === 201) {
        console.log('Service Provider assigned to the ticket:', data)
        message.success('Service Provider assigned to the ticket.')
      }

      setDrawerOpen(false);
      setTicketDetails(null);
      fetchTickets();
    }
    catch (error) {
      message.error('Could not assign service provider.');
    }
  };

  const fetchTickets = async () => {

    const service_type = session?.user?.skill || undefined;

    const payload = {
      premise_id: session?.user?.primary_premise_id,
      sub_premise_id: session?.user?.sub_premise_id,
      servicetype: service_type,
      order_status: 'open',
    }

    const res = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/order-service/list', payload);

    const pendingData = res.data.data.array;
    console.log("pending tickets", JSON.stringify(payload))
    setTickets(pendingData);

  }

  const fetchAvailableVendors = async () => {

    const service_type = session?.user?.skill || undefined;

    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_BASE_URL + '/order-service/handyman/availability',
      {
        premise_id: session?.user?.primary_premise_id,
        servicetype: service_type
      },
      {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      }
    );

    const { data } = response.data;
    // console.log(data);
    setavailableVendors(data || []);
  }

  useEffect(() => {
    fetchAvailableVendors();
    fetchTickets();
  }, [])

  return (
    <>
      <div className="py-3 px-2 font-sans">
        <div className="flex justify-center mb-3">
          <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Assign Tickets</h2>
        </div>
        <div className="space-y-4 overflow-y-auto" style={{ height: '100vh' }}>
          {tickets.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center text-gray-500">
              <p className="text-base font-medium">No tickets available</p>
            </div>
          ) : (
            tickets.map((ticket: any) => (
              <div
                key={ticket._id}
                className="pr-2 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-start space-x-1"
                style={{
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                }}
                onClick={() => {
                  setDrawerOpen(true);
                  setTicketDetails(ticket);
                }}
              >
                <TicketCard ticket={ticket} showStatus={false} showIcon={false} />
              </div>
            ))
          )}

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
            overflow: 'hidden',
            m: 0, // remove default margin
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
          <AssignVendor
            availableVendors={availableVendors}
            handleAssignment={handleAssignment}
          />
        </Box>
      </Drawer>
    </>
  )
}