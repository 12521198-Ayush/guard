// src/utils/getRefreshToken.ts or similar
'use client';

export async function getRefreshToken(): Promise<string | null> {
  try {
    const res = await fetch('https://karyakarta.servizing.app/api/get-refresh-token');
    const json = await res.json();
    return res.ok ? json.refreshToken : null;
  } catch (err) {
    console.error('Error fetching refresh token:', err);
    return null;
  }
}
