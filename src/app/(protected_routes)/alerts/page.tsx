'use client'

import React, { useState } from "react";

// Explicitly define the interface for the preferences  
interface PreferencesState {
  maidNotifications: boolean;
  vehicleNotifications: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  smsNotifications: boolean;
  preInvite: boolean;
  voipMode: boolean;
  ivrsMode: boolean;
  manualMode: boolean;
  serviceCenter: boolean;
  billing: boolean;
}

const Preferences: React.FC = () => {
  // Initialize the preferences state  
  const [preferences, setPreferences] = useState<PreferencesState>({
    maidNotifications: false,
    vehicleNotifications: false,
    emailNotifications: false,
    whatsappNotifications: false,
    smsNotifications: false,
    preInvite: false,
    voipMode: false,
    ivrsMode: false,
    manualMode: false,
    serviceCenter: false,
    billing: false,
  });

  // Handle toggling preferences  
  const handleToggle = (key: keyof PreferencesState) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen py-2 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Preferences</h1>
          {/* <p className="text-gray-600 mt-2">Manage your notification and service preferences below.</p>   */}
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Notification Type */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Type</h2>
          <div className="space-y-4">
            {[
              { label: "Maid Notifications", key: "maidNotifications" },
              { label: "Vehicle Notifications", key: "vehicleNotifications" },
            ].map((option) => (
              <div key={option.key} className="flex justify-between items-center p-4 rounded-lg shadow-md bg-gray-100">
                <span className="text-gray-800">{option.label}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={preferences[option.key as keyof PreferencesState]} // Cast to keyof PreferencesState
                    onChange={() => handleToggle(option.key as keyof PreferencesState)} // Cast to keyof PreferencesState
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}

          </div>

          {/* Services */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Services</h2>
          <div className="space-y-4">
            {[
              { label: "Email Notifications", key: "emailNotifications" },
              { label: "WhatsApp Notifications", key: "whatsappNotifications" },
              { label: "SMS Notifications", key: "smsNotifications" },
            ].map((option) => (
              <div key={option.key} className="flex justify-between items-center p-4 rounded-lg shadow-md bg-gray-100">
                <span className="text-gray-800">{option.label}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={preferences[option.key as keyof PreferencesState]}
                    onChange={() => handleToggle(option.key as keyof PreferencesState)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Visitors */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Visitors</h2>
          <div className="flex justify-between items-center p-4 rounded-lg shadow-md bg-gray-100">
            <span className="text-gray-800">Pre Invite</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={preferences.preInvite}
                onChange={() => handleToggle("preInvite")}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Mode */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Mode</h2>
          <div className="space-y-4">
            {[
              { label: "VOIP", key: "voipMode" },
              { label: "IVRS", key: "ivrsMode" },
              { label: "Manual", key: "manualMode" },
            ].map((option: any) => (
              <div key={option.key} className="flex justify-between items-center p-4 rounded-lg shadow-md bg-gray-100">
                <span className="text-gray-800">{option.label}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={preferences[option.key as keyof PreferencesState]}
                    onChange={() => handleToggle(option.key as keyof PreferencesState)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Other Preferences */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Other</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-lg shadow-md bg-gray-100">
              <span className="text-gray-800">Service Center</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.serviceCenter}
                  onChange={() => handleToggle("serviceCenter")}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg shadow-md bg-gray-100">
              <span className="text-gray-800">Billing</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.billing}
                  onChange={() => handleToggle("billing")}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for the switches */}
      <style jsx>{`  
                .switch {  
                    position: relative;  
                    display: inline-block;  
                    width: 34px;  
                    height: 20px;  
                }  

                .switch input {  
                    opacity: 0;  
                    width: 0;  
                    height: 0;  
                }  

                .slider {  
                    position: absolute;  
                    cursor: pointer;  
                    top: 0;  
                    left: 0;  
                    right: 0;  
                    bottom: 0;  
                    background-color: #ccc;  
                    transition: .4s;  
                    border-radius: 20px;  
                }  

                .slider:before {  
                    position: absolute;  
                    content: "";  
                    height: 16px;  
                    width: 16px;  
                    left: 2px;  
                    bottom: 2px;  
                    background-color: white;  
                    transition: .4s;  
                    border-radius: 50%;  
                }  

                input:checked + .slider {  
                    background-color: #2196F3;  
                }  

                input:checked + .slider:before {  
                    transform: translateX(14px);  
                }  
            `}</style>
    </div>
  );
};

export default Preferences;  
