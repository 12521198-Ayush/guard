'use client';

import axios from 'axios';
import { message } from 'antd';
import IconButton from '@mui/material/IconButton'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Drawer, Box } from '@mui/material';

import TicketCard from '../components/TicketCard';
import AssignVendor from '../components/AssignVendor';
import TicketTimeline from '../components/TicketTimeline';
import TicketStatusChange from '../components/TicketStatusChange';
import DoneAllTwoToneIcon from '@mui/icons-material/DoneAllTwoTone';
import PersonOffTwoToneIcon from '@mui/icons-material/PersonOffTwoTone';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import NoMeetingRoomTwoToneIcon from '@mui/icons-material/NoMeetingRoomTwoTone';

import { blue, orange, lightGreen, blueGrey, pink } from '@mui/material/colors';

export default function InProgressTickets() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [newStauts, setNewStauts] = useState<string>("");
  const [showTimeline, setShowTimeline] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [availableVendors, setavailableVendors] = useState<any[]>([]);
  
  const handleAssignment = async (selectedVendor: any) => {

    if (!selectedVendor) {
      message.error("Please select service provider.");
      return;
    }

    let sp = null;
    try{
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
      const response = await fetch('http://139.84.166.124:8060/order-service/update', {
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
      setShowAssign(false);
      setShowTimeline(false);
      setShowStatusChange(false);
      setNewStauts("");
      setTicketDetails(null);
      fetchTickets();
    }
    catch (error) {
      message.error('Could not assign service provider.');
    }
  };

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

  const fetchAvailableVendors = async () => {

    const service_type = session?.user?.skill || undefined;

    const response = await axios.post(
      'http://139.84.166.124:8060/order-service/handyman/availability',
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
    setavailableVendors(data || [] );
  }

  useEffect(() => {
    fetchAvailableVendors();
    fetchTickets();
  }, [])

  return (
    <>
      <div className="py-3 px-2 font-sans">
          <div className="flex justify-center mb-3">
              <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Parked / On-Hold Tickets</h2>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ height: '77vh' }}>
            {tickets.map((ticket: any) => (
              <div
                key={ticket._id}
                className="bg-white pr-0 rounded-xl shadow-md transition-all active:scale-[0.98] flex-wrap items-start space-y-1"
                style={{
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                }}  
              >
                {/* Ticket Info */}
                <TicketCard ticket={ticket} showStatus={true} showVendor={true} showIcon={false} showParked={true} />

                {/* Action Buttons */}
                {/* <div className="flex justify-left space-x-1"> */}
                <div className="flex justify-start gap-1 p-1">
                  <IconButton
                    onClick={() => {
                      setTicketDetails(ticket);
                      setDrawerOpen(true);
                      setShowAssign(false);
                      setShowTimeline(true);
                      setShowStatusChange(false);
                      setNewStauts("");
                    }}
                    
                    className="!p-2 border border-gray-600 bg-gray-500 hover:bg-gray-700 rounded-full transition"
                  >
                    <HourglassBottomOutlinedIcon sx={{ color: blueGrey[500] }} fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      setTicketDetails(ticket);
                      setDrawerOpen(true);
                      setShowAssign(true);
                      setShowTimeline(false);
                      setShowStatusChange(false);
                      setNewStauts("");
                    }}
                    className="!p-2 border border-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition"
                  >
                    <AssignmentIndOutlinedIcon sx={{ color: blue[600] }} fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      setTicketDetails(ticket);
                      setDrawerOpen(true);
                      setShowAssign(false);
                      setShowTimeline(false);
                      setShowStatusChange(true);
                      setNewStauts("door_locked");
                    }}
                    className="!p-2 border border-pink-600 bg-pink-50 hover:bg-pink-100 rounded-full transition"
                  >
                    <NoMeetingRoomTwoToneIcon sx={{ color: pink[600] }} fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      setTicketDetails(ticket);
                      setDrawerOpen(true);
                      setShowAssign(false);
                      setShowTimeline(false);
                      setShowStatusChange(true);
                      setNewStauts("customer_not_available");
                    }}
                    className="!p-2 border border-pink-600 bg-pink-50 hover:bg-pink-100 rounded-full transition"
                  >
                    <PersonOffTwoToneIcon sx={{ color: pink[600] }} fontSize="small" />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => {
                      setTicketDetails(ticket);
                      setDrawerOpen(true);
                      setShowAssign(false);
                      setShowTimeline(false);
                      setShowStatusChange(true);
                      setNewStauts("complete");
                    }}
                    className="!p-2 border border-green-600 bg-green-50 hover:bg-green-100 rounded-full transition"
                  >
                    <DoneAllTwoToneIcon sx={{ color: lightGreen[600] }} fontSize="small" />
                  </IconButton>
                  
                </div>
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
        { (showTimeline==true) && <TicketTimeline ticket={ticketDetails} /> }
        { showAssign && (
          <AssignVendor
            availableVendors={availableVendors}
            handleAssignment={handleAssignment}
          /> 
        )}
        { showStatusChange && (

          <TicketStatusChange
            open={showStatusChange}
            onClose={() => 
                {
                  setDrawerOpen(false);
                  setShowAssign(false);
                  setShowTimeline(false);
                  setShowStatusChange(false);
                  setNewStauts("");
                  setTicketDetails(null);
                  fetchTickets();
                }
            }
            premiseId={session?.user?.primary_premise_id}
            ticketDetails={ticketDetails}
            newStatus={newStauts}
            session={session}
            refetchTickets={fetchTickets}
        />          

        )}        
      </Box>
    </Drawer>
  </>
  )
}
