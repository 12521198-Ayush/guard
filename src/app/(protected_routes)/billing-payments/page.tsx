'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

const RedirectToSSO = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToSSO = async () => {
      try {
        const res = await fetch('http://139.84.166.124:8060/user-service/user/rank_one/sso', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            premise_id: session?.user?.primary_premise_id,
            premise_unit_id: session?.user?.premise_unit_id,
            member_type: session?.user?.role,
          }),
        });

        const result = await res.json();

        if (result?.data?.ssoURL) {
          window.location.href = result.data.ssoURL;
        } else {
          throw new Error('SSO URL not found in response');
        }
      } catch (error: any) {
        console.error('Redirection failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Redirection Failed',
          text: error?.message || 'Something went wrong while redirecting.',
        });
        setLoading(false);
      }
    };

    redirectToSSO();
  }, [session, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Redirecting to Recharge Portal...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default RedirectToSSO;
