"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    Swal.fire({
      title: "Logged Out",
      text: "You have been logged out. Please log in again.",
      icon: "warning",
      confirmButtonText: "Go to Login",
      confirmButtonColor: "#4CAF50",
      width: "350px",
    }).then(() => {
      window.location.href = `${window.location.origin}/nativeRedirect/logout`;
    });
  }, []);

  return <div>You have been logged out</div>;
};

export default Page;
