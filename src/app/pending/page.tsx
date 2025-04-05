'use client'

import React from 'react';
import { useSession } from 'next-auth/react';
import { useEffect, useCallback, useRef, useState } from "react";
import { signOut } from 'next-auth/react';
import Swal from "sweetalert2";

const Custom401: React.FC = () => {
     const { data: session, update, status } = useSession();
      const logout = useCallback(() => {
        const accessToken = session?.user?.accessToken || undefined
    
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
          method: "POST",
          body: JSON.stringify({ accessToken })
        })
          .then(res => res.json())
          .then(data => {
            // // console.log(data)
            /* send log to the Sentry if the endpoint fails
            if (!data.success)
            notifySentry("Could not log out!")
            */
          })
          .catch(error => {
            // // console.log(error)
            /* send log to the Sentry if an error occurs
            notifySentry(error)
            */
          })
          .finally(async () => {
            // message.success(`Logout Successfully`);
            logout();
            await signOut({ callbackUrl: `${window.location.origin}/nativeRedirect/logout` })
          })
      }, [session])
    
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <img
                src="https://demos.themeselection.com/materio-mui-nextjs-admin-template/demo-1/images/illustrations/characters/5.png"
                alt="404 Character"
                className="h-48 mb-6"
            />
            <h1 className="text-6xl font-bold text-gray-800 mb-2">⚠️</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4"> Your Account Approval is Pending</h2>
            <p className="text-gray-600 mb-6 text-center">
                Thank you for creating an account! Your request is currently under review. Please wait for approval from the admin.
            </p>
            <p className="mb-4 text-gray-600">
                For more details, you can contact the admin at:
            </p>
            <a
                className="text-blue-500 underline"
            >
                admin@servizing.com
            </a>
            <a
               onClick={logoutConfirm}
                className="bg-blue-500 mt-2 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
                Logout
            </a>
        </div>
    );
};

export default Custom401;  