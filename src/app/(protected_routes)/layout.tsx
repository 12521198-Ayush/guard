'use client';
import DefaultLayout from "@/components/Layouts/DefaultLayout";


export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DefaultLayout>
        <div className="relative w-full bg-[#f1f3f6] text-gray-800 font-medium">
          {/* <img
            src="https://as2.ftcdn.net/jpg/03/03/99/15/1000_F_303991571_BZoknekrq91vtPCZfLFzvw0hyHlV2NW3.jpg"
            alt="background"
            className="absolute h-screen inset-0 w-full h-full object-cover opacity-5 z-0"
          /> */}
          {children}
        </div>
      </DefaultLayout>
    </>
  );
}