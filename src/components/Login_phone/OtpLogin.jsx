'use client'
// pages/login.js

import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Login() {
  const [inputValue, setInputValue] = useState('');
  const [isPhone, setIsPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle input change and determine if it's a phone number
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Check if the input starts with a number (indicating phone number)
    if (/^\d/.test(value)) {
      setIsPhone(true);
    } else {
      setIsPhone(false);
    }
  };

  // Handle phone input changes and revert back if backspaced to empty
  const handlePhoneInputChange = (value) => {
    setPhoneValue(value);

    // If the phone number input is completely cleared, revert to email input
    if (value === '') {
      setIsPhone(false);
      setInputValue(''); // Reset input field
    }
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const loginData = {
      loginValue: isPhone ? phoneValue : inputValue,
      password,
    };

    console.log('Login Data:', loginData);
    // Perform login logic (API calls, etc.)
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {isPhone ? (
            <PhoneInput
              country={'us'}
              value={phoneValue}
              onChange={handlePhoneInputChange}
              inputStyle={{ width: '100%' }}
              enableSearch={true} // Enables searching country codes
            />
          ) : (
            <input
              type="text"
              placeholder="Email or Phone Number"
              value={inputValue}
              onChange={handleInputChange}
              required
            />
          )}
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        .input-group {
          margin-bottom: 20px;
        }
        input {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        button {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
}
