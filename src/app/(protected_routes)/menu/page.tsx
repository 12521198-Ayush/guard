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
      primary_premise_id 
      {session?.user.primary_premise_id}
      premise_unit_id 
      {session?.user.premise_unit_id}
      sub_premise_id 
      {session?.user.sub_premise_id}
      </div> */}
      <MobileMenu />
    </>
  );
};

export default Page;