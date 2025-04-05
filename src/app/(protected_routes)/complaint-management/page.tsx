'use client'

import React, { useState } from "react";

const ComplaintManagement = () => {
    const [selectedOption, setSelectedOption] = useState("pendingComplaints");

    const complaintsData = {
        pendingComplaints: [
            { id: 1, date: "2025-04-01", description: "Elevator not working.", status: "Pending" },
            { id: 2, date: "2025-03-28", description: "Noise complaint from the neighbors.", status: "Pending" },
            { id: 3, date: "2025-03-15", description: "Parking space issue.", status: "Pending" },
        ],
        completedComplaints: [
            { id: 4, date: "2025-02-01", description: "Water leakage fixed.", status: "Resolved" },
            { id: 5, date: "2025-01-20", description: "Rubbish not collected, now resolved.", status: "Resolved" },
            { id: 6, date: "2024-12-05", description: "Broken gym equipment repaired.", status: "Resolved" },
        ]
    };

    const [newComplaint, setNewComplaint] = useState("");

    const handleNewComplaintSubmit = () => {
        alert("New complaint raised: " + newComplaint);
        setNewComplaint("");
    };

    return (
        <div className="min-h-screen py-2 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header Section with Shadow */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Complaint Management</h1>
                </div>

                {/* Options Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        className={`w-full sm:w-auto px-4 py-2 text-lg font-semibold rounded-lg transition-all shadow ${selectedOption === "pendingComplaints"
                            ? "bg-blue-300 text-gray-800"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                        onClick={() => setSelectedOption("pendingComplaints")}
                    >
                        Pending Complaints
                    </button>
                    <button
                        className={`w-full sm:w-auto px-4 py-2 text-lg font-semibold rounded-lg transition-all shadow ${selectedOption === "completedComplaints"
                            ? "bg-blue-300 text-gray-800"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                        onClick={() => setSelectedOption("completedComplaints")}
                    >
                        Completed Complaints
                    </button>
                    <button
                        className="w-full sm:w-auto px-4 py-2 text-lg font-semibold rounded-lg bg-green-300 text-white shadow hover:bg-green-400"
                        onClick={() => setSelectedOption("newComplaint")}
                    >
                        Raise New Complaint
                    </button>
                </div>
                {/* Display Selected Option */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {selectedOption === "pendingComplaints" ? (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pending Complaints</h2>
                            <div className="space-y-4">
                                {complaintsData.pendingComplaints.map((complaint) => (
                                    <div key={complaint.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 font-semibold">{complaint.date}</p>
                                            <p className="text-lg">{complaint.description}</p>
                                        </div>
                                        <button className="text-blue-500 text-sm font-semibold">Re-open</button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : selectedOption === "completedComplaints" ? (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Completed Complaints</h2>
                            <div className="space-y-4">
                                {complaintsData.completedComplaints.map((complaint) => (
                                    <div key={complaint.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 font-semibold">{complaint.date}</p>
                                            <p className="text-lg">{complaint.description}</p>
                                            <p className="text-sm text-green-600">{complaint.status}</p>
                                        </div>
                                        <button className="text-blue-500 text-sm font-semibold">Re-open</button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Raise New Complaint</h2>
                            <div className="space-y-4">
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-lg shadow-md"
                                    rows={4}
                                    placeholder="Describe your complaint..."
                                    value={newComplaint}
                                    onChange={(e) => setNewComplaint(e.target.value)}
                                />
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
                                    onClick={handleNewComplaintSubmit}
                                >
                                    Submit Complaint
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintManagement;  