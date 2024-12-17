"use client";
import dynamic from 'next/dynamic';

// Dynamically import the component with SSR disabled
const SummaryChart = dynamic(() => import('@/components/Charts/SummaryChart'), {
  ssr: false,
});
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { blueGrey } from '@mui/material/colors';
import HouseIcon from '@mui/icons-material/House';
import Groups2Icon from '@mui/icons-material/Groups2';
import EmojiTransportationIcon from '@mui/icons-material/EmojiTransportation';

interface Units {
  total: number;
  owner_occupied: number;
  tenant_occupied: number;
}

interface Residents {
  total: number;
  owners: number;
  tenants: number;
}

interface SupportStaff {
  total: number;
  unit_level: number;
  premise_level: number;
}

interface Vehicles {
  total: number;
  tagged: number;
  untagged: number;
}

interface SummaryStats {
  units: Units;
  residents: Residents;
  support_staff: SupportStaff;
  vehicles: Vehicles;

}


export default function Summary() {

  const [premiseId, setPremiseId] = useState("");
  const { data: session } = useSession();
  let accessToken = session?.user?.accessToken || undefined;

  const [summaryStats, setSummaryStats] = useState<SummaryStats>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (session?.user?.primary_premise_id) {
      setPremiseId(session.user.primary_premise_id);
    }
  }, [session?.user?.primary_premise_id]);

  useEffect(() => {
    if (premiseId) {
      loadData();
    }
  }, [premiseId,]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);  // Set the state to true once the component is mounted on the client side
  }, []);

  if (!isClient) {
    return null; // or a loading spinner, or any fallback content
  }


  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://139.84.166.124:8060/user-service/admin/dashboard/summary",
        {
          premise_id: premiseId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const { data } = response.data;
      //console.log(data);
      setSummaryStats(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  function valueToPercent(value: number, seriesTotal: number) {
    return Math.round((value * 100) / seriesTotal);
  }

  let unit_lables = ["Owner Occupied", "Tenant Occupied"]
  let units_total = summaryStats ? summaryStats.units.total : 0;
  let units_series = [summaryStats?.units?.owner_occupied ? valueToPercent(summaryStats.units.owner_occupied, units_total) : 0, summaryStats?.units?.tenant_occupied ? valueToPercent(summaryStats.units.tenant_occupied, units_total) : 0];

  let resident_lables = ["Owners", "Tenants"]
  let resident_total = summaryStats ? summaryStats.residents.total : 0;
  let resident_series = [summaryStats?.residents?.owners ? valueToPercent(summaryStats.residents.owners, resident_total) : 0, summaryStats?.residents?.tenants ? valueToPercent(summaryStats.residents.tenants, resident_total) : 0];

  let staff_lables = ["Premise Level", "Unit Level"]
  let staff_total = summaryStats ? summaryStats.support_staff.total : 0;
  let staff_series = [summaryStats?.support_staff?.premise_level ? valueToPercent(summaryStats.support_staff.premise_level, staff_total) : 0, summaryStats?.support_staff?.unit_level ? valueToPercent(summaryStats.support_staff.unit_level, staff_total) : 0];

  let vehicle_lables = ["Tagged", "Un-Tagged"]
  let vehicle_total = summaryStats ? summaryStats.vehicles.total : 0;
  let vehicle_series = [summaryStats?.vehicles?.tagged ? valueToPercent(summaryStats.vehicles.tagged, vehicle_total) : 0, summaryStats?.vehicles?.untagged ? valueToPercent(summaryStats.vehicles.untagged, vehicle_total) : 0];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3 xl:grid-cols-4 2xl:gap-7.5">
      <SummaryChart
        title="Units"
        lables={unit_lables}
        total={units_total}
        series={units_series}
        color={['#39ff33', '#ff4f33']}
      >
        <HouseIcon sx={{ color: blueGrey[600], fontSize: 40 }} />
      </SummaryChart>

      <SummaryChart
        title="Residents"
        lables={resident_lables}
        total={resident_total}
        series={resident_series}
        color={['#39ff33', '#ff4f33']} // '#1ab7ea', '#0084ff'
      >
        <Groups2Icon sx={{ color: blueGrey[600], fontSize: 40 }} />
      </SummaryChart>

      <SummaryChart
        title="Staff"
        lables={staff_lables}
        total={staff_total}
        series={staff_series}
        color={['#39ff33', '#ff4f33']}
      >
        <HouseIcon sx={{ color: blueGrey[600], fontSize: 40 }} />
      </SummaryChart>

      <SummaryChart
        title="Vehicles"
        lables={vehicle_lables}
        total={vehicle_total}
        series={vehicle_series}
        color={['#39ff33', '#ff4f33']}
      >
        <EmojiTransportationIcon sx={{ color: blueGrey[600], fontSize: 40 }} />
      </SummaryChart>
    </div>
  )

}