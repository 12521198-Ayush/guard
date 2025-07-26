"use client";
import { useEffect, useState } from 'react';
import { getTokensFromWebView } from '../../utils/getTokens';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
    fcm_token: null,
  });

  const router = useRouter();

  const signInWithCredentials = async () => {
    const { accessToken, refreshToken } = tokens;

    if (!accessToken || !refreshToken) {
      console.error("Access token or refresh token is missing");
      return;
    }

    const response = await signIn("credentials", {
      access_token: accessToken,
      refresh_token: refreshToken,
      redirect: false,
    });

    if (response?.ok) {
      router.push('/menu');
    } else {
      console.error("Sign-in failed:", response?.error);
    }
  };

  useEffect(() => {
    async function fetchTokens() {
      const { accessToken, refreshToken, fcm_token } = await getTokensFromWebView();

      // Store FCM token in localStorage, replacing old one
      if (fcm_token) {
        localStorage.removeItem('fcm_token');
        localStorage.setItem('fcm_token', fcm_token);
      }

      setTokens({ accessToken, refreshToken, fcm_token });
    }

    fetchTokens();
  }, []);

  useEffect(() => {
    if (tokens.accessToken && tokens.refreshToken) {
      signInWithCredentials();
    }
  }, [tokens.accessToken, tokens.refreshToken]);

  return (
    <div>
      <h1>Tokens from Android/iOS</h1>
      <p>Access Token: {tokens.accessToken || 'Not available'}</p>
      <p>Refresh Token: {tokens.refreshToken || 'Not available'}</p>
      <p>FCM Token: {tokens.fcm_token || 'Not available'}</p>
    </div>
  );
}
