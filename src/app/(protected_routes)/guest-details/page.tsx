'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function GuestDetailsPage() {
    const searchParams = useSearchParams();
    const [guest, setGuest] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const parsed = JSON.parse(decodeURIComponent(data));
                setGuest(parsed);
            } catch (err) {
                console.error('❌ Failed to parse QR data:', err);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (guest && audioRef.current) {
            const audio = audioRef.current;
            audio.volume = 1.0;
            audio.play().catch((err) => {
                console.warn('⚠️ Audio autoplay was blocked by the browser:', err);
            });
        }
    }, [guest]);

    if (!guest) return <div className="p-4">Loading guest details...</div>;

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-xl font-bold text-gray-800">Guest Details</h1>

            {/* Auto-play audio at full volume */}
            {/* <audio ref={audioRef} autoPlay controls>
                <source
                    src="https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.aac"
                    type="audio/aac"
                />
                Your browser does not support the audio element.
            </audio> */}

            {/* Guest Info Card */}
            <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
                <img
                    src={guest.signed_url}
                    alt="Guest QR"
                    className="w-40 h-40 object-cover rounded-lg"
                />
                <p><strong>Name:</strong> {guest.contact_name}</p>
                <p><strong>Mobile:</strong> {guest.contact_number}</p>
                <p><strong>Unit:</strong> {guest.premise_unit_id}</p>
                <p><strong>Invite Type:</strong> {guest.invite_type}</p>
                <p><strong>Note:</strong> {guest.note_for_guest || '-'}</p>
                <p><strong>Passcode:</strong> {guest.passcode}</p>
                <p><strong>Valid From:</strong> {new Date(guest.start_date).toLocaleString()}</p>
                <p><strong>Valid Until:</strong> {new Date(guest.end_date).toLocaleString()}</p>
            </div>
        </div>
    );
}
