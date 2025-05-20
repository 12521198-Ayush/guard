'use client';

import React, { useState, useRef } from 'react';
import {
  Drawer,
  Button,
  Typography,
  IconButton,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FaUpload } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface NotifyGiftProps {
  premise_id: string;
  premise_unit_id: string;
  card_no: string;
  qr_code: string;
}

export default function NotifyGiftSection({
  premise_id,
  premise_unit_id,
  card_no,
  qr_code,
}: NotifyGiftProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedObjectId, setUploadedObjectId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const getBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 2;
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'application/pdf',
    ];

    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Only PNG, JPG, GIF, or PDF files are allowed.';
      setUploadError(errorMsg);
      toast.error(errorMsg);
      setUploading(false);
      return;
    }

    let finalFile = file;

    if (file.type !== 'application/pdf') {
      try {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        finalFile = await imageCompression(file, options);
      } catch (error) {
        console.error('❌ Image compression failed:', error);
        toast.error('Image compression failed.');
        setUploading(false);
        return;
      }
    } else {
      const isTooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
      if (isTooLarge) {
        const errorMsg = `PDF must be smaller than ${MAX_FILE_SIZE_MB}MB`;
        setUploadError(errorMsg);
        toast.error(errorMsg);
        setUploading(false);
        return;
      }
    }

    setUploadError(null);
    setUploadedFile(finalFile);

    if (finalFile.type === 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(finalFile));
    } else {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(finalFile);
    }

    try {
      const base64WithPrefix = await getBase64(finalFile);
      const payload = {
        premise_id,
        filetype: finalFile.type,
        file_extension: finalFile.name.split('.').pop(),
        base64_data: base64WithPrefix,
      };

      const res = await axios.post(
        'http://139.84.166.124:8060/staff-service/upload/async',
        payload,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      const objectKey = res?.data?.data?.key;
      if (objectKey) {
        setUploadedObjectId(objectKey);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('File upload failed.');
    }

    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!uploadedObjectId || !description) {
      toast.error('Please upload a photo and enter description.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('http://139.84.166.124:8060/staff-service/luggage/update', {
        premise_id,
        premise_unit_id,
        card_no,
        qr_code,
        object_id: uploadedObjectId,
        description,
      });

      toast.success('Notified gate successfully!');
      setOpen(false);
      setDescription('');
      setUploadedFile(null);
      setUploadedObjectId(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('❌ Notify failed:', error);
      toast.error('Failed to notify.');
    }
    setSubmitting(false);
  };

  return (
    <div className="">
      <Typography variant="subtitle1" gutterBottom>
        Notify Gate about Gifts
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={() => setOpen(true)}
      >
        Notify Now
      </Button>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            p: 3,
          },
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Gift Details</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Upload Area */}
        <div className="relative w-full mb-4">
          <label htmlFor="gift-upload" className="block mb-2 text-sm text-gray-800">
            Upload a snapshot of the gift
          </label>

          <label
            htmlFor="gift-upload"
            className={`cursor-pointer w-full p-3 rounded-2xl bg-gray-100 shadow-md flex justify-between items-center text-sm text-gray-800 hover:shadow-lg transition-all ${
              uploading ? 'opacity-70 cursor-wait' : 'cursor-pointer'
            }`}
          >
            {uploading ? (
              <span className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Uploading...</span>
              </span>
            ) : (
              <>
                {uploadedFile ? uploadedFile.name : 'Choose Image (JPG, PNG, GIF, PDF)'}
                <FaUpload className="ml-2 h-4 w-4 text-gray-500" />
              </>
            )}
          </label>

          <input
            id="gift-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif, application/pdf"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />

          {uploadError && (
            <p className="text-sm text-red-500 mt-2">{uploadError}</p>
          )}

          {uploadedFile && (
            <p className="text-xs text-gray-500 mt-1">
              File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        {previewUrl && (
          <div className="mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-lg max-h-60 object-contain"
            />
          </div>
        )}

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4"
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={uploading || submitting || !uploadedObjectId || !description}
          onClick={handleSubmit}
          className="rounded-xl"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </Drawer>
    </div>
  );
}
