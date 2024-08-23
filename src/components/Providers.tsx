"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import {AuthProvider} from "@/components/common/auth-wrapper";

interface Props {
  children: ReactNode;
}

const Providers = ({ children }: Props) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Providers;
