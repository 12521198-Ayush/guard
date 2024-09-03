'use client';
import DefaultLayout from "@/components/Layouts/DefaultLayout";


export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>

      <div className="flex flex-col h-full w-full">

        <DefaultLayout>
          {children}
        </DefaultLayout>
      </div>
    </>
  );
}