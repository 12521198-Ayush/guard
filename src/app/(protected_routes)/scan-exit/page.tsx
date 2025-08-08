'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Avatar, Button, Typography, CircularProgress } from '@mui/material';
import { Phone, Home } from 'lucide-react';
import { motion } from 'framer-motion'


export default function ScanEntry() {
    const premise_id = localStorage.getItem('selected_premise_id');
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [resultData, setResultData] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const validateQR = (qr: string) => {
        return (
            qr.startsWith("[maid]") ||
            qr.startsWith("[staff]") ||
            qr.startsWith("guest_") ||
            qr.startsWith("[_res]")
        );
    };

    useEffect(() => {
        //@ts-ignore
        if (typeof window !== 'undefined' && window.AndroidInterface) {
            if (resultData && !errorMsg) {
                const name = resultData.name || "Visitor";
                const title = resultData.title?.toLowerCase() || "";

                const isResident = title.includes("resident") || title.endsWith("_res");
                const isGuest = title.includes("guest");

                if (isResident) {
                    //@ts-ignore
                    window.AndroidInterface.speakText("Resident Exit Allowed");
                } else {
                    const role = isGuest ? "Guest" : "Staff";
                    //@ts-ignore
                    window.AndroidInterface.speakText(`${role} ${name}, Exit Allowed`);
                }
            } else if (errorMsg) {
                //@ts-ignore
                window.AndroidInterface.speakText("Exit Denied");
            }
        }
    }, [resultData, errorMsg]);


    const handleQRResult = async (scannedResult: string) => {
        console.log('Scanned:', scannedResult);
        setLoading(true);

        if (!validateQR(scannedResult)) {
            setErrorMsg('❌ Invalid QR code');
            setModalOpen(true);
            return;
        }

        try {
            let res;
            const scan_type = "exit";
            const scan_location = localStorage.getItem("selected_subpremise_name");
            const maidpayload = {
                premise_id,
            }
            console.log("maidpayload", JSON.stringify(maidpayload));
            if (scannedResult.startsWith("[maid]") || scannedResult.startsWith("[staff]")) {
                const qr_code = scannedResult;
                const maidpayload = {
                    premise_id,
                    qr_code,
                    scan_type,
                    scan_location
                }
                res = await axios.post('https://api.servizing.app/staff-service/verify/qr', maidpayload);

                console.log("maidpayload", JSON.stringify(maidpayload));

                const data = res.data?.data;
                console.log("data from api", JSON.stringify(data))
                if (!data) throw new Error('Exit Denied');

                setResultData({
                    title: 'Staff / Maid Exit',
                    name: data.name,
                    mobile: data.mobile,
                    image: data.signed_url,
                    unit: data.premise_unit_associated_with?.[0]?.premise_unit_id || '-',
                });
            } else if (scannedResult.startsWith('guest_')) {
                const invite_code = scannedResult;
                res = await axios.post('https://api.servizing.app/vms-service/preinvite/list', {
                    premise_id,
                    invite_code,
                    scan_type,
                    scan_location
                });
                const data = res.data?.data?.[0];
                if (!data) throw new Error('Exit Denied');

                setResultData({
                    title: 'Guest Exit',
                    name: data.contact_name,
                    mobile: data.contact_number,
                    image: data.signed_url,
                    unit: data.premise_unit_id,
                });
            } else if (scannedResult.startsWith('[_res]')) {
                const one_qr = scannedResult;
                res = await axios.post('https://api.servizing.app/user-service/resident/verify/OneQR', {
                    premise_id,
                    one_qr,
                    scan_type,
                    scan_location
                });
                const data = res.data?.data;
                if (!data) throw new Error('Exit Denied');

                setResultData({
                    title: 'Resident Exit',
                    name: data.mobile,
                    mobile: data.mobile,
                    image: null,
                    unit: data.premise_unit_id,
                });
            }

            setModalOpen(true);
        } catch (err) {
            console.error('Scan failed:', JSON.stringify(err));
            setErrorMsg(' Exit Denied');
            setModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const startScan = () => {
        // Android
        // @ts-ignore
        if (window.AndroidInterface?.startQRScan) {
            // @ts-ignore
            window.AndroidInterface.startQRScan();
        }
        // iOS
        // @ts-ignore
        else if (window.webkit?.messageHandlers?.startQRScan) {
            // @ts-ignore
            window.webkit.messageHandlers.startQRScan.postMessage(null);
        } else {
            console.error('QR Scan interface not available');
            setErrorMsg('QR Scanner not available');
            setModalOpen(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Bind scanner handler
        // @ts-ignore
        window.handleQRResult = handleQRResult;
        startScan();

        return () => {
            // @ts-ignore
            window.handleQRResult = null;
        };
    }, []);

    return (
        <>
            {loading && (
                <div className="h-screen flex items-center justify-center">
                    <CircularProgress />
                </div>
            )}

            <Dialog
                open={modalOpen}
                onClose={() => { }}
                maxWidth="md"
                PaperProps={{
                    style: {
                        width: "500px",
                        borderRadius: '24px',
                        padding: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        backgroundColor: '#fdfdfd',
                        backdropFilter: 'blur(20px)',
                    },
                }}
            >
                <DialogTitle
                    style={{
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '18px',
                        color: '#333',
                    }}
                >
                    {errorMsg ? 'Result' : resultData?.title}
                </DialogTitle>

                <DialogContent
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        paddingTop: 0,
                        gap: '16px',
                    }}
                >
                    {errorMsg ? (
                        <Typography color="error" style={{ fontSize: 16 }}>
                            ❌ {errorMsg}
                        </Typography>
                    ) : resultData ? (
                        <>
                            {resultData.image && resultData.title !== 'Guest Exit' ? (
                                <img
                                    src={resultData.image}
                                    alt="Profile"
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                    }}
                                />
                            ) : (
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        fontSize: 32,
                                        backgroundColor: '#d3eafd',
                                        color: '#2b60c5',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                    }}
                                >

                                </Avatar>
                            )}


                            <Typography variant="h6" style={{ fontWeight: 600, fontSize: '17px' }}>
                                {resultData.name}
                            </Typography>

                            {/* Mobile Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="w-full bg-[#eef4ff] rounded-xl flex items-center px-4 py-2 space-x-3"
                            >
                                <Phone className="text-indigo-500 animate-pulse" size={20} />
                                <Typography variant="body2" style={{ fontWeight: 500, color: '#333' }}>
                                    {resultData.mobile}
                                </Typography>
                            </motion.div>

                            {/* Unit Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                                className="w-full bg-[#e9fbee] rounded-xl flex items-center px-4 py-2 space-x-3"
                            >
                                <Home className="text-green-500 animate-pulse" size={20} />
                                <Typography variant="body2" style={{ fontWeight: 500, color: '#333' }}>
                                    Unit: {resultData.unit}
                                </Typography>
                            </motion.div>
                        </>
                    ) : (
                        <Typography>Loading...</Typography>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => router.push('/guard-menu')}
                        style={{
                            marginTop: 16,
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                            borderRadius: 100,
                            fontWeight: 600,
                            fontSize: '15px',
                            textTransform: 'none',
                            padding: '10px 0',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                        }}
                    >
                        OK
                    </Button>
                </DialogContent>
            </Dialog>

        </>
    );
}
