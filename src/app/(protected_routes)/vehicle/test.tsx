'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { FaChevronDown } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: {
        vno: string;
        vehicle_type: string;
        parking_slot: string;
        parking_area_name: string;
    }) => void;
    initialData?: {
        vno: string;
        vehicle_type: string;
        parking_slot: string;
        parking_area_name: string;
    };
    mode: 'add' | 'edit';
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    mode,
}) => {

    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [parkingAreaDropdownOpen, setParkingAreaDropdownOpen] = useState(false);
    const [parkingSlotDropdownOpen, setParkingSlotDropdownOpen] = useState(false);

    const [requiredError, setRequiredError] = useState({
        vno: false,
        parking_slot: false,
        parking_area_name: false,
    });

    const { data: session } = useSession();
    const [parkingAreas, setParkingAreas] = useState<any[]>([]);
    const [parkingSlots, setParkingSlots] = useState<any[]>([]);
    const token = session?.user?.accessToken;

    // @ts-ignore
    const [form, setForm] = useState({
        vno: '',
        vehicle_type: '4w',
        parking_slot: '',
        parking_slot_id: '',
        parking_area_name: '',
        parking_area_id: '',
    });

    useEffect(() => {
        const fetchParkingData = async () => {
            try {
                const payload = {
                    premise_id: "c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af",
                    sub_premise_id: "0aad0a20-6b21-11ef-b2cb-13f201b16993",
                    premise_unit_id: "D-0005",
                };

                const [areaRes, slotRes] = await Promise.all([
                    fetch("http://139.84.166.124:8060/user-service/admin/parking/premises/parking_area/list", {
                        method: "POST",
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload),
                    }),
                    fetch("http://139.84.166.124:8060/user-service/admin/parking/slot/list", {
                        method: "POST",
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload),
                    }),
                ]);

                const areaData = await areaRes.json();
                const slotData = await slotRes.json();

                if (!areaData.error) setParkingAreas(areaData.data || []);
                if (!slotData.error) setParkingSlots(slotData.data || []);
            } catch (err) {
                console.error("Error fetching parking data", err);
            }
        };

        if (isOpen && mode === 'add') fetchParkingData();
    }, [isOpen, mode]);

    // @ts-ignore
    useEffect(() => {
        if (initialData) {
            // @ts-ignore

            setForm(initialData);
        } else {
            // @ts-ignore

            setForm({
                vno: '',
                vehicle_type: '4w',
                parking_slot: '',
                parking_area_name: '',
            });
        }
        setError(null);
        setRequiredError({ vno: false, parking_slot: false, parking_area_name: false });
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setRequiredError((prev) => ({ ...prev, [name]: false }));
        if (name === 'vno' && mode === 'edit' && value === initialData?.vno) {
            setError('This is the same vehicle number as before');
        } else if (name === 'vno') {
            setError(null);
        }
    };

    const handleSubmit = () => {
        if (!form.vno || !form.parking_slot || !form.parking_area_name) {
            setRequiredError({
                vno: !form.vno,
                parking_slot: !form.parking_slot,
                parking_area_name: !form.parking_area_name,
            });
            return;
        }

        if (mode === 'edit' && form.vno === initialData?.vno) {
            setError('This is the same vehicle number as before');
            return;
        }

        const payload = {
            ...form,
            ...(mode === 'edit' ? { oldvno: initialData?.vno } : {}),
        };

        onSave(payload);
        onClose();
    };

    const inputClass =
        'w-full px-4 py-2 bg-gray-100 rounded-xl shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400';
    const errorClass = 'border-2 border-yellow-500';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay - dims everything including header */}
                    <motion.div
                        className="fixed inset-0 bg-black/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl "
                        style={{ maxHeight: '90vh' }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="overflow-y-auto px-6 pt-6 pb-10 max-h-[90vh]">
                            {/* Title Bar */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
                                </h3>
                                <button onClick={onClose}>
                                    <MdClose className="text-gray-500 text-2xl" />
                                </button>
                            </div>

                            <div className="space-y-4">

                                {/* Parking Slot Dropdown */}
                                <div
                                    className="relative w-full"
                                    onClick={() => {
                                        if (mode === 'add') setParkingSlotDropdownOpen((prev) => !prev);
                                    }}
                                >
                                    <button
                                        disabled={mode === 'edit'}
                                        className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 
      ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
                                    >
                                        {form.parking_slot || 'Select Parking Slot'}
                                        <FaChevronDown className={`ml-2 h-4 w-4 transition-transform ${parkingSlotDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {parkingSlotDropdownOpen && mode === 'add' && (
                                        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10 max-h-[10rem] overflow-y-auto">
                                            {parkingSlots.length > 0 ? (
                                                parkingSlots.map((slot) => (
                                                    <button
                                                        key={slot._id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                parking_slot: slot.parking_slot,
                                                                parking_slot_id: slot._id,
                                                            }));
                                                            setParkingSlotDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${form.parking_slot === slot.parking_slot ? 'bg-blue-600 text-white' : 'text-gray-800'
                                                            }`}
                                                    >
                                                        {slot.parking_slot} ({slot.vehicle_type})
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500 text-center">No data found</div>
                                            )}
                                        </div>
                                    )}

                                    {requiredError.parking_slot && (
                                        <p className="text-sm text-yellow-500 mt-1 ml-1">Parking slot is required</p>
                                    )}
                                </div>

                                {/* Parking Area Dropdown */}
                                <div
                                    className="relative w-full"
                                    onClick={() => {
                                        if (mode === 'add') setParkingAreaDropdownOpen((prev) => !prev);
                                    }}
                                >
                                    <button
                                        disabled={mode === 'edit'}
                                        className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 
      ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
                                    >
                                        {form.parking_area_name || 'Select Parking Area'}
                                        <FaChevronDown className={`ml-2 h-4 w-4 transition-transform ${parkingAreaDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {parkingAreaDropdownOpen && mode === 'add' && (
                                        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10 max-h-[10rem] overflow-y-auto">
                                            {parkingAreas.length > 0 ? (
                                                parkingAreas.map((area) => (
                                                    <button
                                                        key={area.parking_area_id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                parking_area_name: area.parking_area_name,
                                                                parking_area_id: area.parking_area_id,
                                                            }));
                                                            setParkingAreaDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${form.parking_area_name === area.parking_area_name ? 'bg-blue-600 text-white' : 'text-gray-800'
                                                            }`}
                                                    >
                                                        {area.parking_area_name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500 text-center">No data found</div>
                                            )}
                                        </div>
                                    )}

                                    {requiredError.parking_area_name && (
                                        <p className="text-sm text-yellow-500 ml-1">Parking area is required</p>
                                    )}
                                </div>

                                {/* Vehicle Number */}
                                <div>
                                    <input
                                        name="vno"
                                        value={form.vno}
                                        onChange={handleChange}
                                        placeholder="Vehicle Number"
                                        className={`${inputClass} ${error || requiredError.vno ? errorClass : ''}`}
                                    />
                                    {error && <p className="text-sm text-yellow-500 mt-1 ml-1">{error}</p>}
                                    {requiredError.vno && (
                                        <p className="text-sm text-yellow-500 mt-1 ml-1">Vehicle number is required</p>
                                    )}
                                </div>

                                {/* Vehicle Type Dropdown */}
                                <div className="relative w-full">
                                    <button
                                        onClick={mode === 'add' ? () => setDropdownOpen(!dropdownOpen) : undefined}
                                        disabled={mode === 'edit'}
                                        className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 
                                    ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
                                    >
                                        {form.vehicle_type === '4w' ? '4 Wheeler' : '2 Wheeler'}
                                        <FaChevronDown className={`ml-2 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {dropdownOpen && mode === 'add' && (
                                        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10">
                                            {['4w', '2w'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setForm((prev) => ({ ...prev, vehicle_type: option }));
                                                        setDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${form.vehicle_type === option ? 'bg-blue-600 text-white' : 'text-gray-800'}`}
                                                >
                                                    {option === '4w' ? '4 Wheeler' : '2 Wheeler'}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium shadow-md hover:bg-blue-700 transition"
                                >
                                    {mode === 'add' ? 'Add Vehicle' : 'Update Vehicle'}
                                </button>
                                
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default VehicleFormModal;
