'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { motion } from 'framer-motion';

const Preference = ({ onComplete }: { onComplete: () => void }) => {
    const { data: session } = useSession();
    const premiseOptions = session?.user?.premises_associated_with || [];
    const [selectedPremise, setSelectedPremise] = useState('');
    const [selectedSubpremise, setSelectedSubpremise] = useState('');

    useEffect(() => {
        const storedPremise = localStorage.getItem('selected_premise_id');
        if (storedPremise) {
            setSelectedPremise(storedPremise);
        }
    }, []);

    useEffect(() => {
        if (selectedPremise) {
            localStorage.setItem('selected_premise_id', selectedPremise);
        }
    }, [selectedPremise]);

    const handleContinue = () => {
        onComplete();
    };

    return (
        <div className="mt-20 mx-5 space-y-6">
            <div className="text-center space-y-1">
                <motion.h2
                    className="text-2xl font-semibold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Select Premise
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
                >
                    <MenuItem value="" disabled>Select Premise</MenuItem>
                    {premiseOptions.map((premise: any) => (
                        <MenuItem key={premise.premise_id} value={premise.premise_id}>
                            {premise.premise_name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>


            {/* Continue Button */}
            {selectedPremise && (
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
    );
};

export default Preference;
function handlePreferenceComplete() {
    throw new Error('Function not implemented.');
}

