'use client';

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const ChatDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const avatar = searchParams.get("avatar");
  const name = searchParams.get("name");
  const body = searchParams.get("body");
  const time = searchParams.get("time");

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="p-6">
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="mb-4 text-blue-500 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Chat Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {avatar && (
              <Image src={avatar} width={56} height={56} alt="User" className="rounded-full" />
            )}
            <h1 className="text-xl font-bold">{name}</h1>
          </div>
          <div className="flex gap-4">
            <ActionButton label="Reply" icon="reply" />
            <ActionButton label="Forward" icon="arrow-right" />
          </div>
        </div>

        {/* Message Body */}
        <p className="mb-2 text-gray-700">{body}</p>
        <p className="text-sm text-gray-500">Sent {time} minutes ago</p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t pt-4">
          <ActionButton label="Star" icon="star" />
          <ActionButton label="Delete" icon="trash" />
          <ActionButton label="Copy Mail" icon="clipboard" />
          <ActionButton label="Print" icon="printer" />
          <ActionButton label="Archive" icon="archive" />
          <ActionButton label="Mark as Unread" icon="envelope" />
        </div>
      </div>
    </div>
  );
};

// Reusable ActionButton component
const ActionButton = ({ label, icon }: { label: string; icon: string }) => (
  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={
          icon === "reply" ? "M3 10l9-7v4h9v6h-9v4l-9-7z"
          : icon === "arrow-right" ? "M9 5l7 7-7 7"
          : icon === "star" ? "M12 17.27L18.18 21 16.54 14.81 21 10.91 14.81 10.19 12 4.77 9.19 10.19 3 10.91 7.46 14.81 5.82 21 12 17.27"
          : icon === "trash" ? "M19 7l-1 12H6L5 7m5-3h4m-4 0V4h4v1M9 3h6"
          : icon === "clipboard" ? "M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z"
          : icon === "printer" ? "M6 9v6m12 0V9m-6 6v6m-2-6h4M3 9h18M5 3h14a2 2 0 012 2v8H3V5a2 2 0 012-2z"
          : icon === "archive" ? "M4 4h16v6H4zM4 14h16v6H4z"
          : icon === "envelope" ? "M3 8l9 6 9-6V4H3v4z"
          : ""
        }
      />
    </svg>
    {label}
  </button>
);

export default ChatDetail;
