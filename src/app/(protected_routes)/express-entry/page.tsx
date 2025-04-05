import React from 'react';  

const ExpressEntry = () => {  
    const visitorLog = [  
        { name: 'John Doe', time: '12:00 PM', purpose: 'Delivery', date: '2025-03-30', icon: 'fas fa-truck' },  
        { name: 'Jane Smith', time: '1:30 PM', purpose: 'Visitor', date: '2025-03-30', icon: 'fas fa-user-friends' },  
        { name: 'Alice Johnson', time: '3:00 PM', purpose: 'Maintenance', date: '2025-03-29', icon: 'fas fa-tools' },  
        { name: 'Rob Brown', time: '10:45 AM', purpose: 'Meeting', date: '2025-03-29', icon: 'fas fa-comments' },  
        { name: 'Ahmed Khan', time: '2:15 PM', purpose: 'Service', date: '2025-03-28', icon: 'fas fa-cog' },  
        { name: 'Emily Davis', time: '11:00 AM', purpose: 'Meeting', date: '2025-03-28', icon: 'fas fa-comments' },  
        { name: 'Michael Lee', time: '4:00 PM', purpose: 'Delivery', date: '2025-03-27', icon: 'fas fa-truck' },  
        { name: 'Sarah Miller', time: '9:30 AM', purpose: 'Service', date: '2025-03-27', icon: 'fas fa-tools' },  
        { name: 'Chris Evans', time: '5:00 PM', purpose: 'Visitor', date: '2025-03-26', icon: 'fas fa-user-friends' },  
        { name: 'Jessica Parker', time: '1:00 PM', purpose: 'Delivery', date: '2025-03-26', icon: 'fas fa-truck' },  
    ];  

    return (  
        <div className="min-h-screen py-2 bg-gray-100">  
            <div className="max-w-6xl mx-auto px-4">  
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">  
                    <h1 className="text-2xl font-bold text-gray-800">Express Entry</h1>  
                </div>  
                {/* Visitor log display */}  
                <div className="bg-white rounded-lg shadow p-6">  
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Visitor Log</h2>  
                    <div className="space-y-4">  
                        {visitorLog.map((visitor, index) => (  
                            <div key={index} className="flex justify-between items-center p-4 rounded-lg shadow-md bg-gray-50">  
                                <div className="flex items-center">  
                                    {/* Icon */}  
                                    <i className={`${visitor.icon} text-blue-600 mr-3`}></i>  
                                    <div>  
                                        <p className="text-lg font-semibold text-gray-700">{visitor.name}</p>  
                                        <p className="text-sm text-gray-500">{visitor.purpose} - {visitor.time} on {visitor.date}</p>  
                                    </div>  
                                </div>  
                                {/* Optional action-button for decoration */}  
                                <button className="text-blue-500 hover:text-blue-700">  
                                    <i className="fas fa-chevron-right"></i>  
                                </button>  
                            </div>  
                        ))}  
                    </div>  
                </div>  
            </div>  
        </div>  
    );  
};  

export default ExpressEntry;  