"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Page = () => {
  const router = useRouter();
  return <div>You have been logged out</div>;
};

export default Page;
