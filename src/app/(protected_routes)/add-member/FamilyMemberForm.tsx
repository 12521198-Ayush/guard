'use client';

import axios from 'axios';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { message } from 'antd';

type Relationship =
    | 'Father'
    | 'Mother'
    | 'Wife'
    | 'Husband'
    | 'Son'
    | 'Daughter'
    | 'Other';

interface FormState {
    family_member_name: string;
    family_member_mobile: string;
    relationship_with_proposer: Relationship | '';
}

interface ErrorState {
    family_member_name?: string;
    family_member_mobile?: string;
    relationship_with_proposer?: string;
}

const FamilyMemberForm: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        family_member_name: '',
        family_member_mobile: '',
        relationship_with_proposer: '',
    });

    const [errors, setErrors] = useState<ErrorState>({});
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { data: session } = useSession();


    const relationships: Relationship[] = [
        'Father',
        'Mother',
        'Wife',
        'Husband',
        'Son',
        'Daughter',
        'Other',
    ];

    const inputClass =
        'w-full p-3 rounded-2xl bg-gray-100 shadow-md text-sm text-gray-800 placeholder-gray-500';
    const errorClass = 'border border-yellow-500';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Add this near the top of your component
    const countryCodes = [
        { name: 'India', code: '91' },
        { name: 'USA', code: '1' },
        { name: 'UK', code: '44' },
    ];

    const [countryCode, setCountryCode] = useState(countryCodes[0]); // Default to India
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: ErrorState = {};
        if (!form.family_member_name) newErrors.family_member_name = 'Name is required';
        if (!form.family_member_mobile) newErrors.family_member_mobile = 'Mobile number is required';
        if (!form.relationship_with_proposer)
            newErrors.relationship_with_proposer = 'Relation is required';

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }
        // Validate
        if (!form.family_member_mobile || form.family_member_mobile.length !== 10) {
            newErrors.family_member_mobile = 'Enter exactly 10 digits';
        }

        // Format mobile number as required by backend
        const formattedMobile = `000${countryCode.code}${form.family_member_mobile}`;

        // Use this in the payload:


        const payload = {
            premise_id: session?.user?.primary_premise_id,
            premise_unit_id: session?.user?.premise_unit_id,
            proposer_mobile: session?.user?.phone,
            sub_premise_id: session?.user?.sub_premise_id,
            family_member_mobile: formattedMobile,
            family_member_name: form.family_member_name,
            relationship_with_proposer: form.relationship_with_proposer,
        };

        console.log(payload);

        try {
            const response = await axios.post(
                'http://139.84.166.124:8060/user-service/registration/premise_unit/family_member',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            message.success('Family member added successfully!');
            setForm({
                family_member_name: '',
                family_member_mobile: '',
                relationship_with_proposer: '',
            });
        } catch (error) {
            console.error('Submission failed:', error);
            message.info('Something went wrong. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Family Member Name */}
            <div>
                <input
                    name="family_member_name"
                    value={form.family_member_name}
                    onChange={handleChange}
                    placeholder="Family Member Name"
                    className={`${inputClass} ${errors.family_member_name ? errorClass : ''}`}
                />
                {errors.family_member_name && (
                    <p className="text-sm text-yellow-500 mt-1 ml-1">{errors.family_member_name}</p>
                )}
            </div>

            {/* Mobile Number with Country Code */}
            <div className="relative w-full">
                {/* Country Code Dropdown */}
                <div
                    className="relative w-full mb-2"
                    onClick={() => setCountryDropdownOpen((prev) => !prev)}
                >
                    <button
                        type="button"
                        className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 hover:shadow-lg transition-all`}
                    >
                        +{countryCode.code} ({countryCode.name})
                        <FaChevronDown
                            className={`ml-2 h-4 w-4 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {countryDropdownOpen && (
                        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10 max-h-[10rem] overflow-y-auto">
                            {countryCodes.map((item) => (
                                <button
                                    key={item.code}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCountryCode(item);
                                        setCountryDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${countryCode.code === item.code ? 'bg-blue-600 text-white' : 'text-gray-800'
                                        }`}
                                >
                                    +{item.code} ({item.name})
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Number Input */}
                <input
                    name="family_member_mobile"
                    value={form.family_member_mobile}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10); // Only digits, max 10
                        setForm((prev) => ({ ...prev, family_member_mobile: value }));
                        setErrors((prev) => ({ ...prev, family_member_mobile: '' }));
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className={`${inputClass} ${errors.family_member_mobile ? errorClass : ''}`}
                />
                {errors.family_member_mobile && (
                    <p className="text-sm text-yellow-500 mt-1 ml-1">{errors.family_member_mobile}</p>
                )}
            </div>


            {/* Dropdown for Relationship */}
            <div className="relative w-full" onClick={() => setDropdownOpen((prev) => !prev)}>
                <button
                    type="button"
                    className={`w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 
          hover:shadow-lg transition-all`}
                >
                    {form.relationship_with_proposer || 'Select Relationship'}
                    <FaChevronDown
                        className={`ml-2 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {dropdownOpen && (
                    <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl z-10 max-h-[10rem] overflow-y-auto">
                        {relationships.map((relation) => (
                            <button
                                key={relation}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setForm((prev) => ({
                                        ...prev,
                                        relationship_with_proposer: relation,
                                    }));
                                    setDropdownOpen(false);
                                    setErrors((prev) => ({ ...prev, relationship_with_proposer: '' }));
                                }}
                                className={`w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-gray-100 transition-all ${form.relationship_with_proposer === relation
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-800'
                                    }`}
                            >
                                {relation}
                            </button>
                        ))}
                    </div>
                )}

                {errors.relationship_with_proposer && (
                    <p className="text-sm text-yellow-500 ml-1 mt-1">{errors.relationship_with_proposer}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 transition-all shadow-md"
            >
                Submit
            </button>
        </form>
    );
};

export default FamilyMemberForm;
