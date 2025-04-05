'use client'

import Swal from "sweetalert2";
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';   
import { Form, Select, Button } from 'antd';
import 'react-phone-input-2/lib/style.css';
import OtpInput from "./OtpInput";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { sha256 } from "crypto-hash";
import { createHash } from 'crypto';
import HeaderWithBack from "@/components/Home/HeaderWithBack";

const { Option } = Select;

const API_BASE = "http://139.84.166.124:8060/user-service/registration";

interface Premise {
    id: string;
    premise_name: string;
}

interface SubPremise {
    sub_premise_id: string;
    sub_premise_name: string;
}

interface PremiseUnit {
    id: string;
    sub_premise_id: string;
    occupancy_status: string;
}

interface Registration_object {
    premise_id: any;
    sub_premise_id: any;
    premise_unit_id: any;
    mobile: any;
    association_type: any;
    is_guardian: any;
    name: any;
    doc_base_64: any;
    otp: any;
}

const Register = () => {
    const { data: session } = useSession(); 
    const { new_registration_token, mobile } = useSelector((state: RootState) => state.registration);
    const [step, setStep] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [name, setName] = useState(session?.user?.name);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [otp, setOtp] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [premise, setPremise] = useState('');
    const [subPremise, setSubPremise] = useState('');
    const [premiseUnit, setPremiseUnit] = useState('');
    const [accosiationType, setaccosiationType] = useState<string>("");
    const [countries, setCountries] = useState<string[]>([]);
    const [mobileNum, setmobile] = useState<any>(session?.user?.phone);
    const accessToken = session?.user?.accessToken;

    const [cities, setCities] = useState<string[]>([]);
    const [premises, setPremises] = useState<Premise[]>([]);
    const [subPremises, setSubPremises] = useState<SubPremise[]>([]);
    const [premiseUnits, setPremiseUnits] = useState<PremiseUnit[]>([]);
    const [isLeaseUnderYourName, setIsLeaseUnderYourName] = useState<"yes" | "no" | null>('no');
    const [base64String, setBase64String] = useState<any>(null);
    const [hashedOtp, setHashedOtp] = useState<any>(null);

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [releaseAgreement, setReleaseAgreement] = useState<File | null>(null);


    const [relationship, setRelationship] = useState<string>('');

    const hashAndUpdateOTP = async (otp: string) => {
        let hashedOtp: any;
        hashedOtp = createHash('md5').update(otp).digest('hex');
        setHashedOtp(hashedOtp);
    };



    const validateEmail = (value: string) => {
        const lowerCaseEmail = value.toLowerCase(); // Convert input to lowercase
        setEmail(lowerCaseEmail);

        if (lowerCaseEmail === "") {
            setError(""); // No validation if empty
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setError(emailRegex.test(lowerCaseEmail) ? "" : "Invalid email format");
        }
    };

    const SubmitForm = async () => {
        const req = {
            premise_id: premise,
            sub_premise_id: subPremise,
            premise_unit_id: premiseUnit,
            mobile: session?.user?.phone,
            email: session?.user?.admin_email,
            association_type: accosiationType,
            is_guardian: isLeaseUnderYourName,
            name: session?.user?.name,
            doc_base_64: base64String,
            otp_hash: hashedOtp,
        }
        console.log(req);
        try {
            const response = await axios.post(
                "http://139.84.166.124:8060/user-service/registration/premise_unit/submit",
                req,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 200) {
                // Show success message from API response if available
                Swal.fire({
                    icon: "success",
                    title: "Registration Completed",
                    html: `Your reference number is <strong>${response.data.data.registration_reference}</strong>.<br>Your request has been submitted, but you need to wait for admin approval.`,
                    confirmButtonText: "Go to Login",
                    confirmButtonColor: "#4CAF50",
                    width: "350px",
                }).then(() => {
                    window.location.href = `${window.location.origin}/nativeRedirect/logout`;
                });

            } else {
                throw new Error(response.data?.message || "Unexpected response status");
            }
        } catch (error: any) {
            console.error("Error Submitting Registration:", error.response?.data || error.message);

            // Show API error message if available, otherwise display generic error
            Swal.fire({
                icon: "error",
                title: "Failed to Submit",
                text: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
                confirmButtonColor: "#d33",
                width: "350px",
            });
        }
    };



    useEffect(() => {
        // Swal.fire({
        //     title: "You are not a registered user",
        //     text: "Do you want to register?",
        //     icon: "warning",
        //     showCancelButton: true,
        //     confirmButtonText: "Yes",
        //     cancelButtonText: "No",
        //     confirmButtonColor: "#1890ff",
        //     cancelButtonColor: "#d33",
        //     width: "350px",
        // }).then((result) => {
        //     if (result.isDismissed) {
        //         // Redirect if user selects "No"
        //         window.location.href = `${window.location.origin}/menu`;
        //     }
        // });

        fetchCountries();
    }, []);


    const fetchCountries = async () => {
        try {
            const res = await fetch(`${API_BASE}/country/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();
            setCountries(data.data || []);
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    const fetchCities = async (selectedCountry: string) => {
        setCountry(selectedCountry);
        try {
            const res = await fetch(`${API_BASE}/city/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: selectedCountry })
            });
            const data = await res.json();
            setCities(data.data || []);
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const fetchPremises = async (selectedCity: string) => {
        setCity(selectedCity);
        try {
            const res = await fetch(`${API_BASE}/premise/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country, city: selectedCity })
            });
            const data = await res.json();
            setPremises(data.data || []);
        } catch (error) {
            console.error("Error fetching premises:", error);
        }
    };

    const fetchSubPremises = async (selectedPremise: string) => {
        setPremise(selectedPremise);
        try {
            const res = await fetch(`${API_BASE}/subpremise/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premise_id: selectedPremise })
            });
            const data = await res.json();
            setSubPremises(data.data || []);
        } catch (error) {
            console.error("Error fetching sub-premises:", error);
        }
    };

    const fetchPremiseUnits = async (selectedSubPremise: string) => {
        setSubPremise(selectedSubPremise);
        try {
            const res = await fetch(`${API_BASE}/premise_unit/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premise_id: premise, sub_premise_id: selectedSubPremise })
            });
            const data = await res.json();
            setPremiseUnits(data.data || []);
        } catch (error) {
            console.error("Error fetching premise units:", error);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
                setError("Only image files (JPG, PNG, GIF) are allowed.");
                setUploadedFile(null);
            } else {
                setError("");
                setUploadedFile(file);
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    setBase64String(reader.result as string);
                };
                reader.onerror = () => {
                    setError("Error converting file to Base64");
                };
                console.log("Uploaded File:", file);
            }
        }
    };

    const SendOtp = async () => {
        try {
            const response = await axios.post(
                "http://139.84.166.124:8060/user-service/registration/premise_unit/otp_challenge",
                {
                    premise_id: premise,
                    mobile: mobileNum,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${new_registration_token}`,
                    },
                }
            );

            if (response.status === 200) {
                // Show success alert and move to the next step when user clicks "OK"
                Swal.fire({
                    icon: "success",
                    title: "OTP Sent Successfully!",
                    text: `OTP has been sent to ${mobileNum.replace(/^0+/, "")}`,
                    confirmButtonColor: "#4CAF50",
                    width: "350px",
                }).then(() => {
                    nextStep(); // Redirect to the next step after clicking OK
                });
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error: any) {
            console.error("Error Sending OTP:", error.response?.data || error.message);

            // Show error alert
            Swal.fire({
                icon: "error",
                title: "Failed to Send OTP",
                text: error.response?.data?.message || "Something went wrong. Please try again.",
                confirmButtonColor: "#d33",
                width: "350px",
            });
            nextStep();
        }
    };


    const nextStep = () => {
        setIsAnimating(true);
        setTimeout(() => {
            // Validate fields before moving to next step


            if (step === 1 && (country === '' || city === '')) {
                Swal.fire({
                    title: 'Error',
                    text: 'Country and City are required!',
                    icon: 'error',
                    width: "350px",
                    confirmButtonColor: '#1D4ED8', // Custom color for confirm button
                    customClass: {
                        popup: 'custom-error-popup',       // Customize the popup (background, borders, etc.)
                        title: 'custom-error-title',       // Customize the title
                        confirmButton: 'custom-error-confirm-button' // Customize the button
                    }
                });
                setIsAnimating(false);
                return;
            }
            if (step === 2 && (premise === '' || subPremise === '' || premiseUnit === '')) {
                Swal.fire({
                    title: 'Error',
                    text: 'Premise, Sub-Premise, and Premise Unit are required!',
                    icon: 'error',
                    width: "350px",
                    confirmButtonColor: '#1D4ED8', // Custom color for confirm button
                    customClass: {
                        popup: 'custom-error-popup',       // Customize the popup (background, borders, etc.)
                        title: 'custom-error-title',       // Customize the title
                        confirmButton: 'custom-error-confirm-button' // Customize the button
                    }
                });
                setIsAnimating(false);
                return;
            }

            // if (step === 5 && isLeaseUnderYourName === null) {
            //     Swal.fire({
            //         title: 'Error',
            //         text: 'Please answer whether the lease is under your name.',
            //         icon: 'error',
            //         confirmButtonColor: '#1D4ED8', // Custom color for confirm button
            //         customClass: {
            //             popup: 'custom-error-popup',       // Customize the popup (background, borders, etc.)
            //             title: 'custom-error-title',       // Customize the title
            //             confirmButton: 'custom-error-confirm-button' // Customize the button
            //         }
            //     });
            //     setIsAnimating(false);
            //     return;
            // }

            // if (step === 5 && isLeaseUnderYourName === 'yes' && !uploadedFile) {
            //     Swal.fire({
            //         title: 'Error',
            //         text: 'Please upload the lease agreement.',
            //         icon: 'error',
            //         confirmButtonColor: '#1D4ED8', // Custom color for confirm button
            //         customClass: {
            //             popup: 'custom-error-popup',       // Customize the popup (background, borders, etc.)
            //             title: 'custom-error-title',       // Customize the title
            //             confirmButton: 'custom-error-confirm-button' // Customize the button
            //         }
            //     });
            //     setIsAnimating(false);
            //     return;
            // }

            // if (step === 5 && isLeaseUnderYourName === 'no' && relationship.trim() === '') {
            //     Swal.fire({
            //         title: 'Error',
            //         text: 'Please specify your relationship with the legal owner or tenant.',
            //         icon: 'error',
            //         confirmButtonColor: '#1D4ED8', // Custom color for confirm button
            //         customClass: {
            //             popup: 'custom-error-popup',       // Customize the popup (background, borders, etc.)
            //             title: 'custom-error-title',       // Customize the title
            //             confirmButton: 'custom-error-confirm-button' // Customize the button
            //         }
            //     });
            //     setIsAnimating(false);
            //     return;
            // }


            setStep(prevStep => prevStep + 1);
            setIsAnimating(false);
        }, 300);
    };

    const setAccosiation = (value: any) => {
        setaccosiationType(value);
    }


    const prevStep = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setStep(prevStep => prevStep - 1);
            setIsAnimating(false);
        }, 300);
    };

    const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
        hashAndUpdateOTP(otp);
        setOtp(e.target.value);

        console.log(e.target.value);
        console.log(hashedOtp);


    };

    useEffect(() => {
        if (otp.length === 6) { // Only hash when OTP is fully entered
            hashAndUpdateOTP(otp);
        }
    }, [otp]);


    const setMobileNumber = () => {
        const trimmedPhone = session?.user?.phone ? String(session.user.phone).replace(/^0+/, '') : '';
        setmobile(session?.user?.phone);
        nextStep();
    };



    return (
        <>
            {/* <div className="p-4 border rounded-md">
                <h2 className="text-lg font-bold">Redux State</h2>
                <p>Token: {new_registration_token || "Not Set"}</p>
                <p>Mobile: {mobile || "Not Set"}</p>

                <button
                    onClick={() => dispatch(setNewRegistrationToken("myNewToken123"))}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md mt-2"
                >
                    Set Token
                </button>

                <button
                    onClick={() => dispatch(setMobile("9876543210"))}
                    className="px-4 py-2 bg-green-500 text-white rounded-md mt-2 ml-2"
                >
                    Set Mobile
                </button>

                <button
                    onClick={() => dispatch(resetRegistration())}
                    className="px-4 py-2 bg-red-500 text-white rounded-md mt-2 ml-2"
                >
                    Reset
                </button>
            </div> */}

            <div className="max-w-full mx-auto p-4 rounded-lg shadow-md bg-white">
                <h2 className="mb-4">
                    {/* {session?.user?.phone} */}
                    <HeaderWithBack title="Add Premise" />
                </h2>

                <div className="mt-2 flex flex-col items-center">

                    <div className="w-full flex-1">
                        <div className="mx-auto">
                            <div
                                className={`transition-opacity duration-300 transform ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                            >


                                {step === 1 && (
                                    <>
                                        <Select
                                            value={country || undefined}
                                            onChange={fetchCities}
                                            className="mt-5 w-full rounded-lg border-gray-300 shadow"
                                            placeholder="Select Country"
                                            style={{ height: '3.5rem' }}
                                            showSearch
                                            filterOption={(input, option) =>
                                                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                                            }
                                        >
                                            {countries.length > 0 ? (
                                                countries.map((c, i) => (
                                                    <Select.Option key={i} value={c}>
                                                        {c}
                                                    </Select.Option>
                                                ))
                                            ) : (
                                                <Select.Option disabled>No Countries Found</Select.Option>
                                            )}
                                        </Select>

                                        <Select
                                            value={city || undefined}
                                            onChange={(value) => { setCity(value); fetchPremises(value); }}
                                            className="mt-5 w-full rounded-lg border-gray-300 shadow"
                                            placeholder="Select City"
                                            style={{ height: '3.5rem' }}
                                            showSearch
                                            filterOption={(input, option) =>
                                                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                                            }
                                        >
                                            {cities.length > 0 ? (
                                                cities.map((c, i) => (
                                                    <Select.Option key={i} value={c}>
                                                        {c}
                                                    </Select.Option>
                                                ))
                                            ) : (
                                                <Select.Option disabled>No Cities Found</Select.Option>
                                            )}
                                        </Select>

                                        <button
                                            className="w-full tracking-wide font-semibold py-4 mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105"
                                            onClick={nextStep}
                                        >
                                            Continue
                                        </button>


                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <Select
                                            value={premise || undefined}
                                            onChange={(value) => { setPremise(value); fetchSubPremises(value); }}
                                            className="mt-5 w-full "
                                            placeholder="Select Premise"
                                            style={{ height: '3.5rem', borderRadius: '8px' }}
                                            showSearch
                                            filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
                                        >
                                            {premises.length > 0 ? (
                                                premises.map((p) => (
                                                    <Select.Option key={p.id} value={p.id}>
                                                        {p.premise_name}
                                                    </Select.Option>
                                                ))
                                            ) : (
                                                <Select.Option disabled>No Premises Found</Select.Option>
                                            )}
                                        </Select>

                                        <Select
                                            value={subPremise || undefined}
                                            onChange={(value) => { setSubPremise(value); fetchPremiseUnits(value); }}
                                            className="mt-5 w-full rounded-lg shadow border-gray-300"
                                            placeholder="Select Sub Premise"
                                            style={{ height: '3.5rem', borderRadius: '8px' }}
                                            showSearch
                                            filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
                                        >
                                            {subPremises.length > 0 ? (
                                                subPremises.map((sp) => (
                                                    <Select.Option key={sp.sub_premise_id} value={sp.sub_premise_id}>
                                                        {sp.sub_premise_name}
                                                    </Select.Option>
                                                ))
                                            ) : (
                                                <Select.Option disabled>No Sub Premises Found</Select.Option>
                                            )}
                                        </Select>

                                        <Select
                                            value={premiseUnit || undefined}
                                            onChange={setPremiseUnit}
                                            className="mt-5 w-full rounded-lg shadow border-gray-300"
                                            placeholder="Select Premise Unit"
                                            style={{ height: '3.5rem', borderRadius: '8px' }}
                                            showSearch
                                            filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
                                        >
                                            {premiseUnits.length > 0 ? (
                                                premiseUnits.map((pu) => (
                                                    <Select.Option key={pu.id} value={pu.id}>
                                                        {pu.id} ({pu.occupancy_status})
                                                    </Select.Option>
                                                ))
                                            ) : (
                                                <Select.Option disabled>No Premise Units Found</Select.Option>
                                            )}
                                        </Select>

                                        <button
                                            className="w-full tracking-wide font-semibold py-4 mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105"
                                            onClick={nextStep}
                                        >
                                            Continue
                                        </button>
                                        <button
                                            className="mt-2 tracking-wide font-semibold bg-gray-300 text-black w-full py-4 rounded-lg hover:bg-gray-400 transition-all duration-300 ease-in-out"
                                            onClick={prevStep}
                                        >
                                            Back
                                        </button>
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <Select
                                            placeholder="Select User Type"
                                            value={accosiationType || undefined}
                                            className="mt-5 w-full rounded-lg shadow border-gray-300"
                                            style={{ height: '3.5rem', borderRadius: '8px' }}
                                            onChange={(value) => setAccosiation(value)}
                                            showSearch
                                        >
                                            <Option value="owner">Owner</Option>
                                            <Option value="tenant">Tenant</Option>
                                        </Select>

                                        <button
                                            className="w-full tracking-wide font-semibold py-4 mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105"
                                            onClick={nextStep}
                                        >
                                            Continue
                                        </button>
                                        <button
                                            className="mt-2 tracking-wide font-semibold bg-gray-300 text-black w-full py-4 rounded-lg hover:bg-gray-400 transition-all duration-300 ease-in-out"
                                            onClick={prevStep}
                                        >
                                            Back
                                        </button>
                                    </>
                                )}
                                {step === 4 && (
                                    <>
                                        <h2 className="text-xl font-semibold mb-4">Is this lease under your name?</h2>

                                        <div className="flex items-center mb-4">
                                            <button
                                                className={`px-4 py-2 rounded-lg ml-4 ${isLeaseUnderYourName === 'yes' ? 'bg-green-600 border-2 border-green-800' : 'bg-yellow-500'} text-white`}
                                                onClick={() => setIsLeaseUnderYourName("yes")}
                                            >
                                                Yes
                                            </button>

                                            <button
                                                className={`px-4 py-2 rounded-lg ml-4 ${isLeaseUnderYourName === 'no' ? 'bg-green-600 border-2 border-green-800' : 'bg-yellow-500'} text-white`}
                                                onClick={() => setIsLeaseUnderYourName("no")}
                                            >
                                                No
                                            </button>
                                        </div>

                                        {isLeaseUnderYourName === "yes" && (
                                            <>
                                                <label htmlFor="lease-agreement" className="block mb-2 text-lg font-semibold">
                                                    Upload Lease Agreement:
                                                </label>
                                                <input
                                                    type="file"
                                                    id="lease-agreement"
                                                    accept="image/png, image/jpeg, image/jpg, image/gif"
                                                    onChange={handleFileUpload}
                                                    className="mb-4 p-2 border border-gray-300 rounded-lg w-full"
                                                />
                                            </>
                                        )}

                                        {isLeaseUnderYourName === "no" && (
                                            <>
                                                <label htmlFor="relationship" className="block mb-2 text-lg font-semibold">
                                                    What is your relationship with the legal owner or tenant?
                                                </label>
                                                <input
                                                    type="file"
                                                    id="relationship-doc"
                                                    accept="image/png, image/jpeg, image/jpg, image/gif"
                                                    onChange={handleFileUpload}
                                                    className="mb-4 p-2 border border-gray-300 rounded-lg w-full"
                                                />
                                            </>
                                        )}

                                        {error && <p className="text-red-500">{error}</p>}

                                        {uploadedFile && (
                                            <div className="mt-4 p-3 bg-gray-100 rounded-lg shadow-md">
                                                {/* Display uploaded file info here */}
                                            </div>
                                        )}

                                        <button
                                            className="w-full tracking-wide font-semibold py-4 mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105"
                                            disabled={isLeaseUnderYourName === null}
                                            onClick={SendOtp}
                                        >
                                            Get OTP
                                        </button>
                                        <button
                                            className="mt-2 tracking-wide font-semibold bg-gray-300 text-black w-full py-4 rounded-lg hover:bg-gray-400 transition-all duration-300 ease-in-out"
                                            onClick={prevStep}
                                        >
                                            Back
                                        </button>
                                    </>
                                )}
                                {step === 5 && (
                                    <>
                                        <OtpInput maxLength={6} handleOtpChange={handleOtpChange} />

                                        <button
                                            onClick={SubmitForm}
                                            className="w-full tracking-wide font-semibold py-4 mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105"
                                        >
                                            Register
                                        </button>
                                        <button
                                            className="mt-2 tracking-wide font-semibold bg-gray-300 text-black w-full py-4 rounded-lg hover:bg-gray-400 transition-all duration-300 ease-in-out"
                                            onClick={prevStep}
                                        >
                                            Back
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
                    <div className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')" }}></div>
                </div>
            </div>
        </>
    );
};

export default Register;
