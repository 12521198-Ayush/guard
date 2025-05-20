'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, IconButton, Typography, Box, Button } from '@mui/material';
import { MdClose } from 'react-icons/md';
import { FaChevronDown } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { FaUpload } from 'react-icons/fa';
import { message } from 'antd';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: {
        vno: string;
        vehicle_type: string;
        parking_slot: string;
        parking_area_name: string;
    }) => void;
    initialData?: {
        vno: string;
        vehicle_type: string;
        parking_slot: string;
        parking_area_name: string;
    };
    mode: 'add' | 'edit';
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    mode,
}) => {
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [parkingAreaDropdownOpen, setParkingAreaDropdownOpen] = useState(false);
    const [parkingSlotDropdownOpen, setParkingSlotDropdownOpen] = useState(false);

    const [requiredError, setRequiredError] = useState({
        vno: false,
        parking_slot: false,
        parking_area_name: false,
    });

    const { data: session } = useSession();
    const [parkingAreas, setParkingAreas] = useState<any[]>([]);
    const [parkingSlots, setParkingSlots] = useState<any[]>([]);
    const token = session?.user?.accessToken;

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedObjectId, setUploadedObjectId] = useState<string | null>(null);

    const [uploading, setUploading] = React.useState(false);

    const getBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploading(true);
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE_MB = 2;
        const validTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'application/pdf',
        ];

        if (!validTypes.includes(file.type)) {
            const errorMsg = 'Only PNG, JPG, GIF, or PDF files are allowed.';
            setUploadError(errorMsg);
            message.warning(errorMsg);
            return;
        }

        let finalFile = file;

        if (file.type !== 'application/pdf') {
            try {
                // Compress image to be under 2MB
                const options = {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                finalFile = await imageCompression(file, options);
                console.log('🗜️ Compressed file size (MB):', finalFile.size / 1024 / 1024);
            } catch (error) {
                console.error('❌ Image compression failed:', error);
                message.error('Image compression failed.');
                setUploading(false);
                return;
            }
        } else {
            // For PDFs, just check size
            const isTooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
            if (isTooLarge) {
                const errorMsg = `PDF must be smaller than ${MAX_FILE_SIZE_MB}MB`;
                setUploadError(errorMsg);
                message.warning(errorMsg);
                setUploading(false);
                return;
            }
        }

        setUploadError(null);
        setUploadedFile(finalFile);
        console.log('📂 Final file selected:', finalFile);

        // Preview
        if (finalFile.type === 'application/pdf') {
            setPreviewUrl(URL.createObjectURL(finalFile));
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(finalFile);
        }

        try {
            const base64WithPrefix = await getBase64(finalFile);
            const payload = {
                premise_id: session?.user?.primary_premise_id,
                filetype: finalFile.type,
                file_extension: finalFile.name.split('.').pop(),
                base64_data: base64WithPrefix,
            };

            console.log('📤 Upload payload:', payload);

            const res = await axios.post(
                'http://139.84.166.124:8060/user-service/upload/async',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );

            const objectKey = res?.data?.data?.key;
            if (objectKey) {
                setUploadedObjectId(objectKey);
                console.log('✅ File uploaded, Object ID:', objectKey);
                message.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('❌ Upload failed:', error);
            message.error('File upload failed.');
        }

        setUploading(false);
    };

    // @ts-ignore
    const [form, setForm] = useState({
        vno: '',
        vehicle_type: '4w',
        parking_slot: '',
        parking_slot_id: '',
        parking_area_name: '',
        parking_area_id: '',
        rc_object_id: uploadedObjectId

    });

    useEffect(() => {
        const fetchParkingData = async () => {
            try {
                const payload = {
                    premise_id: session?.user?.primary_premise_id,
                    sub_premise_id: session?.user?.sub_premise_id,
                    premise_unit_id: session?.user?.premise_unit_id,
                };

                const [areaRes, slotRes] = await Promise.all([
                    fetch("http://139.84.166.124:8060/user-service/admin/parking/premises/parking_area/list", {
                        method: "POST",
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload),
                    }),
                    fetch("http://139.84.166.124:8060/user-service/admin/parking/slot/list", {
                        method: "POST",
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload),
                    }),
                ]);

                const areaData = await areaRes.json();
                const slotData = await slotRes.json();

                if (!areaData.error) setParkingAreas(areaData.data || []);
                if (!slotData.error) setParkingSlots(slotData.data || []);
            } catch (err) {
                console.error("Error fetching parking data", err);
            }
        };

        if (isOpen && mode === 'add') fetchParkingData();
    }, [isOpen, mode]);

    // @ts-ignore
    useEffect(() => {
        if (initialData) {
            // @ts-ignore

            setForm(initialData);
        } else {
            // @ts-ignore

            setForm({
                vno: '',
                vehicle_type: '4w',
                parking_slot: '',
                parking_area_name: '',
            });
        }
        setError(null);
        setRequiredError({ vno: false, parking_slot: false, parking_area_name: false });
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setRequiredError((prev) => ({ ...prev, [name]: false }));
        if (name === 'vno' && mode === 'edit' && value === initialData?.vno) {
            setError('This is the same vehicle number as before');
        } else if (name === 'vno') {
            setError(null);
        }
    };

    const handleSubmit = () => {
        if (!form.vno || !form.parking_slot || !form.parking_area_name) {
            setRequiredError({
                vno: !form.vno,
                parking_slot: !form.parking_slot,
                parking_area_name: !form.parking_area_name,
            });
            return;
        }

        if (mode === 'edit' && form.vno === initialData?.vno) {
            setError('This is the same vehicle number as before');
            return;
        }

        const payload = {
            ...form,
            ...(mode === 'edit' ? { oldvno: initialData?.vno } : {}),
            rc_object_id: uploadedObjectId,  // <--- Add the uploaded file's object ID here
        };

        onSave(payload);
        onClose();
    };


    const inputClass =
        'w-full px-4 py-2 bg-gray-100 rounded-xl shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400';
    const errorClass = 'border-2 border-yellow-500';

    return (
        <Drawer
            anchor="bottom"
            open={isOpen}
            onClose={onClose}
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    {mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
                </Typography>
                <IconButton onClick={onClose}>
                    <MdClose />
                </IconButton>
            </Box>

            <div className="space-y-4">

                {/* Parking Slot Dropdown */}
                <div
                    className="relative w-full"
                    onClick={() => {
                        if (mode === 'add') {
                            setParkingSlotDropdownOpen((prev) => {
                                setParkingAreaDropdownOpen(false);
                                setDropdownOpen(false);
                                return !prev;
                            });
                        }
                    }}

                >
                    <button
                        disabled={mode === 'edit'}
                        className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 
                  ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
                    >
                        {form.parking_slot || 'Select Parking Slot'}
                        <FaChevronDown className={`ml-2 h-4 w-4 transition-transform ${parkingSlotDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {parkingSlotDropdownOpen && mode === 'add' && (
                        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10 max-h-[10rem] overflow-y-auto">
                            {parkingSlots.length > 0 ? (
                                parkingSlots.map((slot) => (
                                    <button
                                        key={slot._id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setForm((prev) => ({
                                                ...prev,
                                                parking_slot: slot.parking_slot,
                                                parking_slot_id: slot._id,
                                            }));
                                            setParkingSlotDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${form.parking_slot === slot.parking_slot ? 'bg-blue-600 text-white' : 'text-gray-800'
                                            }`}
                                    >
                                        {slot.parking_slot} ({slot.vehicle_type})
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">No data found</div>
                            )}
                        </div>
                    )}

                    {requiredError.parking_slot && (
                        <p className="text-sm text-yellow-500 mt-1 ml-1">Parking slot is required</p>
                    )}
                </div>

                {/* Parking Area Dropdown */}
                <div
                    className="relative w-full"
                    onClick={() => {
                        if (mode === 'add') {
                            setParkingAreaDropdownOpen((prev) => {
                                setParkingSlotDropdownOpen(false);
                                setDropdownOpen(false);
                                return !prev;
                            });
                        }
                    }}

                >
                    <button
                        disabled={mode === 'edit'}
                        className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 
                  ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
                    >
                        {form.parking_area_name || 'Select Parking Area'}
                        <FaChevronDown className={`ml-2 h-4 w-4 transition-transform ${parkingAreaDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {parkingAreaDropdownOpen && mode === 'add' && (
                        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10 max-h-[10rem] overflow-y-auto">
                            {parkingAreas.length > 0 ? (
                                parkingAreas.map((area) => (
                                    <button
                                        key={area.parking_area_id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setForm((prev) => ({
                                                ...prev,
                                                parking_area_name: area.parking_area_name,
                                                parking_area_id: area.parking_area_id,
                                            }));
                                            setParkingAreaDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${form.parking_area_name === area.parking_area_name ? 'bg-blue-600 text-white' : 'text-gray-800'
                                            }`}
                                    >
                                        {area.parking_area_name}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">No data found</div>
                            )}
                        </div>
                    )}

                    {requiredError.parking_area_name && (
                        <p className="text-sm text-yellow-500 ml-1">Parking area is required</p>
                    )}
                </div>

                {/* Vehicle Number */}
                <div>
                    <input
                        name="vno"
                        value={form.vno}
                        onChange={handleChange}
                        placeholder="Vehicle Number"
                        className={`${inputClass} ${error || requiredError.vno ? errorClass : ''}`}
                    />
                    {error && <p className="text-sm text-yellow-500 mt-1 ml-1">{error}</p>}
                    {requiredError.vno && (
                        <p className="text-sm text-yellow-500 mt-1 ml-1">Vehicle number is required</p>
                    )}
                </div>

                {/* Vehicle Type Dropdown */}
                <div className="relative w-full" >
                    <button
                        onClick={mode === 'add' ? () => setDropdownOpen(!dropdownOpen) : undefined}
                        disabled={mode === 'edit'}
                        className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 
                                                ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
                    >
                        {form.vehicle_type === '4w' ? '4 Wheeler' : '2 Wheeler'}
                        <FaChevronDown className={`ml-2 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && mode === 'add' && (
                        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10">
                            {['4w', '2w'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setForm((prev) => ({ ...prev, vehicle_type: option }));
                                        setDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${form.vehicle_type === option ? 'bg-blue-600 text-white' : 'text-gray-800'}`}
                                >
                                    {option === '4w' ? '4 Wheeler' : '2 Wheeler'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Document upload area */}
                <div className="relative w-full">
                    <label htmlFor="vehicle-doc-upload" className="block mb-2 text-sm text-gray-800">
                        Upload Vehicle Document (e.g., RC, Insurance)
                    </label>

                    <label
                        htmlFor="vehicle-doc-upload"
                        className={`cursor-pointer w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 hover:shadow-lg transition-all
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
                        accept="image/png, image/jpeg, image/jpg, image/gif, application/pdf"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />

                    {uploadError && (
                        <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                    )}

                    {uploadedFile && (
                        <p className="text-xs text-gray-500 mt-1">
                            File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    )}
                </div>


                <button
                    onClick={handleSubmit}
                    className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium shadow-md hover:bg-blue-700 transition"
                >
                    {mode === 'add' ? 'Add Vehicle' : 'Update Vehicle'}
                </button>

            </div>

        </Drawer>
    );
};

export default VehicleFormModal;
