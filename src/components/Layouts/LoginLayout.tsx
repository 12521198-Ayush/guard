"use client";
import React from "react";
import { motion, AnimatePresence } from 'framer-motion'

export default function DefaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (

        <AnimatePresence>
            <div className="flex h-screen overflow-hidden">
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <main>
                        <motion.div
                            className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            transition={{ delay: 0.5 }}
                        >
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>
        </AnimatePresence>

    );
}
