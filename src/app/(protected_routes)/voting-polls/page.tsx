'use client';
import React, { useState, useRef } from 'react';

const ImageShareComponent: React.FC = () => {
  const [text, setText] = useState('This is a sample text!');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const logDebug = (msg: string) => {
    setDebugInfo((prev) => prev + '\n' + msg);
  };

  const generateImage = (): string | null => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = 400;
        const height = 200;
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, width, height);

        ctx.font = '24px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);

        return canvas.toDataURL('image/png');
      }
    }
    return null;
  };

  const uploadImageToServer = async (base64: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        logDebug('Image uploaded: ' + data.imageUrl);
        return data.imageUrl;
      } else {
        logDebug('Upload error: ' + JSON.stringify(data));
        return null;
      }
    } catch (error) {
      logDebug('Upload failed: ' + error);
      return null;
    }
  };

  const shareImage = async () => {
    logDebug('Generating image...');
    const base64 = generateImage();
    if (!base64) {
      logDebug('Failed to generate image');
      return;
    }

    logDebug('Uploading image...');
    const uploadedUrl = await uploadImageToServer(base64);

    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
      const textToShare = 'This is a text message!';

      // Android
      // @ts-ignore
      if (window.AndroidInterface?.shareImage) {
        // @ts-ignore
        window.AndroidInterface.shareImage(uploadedUrl, textToShare);
        logDebug('Shared via Android interface');
      }
      // iOS
      // @ts-ignore
      else if (window.webkit?.messageHandlers?.shareImage) {
        // @ts-ignore
        window.webkit.messageHandlers.shareImage.postMessage({ imageUrl: uploadedUrl, textToShare });
        logDebug('Shared via iOS interface');
      } else {
        logDebug('No native share interface found');
      }
    } else {
      logDebug('Image upload failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col items-center justify-center mb-4">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg mb-4"
          style={{ width: '100%', height: 'auto' }}
        />
        <p className="text-center text-lg font-medium">{text}</p>
      </div>

      <div className="mt-6">
        <label htmlFor="text" className="block text-sm font-medium text-gray-700">
          Enter text for the image:
        </label>
        <input
          type="text"
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={shareImage}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Share Image
        </button>
      </div>

      {imageUrl && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-md">
          <h3 className="text-sm font-semibold">Generated Image URL:</h3>
          <p className="text-xs break-all text-blue-600">{imageUrl}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded-md">
        <h3 className="text-sm font-semibold mb-1">Debug Info:</h3>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">{debugInfo}</pre>
      </div>
    </div>
  );
};

export default ImageShareComponent;
