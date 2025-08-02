'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    if (!hasRefreshed) {
      sessionStorage.setItem("hasRefreshed", "true");
      window.location.reload(); // Only reload once
    } else {
      sessionStorage.removeItem("hasRefreshed"); // Clear it for future visits
    }
  }, []);

  return <div>You have been logged out</div>;
};

export default Page;
