'use client'

import { useEffect, useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from 'next-auth/react';
import { Modal, message, Button, List } from 'antd';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";


const DropdownUser = () => {

  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    console.log("Logout callback");
    const accessToken = session?.user?.accessToken || undefined
    console.log("2");
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
      method: "POST",
      body: JSON.stringify({ accessToken })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Data")
        /* send log to the Sentry if the endpoint fails
        if (!data.success)
            notifySentry("Could not log out!")
        */
      })
      .catch(error => {

        console.log("Error:", error)
        /* send log to the Sentry if an error occurs
        notifySentry(error)
         */
      })
      .finally(async () => {
       // message.success(`Logout Successfully`);
       console.log("Calling Signout")
        await signOut({ callbackUrl: `${window.location.origin}/nativeRedirect/logout` })
      })
  }, [session])

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") { 
      logout()
    }
  }, [session, logout])

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <>
    </>
  );
};


export default DropdownUser;
