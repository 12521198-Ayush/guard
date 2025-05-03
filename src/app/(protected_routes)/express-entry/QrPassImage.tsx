// components/QrPassImage.tsx
import React from 'react';

interface Visitor {
  contact_name: string;
  contact_number: string;
  signed_url: string;
  passcode: string;
}

interface Props {
  visitors: Visitor[];
}

const QrPassImage = ({ visitors }: Props) => {
  return (
    <div
      id="pass-capture-container"
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', visibility: 'hidden' }}
    >
      {visitors.map((visitor, idx) => (
        <div
          key={idx}
          style={{
            width: '300px',
            padding: '16px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{visitor.contact_name}</p>
          <p style={{ fontSize: '14px', color: '#555' }}>{visitor.contact_number}</p>
          <img
            src={visitor.signed_url}
            alt="QR Code"
            style={{ marginTop: '12px', width: '200px', height: '200px', objectFit: 'contain' }}
          />
          <p style={{ fontSize: '14px', marginTop: '10px', color: '#444' }}>
            Passcode: <strong>{visitor.passcode}</strong>
          </p>
        </div>
      ))}
    </div>
  );
};

export default QrPassImage;
