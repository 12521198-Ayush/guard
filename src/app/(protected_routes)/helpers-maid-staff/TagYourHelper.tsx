'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const MySwal = withReactContent(Swal)

const TagYourHelper = () => {
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()
    const premise_id = session?.user?.primary_premise_id
    const premise_unit_id = session?.user?.premise_unit_id

    const validateQR = (qr: string) => {
        return qr.startsWith('[maid]') && qr.length > 10
    }

    const showInvalidAlert = () => {
        MySwal.fire({
            title: 'Invalid QR Code',
            text: 'Please scan a valid Helper QR code.',
            width: 350,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Scan Again',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#6366F1',
            cancelButtonColor: '#9CA3AF',
        }).then((result) => {
            if (result.isConfirmed) {
                router.push('/helpers-maid-staff')
            } else {
                router.push('/menu')
            }
        })
    }

    const showSuccessAlert = () => {
        MySwal.fire({
            title: 'Helper Tagged',
            text: 'The helper has been successfully tagged to your unit.',
            width: 350,
            icon: 'success',
            confirmButtonText: 'Okay',
            confirmButtonColor: '#22C55E',
        })
    }

    const showErrorAlert = (message: string) => {
        MySwal.fire({
            title: 'Error',
            text: message || 'Something went wrong. Please try again.',
            width: 350,
            icon: 'error',
            confirmButtonText: 'Close',
            confirmButtonColor: '#EF4444',
        })
    }

    const tagHelper = async (qr_code: string) => {
        setLoading(true)
        try {
            if (!session) return
            const res = await fetch('http://139.84.166.124:8060/staff-service/tag/premise_unit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.user?.accessToken}`
                },
                body: JSON.stringify({
                    premise_id,
                    premise_unit_id,
                    qr_code,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                router.push('/menu')
                showSuccessAlert()
            } else {
                router.push('/menu')
                showErrorAlert(data.message || 'Failed to tag helper.')
            }
        } catch (error) {
            console.error(error)
            router.push('/menu')
            showErrorAlert('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleQRResult = (scannedResult: string) => {
        console.log('Scanned:', scannedResult)

        if (!validateQR(scannedResult)) {
            router.push('/menu')
            showInvalidAlert()
            return
        }

        tagHelper(scannedResult)
    }
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
        }
        else {
            console.error("QR Scan interface not available");
        }
    };


    useEffect(() => {
        // Bind the scan handler and start scan immediately
        // @ts-ignore
        window.handleQRResult = handleQRResult

        startScan()

        return () => {
            // @ts-ignore
            window.handleQRResult = null
        }
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] w-full max-w-md mx-auto"
        >
            <p className="text-center text-gray-500 text-sm">Opening scanner...</p>
        </motion.div>
    )
}

export default TagYourHelper
