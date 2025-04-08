"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useCallback, useRef, useState } from "react";
import { signOut } from 'next-auth/react';
import Swal from "sweetalert2";


interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, role }) => {
  const { data: session, update, status } = useSession();



  const logout = useCallback(() => {
    console.log("logout callback");

    const accessToken = session?.user?.accessToken || undefined

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
      method: "POST",
      body: JSON.stringify({ accessToken })
    })
      .then(res => res.json())
      .then(data => {
      })
      .catch(error => {
      })
      .finally(async () => {
        await signOut({ callbackUrl: `${window.location.origin}/nativeRedirect/logout` })
      })
  }, [session])

  // useEffect(() => {
  //   if (session?.error === "RefreshAccessTokenError") {
  //     console.log("logout useEffect");
  //     logout();
  //   }
  // }, [session, logout])

  const logoutConfirm = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      width: '350px',
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
      customClass: {
        container: "z-[99999] fixed inset-0", // Forces modal above all
        popup: "z-[99999]", // Ensures popup is always visible
      },
      backdrop: true, // Ensure backdrop covers everything
    }).then((result) => {
      if (result.isConfirmed) {
        logout(); // Call your logout function
      }
    });
  };

  return (
    <div className="relative bg-gray-900 text-white p-5 w-full max-w-xs mx-auto rounded-xl overflow-hidden">
      {/* Geometric Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-800 via-gray-700 to-orange-600 rounded-xl transform -rotate-3"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-800 to-black rounded-xl opacity-70"></div>

      {/* Profile Content */}
      <div className="relative flex flex-col items-start z-10 p-4">
        {/* Top Section: Profile Picture & Logout Button */}
        <div className="flex items-center w-full">


          {/* User Icon */}
          <div className="w-12 h-12 bg-white-500 rounded-full flex items-center justify-center">
            <img width="48" height="48" src="https://img.icons8.com/pulsar-gradient/48/user.png" alt="user" />
            {/* <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg> */}
          </div>

          {/* Logout Icon */}
           
          <img
            onClick={logoutConfirm}
            width="30"
            height="30"
            className="ml-auto cursor-pointer hover:opacity-80 transition"
            src="https://img.icons8.com/windows/32/FFFFFF/exit.png"
            alt="exit"
          />
         
        </div>

        {/* User Details */}
        <h3 className="mt-2 text-lg font-semibold">{name}</h3>
        <p className="text-gray-300 text-sm">{email}</p>
        <p className="text-gray-400 text-xs">{role}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
