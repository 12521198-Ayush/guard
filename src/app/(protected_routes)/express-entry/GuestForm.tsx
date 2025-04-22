'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, BookUser, CheckCircle, Circle, StickyNote } from 'lucide-react';
import * as React from 'react';
import { Slider } from 'antd';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type Visitor = {
  name: string;
  phone: string;
};

type Contact = {
  name: string;
  phone: string;
};

type Props = {
  onClose: () => void;
};

export default function InviteVisitorsForm({ onClose }: Props) {

  const [visitors, setVisitors] = useState<Visitor[]>([{ name: '', phone: '' }]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showPhonebook, setShowPhonebook] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [validity, setValidity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const { data: session } = useSession()

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  useEffect(() => {
    const stringifyIfObject = (input: any) =>
      typeof input === 'object' ? JSON.stringify(input, null, 2) : input;

    const processContacts = (contactsInput: string | object) => {
      const contactsJson = typeof contactsInput === 'string'
        ? contactsInput
        : JSON.stringify(contactsInput);

      // message.info(`Received contacts JSON: ${stringifyIfObject(contactsInput)}`, 5);
      console.log("Raw contacts JSON:", contactsJson);

      try {
        const parsed: Contact[] = JSON.parse(contactsJson);
        console.log("Parsed contacts:", parsed);

        const uniqueContacts = Array.from(
          new Map(parsed.map(contact => [contact.name.toLowerCase(), contact])).values()
        );

        console.log("Filtered unique contacts:", uniqueContacts);
        // message.success(`Loaded ${uniqueContacts.length} unique contacts.`, 3);
        setContacts(uniqueContacts);
      } catch (error) {
        console.error('Error parsing contacts:', error);
        // message.error('Failed to parse contacts. Check console for details.', 5);
      }
    };

    // Android
    // @ts-ignore
    if (window.AndroidInterface?.getContacts) {
      console.log("Android detected. Fetching contacts...");
      // message.info("Android detected. Fetching contacts...", 3);

      // @ts-ignore
      const contactsJson = window.AndroidInterface.getContacts();
      processContacts(contactsJson);
    }

    // iOS
    // @ts-ignore
    else if (window.webkit?.messageHandlers?.getContacts) {
      console.log("iOS detected. Requesting contacts...");
      // message.info("iOS detected. Requesting contacts...", 3);

      // @ts-ignore
      window.onReceiveContacts = (contactsJson: any) => {
        console.log("iOS callback received contacts:", contactsJson);
        // message.success("Contacts received from iOS.", 3);
        processContacts(contactsJson);
      };

      // @ts-ignore
      window.webkit.messageHandlers.getContacts.postMessage(null);
    } else {
      console.log("No compatible contact interface found.");
      // message.warning("No compatible contact interface found.", 4);
    }
  }, []);



  const handleChange = (index: number, field: keyof Visitor, value: string) => {
    const updated = [...visitors];
    updated[index][field] = value;
    setVisitors(updated);
  };

  const handleAddVisitor = () => {
    setVisitors((prev) => [...prev, { name: '', phone: '' }]);
  };

  const handleRemoveVisitor = (index: number) => {
    setVisitors(visitors.filter((_, i) => i !== index));
  };

  const toggleSelectContact = (phone: string) => {
    setSelectedContacts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(phone)) {
        newSet.delete(phone);
      } else {
        newSet.add(phone);
      }
      return newSet;
    });
  };

  const handleAddSelectedContacts = () => {
    const newVisitors = contacts
      .filter((contact) => selectedContacts.has(contact.phone))
      .filter((contact) => !visitors.some((v) => v.phone === contact.phone))
      .map((contact) => ({ name: contact.name, phone: contact.phone }));

    if (newVisitors.length > 0) {
      if (visitors.length === 1 && !visitors[0].name && !visitors[0].phone) {
        setVisitors(newVisitors);
      } else {
        setVisitors((prev) => [...prev, ...newVisitors]);
      }
    }

    setSelectedContacts(new Set());
    setShowPhonebook(false);
  };

  const handleSubmit = async () => {
    const isEmpty = visitors.some((visitor) => !visitor.name || !visitor.phone);
    if (isEmpty) {
      alert('Please fill in all name and phone fields.');
      return;
    }

    const contact_array = visitors.map((visitor) => {
      const rawNumber = visitor.phone.replace(/\D/g, '').slice(-10); // Extract last 10 digits
      return {
        contact_name: visitor.name.trim(),
        contact_number: rawNumber,
      };
    });

    const now = new Date();
    const future = new Date(now.getTime() + validity * 24 * 60 * 60 * 1000); // validity days later

    if (!session?.user) return;
    const payload: any = {
      premise_id: session.user?.primary_premise_id,
      premise_unit_id: session.user?.premise_unit_id,
      sub_premise_id: session.user?.sub_premise_id,
      resident_mobile_number: session.user?.phone,
      invite_type: 'PERSONAL',
      start_date_iso: now.toISOString(),
      end_date_iso: future.toISOString(),
      contact_array,
    };


    if (note?.trim()) {
      payload.note_for_guest = note.trim();
    }

    console.log(payload);

    try {
      setLoading(true);
      const res = await fetch('http://139.84.166.124:8060/vms-service/guest/preinvite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert('Failed to submit: ' + (errorData.message || res.status));
        return;
      }

      onClose();

      if (res.status === 201) {
        const result = await res.json();

        const htmlContent = result.data
          .map(
            // @ts-ignore
            (visitor) => `
              <div class="qr-card flex-shrink-0 w-full max-w-xs p-3 bg-white rounded-xl text-center space-y-2 mx-auto relative border-gray-200">
                <p class="text-lg font-semibold text-gray-900">${visitor.contact_name}</p>
                <p class="text-sm text-gray-700">${visitor.contact_number}</p>
                <p class="text-sm text-gray-600">
                  Passcode: <strong class="text-black font-semibold">${visitor.passcode}</strong>
                </p>
      
                <img 
                  src="${visitor.signed_url}" 
                  alt="QR Code" 
                  class="mx-auto w-48 h-48 rounded-lg shadow-md object-contain border-gray-200"
                />
      
               <button 
                class="absolute top-3 mt-4 right-3 p-1 rounded-full hover:scale-105 transition"
                onclick="window.AndroidInterface?.shareImage?.(
                  '${visitor.signed_url}', 
                  'Visitor: ${visitor.contact_name}\\nMobile: ${visitor.contact_number}\\nPasscode: ${visitor.passcode}'
                )"
                title="Share via WhatsApp"
                >
                <img width="28" height="28" src="https://img.icons8.com/ios-filled/50/forward-arrow.png" alt="forward-arrow"/>
              </button>

              </div>
            `
          )
          .join('');
        Swal.fire({
          title: 'QR Code',
          html: `
              <div id="qr-scroll-container" class="flex overflow-x-auto snap-x snap-mandatory gap-4 px-2 pb-4">
                ${htmlContent}
              </div>
          
              <!-- Conditionally render dots only if there are more than one QR -->
              ${result.data.length > 1 ? `
                <div class="flex justify-center gap-2 mt-2" id="pagination-dots">
                  ${result.data.map((_: any, idx: any) => `
                    <span class="dot w-2 h-2 rounded-full bg-gray-400 transition-all duration-200 ease-in-out" data-index="${idx}"></span>
                  `).join('')}
                </div>
              ` : ''}
            
              <style>
                #qr-scroll-container::-webkit-scrollbar {
                  display: none;
                }
          
                .qr-card {
                  scroll-snap-align: center;
                  flex: 0 0 100%;
                }
          
                #pagination-dots .dot {
                  width: 10px;
                  height: 10px;
                  border-radius: 9999px;
                  background-color: #cbd5e1; /* Tailwind's slate-300 */
                  transition: all 0.2s ease-in-out;
                }
          
                #pagination-dots .dot.active {
                  width: 10px;
                  height: 10px;
                  background-color: #4CAF50;
                }
          
                .swal2-html-container {
                  padding: 0;
                }
              </style>
            `,
          width: '90%',
          background: '#ffffff',
          confirmButtonText: 'Done',
          confirmButtonColor: '#4CAF50',
          showCloseButton: true,
          scrollbarPadding: false,
          customClass: {
            popup: 'rounded-xl',
            confirmButton: 'text-white bg-green-500 hover:bg-green-600 text-sm px-5 py-2 rounded-md shadow',
            title: 'text-lg font-semibold text-gray-800',
          },
          didOpen: () => {
            const container = document.getElementById('qr-scroll-container');
            const dots = document.querySelectorAll('#pagination-dots .dot');

            function updateDots() {
              const scrollLeft = container?.scrollLeft ?? 0;
              const width = container?.offsetWidth ?? 1;
              const index = Math.round(scrollLeft / width);
              dots.forEach(dot => dot.classList.remove('active'));
              if (dots[index]) dots[index].classList.add('active');
            }

            if (container) {
              container.addEventListener('scroll', updateDots);
              setTimeout(updateDots, 100); // Make sure the first dot gets activated
            }
          }
        });

        router.push('/menu');
        onClose();
      }



      console.log(await res.json());

      alert('Visitors submitted successfully!');
      console.log(await res.json());
    } catch (error) {
      console.error('Submit Error:', error);
      alert('An error occurred while submitting.');
    }
    finally {
      setLoading(false); // Stop loader
    }
  };


  return (
    <motion.div
      key="invite"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full relative"
    >
      {/* Scrollable guest list */}
      <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-1 pb-3">
        <AnimatePresence>
          {visitors.map((visitor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="relative flex items-start gap-3 bg-gray-50 p-4 rounded-2xl shadow-md"
            >
              {/* Avatar Circle */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm uppercase">
                {visitor.name?.charAt(0) || 'G'}
              </div>

              {/* Name & Phone Inputs */}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Visitor Name"
                  value={visitor.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full rounded-xl px-3 py-2 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-inner"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={visitor.phone}
                  onChange={(e) => handleChange(index, 'phone', e.target.value)}
                  className="w-full rounded-xl px-3 py-2 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-inner"
                />
              </div>

              {/* Remove Button */}
              {visitors.length > 1 && (
                <button
                  onClick={() => handleRemoveVisitor(index)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-500"
                >
                  <Trash size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add guest / phonebook / note buttons */}
      <div className="flex space-x-2">

        <motion.button
          onClick={handleAddVisitor}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 rounded-2xl shadow-sm hover:shadow-md hover:from-blue-200 hover:to-indigo-200 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Add Guest
        </motion.button>

        <motion.button
          onClick={() => setShowPhonebook(!showPhonebook)}
          whileTap={{ scale: 0.95 }}
          title="Open Phonebook"
          className="px-4 bg-blue-100 text-blue-600 rounded-xl shadow-inner hover:bg-blue-200 transition flex items-center justify-center"
        >
          <BookUser size={20} />
        </motion.button>

        <motion.button
          onClick={() => setShowNote(!showNote)}
          whileTap={{ scale: 0.95 }}
          title="Add Note"
          className="px-4 bg-yellow-100 text-yellow-700 rounded-xl shadow-inner hover:bg-yellow-200 transition flex items-center justify-center"
        >
          <StickyNote size={20} />
        </motion.button>
      </div>

      {/* Note input with animation */}
      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-3"
          >
            <textarea
              placeholder="Write a note for the visitor(s)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full p-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none shadow-inner placeholder-gray-400"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slider for validity duration */}
      <div className="mt-4">
        <p className="text-gray-700">Pass Validity : {validity} days</p>
        <Slider
          min={1}
          max={30}
          step={1}
          value={validity}
          onChange={(value) => setValidity(value)}
          className="mt-2"
        />
      </div>


      {/* Phonebook drawer */}
      <AnimatePresence>
        {showPhonebook && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-30 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhonebook(false)}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white z-40 rounded-t-2xl max-h-[70vh] flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="sticky top-0 z-10 bg-white pt-4 px-4 rounded-t-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700 text-base">Select from Phonebook</h3>
                  <button
                    onClick={() => setShowPhonebook(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Close
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-none"
                />
              </div>

              <div className="overflow-y-auto px-4 pb-4 flex-1">
                {filteredContacts.length === 0 ? (
                  <p className="text-gray-400 text-sm mt-4">No contacts found.</p>
                ) : (
                  <ul className="space-y-2 mt-4">
                    {filteredContacts.map((contact, idx) => {
                      const isSelected = selectedContacts.has(contact.phone);
                      return (
                        <li
                          key={idx}
                          onClick={() => toggleSelectContact(contact.phone)}
                          className={`flex justify-between items-center p-3 rounded-xl cursor-pointer shadow-sm transition-all duration-200 ${isSelected
                            ? 'bg-blue-50'
                            : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-800">{contact.name}</span>
                            <span className="text-xs text-gray-500 block">{contact.phone}</span>
                          </div>

                          {isSelected ? (
                            <CheckCircle className="text-blue-500" size={20} />
                          ) : (
                            <Circle className="text-gray-300" size={20} />
                          )}
                        </li>

                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="p-4 border-gray-200">
                <button
                  onClick={handleAddSelectedContacts}
                  disabled={selectedContacts.size === 0}
                  className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium disabled:opacity-50"
                >
                  Add Selected ({selectedContacts.size})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom submit button */}
      <div className="mt-6 space-y-2 sticky bottom-0 bg-white pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-xl shadow-md hover:bg-green-600 transition text-base font-medium"
        >
          {loading ? 'Scheduling...' : 'Confirm'}
        </button>
      </div>
    </motion.div>
  );
}
