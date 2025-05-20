'use client'

import Swal from "sweetalert2";
import React, { useState, useEffect, ChangeEvent } from 'react';
import PhoneInput from 'react-phone-input-2';
import { Form, message, Select } from 'antd';
import 'react-phone-input-2/lib/style.css';
import OtpInput from "./OtpInput";
import { Input } from 'antd';
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { sha256 } from "crypto-hash";
import { createHash } from 'crypto';
import imageCompression from 'browser-image-compression';
import { useSession } from 'next-auth/react';

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
    const { new_registration_token, mobile } = useSelector((state: RootState) => state.registration);

    const [step, setStep] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    const [name, setName] = useState('');

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
    const [mobileNum, setmobile] = useState<any>(null);

    const [registrationObject, setRegistrationObject] = useState<Registration_object>({
        premise_id: "",
        sub_premise_id: "",
        premise_unit_id: "",
        mobile: "",
        association_type: "",
        is_guardian: "",
        name: "",
        doc_base_64: "",
        otp: ""
    });

    const [cities, setCities] = useState<string[]>([]);
    const [premises, setPremises] = useState<Premise[]>([]);
    const [subPremises, setSubPremises] = useState<SubPremise[]>([]);
    const [premiseUnits, setPremiseUnits] = useState<PremiseUnit[]>([]);
    const [isLeaseUnderYourName, setIsLeaseUnderYourName] = useState<"yes" | "no" | null>('no');
    const [base64String, setBase64String] = useState<any>(null);
    const [hashedOtp, setHashedOtp] = useState<any>(null);
    const { data: session } = useSession();

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
        try {
            const response = await axios.post(
                "http://139.84.166.124:8060/user-service/registration/premise_unit/submit",
                {
                    premise_id: premise,
                    sub_premise_id: subPremise,
                    premise_unit_id: premiseUnit,
                    mobile: mobile,
                    association_type: accosiationType,
                    is_guardian: isLeaseUnderYourName,
                    name: name,
                    doc_type: isLeaseUnderYourName === 'yes' ? 'lease' : 'relationship',
                    object_id: uploadedObjectId,
                    otp_hash: hashedOtp,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${new_registration_token}`,
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
        Swal.fire({
            title: "You are not a registered user",
            text: "Do you want to register?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "#1890ff",
            cancelButtonColor: "#d33",
            width: "350px",
        }).then((result) => {
            if (result.isDismissed) {
                // Redirect if user selects "No"
                window.location.href = `${window.location.origin}/nativeRedirect/logout`;
            }
        });

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

    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedObjectId, setUploadedObjectId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = React.useState(false);

    const getBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploading(true);
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE_MB = 2;
        const validTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'application/pdf',
        ];

        if (!validTypes.includes(file.type)) {
            const errorMsg = 'Only PNG, JPG, GIF, or PDF files are allowed.';
            setUploadError(errorMsg);
            message.warning(errorMsg);
            return;
        }

        let finalFile = file;

        if (file.type !== 'application/pdf') {
            try {
                // Compress image to be under 2MB
                const options = {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                finalFile = await imageCompression(file, options);
                console.log('🗜️ Compressed file size (MB):', finalFile.size / 1024 / 1024);
            } catch (error) {
                console.error('❌ Image compression failed:', error);
                message.error('Image compression failed.');
                setUploading(false);
                return;
            }
        } else {
            // For PDFs, just check size
            const isTooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
            if (isTooLarge) {
                const errorMsg = `PDF must be smaller than ${MAX_FILE_SIZE_MB}MB`;
                setUploadError(errorMsg);
                message.warning(errorMsg);
                setUploading(false);
                return;
            }
        }

        setUploadError(null);
        setUploadedFile(finalFile);
        console.log('📂 Final file selected:', finalFile);

        // Preview
        if (finalFile.type === 'application/pdf') {
            setPreviewUrl(URL.createObjectURL(finalFile));
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(finalFile);
        }

        try {
            const base64WithPrefix = await getBase64(finalFile);
            const payload = {
                premise_id: session?.user?.primary_premise_id,
                filetype: finalFile.type,
                file_extension: finalFile.name.split('.').pop(),
                base64_data: base64WithPrefix,
            };

            console.log('📤 Upload payload:', payload);

            const res = await axios.post(
                'http://139.84.166.124:8060/user-service/upload/async',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );

            const objectKey = res?.data?.data?.key;
            if (objectKey) {
                setUploadedObjectId(objectKey);
                console.log('✅ File uploaded, Object ID:', objectKey);
                message.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('❌ Upload failed:', error);
            message.error('File upload failed.');
        }

        setUploading(false);
    };

    const SendOtp = async () => {
        console.log(premise);
        console.log(mobileNum);

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
        }
    };


    const nextStep = () => {
        setIsAnimating(true);
        setTimeout(() => {
            // Validate fields before moving to next step
            if (step === 1 && (name === '')) {
                Swal.fire({
                    title: 'Error',
                    text: 'Name and Phone number are required!',
                    icon: 'error',
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
            if (step === 1 && email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                Swal.fire({
                    title: 'Error',
                    text: 'Email is not valid',
                    icon: 'error',
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

            if (step === 2 && (country === '' || city === '')) {
                Swal.fire({
                    title: 'Error',
                    text: 'Country and City are required!',
                    icon: 'error',
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
            if (step === 3 && (premise === '' || subPremise === '' || premiseUnit === '')) {
                Swal.fire({
                    title: 'Error',
                    text: 'Premise, Sub-Premise, and Premise Unit are required!',
                    icon: 'error',
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
        setmobile(mobile);
        nextStep();
    }

    const handlerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optional: Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (png, jpg, jpeg, gif).');
            return;
        }

        console.log('Selected file:', file);
        alert(`Selected file: ${file.name}`);

        // Optional: Preview the file
        const reader = new FileReader();
        reader.onload = () => {
            const previewUrl = reader.result as string;
            console.log('Preview URL:', previewUrl);
            // e.g. setPreview(previewUrl) if you want to show image in UI
        };
        reader.readAsDataURL(file);

        // Optional: Upload logic
        // const formData = new FormData();
        // formData.append('file', file);
        // await fetch('/api/upload', { method: 'POST', body: formData });
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
            <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
                <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
                    <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
                        <div className="mt-12 flex flex-col items-center">
                            <h1 className="text-2xl xl:text-3xl font-extrabold">
                                <img src="http://139.84.169.221:3001/_next/image?url=%2Fimages%2Flogo%2Flogo.png&w=128&q=75" alt="logo" />
                            </h1>
                            <h1 className="text-2xl xl:text-3xl font-bold">
                                Create an Account
                            </h1>
                            {/* <p>Token: {new_registration_token || "Not Set"}</p> */}

                            <div className="w-full flex-1 mt-8">
                                <div className="mx-auto max-w-xs">
                                    <div
                                        className={`transition-opacity duration-300 transform ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                                    >
                                        {/* <p>Mobile: {mobile || "Not Set"}</p> */}
                                        {step === 1 && (
                                            <>
                                                <Input
                                                    style={{ height: '3.5rem', padding: '0 2rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #d9d9d9' }}
                                                    placeholder="Name"
                                                    className="mb-4 w-full"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                                <div className="w-full">
                                                    <Input
                                                        style={{
                                                            height: "3.5rem",
                                                            padding: "0 2rem",
                                                            fontSize: "1rem",
                                                            borderRadius: "8px",
                                                            border: error ? "1px solid #ff4d4f" : "1px solidrgb(255, 255, 255)", // Red border if error
                                                        }}
                                                        placeholder="Email (optional)"
                                                        className={`mb-2 ${error ? "border-red-500" : ""}`}
                                                        value={email}
                                                        onChange={(e) => validateEmail(e.target.value)}
                                                    />
                                                    {error && (
                                                        <p className="text-red-500 text-sm flex items-center mt-1">
                                                            <ExclamationCircleOutlined className="mr-1 text-yellow-500" />
                                                            {error}
                                                        </p>
                                                    )}
                                                </div>
                                                <br />
                                                <Form.Item>
                                                    {/* <PhoneInput
                                                        country={'in'}
                                                        
                                                        inputStyle={{
                                                            width: '100%',
                                                            boxSizing: 'border-box',
                                                            height: '3.5rem',
                                                        }}
                                                        enableSearch={true}
                                                        containerClass="w-full rounded-lg border border-stroke bg-transparent dark:border-form-strokedark dark:bg-form-input"
                                                        inputClass="w-full py-3 pl-6 pr-20 text-black outline-none focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary"
                                                        disabled={true}
                                                    /> */}
                                                    <PhoneInput
                                                        country={"in"}
                                                        value={mobile ? mobile.replace(/^0+/, "") : ""}
                                                        inputStyle={{
                                                            width: "100%",
                                                            boxSizing: "border-box",
                                                            height: "3.5rem",
                                                        }}
                                                        enableSearch={true}
                                                        containerClass="w-full rounded-lg border border-stroke bg-transparent dark:border-form-strokedark dark:bg-form-input"
                                                        inputClass="w-full py-3 pl-6 pr-20 text-black outline-none focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary"
                                                        disabled={true}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            (window.location.href = `${window.location.origin}/nativeRedirect/logout`)
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
                                                    >
                                                        Change
                                                    </button>


                                                </Form.Item>
                                                <button
                                                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out"
                                                    onClick={setMobileNumber}
                                                >
                                                    Continue
                                                </button>
                                            </>
                                        )}

                                        {step === 2 && (
                                            <>
                                                <Select
                                                    value={country || undefined}
                                                    onChange={fetchCities}
                                                    className="mt-5 w-full"
                                                    placeholder="Select Country"
                                                    style={{ height: '3.5rem', width: '20rem' }}
                                                    showSearch
                                                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
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
                                                    className="mt-5 w-full"
                                                    placeholder="Select City"
                                                    style={{ height: '3.5rem', width: '20rem' }}
                                                    showSearch
                                                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
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
                                                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out"
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
                                                    value={premise || undefined}
                                                    onChange={(value) => { setPremise(value); fetchSubPremises(value); }}
                                                    className="mt-5 w-full"
                                                    placeholder="Select Premise"
                                                    style={{ height: '3.5rem' }}
                                                    showSearch
                                                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
                                                >
                                                    {premises.length > 0 ? premises.map((p) => (
                                                        <Select.Option key={p.id} value={p.id}>{p.premise_name}</Select.Option>
                                                    )) : <Select.Option disabled>No Premises Found</Select.Option>}
                                                </Select>

                                                <Select
                                                    value={subPremise || undefined}
                                                    onChange={(value) => { setSubPremise(value); fetchPremiseUnits(value); }}
                                                    className="mt-5 w-full"
                                                    placeholder="Select Sub Premise"
                                                    style={{ height: '3.5rem' }}
                                                    showSearch
                                                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
                                                >
                                                    {subPremises.length > 0 ? subPremises.map((sp) => (
                                                        <Select.Option key={sp.sub_premise_id} value={sp.sub_premise_id}>{sp.sub_premise_name}</Select.Option>
                                                    )) : <Select.Option disabled>No Sub Premises Found</Select.Option>}
                                                </Select>

                                                <Select
                                                    value={premiseUnit || undefined}
                                                    onChange={setPremiseUnit}
                                                    className="mt-5 w-full"
                                                    placeholder="Select Premise Unit"
                                                    style={{ height: '3.5rem' }}
                                                    showSearch
                                                    filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false}
                                                >
                                                    {premiseUnits.length > 0 ? premiseUnits.map((pu) => (
                                                        <Select.Option key={pu.id} value={pu.id}>
                                                            {pu.id} ({pu.occupancy_status})
                                                        </Select.Option>
                                                    )) : <Select.Option disabled>No Premise Units Found</Select.Option>}
                                                </Select>

                                                <button
                                                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out"
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

                                                <Select placeholder="Select User Type"
                                                    value={accosiationType || undefined}
                                                    className="w-full"
                                                    style={{ height: '3.5rem', width: '20rem' }}
                                                    onChange={(value) => setAccosiation(value)}
                                                >
                                                    <Option value="owner">Owner</Option>
                                                    <Option value="tenant">Tenant</Option>
                                                </Select>


                                                <button
                                                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out"
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
                                        {step === 5 && (
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
                                                        <label htmlFor="lease-agreement" className="block mb-2 text-lg">
                                                            Upload Lease Agreement:
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id="lease-agreement"
                                                            accept="image/png, image/jpeg, image/jpg, image/gif"
                                                            onChange={handleFileUpload}
                                                            className="mb-4 p-2 border rounded-lg w-full"
                                                        />
                                                    </>
                                                )}

                                                {isLeaseUnderYourName === "no" && (
                                                    <>
                                                        <label htmlFor="relationship" className="block mb-2 text-lg">
                                                            What is your relationship with the legal owner or tenant?
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id="lease-agreement"
                                                            accept="image/png, image/jpeg, image/jpg, image/gif"
                                                            capture="environment"
                                                            onChange={handlerFileUpload}
                                                            className="mb-4 p-2 border rounded-lg w-full"
                                                        />

                                                    </>
                                                )}

                                                {error && <p className="text-red-500">{error}</p>}

                                                {uploadedFile && (
                                                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                                        {/* <p>base64String: {base64String}</p>
                                                        <p><strong>File Name:</strong> {uploadedFile.name}</p>
                                                        <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                                                        <p><strong>Type:</strong> {uploadedFile.type}</p> */}
                                                    </div>
                                                )}

                                                <button
                                                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out"
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
                                        {step === 6 && (
                                            <>
                                                <OtpInput maxLength={6} handleOtpChange={handleOtpChange} />
                                                <p>
                                                    {/* {registrationObject.premise_id}
                                                    {registrationObject.sub_premise_id}
                                                    {registrationObject.premise_unit_id} */}
                                                    {/* {registrationObject.mobile} */}
                                                    {/* {registrationObject.association_type}
                                                    {registrationObject.name} */}
                                                </p>
                                                <button
                                                    onClick={SubmitForm}
                                                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out"
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
                    </div>
                    <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
                        <div className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')" }}></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
