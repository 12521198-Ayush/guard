'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StaffDetailsPage() {
  const searchParams = useSearchParams();
  const [staff, setStaff] = useState<any>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        setStaff(JSON.parse(decodeURIComponent(data)));
      } catch (err) {
        console.error('Failed to parse QR data:', err);
      }
    }
  }, [searchParams]);

  if (!staff) return <div className="p-4">Loading staff details...</div>;

  const hasPremiseUnits = Array.isArray(staff.premise_unit_associated_with) && staff.premise_unit_associated_with.length > 0;

  return (
    <div className="m-2 p-2">
      <h1 className="text-xl ml-auto font-bold text-gray-800">Staff Details</h1>

      <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
        <img
          src={staff.signed_url}
          alt={staff.name}
          className="w-32 h-32 object-cover rounded-lg"
        />

        <p><strong>Name:</strong> {staff.name}</p>
        <p><strong>Mobile:</strong> +{staff.country_code} {staff.mobile}</p>

        {hasPremiseUnits ? (
          <p><strong>Premise Units:</strong> {staff.premise_unit_associated_with.map((u: any) => u.premise_unit_id).join(', ')}</p>
        ) : (
          <p className="text-red-600 font-semibold">🚫 Access Denied: Staff is not allowed for entry.</p>
        )}
      </div>
    </div>
  );
}
