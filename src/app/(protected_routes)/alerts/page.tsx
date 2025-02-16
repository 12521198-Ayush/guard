"use client";

import { useState } from "react";
import { Switch, Button, Modal } from "antd";
import HeaderWithBack from "../../../components/Home/HeaderWithBack";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    maidAlerts: false,
    visitorAlerts: false,
    vehicleAlerts: false,
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (type: string) => {
    setPreferences((prev:any) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Modal.success({
        title: "Success",
        content: "Preferences saved successfully!",
        centered: true,
        getContainer: false,
        width: 400,
        style: { padding: "0 20px" },
        okButtonProps: {
          style: {
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "6px",
          },
        },
      });
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-4 rounded-lg shadow-md bg-white">
      {/* Go Back Button */}
      {/* <button
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        onClick={() => router.back()}
      >
        <LeftOutlined className="mr-2" />

      </button> */}

      <h2 className="mb-4">
      <HeaderWithBack title="Notification Preferences" />
      </h2>

      <div className="flex justify-between items-center py-2">
        <span>Maid Alerts</span>
        <Switch
          checked={preferences.maidAlerts}
          onChange={() => handleToggle("maidAlerts")}
          style={{ backgroundColor: preferences.maidAlerts ? "#1890ff" : "#d9d9d9" }}
        />
      </div>
      <div className="flex justify-between items-center py-2">
        <span>Visitor Alerts</span>
        <Switch
          checked={preferences.visitorAlerts}
          onChange={() => handleToggle("visitorAlerts")}
          style={{ backgroundColor: preferences.visitorAlerts ? "#1890ff" : "#d9d9d9" }}
        />
      </div>
      <div className="flex justify-between items-center py-2">
        <span>Vehicle Alerts</span>
        <Switch
          checked={preferences.vehicleAlerts}
          onChange={() => handleToggle("vehicleAlerts")}
          style={{ backgroundColor: preferences.vehicleAlerts ? "#1890ff" : "#d9d9d9" }}
        />
      </div>

      <Button
        htmlType="submit"
        disabled={loading}
        onClick={handleSubmit}
        className="w-full mt-4"
        style={{
          marginBottom: "8px",
          background: "linear-gradient(90deg,rgb(128, 171, 241),rgb(74, 143, 255))",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "8px 16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
        }}
      >
        {loading ? "Saving..." : "Submit"}
      </Button>
    </div>
  );
};

export default NotificationPreferences;
