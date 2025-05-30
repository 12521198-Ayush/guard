"use client";

import { useState } from "react";
import {Modal} from 'antd';
import HeaderWithBack from "@/components/Home/HeaderWithBack";
import { PhoneOutlined } from "@ant-design/icons";

const quickDialNumbers = [
    { name: "Security", phone: "+911234567890", description: "24/7 Security Helpdesk" },
    { name: "Maintenance", phone: "+919876543210", description: "Building Maintenance Support" },
    { name: "Society Office", phone: "+911122334455", description: "General Society Queries" },
    { name: "Fire Department", phone: "101", description: "Emergency Fire Service" },
];

const QuickDialList = () => {

    const [loading, setLoading] = useState(false);


    const handleSubmit = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Modal.success({
                title: "Success",
                content: "Call Initiated successfully!",
                centered: true,
                getContainer: false,
                width: 400,
                style: { padding: "0 20px" },
                okButtonProps: {
                    style: {
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        color: "#fff",
                        fontWeight: "bold",
                        borderRadius: "6px",
                    },
                },
            });
        }, 1500);
    };


    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h2 className="mb-4">
                <HeaderWithBack title="Quick Dial Numbers" />
            </h2>
            <ul className="space-y-4">
                {quickDialNumbers.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                        <div>
                            <h3 className="text-lg font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-sm font-semibold text-blue-600">{item.phone}</p>
                        </div>
                        <a href={`tel:${item.phone}`} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg flex items-center gap-1 transition">
                            <PhoneOutlined className="text-lg" />
                            <span onClick={handleSubmit}>Call</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuickDialList;
