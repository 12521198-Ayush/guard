import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSession } from 'next-auth/react';
import StatusStory from "./StatusStory";


const DashboardImageCarousel = ({ premiseId }: { premiseId: string }) => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: session } = useSession();

    // 1. Fetch object IDs and then fetch pre-signed URLs
    useEffect(() => {
        const fetchImageUrls = async () => {
            try {
                const objectIdRes = await axios.post(
                    "http://139.84.166.124:8060/user-service/misc/dashboard/image/read",
                    { premise_id: premiseId },
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                        },
                    }
                );

                const objectIds =
                    objectIdRes.data?.data?.dashboard_image_object_id_array || [];

                const urlPromises = objectIds.map((fileKey: string) =>
                    axios
                        .post(
                            "http://139.84.166.124:8060/user-service/upload/get_presigned_url",
                            { premise_id: premiseId, file_key: fileKey },
                            {
                                headers: {
                                    Authorization: `Bearer ${session?.user?.accessToken}`,
                                },
                            }
                        )
                        .then((res) => res.data?.data)
                );

                const urls = await Promise.all(urlPromises);
                setImageUrls(urls.filter(Boolean));
            } catch (error) {
                console.error("Error fetching image URLs", error);
            }
        };

        fetchImageUrls();
    }, [premiseId]);

    // 2. Setup timer for automatic transitions
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                imageUrls.length > 0 ? (prev + 1) % imageUrls.length : 0
            );
        }, 2000); // every 2 seconds

        return () => clearInterval(interval);
    }, [imageUrls]);

    const currentImage = imageUrls[currentIndex];

    return (
        <div className="relative h-48 rounded-2xl overflow-hidden shadow-md">
            <AnimatePresence>
                {currentImage && (
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url("${currentImage}")` }}
                    />
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="relative h-full flex flex-col justify-center p-4 text-center">
                <div className="">
                    <StatusStory
                        media={imageUrls}
                        title={session?.user?.primary_premise_name || " "}
                        subtitle=""
                    />
                </div>


                <h2 className="text-white text-2xl font-bold">
                    {session?.user?.primary_premise_name || "Your Premise"}
                </h2>
                <p className="text-white text-sm italic mt-1">
                    “A peaceful home starts with respectful hands.”
                </p>
            </div>
        </div>
    );
};

export default DashboardImageCarousel;
