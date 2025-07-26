'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'

type Premise = {
  premise_id: string;
  premise_name: string;
  country_code: string;
  mobile: string;
  name: string;
  skill: string;
  bCanTakePremiseOrders: string;
};

const Page = ({ onComplete }: { onComplete: () => void }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const API_BASE = 'http://139.84.166.124:8060/user-service/registration';
  const premiseOptions: any = session?.user?.premises_associated_with || [];

  const [selectedPremise, setSelectedPremise] = useState<any>('');
  const [subpremises, setSubPremises] = useState([]);
  const [selectedSubpremise, setSelectedSubpremise] = useState('');

  useEffect(() => {
    const storedPremise = localStorage.getItem('selected_premise_id');
    const guard_id = uuidv4();
    localStorage.setItem('security_guard_id', guard_id);
    
    if (storedPremise) {
      setSelectedPremise(storedPremise);
    }
  }, []);

  useEffect(() => {
    if (selectedPremise) {
      localStorage.setItem('selected_premise_id', selectedPremise);
      fetchSubPremises(selectedPremise);
    }
  }, [selectedPremise]);

  const fetchSubPremises = async (premiseId: string) => {
    try {
      const res = await fetch(`${API_BASE}/subpremise/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premise_id: premiseId }),
      });

      const data = await res.json();
      setSubPremises(data.data || []);
    } catch (error) {
      console.error('Error fetching sub-premises:', error);
    }
  };

  const handleContinue = () => {
    localStorage.setItem('selected_subpremise_id', selectedSubpremise);

    // ✅ Save extra fields for selected premise
    const selectedPremiseObject = premiseOptions.find(
      (p: any) => p.premise_id === selectedPremise
    );

    if (selectedPremiseObject) {
      localStorage.setItem('selected_premise_name', selectedPremiseObject.premise_name || '');
      localStorage.setItem('selected_country_code', selectedPremiseObject.country_code || '');
      localStorage.setItem('selected_mobile', selectedPremiseObject.mobile || '');
      localStorage.setItem('selected_name', selectedPremiseObject.name || '');
    }

    onComplete();
  };

  const combinedSubPremiseOptions = [
    { sub_premise_id: 'gate', sub_premise_name: 'Gate' },
    ...subpremises,
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[9999] bg-white overflow-auto">
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <motion.h2
              className="text-2xl font-semibold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Select Premise and Device Location
            </motion.h2>
          </div>

          {/* Premise Dropdown */}
          <FormControl fullWidth>
            <InputLabel id="premise-select-label">Select Premise</InputLabel>
            <Select
              labelId="premise-select-label"
              value={selectedPremise}
              label="Select Premise"
              onChange={(e) => {
                setSelectedPremise(e.target.value);
                setSelectedSubpremise('');
              }}
              MenuProps={{
                disablePortal: true,
                PaperProps: {
                  style: { zIndex: 1300 },
                },
              }}
            >
              <MenuItem value="" disabled>
                Select Premise
              </MenuItem>
              {premiseOptions.map((premise: any) => (
                <MenuItem key={premise.premise_id} value={premise.premise_id}>
                  {premise.premise_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subpremise Dropdown */}
          {selectedPremise && (
            <FormControl fullWidth>
              <InputLabel id="subpremise-select-label">Select Device Preference</InputLabel>
              <Select
                labelId="subpremise-select-label"
                value={selectedSubpremise}
                label="Select Device Preference"
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSubpremise(id);

                  const selectedSub = combinedSubPremiseOptions.find((sp) => sp.sub_premise_id === id);
                  if (selectedSub) {
                    localStorage.setItem('selected_subpremise_id', selectedSub.sub_premise_id);
                    localStorage.setItem('selected_subpremise_name', selectedSub.sub_premise_name); // ✅ Save name
                  }
                }}
                MenuProps={{
                  disablePortal: true,
                  PaperProps: {
                    style: { zIndex: 1300 },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select Device Preference
                </MenuItem>
                {combinedSubPremiseOptions.map((sub) => (
                  <MenuItem key={sub.sub_premise_id} value={sub.sub_premise_id}>
                    {sub.sub_premise_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Continue Button */}
          {selectedPremise && selectedSubpremise && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <motion.button
                onClick={handleContinue}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.05 }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out"
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
