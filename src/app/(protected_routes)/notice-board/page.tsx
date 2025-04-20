'use client'
import React, { useEffect, useState } from 'react';

const Page = () => {
  const [result, setResult] = useState('');

  useEffect(() => {
    // @ts-ignore
    window.handleQRResult = (scannedResult: string) => {
      console.log("QR Code scanned:", scannedResult);
      setResult(scannedResult);
    };
  }, []);

  const shareText = () => {
    // @ts-ignore
    window.AndroidInterface?.shareText?.("This is a text message!");
  };

  const shareLink = () => {
    // @ts-ignore
    window.AndroidInterface?.shareLink?.("https://example.com");
  };

  const shareImage2 = () => {
    // @ts-ignore
    window.AndroidInterface?.shareImage?.(
      "https://servizing.com/qr_codes/guest/guest_d996115b-8239-4a54-b528-5689658b2e67.png",
      "This is a text message!"
    );
  };

  const shareFile = () => {
    // @ts-ignore
    window.AndroidInterface?.shareFile?.(
      "https://www.servizing.com/notification/83861ee0-0c99-11f0-b978-7d95e3256608.pdf",
      "This is a text message!"
    );
  };

  const startScan = () => {
    // @ts-ignore
    window.AndroidInterface?.startQRScan?.();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Share & Scan Example</h2>

      <div style={{ marginTop: 30 }}>
        <button onClick={shareText}>Share Text</button>
      </div>

      <div style={{ marginTop: 30 }}>
        <button onClick={shareLink}>Share Link</button>
      </div>

      <div style={{ marginTop: 30 }}>
        <button onClick={shareImage2}>Share Image</button>
      </div>

      <div style={{ marginTop: 30 }}>
        <button onClick={shareFile}>Share File</button>
      </div>

      <div style={{ marginTop: 30 }}>
        <button onClick={startScan}>Start QR Scan</button>
      </div>

      <div style={{ marginTop: 50, fontWeight: 'bold' }}>
        Here is your result: <br /> <span style={{ color: 'green' }}>{result}</span>
      </div>
    </div>
  );
};

export default Page;
