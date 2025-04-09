'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import VendorForm from './VendorForm';
import GuestForm from './GuestForm';
import OtherForm from './OtherForm';

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
        return <OtherForm onClose={closeDrawer} />;
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
        className: 'rounded-t-2xl px-4 py-6 h-[86vh] overflow-y-auto shadow-xl',
      }}
    >
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
        <div className="grid gap-4">
          {[
            { key: 'vendor', label: 'Vendor Entry' },
            { key: 'guest', label: 'Guest Entry' },
            { key: 'other', label: 'Other Entry' },
          ].map((entry) => (
            <button
              key={entry.key}
              onClick={() =>
                setSelectedEntry(entry.key as 'vendor' | 'guest' | 'other')
              }
              className="w-full text-left p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <span className="text-base font-medium text-gray-800">{entry.label}</span>
            </button>
          ))}
        </div>
      ) : (
        renderForm()
      )}
    </Drawer>
  );
}
