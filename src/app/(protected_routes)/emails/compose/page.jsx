import ComposeMail from "@/components/Chat/ComposeMail";
import React from "react";

const page = () => {
  return (
    <div className="col-span-12 rounded-sm border-none border-stroke bg-white py-2 xl:col-span-4">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-medium text-black dark:text-white">
            Compose Email
          </h4>
        </div>
      </div>

      <div className="bg-white p-4">
        <ComposeMail />
      </div>
    </div>
  );
};

export default page;
