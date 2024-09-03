'use client'
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import DataTable from '@/components/DataTable/index'
const page = () => {
  return (
    <>
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Manage Flats
      </h4>
      <DataTable />
    </>

  )
}

export default page
