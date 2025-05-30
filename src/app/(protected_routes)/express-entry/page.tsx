'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import VendorForm from './VendorForm';
import GuestForm from './GuestForm';
import OtherForm from './OtherForm';
import { Truck, UserPlus, ListOrdered } from 'lucide-react' // example icons

export default function VisitorEntry() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<'vendor' | 'guest' | 'other' | null>(null);

  const closeDrawer = () => {
    if (selectedEntry === null) {
      setOpen(false);
      router.push('/menu');
    } else {
      setSelectedEntry(null);
    }
  };

  const renderForm = () => {
    switch (selectedEntry) {
      case 'vendor':
        return <VendorForm onClose={closeDrawer} />;
      case 'guest':
        return <GuestForm onClose={closeDrawer} />;
      case 'other':
        return <OtherForm />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={closeDrawer}
      PaperProps={{
        className:
          'rounded-t-3xl px-5 py-6 h-[86vh] max-h-[90vh] overflow-y-auto shadow-xl bg-gray-50 animate-slideUp',
          style: { height: 'fit-content' },
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
        <h2 className="text-xl font-bold text-gray-800">
          {selectedEntry
            ? `${selectedEntry.charAt(0).toUpperCase() + selectedEntry.slice(1)} Entry`
            : 'Visitor Entry'}
        </h2>
        <IconButton onClick={closeDrawer}>
          <CloseIcon className="text-gray-500" />
        </IconButton>
      </div>

      {selectedEntry === null ? (
        <div className="grid gap-5">
          {[
            {
              key: 'vendor',
              label: 'Pre-invite Vendor',
              about: 'Allow delivery agents, repairmen, or other service providers.',
              color: 'from-indigo-100 to-white',
              icon: <Truck className="h-6 w-6 text-indigo-600" />,
            },
            {
              key: 'guest',
              label: 'Pre-invite Guest',
              about: 'Invite your friends or family to visit your home.',
              color: 'from-green-100 to-white',
              icon: <UserPlus className="h-6 w-6 text-green-600" />,
            },
            {
              key: 'other',
              label: 'Pre-invited Guest/Vendors',
              about: 'See whom you have invited?',
              color: 'from-yellow-100 to-white',
              icon: <ListOrdered className="h-6 w-6 text-yellow-600" />,
            },
          ].map((entry) => (
            <button
              key={entry.key}
              onClick={() => setSelectedEntry(entry.key as 'vendor' | 'guest' | 'other')}
              className={`w-full text-left rounded-xl p-4 bg-gradient-to-tr ${entry.color} shadow-md hover:shadow-lg transition-all flex items-start gap-3`}
            >
              {entry.icon}
              <div>
                <span className="block text-base font-semibold text-gray-800">
                  {entry.label}
                </span>
                <span className="mt-1 text-sm text-gray-600">{entry.about}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        renderForm()
      )}
    </Drawer>
  );
}
