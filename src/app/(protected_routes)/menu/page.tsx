'use client'

import MobileMenu from '@/components/Home/MobileMenu';
import React from 'react';
import { useSession } from 'next-auth/react';

const Page = () => {
  const { data: session } = useSession();
  return (
    <>
      {/* <div> access token - 
      {session?.user.accessToken}
      refresh tken ---------------------
      {session?.user.accessToken}
      </div> */}
      <MobileMenu />
    </>
  );
};

export default Page; 