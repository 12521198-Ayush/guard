'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FilePlus2, History } from 'lucide-react';

export default function ComplaintDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const closeDrawer = () => {
    setOpen(false);
    router.push('/menu');
  };

  return (

    <div className="grid m-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Tickets</h2>
      </div>

      <div className="grid gap-5">
        {[
          {
            route: '/assign_ticket',
            label: 'Pending / Not-Assigned Tickets',
            about: 'Assign tickets to service provider for resolution.',
            color: 'from-blue-100 to-blue-50',
            icon: <FilePlus2 className="h-6 w-6 text-blue-500" />,
          },
          {
            route: '/in_progress',
            label: 'In Progress',
            about: 'View in-progress tickets.',
            color: 'from-amber-100 to-amber-50',
            icon: <History className="h-6 w-6 text-amber-600" />,
          },
          {
            route: '/on_hold',
            label: 'Parked / On-Hold Tickets',
            about: 'View tickets which have been parked or put on-hold.',
            color: 'from-pink-100 to-pink-50',
            icon: <FilePlus2 className="h-6 w-6 text-pink-500" />,
          },
          {
            route: '/ticket_history',
            label: 'Ticket History',
            about: 'View previously raised tickets.',
            color: 'from-green-100 to-green-50',
            icon: <History className="h-6 w-6 text-green-600" />,
          },
        ].map((option) => (
          <button
            key={option.route}
            onClick={() => router.push(`/service_provider/${option.route}`)}
            className={`w-full text-left rounded-xl p-4 bg-gradient-to-tr ${option.color} shadow-md hover:shadow-lg transition-all flex items-start gap-3`}
          >
            {option.icon}
            <div>
              <span className="block text-base font-semibold text-gray-800">
                {option.label}
              </span>
              <span className="mt-1 text-sm text-gray-600">{option.about}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
