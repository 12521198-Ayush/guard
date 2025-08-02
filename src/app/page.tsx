'use client'

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = `${window.location.origin}/guard-menu`;
  }, []);

  return <>Redirecting...</>;
}
