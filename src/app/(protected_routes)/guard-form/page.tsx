'use client'
import React, { useEffect, useState } from 'react';
import {
    Box, Button, Chip, Typography, Paper, Grid, TextField, InputAdornment, Snackbar, Alert, CircularProgress,
    FormControl,
    MenuItem,
    InputLabel,
    Select
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
    const [selectedFlats, setSelectedFlats] = useState<{
        premise_unit_id: string;
        sub_premise_id: string;
        sub_premise_name: string;
    }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTowerName, setSelectedTowerName] = useState('');
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
    const premise_id = localStorage.getItem('selected_premise_id') || '';
    const [visitorCount, setVisitorCount] = useState('1');
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
                setUploadedFile(null)
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
            setUploadedFile(null);
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

    const fetchPremiseUnits = async (subPremiseId: string, subPremiseName: string) => {
        setSelectedTower(subPremiseId);
        setSelectedTowerName(subPremiseName);
        setLoadingUnits(true);
        try {
            const res = await fetch(`${API_BASE}/premise_unit/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premise_id, sub_premise_id: subPremiseId })
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


    const handleFlatToggle = (unitId: string) => {
        setSelectedFlats((prev) => {
            const exists = prev.find(
                (f) => f.premise_unit_id === unitId && f.sub_premise_id === selectedTower
            );
            if (exists) {
                return prev.filter(
                    (f) => !(f.premise_unit_id === unitId && f.sub_premise_id === selectedTower)
                );
            } else {
                return [
                    ...prev,
                    {
                        premise_unit_id: unitId,
                        sub_premise_id: selectedTower,
                        sub_premise_name: selectedTowerName
                    }
                ];
            }
        });
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

    const handleNext = async () => {
        if (!name) {
            message.info("Please enter visitor name.");
            return;
        } else if (!guestType) {
            message.info("Please select a guest type.");
            return;
        } else if (!vehicleType) {
            message.info("Please select a vehicle type.");
            return;
        } else if (vehicleType !== 'pedestrian' && !vehicleNumber) {
            message.info("Please enter vehicle number.");
            return;
        } else if (!uploadedObjectId) {
            message.info("Please upload a visitor image.");
            return;
        }
        setStep('address');
    }

    const handleSubmit = async () => {
        if (!selectedTower || selectedFlats.length === 0) {
            message.info("Please select a tower and at least one flat.");
            return;
        }

        const visit_id = `visitid[${uuidv4()}]`;
        const fcmToken = localStorage.getItem('fcm_token') || "49iu4983u43483u483h483u438434";
        const total_no_of_person = visitorCount;
        const visitor_info_json = {
            name: name,
            type: guestType,
            mobile: MobileNumber,
            vehicle_type: vehicleType,
            total_no_of_person,
            vehicle_number: vehicleType !== 'pedestrian' ? vehicleNumber : 'NOT_ON_VEHICLE',
            pic_url: uploadedObjectId,
            ...(guestType === 'delivery' && {
                brand: selectedBrandName,
                brand_logo_url: selectedBrandLogo,
            }),
        };


        // Convert resident list to status map
        const resident_status: Record<string, boolean> = {};

        selectedFlats.forEach(flat => {
            resident_status[flat.premise_unit_id] = false;
        });

        const mobile = session?.user?.phone || '9999999999';
        const premise = localStorage.getItem('selected_premise_id') || "c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af";
        const subpremise = localStorage.getItem('selected_subpremise_id') || "gate";
        const security_guard_id = localStorage.getItem('security_guard_id');
        const premiseName = localStorage.getItem('selected_premise_name') || "Ireo Uptown";
        const subpremiseName = localStorage.getItem('selected_subpremise_name') || "Gate";
        
        const localStoragePayload = {
            premise_id: premise,
            visit_id,
            visitor_info_json,
            resident_json_array: selectedFlats,
            security_guard_id: security_guard_id,
            resident_status,
            security_guard_fcmid: "fcmToken",
        };

        const payload = {
            premise_id: premise,
            premise_name: premiseName,
            scan_location: subpremiseName,
            visit_id,
            visitor_info_json,
            resident_json_array: selectedFlats,
            security_guard_id: security_guard_id,
            security_guard_fcmid: fcmToken,
        };

        console.log(payload);

        // Save to localStorage
        try {
            const existingData = localStorage.getItem('pending_visitor_list');
            const pendingList = existingData ? JSON.parse(existingData) : [];

            pendingList.push(localStoragePayload);
            localStorage.setItem('pending_visitor_list', JSON.stringify(pendingList));
        } catch (e) {
            console.error("Error handling localStorage:", e);
        }

        // Submit to backend
        setLoadingSubmit(true);
        try {
            const res = await fetch('http://139.84.166.124:8060/vms-service/entry/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            console.log(data);

            if (data && !data.error) {
                message.success("Visitor added successfully!");
                resetForm();
                setUploadedFile(null);
                router.push('/guard-menu');
            } else {
                alert(`Submission failed ${data.error.message}`);
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

    const [brands, setBrands] = useState<any[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [selectedBrandName, setSelectedBrandName] = useState('');
    const [selectedBrandLogo, setSelectedBrandLogo] = useState('');


    useEffect(() => {
        if (guestType === 'delivery') {
            axios
                .post('http://139.84.166.124:8060/vms-service/vendor/list', {
                    premise_id: premise_id,
                })
                .then((response) => {
                    if (response.data?.data) {
                        setBrands(response.data.data);
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch vendor list:', err.message);
                });
        }
    }, [guestType]);

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

                            <TextField
                                fullWidth
                                label="Number of Visitors"
                                value={visitorCount}
                                onChange={(e) => setVisitorCount(e.target.value)}
                                type="number"
                                className="mb-4"
                                margin="normal"
                                required
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
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 2 }}>
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

                            {guestType === 'delivery' && (
                                <FormControl fullWidth>
                                    <InputLabel>Select Brand</InputLabel>
                                    <Select
                                        value={selectedBrandId}
                                        onChange={(e) => {
                                            const brandId = e.target.value;
                                            const brand = brands.find((b) => b._id === brandId);

                                            setSelectedBrandId(brandId);
                                            setSelectedBrandName(brand?.name || '');
                                            setSelectedBrandLogo(brand?.logo || '');
                                        }}
                                        label="Select Brand"
                                        renderValue={() => (
                                            <div className="flex items-center gap-2">
                                                {selectedBrandLogo && (
                                                    <img src={selectedBrandLogo} alt="logo" className="w-6 h-6 rounded" />
                                                )}
                                                <span>{selectedBrandName}</span>
                                            </div>
                                        )}
                                    >
                                        {brands.map((brand) => (
                                            <MenuItem key={brand._id} value={brand._id}>
                                                <div className="flex items-center gap-3">
                                                    <img src={brand.logo} alt={brand.name} className="w-6 h-6 rounded" />
                                                    <span>{brand.name}</span>
                                                </div>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
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
                                        onClick={handleNext}
                                        disabled={!name || !guestType || !vehicleType || (vehicleType !== 'pedestrian' && !vehicleNumber) || uploading}
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
                                        onClick={() => fetchPremiseUnits(sp.sub_premise_id, sp.sub_premise_name)}
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
                                                                key={`chip-${flat.premise_unit_id}`}
                                                                label={flat.premise_unit_id}
                                                                onDelete={() => handleFlatToggle(flat.premise_unit_id)}
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
                                                                variant={
                                                                    selectedFlats.some(f => f.premise_unit_id === unit.id && f.sub_premise_id === selectedTower)
                                                                        ? 'outlined'
                                                                        : 'text'
                                                                }

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
