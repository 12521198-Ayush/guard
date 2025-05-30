'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { BookUser } from 'lucide-react';
import Drawer from '@mui/material/Drawer';
import { CheckCircle, Circle } from 'lucide-react';
import { FaUpload } from 'react-icons/fa';

interface VendorForm {
    premise_id: string;
    premise_unit_id: string;
    recommended_by_name: string;
    vendor_name: string;
    vendor_mobile: string;
    skill: string;
    sub_skill: string;
}

type Contact = {
    name: string;
    phone: string;
};
type Visitor = {
    name: string;
    phone: string;
};
type ErrorState = Partial<Record<keyof VendorForm, string>>;

const inputClass =
    'w-full p-3 rounded-2xl bg-gray-100 shadow-md text-sm text-gray-800 placeholder-gray-500';
const errorClass = 'border border-yellow-500';

const RecommendVendor: React.FC = () => {
    const { data: session } = useSession();
    const [showPhonebook, setShowPhonebook] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [visitors, setVisitors] = useState<Visitor[]>([{ name: '', phone: '' }]);
    const [uploading, setUploading] = React.useState(false);

    const handleAddSelectedContacts = () => {
        const newVisitors = contacts
            .filter((contact) => selectedContacts.has(contact.phone))
            .filter((contact) => !visitors.some((v) => v.phone === contact.phone))
            .map((contact) => ({ name: contact.name, phone: contact.phone }));

        if (newVisitors.length > 0) {
            if (visitors.length === 1 && !visitors[0].name && !visitors[0].phone) {
                setVisitors(newVisitors);
            } else {
                setVisitors((prev) => [...prev, ...newVisitors]);
            }
        }

        setSelectedContacts(new Set());
        setShowPhonebook(false);
    };

    const [form, setForm] = useState<VendorForm>({
        premise_id: '',
        premise_unit_id: '',
        recommended_by_name: '',
        vendor_name: '',
        vendor_mobile: '',
        skill: '',
        sub_skill: '',
    });

    const [errors, setErrors] = useState<ErrorState>({});

    useEffect(() => {
        if (session?.user) {
            setForm((prev) => ({
                ...prev,
                premise_id: session.user.primary_premise_id || '',
                premise_unit_id: session.user.premise_unit_id || '',
            }));
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    };

    const validate = (): ErrorState => {
        const requiredFields: (keyof VendorForm)[] = [
            'recommended_by_name',
            'vendor_name',
            'vendor_mobile',
            'skill',
            'sub_skill',
        ];
        const newErrors: ErrorState = {};
        for (const key of requiredFields) {
            if (!form[key]) {
                newErrors[key] = 'Required';
            }
        }
        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const res = await axios.post(
                'http://139.84.166.124:8060/user-service/misc/yellow_pages/add',
                form
            );

            if (res.data?.data?.acknowledged) {
                message.success('Vendor recommended successfully!');
                setForm((prev) => ({
                    ...prev,
                    recommended_by_name: '',
                    vendor_name: '',
                    vendor_mobile: '',
                    skill: '',
                    sub_skill: '',
                }));
            } else {
                message.error('Unexpected response from server.');
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to recommend vendor.');
        }
    };

    const inputFields: (keyof VendorForm)[] = [
        'recommended_by_name',
        'vendor_name',
        'vendor_mobile',
        'skill',
        'sub_skill',
    ];

    const toggleSelectContact = (phone: string) => {
        setSelectedContacts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(phone)) {
                newSet.delete(phone);
            } else {
                newSet.add(phone);
            }
            return newSet;
        });
    };

    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery)
    );

    useEffect(() => {
        const stringifyIfObject = (input: any) =>
            typeof input === 'object' ? JSON.stringify(input, null, 2) : input;

        const processContacts = (contactsInput: string | object) => {
            const contactsJson = typeof contactsInput === 'string'
                ? contactsInput
                : JSON.stringify(contactsInput);

            console.log("Raw contacts JSON:", contactsJson);

            try {
                const parsed: Contact[] = JSON.parse(contactsJson);
                console.log("Parsed contacts:", parsed);

                const uniqueContacts = Array.from(
                    new Map(parsed.map(contact => [contact.name.toLowerCase(), contact])).values()
                );

                console.log("Filtered unique contacts:", uniqueContacts);
                setContacts(uniqueContacts);
            } catch (error) {
                console.error('Error parsing contacts:', error);
            }
        };

        // 1. Always define the global callbacks FIRST
        // Android callback
        // @ts-ignore
        window.showContacts = function (contactsFromAndroid: any) {
            console.log("Received contacts from Android:", contactsFromAndroid);
            processContacts(contactsFromAndroid);
        };

        // iOS callback
        // @ts-ignore
        window.onReceiveContacts = function (contactsFromiOS: any) {
            console.log("Received contacts from iOS:", contactsFromiOS);
            processContacts(contactsFromiOS);
        };

        // 2. Then request contacts (after callback is ready)
        // Android
        // @ts-ignore
        if (window.AndroidContacts?.fetchContacts) {
            console.log("Android detected. Requesting contacts...");
            // @ts-ignore
            window.AndroidContacts.fetchContacts();
        }
        // iOS
        // @ts-ignore
        else if (window.webkit?.messageHandlers?.getContacts) {
            console.log("iOS detected. Requesting contacts...");
            // @ts-ignore
            window.webkit.messageHandlers.getContacts.postMessage(null);
        }
        // Other / Unsupported
        else {
            console.log("No compatible contact interface found.");
        }
    }, []);

    return (
        <div className="bg-white p-3 font-sans relative ">
            <div className="p-4 space-y-4 max-w-md mx-auto">
                <div className="flex justify-center mb-6 ">
                    <h2 className="text-lg font-semibold text-gray-700">Recommend a Vendor</h2>
                </div>
                {/* <motion.button
                    onClick={() => setShowPhonebook(!showPhonebook)}
                    whileTap={{ scale: 0.95 }}
                    title="Open Phonebook"
                    className="px-4 bg-blue-100 text-blue-600 rounded-xl shadow-inner hover:bg-blue-200 transition flex items-center justify-center"
                >
                    <BookUser size={20} />
                </motion.button> */}


                <Drawer
                    anchor="bottom"
                    open={showPhonebook}
                    onClose={() => setShowPhonebook(false)}
                    PaperProps={{
                        className: 'rounded-t-2xl max-h-[80vh] w-full overflow-hidden',
                    }}
                    ModalProps={{
                        keepMounted: true, // Helps with mobile performance
                    }}
                >
                    <div className="flex flex-col h-full max-h-[80vh] relative">
                        {/* Header */}
                        <div className="pt-4 px-4 bg-white">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-700 text-base">Select from Phonebook</h3>
                                <button
                                    onClick={() => setShowPhonebook(false)}
                                    className="text-gray-400 hover:text-gray-600 text-sm"
                                >
                                    Close
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-none"
                            />
                        </div>

                        {/* Contact List */}
                        <div className="overflow-y-auto px-4 flex-1 pb-24"> {/* Extra bottom padding for footer */}
                            {filteredContacts.length === 0 ? (
                                <p className="text-gray-400 text-sm mt-4">No contacts found.</p>
                            ) : (
                                <ul className="space-y-2 mt-4">
                                    {filteredContacts.map((contact: any, idx: any) => {
                                        const isSelected = selectedContacts.has(contact.phone);
                                        return (
                                            <li
                                                key={idx}
                                                onClick={() => toggleSelectContact(contact.phone)}
                                                className={`flex justify-between items-center p-3 rounded-xl cursor-pointer shadow-sm transition-all duration-200 ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div>
                                                    <span className="text-sm font-medium text-gray-800">{contact.name}</span>
                                                    <span className="text-xs text-gray-500 block">{contact.phone}</span>
                                                </div>
                                                {isSelected ? (
                                                    <CheckCircle className="text-blue-500" size={20} />
                                                ) : (
                                                    <Circle className="text-gray-300" size={20} />
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Fixed Footer Button */}
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-white">
                            <button
                                onClick={handleAddSelectedContacts}
                                disabled={selectedContacts.size === 0}
                                className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium disabled:opacity-50"
                            >
                                Add Selected ({selectedContacts.size})
                            </button>
                        </div>
                    </div>
                </Drawer>

                <div className="space-y-4 overflow-y-auto pb-20" style={{ height: '75vh' }}>
                    {inputFields.map((key) => (
                        <div key={key}>
                            <input
                                name={key}
                                value={form[key]}
                                onChange={handleChange}
                                placeholder={key
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                className={`${inputClass} ${errors[key] ? errorClass : ''}`}
                            />
                            {errors[key] && (
                                <p className="text-sm text-yellow-500 mt-1 ml-1">{errors[key]}</p>
                            )}
                        </div>
                    ))}

                    <div className="relative w-full">
                        <label htmlFor="vendor-contact-upload" className="block mb-2 text-sm text-gray-800 font-medium">
                            Select Vendor Contact Information
                        </label>

                        <label
                            htmlFor="vendor-contact-upload"
                            className={`cursor-pointer w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 hover:shadow-lg transition-all
      ${uploading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
                        >
                            {uploading ? (
                                <span className="flex items-center space-x-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-gray-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        ></path>
                                    </svg>
                                    <span>Uploading...</span>
                                </span>
                            ) : (
                                <>
                                    Browse Contacts
                                    <FaUpload className="ml-2 h-4 w-4 text-gray-500" />
                                </>
                            )}
                        </label>

                        <input
                            id="vendor-contact-upload"
                            type="text"
                            onClick={() => setShowPhonebook(!showPhonebook)}
                            className="hidden"
                            disabled={uploading}
                        />

                        {/* Optional: Contact count display */}
                        {/* {selectedContacts && (
                        <p className="text-xs text-gray-500 mt-1">
                        Selected: {selectedContacts.size}
                        </p>
                    )} */}
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full mt-4 p-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700"
                    >
                        Submit Recommendation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendVendor;
