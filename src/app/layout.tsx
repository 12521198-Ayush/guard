// layout.tsx
import { Karla } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "./providers";
import { AuthProvider } from "@/components/common/auth-wrapper";
import SocketClient from "@/components/SocketClient"; // <-- Add this
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider session={session}>
          <Providers>
            {/* <SocketClient />  */}
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
