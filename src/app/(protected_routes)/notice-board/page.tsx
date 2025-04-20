'use client'
import React, { useEffect, useState } from 'react';

const Page = () => {
  const [result, setResult] = useState('');

  useEffect(() => {
    // Handle QR result for both platforms
    // Android calls: window.handleQRResult(result)
    // iOS calls: window.webkit.messageHandlers.qrResultHandler.postMessage(result) → which calls window.handleQRResult

    // Common handler for QR result
    // @ts-ignore
    window.handleQRResult = (scannedResult: string) => {
      console.log("QR Code scanned:", scannedResult);
      setResult(scannedResult);
    };
  }, []);

  const shareText = () => {
    const message = "This is a text message!";
    // Android
    // @ts-ignore
    if (window.AndroidInterface?.shareText) {
      // @ts-ignore
      window.AndroidInterface.shareText(message);
    }
    // iOS
    // @ts-ignore
    else if (window.webkit?.messageHandlers?.shareText) {
      // @ts-ignore
      window.webkit.messageHandlers.shareText.postMessage(message);
    }
  };

  const shareLink = () => {
    const link = "https://example.com";
    // Android
    // @ts-ignore
    if (window.AndroidInterface?.shareLink) {
      // @ts-ignore
      window.AndroidInterface.shareLink(link);
    }
    // iOS
    // @ts-ignore
    else if (window.webkit?.messageHandlers?.shareLink) {
      // @ts-ignore
      window.webkit.messageHandlers.shareLink.postMessage(link);
    }
  };

  const shareImage = () => {
    const imageUrl = "https://servizing.com/qr_codes/guest/guest_d996115b-8239-4a54-b528-5689658b2e67.png";
    const text = "This is a text message!";
    // Android
    // @ts-ignore
    if (window.AndroidInterface?.shareImage) {
      // @ts-ignore
      window.AndroidInterface.shareImage(imageUrl, text);
    }
    // iOS
    // @ts-ignore
    else if (window.webkit?.messageHandlers?.shareImage) {
      // @ts-ignore
      window.webkit.messageHandlers.shareImage.postMessage({ imageUrl, text });
    }
  };

  const shareFile = () => {
    const fileUrl = "https://www.servizing.com/notification/83861ee0-0c99-11f0-b978-7d95e3256608.pdf";
    const text = "This is a text message!";
    // Android
    // @ts-ignore
    if (window.AndroidInterface?.shareFile) {
      // @ts-ignore
      window.AndroidInterface.shareFile(fileUrl, text);
    }
    // iOS
    // @ts-ignore
    else if (window.webkit?.messageHandlers?.shareFile) {
      // @ts-ignore
      window.webkit.messageHandlers.shareFile.postMessage({ fileUrl, text });
    }
  };

  const startScan = () => {
    // Android
    // @ts-ignore
    if (window.AndroidInterface?.startQRScan) {
      // @ts-ignore
      window.AndroidInterface.startQRScan();
    }
    // iOS
    // @ts-ignore
    else if (window.webkit?.messageHandlers?.startQRScan) {
      // @ts-ignore
      window.webkit.messageHandlers.startQRScan.postMessage(null);
    }
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
        <button onClick={shareImage}>Share Image</button>
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
