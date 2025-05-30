'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import axios from 'axios';

interface RankOneResponse {
  data: {
    ssoCiperText: string;
    dateTime: string;
    ssoURL: string;
  };
}

interface Subpremise {
  sub_premise_id: string;
  subpremise_name: string;
}

interface UserSession {
  primary_premise_id: string;
  accessToken: string;
  premise_unit_id: string;
  subpremiseArray: Subpremise[];
  role: string;
}

interface Session {
  user: UserSession;
}

const RedirectToSSO = () => {
  const { data: session } = useSession() as unknown as { data: Session };
  const [loading, setLoading] = useState(true);
  const premiseId = session?.user?.primary_premise_id;

  useEffect(() => {
    const switchToRankOne = async () => {
      try {
        console.log('Calling rank one API.');
        const response = await axios.post<RankOneResponse>(
          `http://139.84.166.124:8060/user-service/user/rank_one/sso`,
          {
            premise_id: session?.user?.primary_premise_id,
            premise_unit_id: session?.user?.premise_unit_id,
            member_type: session?.user?.role,
          }
        );

        const { ssoCiperText: ro_key, dateTime: ro_datetime, ssoURL: ro_ulr } = response.data.data;
        const ro_mid = 'Servizing';

        if (!ro_key || !ro_datetime || !ro_mid || !ro_ulr) {
          console.error('Missing required fields');
          return;
        }

        const ro_data = {
          Key: ro_key,
          DaTeTime: ro_datetime,
          MID: ro_mid,
        };

        postAndRedirect(ro_ulr, ro_data);
      } catch (error) {
        console.error('Error: Could not load rank one details', error);
      }
    };

    const postAndRedirect = (url: string, postData: Record<string, string>) => {
      const form = document.createElement('form');
      form.action = url;
      form.method = 'POST';
      form.target = '_blank';

      Object.entries(postData).forEach(([key, value]) => {

        console.log(key);
        console.log(value);

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      console.log(form);
      form.submit();
      document.body.removeChild(form); // Clean up
    };

    switchToRankOne();

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
