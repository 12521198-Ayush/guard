'use client'

import React, { useState } from "react";  

const BillingPayments = () => {  
    const [selectedOption, setSelectedOption] = useState("paymentHistory");  

    const paymentHistory = [  
        { date: "2025-03-10", amount: 1500, status: "Paid" },  
        { date: "2025-02-15", amount: 1200, status: "Paid" },  
        { date: "2025-01-05", amount: 800, status: "Pending" },  
        { date: "2024-12-12", amount: 1000, status: "Paid" },  
        { date: "2024-11-08", amount: 1300, status: "Paid" },  
        { date: "2024-10-20", amount: 900, status: "Failed" },  
        { date: "2024-09-30", amount: 1400, status: "Paid" },  
        { date: "2024-09-01", amount: 1100, status: "Paid" },  
        { date: "2024-08-15", amount: 1600, status: "Pending" },  
        { date: "2024-07-10", amount: 1800, status: "Paid" },  
    ];  

    const newPayments = [  
        { date: "2025-04-01", amount: 500, status: "Pending" },  
        { date: "2025-04-02", amount: 750, status: "Pending" },  
    ];  

    return (  
        <div className="min-h-screen py-2 bg-gray-50">  
            <div className="max-w-6xl mx-auto px-4">  
                {/* Header Section with Shadow */}  
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">  
                    <h1 className="text-2xl font-bold text-gray-800">Billing & Payments</h1>  
                </div>  

                {/* Options Section */}  
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex space-x-4">  
                    <button  
                        className={`px-4 py-2 text-lg font-semibold rounded-lg transition-all shadow ${  
                            selectedOption === "newPayment"  
                                ? "bg-blue-300 text-gray-800"  
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"  
                        }`}  
                        onClick={() => setSelectedOption("newPayment")}  
                    >  
                        Make New Payment  
                    </button>  
                    <button  
                        className={`px-4 py-2 text-lg font-semibold rounded-lg transition-all shadow ${  
                            selectedOption === "paymentHistory"  
                                ? "bg-blue-300 text-gray-800"  
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"  
                        }`}  
                        onClick={() => setSelectedOption("paymentHistory")}  
                    >  
                        Payment History  
                    </button>  
                </div>

                {/* Display Selected Option */}  
                <div className="bg-white rounded-lg shadow-lg p-6">  
                    {selectedOption === "paymentHistory" ? (  
                        <>  
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment History</h2>  
                            <div className="space-y-4">  
                                {paymentHistory.map((payment, index) => (  
                                    <div  
                                        key={index}  
                                        className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"  
                                    >  
                                        <div>  
                                            <p className="text-gray-600 font-semibold">{payment.date}</p>  
                                            <p className="text-lg font-bold">${payment.amount.toFixed(2)}</p>  
                                        </div>  
                                        <span  
                                            className={`text-sm font-semibold ${  
                                                payment.status === "Paid"  
                                                    ? "text-green-600"  
                                                    : payment.status === "Pending"  
                                                    ? "text-yellow-600"  
                                                    : "text-red-600"  
                                            }`}  
                                        >  
                                            {payment.status}  
                                        </span>  
                                    </div>  
                                ))}  
                            </div>  
                        </>  
                    ) : (  
                        <>  
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Make New Payments</h2>  
                            <div className="space-y-4">  
                                {newPayments.map((payment, index) => (  
                                    <div  
                                        key={index}  
                                        className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"  
                                    >  
                                        <div>  
                                            <p className="text-gray-600 font-semibold">{payment.date}</p>  
                                            <p className="text-lg font-bold">${payment.amount.toFixed(2)}</p>  
                                        </div>  
                                        <span className={`text-sm font-semibold text-yellow-600`}>  
                                            {payment.status}  
                                        </span>  
                                    </div>  
                                ))}  
                            </div>  
                        </>  
                    )}  
                </div>  
            </div>  
        </div>  
    );  
};  

export default BillingPayments;