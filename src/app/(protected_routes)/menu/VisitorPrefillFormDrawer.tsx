'use client'
import {
    Drawer,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Box,
    Chip,
    Snackbar,
    Alert,
} from '@mui/material'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import PendingVisitorList from './PendingVisitorList'
import { message } from 'antd'
import { FaUpload } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import React from 'react'
import { useSession } from 'next-auth/react';

export interface VisitorData {
    mobile: string
    name?: string
    visitor_type?: string
    brand?: string
    picture_obj?: string
    last_visit_premise_unit_array?: string[]
    guest_type?: 'Delivery' | 'Cab' | 'Private' | 'Others'
    vehicle_type?: 'Car' | 'Bike' | 'Pedestrian'
    vehicle_number?: string
}

interface Unit {
    id: string
    sub_premise_id: string
    occupancy_status: string
}

interface Props {
    open: boolean
    onClose: () => void
    data?: VisitorData
    onSubmit: (form: VisitorData) => void
}

const VisitorPrefillFormDrawer = ({ open, onClose, data, onSubmit }: Props) => {
    const [form, setForm] = useState<VisitorData>(data || { mobile: '' })
    const [unitOptions, setUnitOptions] = useState<Unit[]>([])
    const [loadingUnits, setLoadingUnits] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showError, setShowError] = useState(false)
    const { data: session } = useSession();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedObjectId, setUploadedObjectId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const premise_id = '348afcc9-d024-3fe9-2e85-bf5a9694ea19'

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    useEffect(() => {
        const fetchUnits = async () => {
            setLoadingUnits(true)
            try {
                const res = await axios.post('http://139.84.166.124:8060/user-service/registration/premise_unit/list', {
                    premise_id,
                })
                const sorted = [...(res.data?.data || [])].sort((a, b) => a.id.localeCompare(b.id))
                setUnitOptions(sorted)
            } catch (err) {
                console.error('Failed to fetch units:', err)
            } finally {
                setLoadingUnits(false)
            }
        }

        if (open) fetchUnits()
    }, [open])

    const handleChange = (field: keyof VisitorData, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const filteredUnits = unitOptions.filter((unit) =>
        unit.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const isFormValid = () =>
        form.mobile &&
        form.name?.trim() &&
        form.guest_type &&
        form.vehicle_type &&
        form.last_visit_premise_unit_array &&
        form.last_visit_premise_unit_array.length > 0

    const saveVisitorToLocalStorage = (apiPayload: any) => {
        const visitor_info_json = apiPayload?.visitor_info_json;
        if (!visitor_info_json?.visit_id) return;

        const entry = {
            visitor_info_json,
            resident_array: apiPayload?.resident_array || [],
            approval_status: 'pending',
        };

        const saved = localStorage.getItem('pending_visitors');
        const current = saved ? JSON.parse(saved) : [];

        const updated = [
            entry,
            ...current.filter(
                (e: { visitor_info_json: { visit_id: any } }) =>
                    e.visitor_info_json.visit_id !== visitor_info_json.visit_id
            ),
        ];

        localStorage.setItem('pending_visitors', JSON.stringify(updated));
        window.dispatchEvent(new Event('visitorListUpdated'));
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return

        setSubmitting(true)

        const visit_id = `visitid[${uuidv4()}]`
        const pic_url = uploadedObjectId;
        const security_guard_id = uuidv4()
        const security_guard_fcmid = uuidv4()

        const apiPayload = {
            premise_id,
            visitor_info_json: {
                visit_id,
                guest_type: (form.guest_type || 'Private').toLowerCase(),
                vehicle_type: (form.vehicle_type || 'Pedestrian').toLowerCase(),
                vehicle_registration_number:
                    form.vehicle_type === 'Pedestrian' || !form.vehicle_number
                        ? 'NOT_ON_VEHICLE'
                        : form.vehicle_number || 'NOT_ON_VEHICLE',
                guest_mobile_no: form.mobile,
                visitor_name: form.name || '',
                pic_url,
                guest_reference: form.name || '',
                listed_type: 'unlisted',
            },
            resident_array: form.last_visit_premise_unit_array || [],
            security_guard_id,
            security_guard_fcmid,
        }

        saveVisitorToLocalStorage(apiPayload);

        console.log('✅ API Payload:', apiPayload);

        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/vms-service/entry/request',
                apiPayload
            )
            console.log('✅ API Response:', response.data)
            setShowSuccess(true)
            onSubmit(form)
            setUploadedFile(null)
        } catch (error) {
            console.error('❌ API Error:', error)
            setShowError(true)
            setUploadedFile(null)

        } finally {
            setSubmitting(false)
            setUploadedFile(null)

        }
    }

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
                premise_id: premise_id,
                filetype: finalFile.type,
                file_extension: finalFile.name.split('.').pop(),
                base64_data: base64WithPrefix,
            };

            console.log('📤 Upload payload:', payload);

            const res = await axios.post(
                'http://139.84.166.124:8060/order-service/upload/async',
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

    return (
        <>
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                PaperProps={{
                    className: 'rounded-t-2xl px-4 pt-4 pb-6 shadow-lg',
                    style: { maxHeight: '98vh' },
                }}
            >
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Visitor Info</h2>
                    <p className="text-sm text-gray-500">
                        {data ? 'Review & update visitor details' : 'Enter visitor details'}
                    </p>
                </div>
                <br />

                <div className="space-y-5 max-w-md mx-auto bg-white rounded-xl shadow-sm">
                    <TextField
                        label="Mobile Number"
                        value={form.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="medium"
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />

                    <TextField
                        label="Name"
                        value={form.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="medium"
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />

                    <FormControl fullWidth variant="outlined" size="medium" sx={{ borderRadius: 2 }}>
                        <InputLabel>Guest Type</InputLabel>
                        <Select
                            value={form.guest_type || ''}
                            label="Guest Type"
                            onChange={(e) => handleChange('guest_type', e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="Private">Private</MenuItem>
                            <MenuItem value="Delivery">Delivery</MenuItem>
                            <MenuItem value="Cab">Cab</MenuItem>
                            <MenuItem value="Others">Others</MenuItem>
                        </Select>
                    </FormControl>

                    {form.guest_type && (
                        <FormControl fullWidth variant="outlined" size="medium" sx={{ borderRadius: 2 }}>
                            <InputLabel>Vehicle Type</InputLabel>
                            <Select
                                value={form.vehicle_type || ''}
                                label="Vehicle Type"
                                onChange={(e) => handleChange('vehicle_type', e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="Car">Car</MenuItem>
                                <MenuItem value="Bike">Bike</MenuItem>
                                {form.guest_type !== 'Cab' && (
                                    <MenuItem value="Pedestrian">Pedestrian</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    )}

                    {form.vehicle_type && form.vehicle_type !== 'Pedestrian' && (
                        <TextField
                            label="Vehicle Number"
                            value={form.vehicle_number || ''}
                            onChange={(e) => handleChange('vehicle_number', e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="medium"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    )}

                    <FormControl fullWidth>
                        <InputLabel id="unit-select-label">Select Visited Units</InputLabel>
                        <Select
                            labelId="unit-select-label"
                            multiple
                            value={form.last_visit_premise_unit_array || []}
                            onChange={(e) =>
                                handleChange('last_visit_premise_unit_array', e.target.value as string[])
                            }
                            input={<OutlinedInput label="Select Visited Units" sx={{ borderRadius: 2 }} />}
                            renderValue={(selected) =>
                                selected.length === 0 ? (
                                    <span className="text-gray-400">None selected</span>
                                ) : (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                size="small"
                                                sx={{
                                                    borderRadius: '8px',
                                                    backgroundColor: '#e0f2fe',
                                                    color: '#0284c7',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )
                            }
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 400,
                                        borderRadius: 12,
                                    },
                                },
                            }}
                        >
                            <Box className="px-3 pt-2 pb-1 sticky top-0 bg-white z-10">
                                <TextField
                                    placeholder="Search unit ID"
                                    size="small"
                                    fullWidth
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        sx: { padding: '4px 8px', fontSize: '0.875rem', borderRadius: 2 },
                                    }}
                                />
                            </Box>

                            {loadingUnits ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} />
                                </MenuItem>
                            ) : filteredUnits.length === 0 ? (
                                <MenuItem disabled>No units found</MenuItem>
                            ) : (
                                filteredUnits.map((unit, index) => (
                                    <MenuItem
                                        key={`${unit.sub_premise_id}-${unit.id}-${index}`}
                                        value={unit.id}
                                        dense
                                        sx={{ py: 1.25, px: 2 }}
                                    >
                                        <Box className="flex items-center justify-between w-full text-sm">
                                            <span>{unit.id}</span>
                                        </Box>
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </div>

                <br />
                <div className="relative w-full">
                    <label htmlFor="vehicle-doc-upload" className="block mb-2 text-sm text-gray-800">
                        Upload a snapshot of Visitor
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
                        accept="image/png, image/jpeg, image/jpg"
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

                <PendingVisitorList />


                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={!isFormValid() || submitting}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl text-base font-semibold shadow-md transition-all duration-200 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
                </motion.button>
            </Drawer>


            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Visitor entry submitted successfully!
                </Alert>
            </Snackbar>

            <Snackbar
                open={showError}
                autoHideDuration={3000}
                onClose={() => setShowError(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
                    Submission failed. Please try again.
                </Alert>
            </Snackbar>
        </>
    )
}

export default VisitorPrefillFormDrawer
