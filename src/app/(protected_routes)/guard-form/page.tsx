'use client'
import React, { useEffect, useState } from 'react';
import {
    Box, Button, Chip, Typography, Paper, Grid, TextField, InputAdornment, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchParams } from 'next/navigation';
import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaUpload } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import VoiceInput from './VoiceInput'
import { FaCamera, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Add these icons


const API_BASE = 'http://139.84.166.124:8060/user-service/registration';
const premise_id = '348afcc9-d024-3fe9-2e85-bf5a9694ea19';

const guestTypes = ['delivery', 'private', 'cab', 'others'];
const vehicleTypes = ['car', 'bike', 'pedestrian'];

const GuardVisitorForm = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [guestType, setGuestType] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [MobileNumber, setMobileNumber] = useState('');
    const [step, setStep] = useState<'main' | 'address'>('main');
    const [subPremises, setSubPremises] = useState<any[]>([]);
    const [selectedTower, setSelectedTower] = useState('');
    const [premiseUnits, setPremiseUnits] = useState<any[]>([]);
    const [selectedFlats, setSelectedFlats] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMsgOpen, setSuccessMsgOpen] = useState(false);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const searchParams = useSearchParams();
    const [prefilledData, setPrefilledData] = useState<any>(null);
    const { data: session } = useSession();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedObjectId, setUploadedObjectId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const getBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploading(true);
        // @ts-ignore


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
            console.log("previewUrl");
            console.log(previewUrl);
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(finalFile);
            console.log("previewUrl");
            console.log(previewUrl);
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

    useEffect(() => {
        const data: any = {};
        Array.from(searchParams.entries()).forEach(([key, value]) => {
            data[key] = value;
        });
        setName(data.name || '');
        setGuestType(data.visitor_type || '');
        setMobileNumber(data.mobile || '');
        setPrefilledData(data);
    }, [searchParams]);

    useEffect(() => {
        fetchSubPremises(premise_id);
    }, []);

    const fetchSubPremises = async (selectedPremise: string) => {
        try {
            const res = await fetch(`${API_BASE}/subpremise/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premise_id: selectedPremise })
            });
            const data = await res.json();
            setSubPremises(data.data || []);
        } catch (error) {
            console.error("Error fetching sub-premises:", error);
        }
    };

    const fetchPremiseUnits = async (selectedSubPremise: string) => {
        setSelectedTower(selectedSubPremise);
        setLoadingUnits(true);
        try {
            const res = await fetch(`${API_BASE}/premise_unit/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premise_id, sub_premise_id: selectedSubPremise })
            });
            const data = await res.json();
            const sorted = [...(data.data || [])].sort((a, b) => a.id.localeCompare(b.id));
            setPremiseUnits(sorted);
        } catch (error) {
            console.error("Error fetching premise units:", error);
        } finally {
            setLoadingUnits(false);
        }
    };

    const handleFlatToggle = (unit: string) => {
        setSelectedFlats((prev) =>
            prev.includes(unit) ? prev.filter(f => f !== unit) : [...prev, unit]
        );
    };

    const filteredTowers = subPremises.filter(tp => tp.sub_premise_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUnits = premiseUnits.filter(unit => unit?.id?.toLowerCase().includes(searchQuery.toLowerCase()));

    const resetForm = () => {
        setName('');
        setGuestType('');
        setVehicleType('');
        setVehicleNumber('');
        setStep('main');
        setSelectedTower('');
        setPremiseUnits([]);
        setSelectedFlats([]);
        setSearchQuery('');
    };

    const handleSubmit = async () => {
        if (!name || !guestType || !vehicleType || !selectedTower || selectedFlats.length === 0 || (vehicleType !== 'pedestrian' && !vehicleNumber)) {
            message.info("Please fill all required fields.");
            return;
        }
        const visit_id = `visitid[${uuidv4()}]`
        const visitor_info_json = {
            visit_id,
            guestType,
            vehicle_type: vehicleType,
            vehicle_registration_number: vehicleType !== 'pedestrian' ? vehicleNumber : 'NOT_ON_VEHICLE',
            guest_mobile_no: MobileNumber,
            visitor_name: name,
            pic_url: uploadedObjectId,
            guest_reference: "Zakir",
            listed_type: "unlisted"
        }
        const security_guard_id = uuidv4()

        const payload = {
            premise_id: "348afcc9-d024-3fe9-2e85-bf5a9694ea19",
            visitor_info_json,
            resident_array: selectedFlats,
            security_guard_id,
            security_guard_fcmid: "fcmid[1234567890]",

        };
        console.log("Submitting payload:", payload);
        console.log("Prefilled data:", prefilledData);

        setLoadingSubmit(true);
        try {
            const res = await fetch('http://139.84.166.124:8060/vms-service/entry/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data && !data.error) {
                message.success("Visitor added successfully!");
                resetForm();
                setUploadedFile(null);
                router.push('/menu');
            } else {
                alert('Submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoadingSubmit(false);
        }
    };

    function enableCameraOnly() {
        // @ts-ignore
        if (window.AndroidBridge && AndroidBridge.setAllowGallery) {
            // @ts-ignore
            AndroidBridge.setAllowGallery(false);
        }
    }



    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Visitor Entry Form
                </Typography>

                <AnimatePresence mode="wait">
                    {step === 'main' && (
                        <motion.div
                            key="main"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="relative w-full">
                                <label htmlFor="visitor-snap-upload" className="block mb-2 text-sm font-medium text-gray-800">
                                    Take a Snapshot of Visitor
                                </label>

                                <label
                                    htmlFor="visitor-snap-upload"
                                    className={`cursor-pointer w-full h-30 rounded-2xl border-2 border-dashed bg-gray-100 text-gray-700 flex flex-col items-center justify-center transition-all hover:shadow-lg ${uploading ? 'opacity-60 cursor-wait' : 'hover:bg-gray-200'
                                        }`}
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
                                    ) : uploadError ? (
                                        <div className="flex flex-col items-center">
                                            <FaTimesCircle className="text-red-500 text-4xl animate-ping-slow" />
                                            <span className="text-sm mt-1">Upload Failed</span>
                                        </div>
                                    ) : uploadedFile ? (
                                        <div className="flex flex-col items-center">
                                            <FaCheckCircle className="text-green-500 text-4xl animate-bounce" />
                                            <span className="text-sm mt-1">Uploaded</span>
                                        </div>
                                    ) : (
                                        <>
                                            <FaCamera className="h-6 w-6 mb-2 text-gray-600" />
                                            <span className="text-sm">Tap to Take a Photo</span>
                                        </>
                                    )}
                                </label>

                                <input
                                    id="visitor-snap-upload"
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    capture="environment"
                                    onChange={handleFileUpload}
                                    onClick={enableCameraOnly}
                                    className="hidden"
                                    disabled={uploading}
                                />

                                {uploadError && (
                                    <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                                )}

                                {uploadedFile && !uploadError && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                )}
                            </div>

                            <br />

                            <TextField
                                fullWidth
                                label="Visitor Name"
                                value={name}
                                className='mb-4'
                                onChange={(e) => setName(e.target.value)}
                                margin="normal"
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <VoiceInput onText={(text) => setName(text)} fieldId="visitor_name" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Typography variant="subtitle1">Guest Type</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt: 2 }}>
                                {guestTypes.map(type => (
                                    <Button
                                        key={`guest-${type}`}
                                        variant={guestType === type ? 'outlined' : 'text'}
                                        onClick={() => setGuestType(type)}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </Box>

                            {guestType && (
                                <Box>
                                    <Typography variant="subtitle1">Vehicle Type</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        {vehicleTypes.filter(v => !(guestType === 'cab' && v === 'pedestrian')).map(v => (
                                            <Button
                                                key={`vehicle-${v}`}
                                                variant={vehicleType === v ? 'outlined' : 'text'}
                                                onClick={() => setVehicleType(v)}
                                            >
                                                {v}
                                            </Button>
                                        ))}
                                    </Box>


                                </Box>
                            )}

                            {vehicleType && (
                                <>
                                    {vehicleType !== 'pedestrian' && (
                                        <TextField
                                            fullWidth
                                            label="Vehicle Number"
                                            value={vehicleNumber}
                                            onChange={(e) => {
                                                const value = e.target.value.toUpperCase().replace(/\s+/g, '');
                                                setVehicleNumber(value);
                                            }}
                                            margin="normal"
                                            required
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <VoiceInput
                                                            fieldId="vehicle_number"
                                                            onText={(text) => {
                                                                const value = text.toUpperCase().replace(/\s+/g, '');
                                                                setVehicleNumber(value);
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}

                                    <Button
                                        className='mt-4'
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => setStep('address')}
                                    >
                                        Next
                                    </Button>
                                </>
                            )}


                        </motion.div>
                    )}

                    {step === 'address' && (
                        <motion.div
                            key="address"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <TextField
                                fullWidth
                                placeholder="Search Tower or Unit"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                                {filteredTowers.map((sp) => (
                                    <Button
                                        key={`tower-${sp.sub_premise_id}`}
                                        variant={selectedTower === sp.sub_premise_id ? 'outlined' : 'text'}
                                        onClick={() => fetchPremiseUnits(sp.sub_premise_id)}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {sp.sub_premise_name || 'Unnamed Tower'}
                                    </Button>
                                ))}
                            </Box>

                            {selectedTower && (
                                <>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Available Units
                                    </Typography>

                                    {loadingUnits ? (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <>
                                            {selectedFlats.length > 0 && (
                                                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                                    <Typography variant="body2" gutterBottom>
                                                        Selected Flats:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        {selectedFlats.map((flat) => (
                                                            <Chip
                                                                key={`chip-${flat}`}
                                                                label={flat}
                                                                onDelete={() => handleFlatToggle(flat)}
                                                                color="primary"
                                                            />
                                                        ))}
                                                    </Box>
                                                </Paper>
                                            )}

                                            <Grid container spacing={1}>
                                                {filteredUnits.length === 0 ? (
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            No flats found for selected tower.
                                                        </Typography>
                                                    </Grid>
                                                ) : (
                                                    filteredUnits.map((unit, idx) => (
                                                        <Grid item xs={4} sm={3} key={`unit-${unit.id}-${idx}`}>
                                                            <Button
                                                                fullWidth
                                                                size="small"
                                                                variant={selectedFlats.includes(unit.id) ? 'outlined' : 'text'}
                                                                onClick={() => handleFlatToggle(unit.id)}
                                                            >
                                                                {unit.id}
                                                            </Button>
                                                        </Grid>
                                                    ))
                                                )}
                                            </Grid>

                                            <Button
                                                variant="outlined"
                                                sx={{ mt: 3, mr: 2 }}
                                                onClick={handleSubmit}
                                                disabled={loadingSubmit}
                                            >
                                                {loadingSubmit ? <CircularProgress size={20} color="inherit" /> : 'Submit Entry'}
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}

                            <Button
                                variant="outlined"
                                sx={{ mt: 3 }}
                                onClick={() => setStep('main')}
                            >
                                Back
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Snackbar
                    open={successMsgOpen}
                    autoHideDuration={1000}
                    onClose={() => {
                        setSuccessMsgOpen(false);
                        router.push('/menu'); // Redirect after close
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => {
                            setSuccessMsgOpen(false);
                            router.push('/menu'); // Redirect after close
                        }}
                        severity="success"
                        sx={{ width: '100%' }}
                    >
                        Visitor entry submitted successfully!
                    </Alert>
                </Snackbar>
            </Box>
        </motion.div>
    );
};

export default GuardVisitorForm;
