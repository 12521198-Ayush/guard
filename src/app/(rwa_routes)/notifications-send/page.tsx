'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    TextField,
    CircularProgress,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {message} from 'antd';
import { FaUpload } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import { useSession } from 'next-auth/react';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const RichTextEditor = dynamic(() => import('react-quill'), { ssr: false });
const Page = () => {
    const { data: session } = useSession();

    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [recipientType, setRecipientType] = useState('all');
    const [subject, setSubject] = useState('');
    const [Emessage, setEmessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch(process.env.NEXT_PUBLIC_API_BASE_URL+'/communication-service-producer/communication/email/template/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: 'test' }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data?.data) setTemplates(data.data);
            });
    }, []);

    const handleSend = async () => {
        if (!subject || !Emessage) {
            setError('Subject and message cannot be empty.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setLoading(true);
        const payload = {
            recipient_type: recipientType,
            premise_id: session?.user?.primary_premise_id || "c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af",
            message: Emessage,
            subject,
            object_id_attachment_array: uploadedObjectIds,
        };

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL+'/communication-service-producer/communication/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (!result.error) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                setUploadedFiles([]);
                setUploadedObjectIds([]);
                setSubject('');
                setEmessage('');
                setSelectedTemplate('');
            } else {
                throw new Error('Server returned an error.');
            }
        } catch (err) {
            setError('Failed to send email.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateChange = (id: string) => {
        const template = templates.find((t) => t._id === id);
        if (template) {
            setSubject(template.template_description);
            setEmessage(`<p>${template.template}</p>`);
            setSelectedTemplate(id);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments((prev) => [...prev, ...files]);
    };

    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedObjectIds, setUploadedObjectIds] = useState<string[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [openPreviewIndexes, setOpenPreviewIndexes] = useState<number[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleRemoveFile = (index: number) => {
        console.log(`🗑️ Removing file at index ${index}`);
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        setUploadedObjectIds(prev => prev.filter((_, i) => i !== index));
    };

    const togglePreview = (index: number) => {
        setOpenPreviewIndexes(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index) // hide preview
                : [...prev, index]              // show preview
        );
    };

    const getBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) {
            console.log("🚫 No files selected");
            return;
        }

        setUploading(true);
        const objectIds: string[] = [];
        const previews: string[] = [];
        const acceptedFiles: File[] = [];

        const MAX_FILE_SIZE_MB = 2;
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'];

        for (const file of files) {
            console.log(`📂 Processing file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

            if (!validTypes.includes(file.type)) {
                console.warn(`⚠️ Invalid type for ${file.name}`);
                message.warning(`❌ ${file.name} is not a valid file type.`);
                continue;
            }

            let finalFile = file;

            try {
                if (file.type !== 'application/pdf') {
                    const options = {
                        maxSizeMB: 2,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                    };
                    finalFile = await imageCompression(file, options);
                    console.log(`🗜️ Compressed ${file.name} to ${(finalFile.size / 1024 / 1024).toFixed(2)}MB`);
                } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                    console.warn(`⚠️ ${file.name} is too large`);
                    message.warning(`❌ ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB.`);
                    continue;
                }
            } catch (error) {
                console.error(`❌ Compression failed for ${file.name}`, error);
                continue;
            }

            try {
                const base64WithPrefix = await getBase64(finalFile);
                const payload = {
                    premise_id: session?.user?.primary_premise_id || "c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af",
                    filetype: finalFile.type,
                    file_extension: finalFile.name.split('.').pop(),
                    base64_data: base64WithPrefix,
                };

                console.log("📤 Upload payload:", payload);

                const res = await axios.post(
                    process.env.NEXT_PUBLIC_API_BASE_URL+'/user-service/upload/async',
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                        },
                    }
                );

                const objectKey = res?.data?.data?.key;
                if (objectKey) {
                    objectIds.push(objectKey);
                    acceptedFiles.push(finalFile);
                    previews.push(
                        finalFile.type === 'application/pdf'
                            ? URL.createObjectURL(finalFile)
                            : base64WithPrefix
                    );

                    console.log(`✅ Uploaded ${file.name}, objectKey: ${objectKey}`);
                    message.success(`✅ ${file.name} uploaded.`);
                }
            } catch (error) {
                console.log(`❌ Upload failed for ${file.name}`, error);
                message.info(`Upload failed for ${file.name}`);
            }
        }

        setUploadedObjectIds(prev => [...prev, ...objectIds]);
        setPreviewUrls(prev => [...prev, ...previews]);
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);
        setUploading(false);

        console.log("✅ All uploads done. Object IDs:", uploadedObjectIds);

    };

    return (
        <Box className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-white p-4 space-y-6">
            {/* <div className="relative flex items-center justify-center py-2">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => history.back()}
                    className="absolute left-0 p-2 ml-1 rounded-full bg-gray-800 shadow text-gray-600"
                >
                    <ArrowBackIcon />
                </motion.button>
                
                <Typography variant="h6" className="text-xl font-semibold text-center text-gray-800 ">
                    Send Notification
                </Typography>
            </div> */}
            <div className="flex justify-center mb-3">
              <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">Send Notification</h2>
          </div>

            <motion.div
                className="grid grid-cols-1 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120 }}
            >
                <FormControl fullWidth>
                    <InputLabel>Recipient Type</InputLabel>
                    <Select value={recipientType} onChange={(e) => setRecipientType(e.target.value)} label="Recipient Type">
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="owner">Owners</MenuItem>
                        <MenuItem value="helper">Helpers</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Email Template</InputLabel>
                    <Select value={selectedTemplate} onChange={(e) => handleTemplateChange(e.target.value)} label="Email Template">
                        {templates.map((template) => (
                            <MenuItem key={template._id} value={template._id}>
                                {template.template_description}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />

                <div className="bg-white rounded-lg shadow p-2">
                    <RichTextEditor theme="snow" value={Emessage} onChange={setEmessage} />
                </div>

                {/* <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-medium shadow"
                    >
                        <UploadFileIcon fontSize="small" /> Attach Files
                    </motion.button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileChange}
                    />
                    <span className="text-xs text-gray-500">{attachments.length} file(s) selected</span>
                </div>
 */}







                <>
                    <div className="relative w-full ">
                        <label htmlFor="vehicle-doc-upload" className="block mb-2 text-sm text-gray-800">
                            Upload your files
                        </label>

                        <label
                            htmlFor="vehicle-doc-upload"
                            className={`cursor-pointer w-full p-3 rounded-2xl bg-white shadow-md flex justify-between items-center text-sm text-gray-800 hover:shadow-lg transition-all
                                                      ${uploading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
                        >
                            {uploading ? (
                                <span className="flex items-center space-x-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-gray-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        ></path>
                                    </svg>
                                    <span>Uploading...</span>
                                </span>
                            ) : (
                                <>
                                    {uploadedFile ? uploadedFile.name : 'Choose Image (JPG, PNG, GIF, PDF)'}
                                    <FaUpload className="ml-2 h-4 w-4 text-gray-500" />
                                </>
                            )}
                        </label>
                        <input
                            id="vehicle-doc-upload"
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/jpg, image/gif, application/pdf"
                            capture="environment"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploading}
                        />

                        {uploadError && (
                            <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        {uploadedFiles.length === 0 ? (
                            <p className="text-sm text-gray-500">No files uploaded yet.</p>
                        ) : (
                            uploadedFiles.map((file, idx) => {
                                const isOpen = openPreviewIndexes.includes(idx);

                                return (
                                    <div
                                        key={idx}
                                        className="mb-3 p-3 bg-white rounded-xl shadow-md relative"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-700 font-medium">
                                                    📄 {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>

                                                <button
                                                    onClick={() => togglePreview(idx)}
                                                    className="text-xs text-blue-600 underline mt-1"
                                                >
                                                    {isOpen ? 'Hide Preview' : 'Show Preview'}
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveFile(idx)}
                                                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {isOpen && (
                                            <div className="mt-2">
                                                {previewUrls[idx]?.startsWith('blob') || file.type === 'application/pdf' ? (
                                                    <a
                                                        href={previewUrls[idx]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline text-xs"
                                                    >
                                                        View PDF
                                                    </a>
                                                ) : (
                                                    <img
                                                        src={previewUrls[idx]}
                                                        alt={`preview-${idx}`}
                                                        className="mt-2 w-32 h-auto rounded shadow"
                                                    />
                                                )}


                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>


                </>










                <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={handleSend}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition"
                >
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Email'}
                </motion.button>
            </motion.div>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-4 inset-x-0 mx-auto w-fit max-w-[90%] bg-green-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 z-50"
                    >
                        <CheckCircleOutlineIcon /> Email sent successfully!
                    </motion.div>
                )}


                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-4 inset-x-0 mx-auto w-fit max-w-[90%] bg-rose-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 z-50"
                    >
                        <ErrorOutlineIcon /> {error}
                    </motion.div>
                )}

            </AnimatePresence>
        </Box>
    );
};

export default Page;