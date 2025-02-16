'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ScrollableMenu from "./ScrollableMenu";

const menuItems = [
  {
    name: "Billing & Payments",
    icon: <img width="100" height="80" src="https://img.freepik.com/free-vector/credit-card-payment-concept-landing-page_52683-24768.jpg?ga=GA1.1.1625333450.1739551380&semt=ais_authors_boost" alt="billing-payments" />,
    link: "/billing-payments",
    description: "Manage your invoices and payments easily."
  },
  {
    name: "Express Entry",
    icon: <img width="150" height="80" src="https://img.freepik.com/premium-vector/login-access-denied-vector-illustration-system-refuses-password-error-entry-computer-device-showing-user-does-have-permission-website-mobile-development_2175-1266.jpg" alt="express-entry" />,
    link: "/express-entry",
    description: "Quickly enter your details for access."
  },
  {
    name: "Helpers, Maid and Staff",
    icon: <img width="150" height="80" src="https://img.freepik.com/premium-vector/maid-service-home-concept-women-uniform-clean-apartment-staff-wash-floor-wipe-dust-wash-things-cleanliness-routine-household-chores-cartoon-flat-vector-illustration_118813-15503.jpg?semt=ais_hybrid" alt="helpers-maid-staff" />,
    link: "/helpers-maid-staff",
    description: "Find and manage your household staff."
  },
  {
    name: "Complaint Management",
    icon: <img width="110" height="80" src="https://mir-s3-cdn-cf.behance.net/projects/404/bdb00e101191511.Y3JvcCw2MzIsNDk0LDQ4LDE2NA.png" alt="complaint-management" />,
    link: "/complaint-management",
    description: "Submit and track your complaints easily."
  },
  {
    name: "Notice Board",
    icon: <img width="100" height="100" src="https://img.icons8.com/bubbles/100/man-with-notification-bell.png" alt="notice-board" />,
    link: "/notice-board",
    description: "Stay updated with important announcements."
  },
  {
    name: "Voting and Polls",
    icon: <img width="100" height="80" src="https://img.freepik.com/free-vector/voting-concept-illustration_114360-5972.jpg?t=st=1739624670~exp=1739628270~hmac=1fb6132ffda612d78830dbbaaecebefefb3bfadaf7e434e8d4538fcf76a3e87f&w=740" alt="voting-polls" />,
    link: "/voting-polls",
    description: "Participate in community votes and polls."
  },
];


const MobileMenu = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for 2 seconds  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 2 seconds delay  

    return () => clearTimeout(timer);
  }, []);

  // Skeleton loader component  
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 gap-4 p-2 bg-gray min-h-screen">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          <div className="mt-2 w-24 h-4 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {isLoading ? (
        <SkeletonLoader /> // Show skeleton loader while loading  
      ) : (
        <>
          <div className="relative bg-[url(https://www.nobroker.in/blog/wp-content/uploads/2024/03/best-society-in-delhi.jpg)] bg-cover bg-center bg-no-repeat flex flex-col my-5 items-center justify-center p-4 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 text-center transition-transform duration-300 ease-in-out  w-full h-[20vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] max-w-lg mx-auto">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl"></div>

            {/* Text Content */}
            <div className="relative z-10 text-white text-2xl font-bold drop-shadow-lg">
              Jaipur Greens
            </div>
          </div>


          <div className="p-4">
            <ScrollableMenu />
          </div>

          <div className="grid grid-cols-1 gap-4 p-2 bg-gray min-h-screen">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg hover:bg-gray-200 text-center transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                <div className="text-4xl text-blue-500 transition-transform duration-500 ease-in-out hover:rotate-0">
                  {item.icon}
                </div>
                <span className="mt-2 text-lg font-semibold text-gray-700 transition-opacity duration-300 ease-in-out hover:opacity-80">
                  {item.name}
                </span>
                {/* Footer section with description */}
                <span className="mt-1 text-sm text-gray-500">
                  {item.description}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default MobileMenu;