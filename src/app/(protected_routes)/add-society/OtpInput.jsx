'use client'

import React, { useState, useRef } from "react";

const OtpInput = ({ maxLength = 6, handleOtpChange }) => {
  const [otp, setOtp] = useState(new Array(maxLength).fill(""));
  const inputRefs = useRef([]);

  // Function to handle input change in each box
  const handleInputChange = (value, index) => {
    const onlyNumbers = value.replace(/\D/g, ""); // Allow only numeric values
    if (!onlyNumbers) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = onlyNumbers;
    setOtp(updatedOtp);

    // Combine OTP digits and call the parent function
    handleOtpChange({ target: { value: updatedOtp.join("") } });

    // Move focus to the next input field if available
    if (onlyNumbers && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace for navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const updatedOtp = [...otp];
        updatedOtp[index] = "";
        setOtp(updatedOtp);
        handleOtpChange({ target: { value: updatedOtp.join("") } });
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, maxLength);
    if (!/^\d+$/.test(pastedData)) return;

    const updatedOtp = pastedData.split("");
    for (let i = 0; i < maxLength; i++) {
      otp[i] = updatedOtp[i] || "";
    }

    setOtp([...otp]);
    handleOtpChange({ target: { value: otp.join("") } });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Enter OTP Label */}
      <label className="text-gray-700 dark:text-gray-300 text-lg font-medium sm:text-xl">
        Enter OTP
      </label>

      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-2 sm:space-x-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="h-10 w-10 sm:h-14 sm:w-14 text-xl text-center border-1 border-gray-300 dark:border-gray-600 rounded-md outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:border-blue-400 dark:focus:ring-blue-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
            placeholder="●"
          />
        ))}
      </div>

      {/* Resend OTP Button */}
      <button
        type="button"
        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 transition duration-200"
        onClick={() => alert("Resend OTP triggered")}
      >
        Resend OTP
      </button>
    </div>
  );
};

export default OtpInput;
