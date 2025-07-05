'use client'

import { useEffect, useState } from 'react';

export default function Home() {
    const [voiceText, setVoiceText] = useState('');

    useEffect(() => {
        //@ts-ignore
        window.onVoiceInputResult = function (text) {
            console.log('Voice Input Received:', text);
            setVoiceText(text);
        };
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h2>Google Voice Input from Android</h2>
            <p>Recognized Text: <strong>{voiceText}</strong></p>
            <br />
            <br />
            <br />
            <br />
            <button onClick={() =>
                //@ts-ignore
                AndroidInterface?.startVoiceInput()}>
                Start Voice Input
            </button>
        </div>
    );
}