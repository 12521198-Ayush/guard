import React, { useState } from "react";

const OtpInput = ({ maxLength = 6, handleOtpChange }) => {
  const [otp, setOtp] = useState(new Array(maxLength).fill("")); // Array to store OTP digits

  // Function to handle input change in each box
  const handleInputChange = (value, index) => {
    const onlyNumbers = value.replace(/\D/g, ""); // Allow only numeric values
    const updatedOtp = [...otp];
    updatedOtp[index] = onlyNumbers;
    setOtp(updatedOtp);

    // Combine OTP digits and call the parent function
    handleOtpChange({ target: { value: updatedOtp.join("") } });

    // Move focus to the next input box
    if (onlyNumbers && index < maxLength - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle Backspace key for navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
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
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="border-gray-300 bg-gray-100 dark:border-gray-500 dark:bg-gray-800 h-12 w-12 rounded-md border-2 text-center text-xl text-black outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/50 dark:text-white sm:h-14 sm:w-14"
            placeholder="•"
          />
        ))}
      </div>
    </div>
  );
};

export default OtpInput;
