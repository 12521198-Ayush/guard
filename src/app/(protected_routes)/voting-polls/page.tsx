'use client'
import React from "react";

export default function WhatsAppRedirectButton() {
  const handleRedirect = () => {
    window.location.href = "https://wa.me/919795257638";
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <button
        onClick={handleRedirect}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#25D366",
          color: "white",
          cursor: "pointer",
        }}
      >
        Chat on WhatsApp
      </button>
    </div>
  );
}
