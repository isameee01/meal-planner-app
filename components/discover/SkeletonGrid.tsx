"use client";

import { motion } from "framer-motion";

export const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
        <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md mb-3" />
        <div className="flex justify-between items-center">
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
    </div>
);

export default function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
