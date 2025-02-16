"use client";

import HeaderWithBack from "@/components/Home/HeaderWithBack";

const visitorData = [
    {
        id: 1,
        name: "John Doe",
        phone: "+911234567890",
        reason: "Courier Delivery",
        inTime: "10:30 AM",
        outTime: "10:45 AM",
        guardName: "Ramesh Sharma",
        guardPhone: "+919876543210",
        vehicleType: "Bike",
        vehicleNumber: "MH12AB1234",
        entryGate: "Gate 3",
        photo: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
        id: 2,
        name: "Emily Smith",
        phone: "+919876543210",
        reason: "Guest Visit",
        inTime: "11:15 AM",
        outTime: "1:00 PM",
        guardName: "Suresh Yadav",
        guardPhone: "+919845612347",
        vehicleType: "Car",
        vehicleNumber: "DL8CAF4321",
        entryGate: "Gate 1",
        photo: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
        id: 3,
        name: "Rahul Kumar",
        phone: "+911122334455",
        reason: "Plumber Service",
        inTime: "2:00 PM",
        outTime: "2:45 PM",
        guardName: "Amit Verma",
        guardPhone: "+919812345678",
        vehicleType: "Scooter",
        vehicleNumber: "UP16CD6789",
        entryGate: "Gate 2",
        photo: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
        id: 4,
        name: "Anjali Mehta",
        phone: "+911098765432",
        reason: "Maid Service",
        inTime: "7:00 AM",
        outTime: "5:00 PM",
        guardName: "Vinod Kumar",
        guardPhone: "+919567812340",
        vehicleType: "None",
        vehicleNumber: "N/A",
        entryGate: "Gate 4",
        photo: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    {
        id: 5,
        name: "Vikas Gupta",
        phone: "+919876543298",
        reason: "Electrician Work",
        inTime: "4:00 PM",
        outTime: "5:30 PM",
        guardName: "Kunal Singh",
        guardPhone: "+919857462310",
        vehicleType: "Van",
        vehicleNumber: "HR26DK9087",
        entryGate: "Gate 5",
        photo: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    {
        id: 6,
        name: "Sonia Kapoor",
        phone: "+911998877665",
        reason: "Guest Visit",
        inTime: "6:30 PM",
        outTime: "9:00 PM",
        guardName: "Rajesh Patil",
        guardPhone: "+919845612341",
        vehicleType: "Car",
        vehicleNumber: "KA03BC2345",
        entryGate: "Gate 2",
        photo: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    {
        id: 7,
        name: "Amit Sharma",
        phone: "+911234567123",
        reason: "Delivery (Amazon)",
        inTime: "8:00 AM",
        outTime: "8:15 AM",
        guardName: "Sandeep Rawat",
        guardPhone: "+919847561234",
        vehicleType: "Bike",
        vehicleNumber: "RJ14CD5678",
        entryGate: "Gate 1",
        photo: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    {
        id: 8,
        name: "Priya Verma",
        phone: "+911112223344",
        reason: "Relative Visit",
        inTime: "3:00 PM",
        outTime: "6:00 PM",
        guardName: "Deepak Joshi",
        guardPhone: "+919756341290",
        vehicleType: "Auto",
        vehicleNumber: "MP09XY6789",
        entryGate: "Gate 3",
        photo: "https://randomuser.me/api/portraits/women/8.jpg",
    },
    {
        id: 9,
        name: "Rajiv Nair",
        phone: "+919888776655",
        reason: "Water Tank Cleaning",
        inTime: "11:00 AM",
        outTime: "12:30 PM",
        guardName: "Narayan Das",
        guardPhone: "+919654312345",
        vehicleType: "Truck",
        vehicleNumber: "TN02GH4321",
        entryGate: "Gate 5",
        photo: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    {
        id: 10,
        name: "Neha Aggarwal",
        phone: "+919554433221",
        reason: "Tutor (Kids)",
        inTime: "5:00 PM",
        outTime: "7:00 PM",
        guardName: "Shankar Rao",
        guardPhone: "+919843212345",
        vehicleType: "None",
        vehicleNumber: "N/A",
        entryGate: "Gate 4",
        photo: "https://randomuser.me/api/portraits/women/10.jpg",
    },
];


const VisitorList = () => {
    return (
        <div className="max-w-3xl mx-auto p-4 rounded-lg shadow-md bg-white">
            <h2 className="mb-5">
                <HeaderWithBack title="Visitor Lists" />
            </h2>

            {/* Scrollable Container */}
            <div className="max-h-[70vh] overflow-y-auto rounded-lg p-2 bg-gray-50">
                <div className="space-y-4">
                    {visitorData.map((visitor) => (
                        <div
                            key={visitor.id}
                            className="p-4 rounded-lg shadow-md bg-white flex items-start"
                        >
                            {/* Visitor Image */}
                            <img
                                src={visitor.photo}
                                alt={visitor.name}
                                className="w-16 h-16 rounded-full border mr-4"
                            />

                            {/* Visitor Info */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{visitor.name}</h3>
                                <p className="text-gray-600 text-sm">Reason: {visitor.reason}</p>
                                <p className="text-gray-500 text-sm">
                                    <strong>In:</strong> {visitor.inTime} | <strong>Out:</strong> {visitor.outTime}
                                </p>

                                <hr className="my-2" />

                                <p className="text-gray-600 text-sm">
                                    <strong>Guard:</strong> {visitor.guardName} ({visitor.guardPhone})
                                </p>
                                <p className="text-gray-600 text-sm">
                                    <strong>Vehicle:</strong> {visitor.vehicleType} ({visitor.vehicleNumber})
                                </p>
                                <p className="text-gray-600 text-sm">
                                    <strong>Entry Gate:</strong> {visitor.entryGate}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VisitorList;
