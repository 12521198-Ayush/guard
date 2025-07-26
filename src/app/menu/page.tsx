'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const skill = session?.user?.skill;

      if (skill === 'RWA Support') {
        router.replace('/rwa-menu');
      } else if (skill === 'Security') {
        router.replace('/guard-menu');
      }
    }
  }, [session, status, router]);

  // Optional: Loading screen while redirecting
  if (status === 'loading' || (status === 'authenticated' && session?.user?.skill)) {
    return <div className="p-6 text-center text-gray-600">Redirecting...</div>;
  }

  return <div className="p-6 text-center text-gray-700">Unauthorized or unknown role</div>;
};

export default Page;
