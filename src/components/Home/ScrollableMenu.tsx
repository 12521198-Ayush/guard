'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const menuItems = [
    { icon: <img width="48" height="48" src="https://www.svgrepo.com/show/304531/notification-alert.svg" alt="siren" />, label: "Manage Alerts", path: "/alerts" },
    { icon: <img width="64" height="64" src="https://cdn-icons-png.flaticon.com/512/5535/5535699.png" alt="phone-not-being-used" />, label: "Quick Dial", path: "/quick-dial" },
    { icon: <img width="64" height="64" src="https://img.icons8.com/external-flaticons-flat-flat-icons/512w/external-visitor-internet-marketing-service-flaticons-flat-flat-icons.png" alt="external-visitors-hospitality-services" />, label: "My Visitors", path: "/visitors" },
    { icon: <img width="58" height="58" src="https://img.icons8.com/parakeet/48/qr-code.png" alt="qr-scan-payment" />, label: "One QR", path: "/one-qr" },
    { icon: <img width="64" height="64" src="https://img.icons8.com/dusk/64/print.png" alt="print" />, label: "Printables", path: "/printables" },
    { icon: <img width="48" height="48" src="https://img.icons8.com/fluency/48/fiat-500.png" alt="fiat-500" />, label: "Vehicle Logs", path: "/vehicle-logs" },
    { icon: <img width="64" height="64" src="https://img.icons8.com/arcade/64/terms-and-conditions.png" alt="terms-and-conditions" />, label: "Yellow Pages", path: "/yellow-pages" },
];

const ScrollableMenu = () => {
    const [isShaking, setIsShaking] = useState(false);
    const [blinkIndex, setBlinkIndex] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsShaking(true);
        }, 2000); // Start shaking after 2 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 p-4 whitespace-nowrap">
                {menuItems.map((item, index) => (
                    <div 
                        key={index} 
                        className="flex flex-col items-center text-gray-600 hover:text-black cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => router.push(item.path)} // Navigate to the path
                    >
                        <div className="p-4 bg-white border-gray-300 rounded-xl shadow-lg w-20 h-20 flex items-center justify-center">
                            <div className={`${isShaking ? 'animate-shake' : ''} ${blinkIndex === index ? 'animate-blink' : ''}`}>
                                {item.icon}
                            </div>
                        </div>
                        <span className="text-sm mt-2">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollableMenu;
