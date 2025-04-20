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
    <Drawer
      anchor="bottom"
      open={open}
      onClose={closeDrawer}
      PaperProps={{
        className:
          'rounded-t-3xl px-5 py-6 h-[86vh] max-h-[90vh] overflow-y-auto shadow-xl bg-gray-50 animate-slideUp',
      }}
    >
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.35s ease-out;
        }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Complaint Options</h2>
        <IconButton onClick={closeDrawer}>
          <CloseIcon className="text-gray-500" />
        </IconButton>
      </div>

      <div className="grid gap-5">
        {[
          {
            route: '/create_or_pending_ticket',
            label: 'Create / Pending Tickets',
            about: 'Report a new complaint or view unresolved tickets.',
            color: 'from-blue-100 to-white',
            icon: <FilePlus2 className="h-6 w-6 text-blue-600" />,
          },
          {
            route: '/ticket-history',
            label: 'Ticket History',
            about: 'View your previously raised tickets.',
            color: 'from-purple-100 to-white',
            icon: <History className="h-6 w-6 text-purple-600" />,
          },
        ].map((option) => (
          <button
            key={option.route}
            onClick={() => router.push(option.route)}
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
    </Drawer>
  );
}
