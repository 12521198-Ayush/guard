'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HelpIcon from '@mui/icons-material/Help';
import { blueGrey, orange, lightGreen } from '@mui/material/colors';

const customerNameHelper = (serviceProvider: any) => {

    let vendorStatus = (serviceProvider?.bInCampus ?? "Unknown").toLowerCase();
    let isIncampus = vendorStatus == "yes";
    let offIncampus = vendorStatus == "no";
    let unknown = vendorStatus == "unknown";
    return ( 
        <>
        <div className="w-full flex flex-wrap justify-between items-center">
            <div className="w-6/12 md:w-12/12 flex flex-wrap items-center">
                <span>{serviceProvider?.name ?? "Unkown"} - {serviceProvider?.mobile ?? "Unknown"}</span>
            </div>
            <div className="w-6/12 md:w-12/12 flex flex-wrap justify-end">
                { isIncampus && <HowToRegIcon sx={{ color: lightGreen[600] }} />}
                { unknown && <HelpIcon sx={{ color: blueGrey[500] }} />}
                { offIncampus && <PersonOffIcon sx={{ color: orange[600] }} />}
            </div>
        </div>
    </>
    );
};

interface AssignVendorFormProps {
    availableVendors: any[];
    handleAssignment: (selectedVendor: any | null) => void;
}


const AssignVendor = ({ availableVendors, handleAssignment }: AssignVendorFormProps) => {

    const [selectedVendor, setSelectedVendor] = useState<any>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleAssignment(selectedVendor);
    };

    return (
        <Box p={3} overflow="auto" flexGrow={1}>
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md mx-auto px-2 py-2 space-y-6 bg-white rounded-2xl"
            >
                {/* Header */}
                <div className="text-center space-y-1">
                    <motion.h2
                        className="text-2xl font-semibold text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        Assign Service Provider
                    </motion.h2>
                    <motion.p
                        className="text-sm text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Please assign service provider to the ticket 
                    </motion.p>
                </div>            

                {/* Vendor dropdown */}
                {availableVendors.length > 0 ? (
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="Vendor-select-label">Select</InputLabel>
                        <Select
                        labelId="Vendor-select-label"
                        // value={selectedVendor}
                        label="vendor"
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        >
                        {availableVendors.map((sub, idx) => (
                            <MenuItem key={idx} value={JSON.stringify(sub)}>
                            {customerNameHelper(sub)}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                ): (
                    <div className="text-center space-y-1">
                    <p className="text-red font-semibold text-xl mt-2">No vendors available</p>
                    </div>
                )}

                {/* Submit Button */}
                {availableVendors.length > 0 && (
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                    >
                    Assign
                    </motion.button>
                )}
            </motion.form>

        </Box>
    );
}

export default AssignVendor;