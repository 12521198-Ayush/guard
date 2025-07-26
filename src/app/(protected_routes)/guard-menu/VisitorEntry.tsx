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

    const premise_id = 'c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af'

    const isValidOtp = (val: string) => /^\d{6}$/.test(val)
    const isValidPhone = (val: string) => /^\d{10}$/.test(val)

    const handleSubmit = async () => {
        const trimmed = input.trim();

        if (isValidOtp(trimmed)) {
            setShowOtpScreen(true);
        } else if (isValidPhone(trimmed)) {
            try {
                const res = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL+'/vms-service/mobile/fetch', {
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

    const displayLength = input.length > 6 ? 10 : 6

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
                                setShowOtpScreen(false)
                                setInput('')
                            }}
                        >
                            <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
                        </button>
                        OTP Submitted
                    </h2>
                    <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
                        <p className="text-sm text-gray-600">
                            A 6-digit OTP was submitted: <strong>{input}</strong>
                        </p>
                        <button
                            className="w-full bg-green-600 text-white py-2 rounded-xl font-medium text-sm"
                            onClick={() => console.log('OTP Confirmed:', input)}
                        >
                            Confirm & Proceed
                        </button>
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
