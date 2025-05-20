'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { AiFillFilePdf, AiFillFileImage, AiFillFileExcel } from 'react-icons/ai';
import { useSession } from 'next-auth/react'
import EmailDrawer from './EmailDrawer';
import { formatDistanceToNow } from 'date-fns';
import { Button } from 'antd';

const getFileType = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext!)) return 'image';
  if (['xls', 'xlsx', 'csv'].includes(ext!)) return 'excel';
  return 'file';
};

const Page = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [viewingAttachment, setViewingAttachment] = useState<any>(null);
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const premiseId = session?.user?.primary_premise_id;


  useEffect(() => {
    const fetchEmails = async () => {

      try {
        const res = await fetch("http://139.84.166.124:8060/communication-service-producer/communication/email/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ premise_id: premiseId }),
        });
        const result = await res.json();
        setEmails(result?.data);

      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    };

    fetchEmails();
  }, []);

  const getAttachmentIcon = (filetype: string) => {
    switch (filetype) {
      case 'pdf':
        return <AiFillFilePdf className="text-red-500 w-6 h-6" />;
      case 'image':
        return <AiFillFileImage className="text-blue-400 w-6 h-6" />;
      case 'excel':
        return <AiFillFileExcel className="text-green-500 w-6 h-6" />;
      default:
        return null;
    }
  };

  const handleAttachmentClick = async (att: any) => {
    try {
      const res = await fetch("http://139.84.166.124:8060/staff-service/upload/get_presigned_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ premise_id: premiseId, file_key: att.file_key }),
      });
      const result = await res.json();
      if (result?.data) {
        setViewingAttachment({ ...att, url: result.data });
      }
    } catch (error) {
      console.error("Error fetching attachment URL:", error);
    }
  };

  return (
    <div className="bg-white p-4 font-sans relative">
      <div className="flex justify-center mb-6">
        <h2
          className="text-xl font-medium text-[#222] px-6 py-3 rounded-2xl bg-white"
          style={{
            textAlign: 'center',
            width: '90%',
            background: 'white',
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 -1px 3px rgba(0, 0, 0, 0.07)',
          }}
        >
          Email Notifications
        </h2>
      </div>

      <div className="flex justify-start gap-4 px-6 py-4">
        {['ALL', 'Circular', 'Notice', 'Marketing'].map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              backgroundColor: selectedCategory === category ? '#1e62d0' : '#f0f0f0',
              color: selectedCategory === category ? 'white' : '#000',
            }}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="space-y-4 overflow-y-auto" style={{ height: '75vh' }}>
        {emails.map((email) => (
          <motion.div
            key={email.id}
            className=" from-white to-blue-50 p-4 rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => setSelectedEmail(email)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                {(email.subject?.replace(/^\s*/, '')?.charAt(0)?.toUpperCase() || 'E')}
              </div>

              {/* Email Content */}
              <div className="flex justify-between items-start flex-1">
                <div>
                  <h3 className="text-md font-semibold text-[#333]">{email.subject}</h3>
                  <p className="text-sm text-[#666]">{email.from}</p>
                  <span className="text-xs ml-1 text-gray-500">
                    • {email.ts ? formatDistanceToNow(new Date(email.ts), { addSuffix: true }) : 'now'}
                  </span>
                </div>
                {email.isStarred && <FaStar className="text-yellow-400 w-5 h-5" />}
              </div>
            </div>

          </motion.div>
        ))}
      </div>

      {/* Blur Background */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black backdrop-blur-md z-[999]"
            onClick={() => setSelectedEmail(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Drawer */}
      <EmailDrawer
        selectedEmail={selectedEmail}
        onClose={() => setSelectedEmail(null)}
        handleAttachmentClick={handleAttachmentClick}
        getAttachmentIcon={getAttachmentIcon}
      />


      {/* Attachment Viewer */}
      <AnimatePresence>
        {viewingAttachment && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[999999] flex flex-col bg-white overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="relative bg-blue-600 text-white p-4 flex items-center justify-center shadow-md">
              <span className="text-sm font-medium text-center truncate max-w-[80%]">
                {viewingAttachment.filename}
              </span>
              <button
                onClick={() => setViewingAttachment(null)}
                className="absolute right-4 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 bg-black/5">
              {viewingAttachment.filetype === 'pdf' ||
                viewingAttachment.filetype === 'excel' ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingAttachment.url)}&embedded=true`}
                  className="w-full h-full"
                  title="Document Viewer"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <img
                    src={viewingAttachment.url}
                    alt={viewingAttachment.filename}
                    className="max-h-full max-w-full object-contain rounded-md shadow-lg"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
