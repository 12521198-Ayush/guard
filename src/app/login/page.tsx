"use client"
import { useEffect, useState } from 'react';
import { getTokensFromWebView } from '../../utils/getTokens';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function Home() {
    const [tokens, setTokens] = useState({ accessToken: null, refreshToken: null });
    const router = useRouter();  // Hook for redirecting after sign-in

    const signInWithCredentials = async () => {
        if (!tokens.accessToken || !tokens.refreshToken) {
            console.error("Access token or refresh token is missing");
            return;
        }

        const response = await signIn("credentials", {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            redirect: false,  // Do not auto-redirect
        });

        if (response?.ok) {
            router.push('/menu');  // Redirect to menu if sign-in is successful
        } else {
            console.error("Sign-in failed:", response?.error);
        }
    };

    useEffect(() => {
        async function fetchTokens() {
            const { accessToken, refreshToken } = await getTokensFromWebView();
            setTokens({ accessToken, refreshToken });
        }
        fetchTokens();
        signInWithCredentials();  // Attempt sign-in with the tokens
    }, [tokens.accessToken, tokens.refreshToken]);  // Trigger sign-in when tokens change

    return (
        <div>
            <h1>Tokens from Android</h1>
            <p>Access Token: {tokens.accessToken || 'Not available'}</p>
            <p>Refresh Token: {tokens.refreshToken || 'Not available'}</p>
        </div>
    );
}
