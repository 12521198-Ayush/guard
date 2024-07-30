'use client'
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Link from 'next/link';
import React, { useState } from 'react';
import UploadSharpIcon from '@mui/icons-material/UploadSharp';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'antd';


export default function Page() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const flatData = {
      blockName: formData.get('blockName') as string,
      flatName: formData.get('flatName') as string,
      floor: formData.get('floor') as string,
      extensionNumber: formData.get('extensionNumber') as string,
    };
    console.log(flatData);

    toast.success('Flat added Successfully', {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
      onClose: () => {
        window.location.href = '/flats-residents/manage-flats';
      },
    });
  };

  const handleCancel = () => {
    window.location.href = '/flats-residents/manage-flats';
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Add Apartment
            <Link
              href="/flats-residents/add-flats/bulk"
            >
              <Button className="float-right">Bulk Upload</Button>
            </Link>
          </h3>

        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            <div className="mb-4.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Block name*
              </label>
              <input
                type="text"
                name="blockName"
                placeholder="Block name"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Flat Name*
              </label>
              <input
                type="text"
                name="flatName"
                placeholder="Flat Name"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Floor*
              </label>
              <input
                type="text"
                name="floor"
                placeholder="Floor"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Extension Number*
              </label>
              <input
                type="text"
                name="extensionNumber"
                placeholder="Extension Number"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-4.5">
              <button
                className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                type="submit"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
