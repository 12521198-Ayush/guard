'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import qs from 'qs';

const VisitorEntry = () => {
    const [input, setInput] = useState('')
    const [showOtpScreen, setShowOtpScreen] = useState(false)
    const [showFormDrawer, setShowFormDrawer] = useState(false)
    const router = useRouter();
    const [resultData, setResultData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const premise_id = localStorage.getItem('selected_premise_id');


    const isValidOtp = (val: string) => /^\d{7}$/.test(val)
    const isValidPhone = (val: string) => /^\d{10}$/.test(val)

    const handleSubmit = async () => {
        const trimmed = input.trim();

        if (isValidOtp(trimmed)) {
            setShowOtpScreen(true);
        } else if (isValidPhone(trimmed)) {
            try {
                const res = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/vms-service/mobile/fetch', {
                    mobile: trimmed,
                    premise_id,
                });

                const found = res.data?.data?.[0];
                const payload = found ? { ...found } : { mobile: trimmed };

                const query = qs.stringify(payload); // safely serialize query params
                router.push(`/guard-form?${query}`);
            } catch (err) {
                console.error('Error checking mobile:', err);
                const fallback = qs.stringify({ mobile: trimmed });
                router.push(`/guard-form?${fallback}`);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '')
        if (val.length <= 10) setInput(val)
    }

    const otpSubmission = async (otp: any) => {
        try {
            const res = await axios.post('https://api.servizing.app/vms-service/preinvite/list', {
                premise_id,
                invite_code: otp,
            });

            const data = res.data?.data?.[0];

            // ❌ Deny entry if no valid data is returned
            if (!data || !data.contact_name || !data.premise_unit_id) {
                //@ts-ignore
                if (typeof window !== 'undefined' && window.AndroidInterface) {
                    //@ts-ignore
                    window.AndroidInterface.speakText("Entry Denied. Invalid Passcode.");
                }
                alert("Invalid or expired passcode. Entry denied.");
                return;
            }

            // ✅ Allow entry if valid data exists
            //@ts-ignore
            if (typeof window !== 'undefined' && window.AndroidInterface) {
                //@ts-ignore
                window.AndroidInterface.speakText("Passcode Entry Allowed");
            }

            setResultData({
                title: 'Guest Entry',
                name: data.contact_name,
                mobile: data.contact_number,
                image: data.signed_url,
                unit: data.premise_unit_id,
            });

        } catch (err) {
            console.error("OTP submission failed:", err);
            //@ts-ignore

            if (typeof window !== 'undefined' && window.AndroidInterface) {
                //@ts-ignore
                window.AndroidInterface.speakText("Entry Denied. Please try again.");
            }
            alert("Error verifying passcode. Please check your internet connection or try again.");
        }
    }


    const displayLength = input.length > 7 ? 10 : 7

    return (
        <div className="mt-6 px-4 relative">
            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .blinking-cursor {
                    animation: blink 1s step-start infinite;
                }
            `}</style>

            {showOtpScreen ? (
                <>
                    <h2 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                        <button
                            className="p-1 rounded-full bg-gray-100"
                            onClick={() => {
                                setShowOtpScreen(false);
                                setInput('');
                                setIsLoading(false); // Reset loader if going back
                            }}
                        >
                            <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
                        </button>
                        OTP Submitted
                    </h2>
                    <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
                        <p className="text-sm text-gray-600">
                            A 7-digit OTP was submitted: <strong>{input}</strong>
                        </p>

                        {isLoading ? (
                            <div className="w-full flex justify-center">
                                <div className="animate-spin h-6 w-6 border-4 border-green-600 border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            <button
                                className="w-full bg-green-600 text-white py-2 rounded-xl font-medium text-sm"
                                onClick={() => {
                                    setIsLoading(true);
                                    setTimeout(() => {
                                        otpSubmission(input);
                                    }, 1000);
                                }}
                            >
                                Confirm & Proceed
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-lg font-semibold mb-3 text-gray-900">Visitor Entry</h2>
                    <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
                        <label className="block text-sm text-gray-600 mb-1">
                            Enter OTP or Phone Number
                        </label>

                        {/* Hidden input */}
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="\d*"
                            autoComplete="one-time-code"
                            value={input}
                            onChange={handleChange}
                            maxLength={10}
                            className="absolute opacity-0 pointer-events-none"
                        />

                        {/* Visual blocks with underlines */}
                        <div
                            className="flex justify-between gap-2 px-1"
                            onClick={() => {
                                const inputField = document.querySelector<HTMLInputElement>('input[type="tel"]')
                                inputField?.focus()
                            }}
                        >
                            {Array.from({ length: displayLength }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-8 border-b-2 text-center text-lg text-gray-800 pb-1 border-gray-400"
                                >
                                    {input[i] !== undefined ? (
                                        input[i]
                                    ) : i === input.length ? (
                                        <span className="blinking-cursor text-gray-500">|</span>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium text-sm disabled:bg-blue-300 active:scale-[0.98] transition-transform mt-3"
                            disabled={!isValidOtp(input) && !isValidPhone(input)}
                            onClick={handleSubmit}
                        >
                            Continue
                        </button>
                    </div>
                </>
            )}

            {/* Bottom Drawer for Prefilled Form */}

        </div>
    )
}

export default VisitorEntry
