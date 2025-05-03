import { useEffect, useState } from 'react';
import StatusStory from './StatusStory';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion'; // Import Framer Motion for animations

export function CardWithSlideshowBackground({ media, title, subtitle }) {
    const imageUrls = media.filter(item => item.type === 'image').map(item => item.url);
    const [currentImage, setCurrentImage] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [showStory, setShowStory] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsImageLoaded(false);
            setCurrentImage(prev => (prev + 1) % imageUrls.length);
        }, 3000); // Set interval to 3 seconds
        return () => clearInterval(interval);
    }, [imageUrls.length]);

    return (
        <>
            <div
                className="relative rounded-2xl overflow-hidden shadow-lg mb-4 text-center cursor-pointer"
                onClick={() => setShowStory(true)}
            >
                {/* Background image with fade and slide effect */}
                <motion.div
                    key={currentImage} // Ensure animation triggers on every image change
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0, x: 100 }}  // Initial position off to the right
                    animate={{ opacity: 1, x: 0 }} // Animate to full opacity and reset x-axis position
                    exit={{ opacity: 0, x: -100 }} // Exit animation: fade out and slide out to the left
                    transition={{ duration: 1, ease: 'easeInOut' }} // Smooth transition
                >
                    <img
                        src={imageUrls[currentImage]}
                        onLoad={() => setIsImageLoaded(true)}
                        alt="Slideshow background"
                        className={`absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                </motion.div>

                {/* Fancy shimmer loader */}
                {!isImageLoaded && (
                    <div className="absolute inset-0 animate-pulse backdrop-blur-md bg-transparent z-0" />
                )}

                <motion.div
                    className="relative z-10 backdrop-blur-md bg-black/5 p-5 flex flex-col items-center rounded-2xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-lg font-semibold text-white mb-1">Society Snapshot</h2>
                    <p className="text-sm text-white mb-4">
                        This snapshot shows important details shared by your society admin.
                    </p>
                </motion.div>

            </div>

            {/* Story Modal with slide-up and fade-in */}
            {showStory &&
                createPortal(
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 25 }} // Smooth spring animation
                    >
                        <StatusStory
                            media={media}
                            title={title}
                            subtitle={subtitle}
                            onClose={() => setShowStory(false)}
                        />
                        <button
                            onClick={() => setShowStory(false)}
                            className="absolute top-5 right-5 text-white text-2xl"
                        >
                            ✕
                        </button>
                    </motion.div>,
                    document.body
                )}
        </>
    );
}
