'use client'

import React, { useState, useEffect } from "react";
import {
  FaBell, FaCar, FaEnvelope, FaWhatsapp, FaSms,
  FaUserCheck, FaPhoneAlt, FaMicrophoneAlt, FaHandPaper,
  FaTools, FaFileInvoice
} from "react-icons/fa";
import { useSession } from 'next-auth/react';
import axios from "axios";
import { message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';



interface PreferencesState {
  maidNotifications: boolean;
  vehicleNotifications: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  smsNotifications: boolean;
  voipMode: boolean;
  ivrsMode: boolean;
  manualMode: boolean;
}

const iconMap: Record<keyof PreferencesState, JSX.Element> = {
  maidNotifications: <FaBell className="text-pink-500" />,
  vehicleNotifications: <FaCar className="text-blue-500" />,
  emailNotifications: <FaEnvelope className="text-yellow-500" />,
  whatsappNotifications: <FaWhatsapp className="text-green-500" />,
  smsNotifications: <FaSms className="text-indigo-500" />,
  voipMode: <FaPhoneAlt className="text-cyan-500" />,
  ivrsMode: <FaMicrophoneAlt className="text-orange-500" />,
  manualMode: <FaHandPaper className="text-red-500" />,
};

const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState<PreferencesState>({
    maidNotifications: false,
    vehicleNotifications: false,
    emailNotifications: false,
    whatsappNotifications: false,
    smsNotifications: false,
    voipMode: false,
    ivrsMode: false,
    manualMode: false
  });

  const [toggleCountdowns, setToggleCountdowns] = useState<Record<keyof PreferencesState, number>>({
    maidNotifications: 0,
    vehicleNotifications: 0,
    emailNotifications: 0,
    whatsappNotifications: 0,
    smsNotifications: 0,
    voipMode: 0,
    ivrsMode: 0,
    manualMode: 0
  });

  const [disabledToggles, setDisabledToggles] = useState<Record<keyof PreferencesState, boolean>>({
    maidNotifications: false,
    vehicleNotifications: false,
    emailNotifications: false,
    whatsappNotifications: false,
    smsNotifications: false,
    voipMode: false,
    ivrsMode: false,
    manualMode: false
  });

  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken || '';

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axios.post(
          "http://139.84.166.124:8060/user-service/admin/premise_unit/list",
          {
            premise_id: "c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af",
            id: "D-0005",
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = response.data?.data?.array;
        if (data) {
          setPreferences({
            maidNotifications: data.maid_notification === "yes",
            vehicleNotifications: data.vehicle_notification === "yes",
            emailNotifications: data.email_notification === "yes",
            whatsappNotifications: data.wa_notification === "yes",
            smsNotifications: data.sms_notification === "yes",
            voipMode: data.vms_voip === "yes",
            ivrsMode: data.vms_ivrs === "yes",
            manualMode: data.vms_manual === "yes"
          });
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    if (accessToken) {
      fetchPreferences();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setToggleCountdowns((prev) => {
        const updated = { ...prev };
        let hasChange = false;
        for (const key in updated) {
          const k = key as keyof PreferencesState;
          if (updated[k] > 0) {
            updated[k] -= 1;
            hasChange = true;
          }
        }
        return hasChange ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatKeyForDisplay = (key: keyof PreferencesState) => {
    const nameMap: Record<keyof PreferencesState, string> = {
      maidNotifications: "Maid",
      vehicleNotifications: "Vehicle",
      emailNotifications: "Email",
      whatsappNotifications: "WhatsApp",
      smsNotifications: "SMS",
      voipMode: "VOIP",
      ivrsMode: "IVRS",
      manualMode: "Manual"
    };
    return nameMap[key];
  };

  const handleToggle = async (key: keyof PreferencesState) => {
    if (disabledToggles[key]) {
      message.info("Please wait 5 seconds before changing this again.");
      return;
    }

    const newValue = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    // Prepare API request payload
    const fieldMap: Record<keyof PreferencesState, string> = {
      maidNotifications: "maid_notification",
      vehicleNotifications: "vehicle_notification",
      emailNotifications: "email_notification",
      whatsappNotifications: "wa_notification",
      smsNotifications: "sms_notification",
      voipMode: "vms_voip",
      ivrsMode: "vms_ivrs",
      manualMode: "vms_manual"
    };

    const payload: any = {
      premise_id: "c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af",
      sub_premise_id: "0aad0a20-6b21-11ef-b2cb-13f201b16993",
      premise_unit_id: "D-0005",
      mobile: "000918588868604",
      [fieldMap[key]]: newValue ? "yes" : "no"
    };

    try {
      await axios.post(
        "http://139.84.166.124:8060/user-service/admin/resident/update/preferences_n_personal_dtls",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      message.open({
        content: (
          <span className="flex items-center gap-2">
            {iconMap[key]}
            <span className="font-medium capitalize">
              {formatKeyForDisplay(key)} updated successfully
            </span>
          </span>
        ),
        duration: 3
      });

      setDisabledToggles((prev) => ({ ...prev, [key]: true }));
      setToggleCountdowns((prev) => ({ ...prev, [key]: 5 }));

      setTimeout(() => {
        setDisabledToggles((prev) => ({ ...prev, [key]: false }));
      }, 5000);

    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update preference.");
      setPreferences((prev) => ({ ...prev, [key]: !newValue })); // rollback toggle
    }
  };

  const sections = [
    {
      title: "Notification Type",
      options: [
        {
          key: "maidNotifications",
          label: "Maid Notifications",
          desc: "Receive alerts when your maid checks in/out."
        },
        {
          key: "vehicleNotifications",
          label: "Vehicle Notifications",
          desc: "Get notified when a visitor vehicle enters your premises."
        }
      ]
    },
    {
      title: "Services",
      options: [
        {
          key: "emailNotifications",
          label: "Email Notifications",
          desc: "Receive updates and alerts through email."
        },
        {
          key: "whatsappNotifications",
          label: "WhatsApp Notifications",
          desc: "Get society alerts via WhatsApp messages."
        },
        {
          key: "smsNotifications",
          label: "SMS Notifications",
          desc: "Enable SMS-based communication for quick alerts."
        }
      ]
    },
    {
      title: "Mode",
      options: [
        {
          key: "voipMode",
          label: "VOIP",
          desc: "Allow calls via internet telephony for visitor calls."
        },
        {
          key: "ivrsMode",
          label: "IVRS",
          desc: "Interactive Voice Response mode for handling calls."
        },
        {
          key: "manualMode",
          label: "Manual",
          desc: "Manually handle visitor entries through the app."
        }
      ]
    }
  ];

  return (
    <div className="max-w-lg mx-auto p-4 bg-white font-sans">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-[#222] bg-gradient-to-r from-white to-[#f9fbfd] shadow-inner py-3 rounded-xl">
          Manage Alerts
        </h2>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '75vh' }}>
        {sections.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{group.title}</h3>
            <div className="space-y-4">
              {group.options.map((option) => {
                const key = option.key as keyof PreferencesState;
                return (
                  <div
                    key={key}
                    className="p-4 rounded-lg shadow bg-gray-50 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        {iconMap[key]}
                        <span className="text-gray-800 font-medium">{option.label}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={preferences[key]}
                            onChange={() => handleToggle(key)}
                            disabled={disabledToggles[key]}
                          />
                          <span className="slider"></span>
                        </label>
                        {toggleCountdowns[key] > 0 && (
                          <span className="text-xs text-red-500 mt-1">
                            {toggleCountdowns[key]}s remaining
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-7">{option.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Toggle Styles */}
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
          transition: 0.4s;
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
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #2196f3;
        }

        input:checked + .slider:before {
          transform: translateX(14px);
        }
      `}</style>
    </div>
  );
};

export default Preferences;
