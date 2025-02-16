"use client";

import { useRouter } from "next/navigation";
import { LeftOutlined } from "@ant-design/icons";

const HeaderWithBack = ({ title }: { title: string }) => {
    const router = useRouter();

    return (
        <div className="flex items-center rounded-lg bg-blue-400 text-white p-4 w-full">
            <button
                onClick={() => router.back()}
                className="mr-2 p-2 bg-blue-200 rounded-full hover:bg-blue-200 transition"
            >
                <LeftOutlined className="text-white text-lg" />
            </button>
            <h2 className="text-lg font-semibold">{title}</h2>
        </div>
    );
};

export default HeaderWithBack;
