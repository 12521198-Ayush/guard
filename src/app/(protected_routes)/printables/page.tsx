'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { FileTextOutlined, PrinterOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';

const DOCUMENTS_API = 'http://139.84.166.124:8060/user-service/misc/documents/read';
const PRESIGNED_URL_API = 'http://139.84.166.124:8060/user-service/upload/get_presigned_url';

type DocumentItem = {
    _id: string;
    document_description: string;
    document_object_id: string;
};

const DocumentsPage = () => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [iframeUrl, setIframeUrl] = useState('');
    const [iframeLoading, setIframeLoading] = useState(true);
    const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string; filetype: string } | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const { data: session } = useSession();
    const PREMISE_ID = session?.user?.primary_premise_id;
    const accessToken = session?.user?.accessToken;

    useEffect(() => {
        if (!accessToken || !PREMISE_ID) return;

        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const res = await fetch(DOCUMENTS_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ premise_id: PREMISE_ID }),
                });
                const data = await res.json();
                if (data?.data) setDocuments(data.data);
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [accessToken, PREMISE_ID]);

    const handleDocumentClick = async (doc: DocumentItem) => {
        setIframeLoading(true);
        try {
            const res = await fetch(PRESIGNED_URL_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ premise_id: PREMISE_ID, file_key: doc.document_object_id }),
            });

            const data = await res.json();
            if (data?.data) {
                const url = data.data;
                const filetype = url.includes('.pdf') ? 'pdf' : url.includes('.xls') ? 'excel' : 'image';
                setViewingDocument({
                    url,
                    name: doc.document_description,
                    filetype,
                });
            } else {
                throw new Error('Invalid presigned URL response');
            }
        } catch (error) {
            console.error('Error fetching presigned URL:', error);
        } finally {
            setIframeLoading(false);
        }
    };

    const handlePrint = () => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    };

    return (
        <div className="bg-white font-sans">
            <div className="p-4 max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Documents</h2>
                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
                    {loading ? (
                        <Spin size="large" className="mt-10" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleDocumentClick(doc)}
                                >
                                    <div>
                                        <h3 className="text-md font-semibold">{doc.document_description}</h3>
                                        <p className="text-xs text-gray-500">Tap to view & print</p>
                                    </div>
                                    <FileTextOutlined className="text-xl text-blue-600" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Animated Fullscreen Document Viewer */}
            <AnimatePresence>
                {viewingDocument && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed inset-0 z-[999999] flex flex-col bg-white overflow-hidden shadow-[0_-2px_16px_rgba(0,0,0,0.1)]"
                    >
                        {/* Header */}
                        <div className="relative bg-blue-600 text-white px-4 py-3 flex items-center justify-center shadow-sm">
                            <div className="flex items-center gap-2 truncate max-w-[80%]">
                                <FileTextOutlined className="text-white" />
                                <span className="text-sm font-medium truncate">{viewingDocument.name}</span>
                            </div>
                            <button
                                onClick={() => setViewingDocument(null)}
                                className="absolute right-4 text-2xl font-bold text-white"
                            >
                                ×
                            </button>
                        </div>

                        {/* Viewer Content */}
                        <div className="flex-1 bg-gray-50">
                            {iframeLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Spin tip="Loading..." />
                                </div>
                            ) : viewingDocument.filetype === 'pdf' || viewingDocument.filetype === 'excel' ? (
                                <iframe
                                    ref={iframeRef}
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                        viewingDocument.url
                                    )}&embedded=true`}
                                    className="w-full h-full border-none"
                                    title="Document Viewer"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-white">
                                    <img
                                        src={viewingDocument.url}
                                        alt={viewingDocument.name}
                                        className="max-h-full max-w-full object-contain rounded-md shadow-md"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Print Button */}
                        {/* <div className="p-2 border-t flex justify-end bg-white">
                            <button
                                onClick={handlePrint}
                                disabled={iframeLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                            >
                                <PrinterOutlined /> Print
                            </button>
                        </div> */}
                        <div className="mt-4 mx-2 mb-2 space-y-2 sticky bottom-0 bg-white">
                            <button
                                onClick={handlePrint}
                                disabled={iframeLoading}
                                className="w-full bg-blue-500 text-white py-3 rounded-xl shadow-md hover:bg-blue-500 transition text-base font-medium"
                            >
                                <PrinterOutlined /> Print
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentsPage;
