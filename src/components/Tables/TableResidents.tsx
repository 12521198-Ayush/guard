'use client'
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";
import Link from "next/link";
import AddSharpIcon from '@mui/icons-material/AddSharp';
import { Button } from "antd";


const flatData = [
    {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201",
        options: ["Edit", "Delete"],
    }, {
        flatNo: "101",
        block: "A",
        residents: 2,
        occupancyStatus: "Occupied",
        parking: "Yes",
        ext: "102",
        options: ["Edit", "Delete"],
    },
    {
        flatNo: "202",
        block: "B",
        residents: 1,
        occupancyStatus: "Vacant",
        parking: "No",
        ext: "201", 
        options: ["Edit", "Delete"],
    },
    // Add more data as needed
];

const ManageFlats: React.FC = () => {
    const itemsPerPage = 10; // Number of items per page
    const [currentPage, setCurrentPage] = useState(1); // Current page state

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = flatData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <DefaultLayout>
            <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">


                <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                    Manage Flats
                    <Link
                        href="/manage-flats/add-flats"
                    >
                        <Button className="float-right">Add Flat</Button>
                    </Link>

                </h4>



                <div className="flex flex-col">
                    <div className="grid grid-cols-3 sm:grid-cols-7 rounded-sm bg-gray-2 dark:bg-meta-4">
                        <div className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Flat No.
                            </h5>
                        </div>
                        <div className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Block
                            </h5>
                        </div>
                        <div className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Residents
                            </h5>
                        </div>
                        <div className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Occupancy Status
                            </h5>
                        </div>
                        <div className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Parking
                            </h5>
                        </div>
                        <div className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Ext
                            </h5>
                        </div>
                        <div className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Options
                            </h5>
                        </div>
                    </div>

                    {currentItems.map((flat, index) => (
                        <div
                            className={`grid grid-cols-3 sm:grid-cols-7 ${index === currentItems.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"
                                }`}
                            key={index}
                            style={{ marginLeft: '-1px' }}  
                        >
                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white">{flat.flatNo}</p>
                            </div>
                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white">{flat.block}</p>
                            </div>
                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white">{flat.residents}</p>
                            </div>
                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white">{flat.occupancyStatus}</p>
                            </div>
                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white">{flat.parking}</p>
                            </div>
                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white">{flat.ext}</p>
                            </div>
                            <div className="flex items-center justify-center space-x-2 p-2.5 xl:p-5">
                                {flat.options.map((option, i) => (
                                    <span key={i} className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-center font-medium text-primary hover:bg-opacity-90 lg:px-3 xl:px-2">{option}</span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-center mt-4">
                        <nav className="inline-flex">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 text-sm font-medium ${currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-primary hover:bg-opacity-90"
                                    }`}
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.ceil(flatData.length / itemsPerPage) }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => paginate(index + 1)}
                                    className={`px-4 py-2 text-sm font-medium ${currentPage === index + 1
                                        ? "text-primary hover:bg-opacity-90"
                                        : "text-black dark:text-white hover:bg-opacity-90"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(flatData.length / itemsPerPage)}
                                className={`px-4 py-2 text-sm font-medium ${currentPage === Math.ceil(flatData.length / itemsPerPage)
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-primary hover:bg-opacity-90"
                                    }`}
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default ManageFlats;
