"use client";

import React from "react";
import { motion } from "framer-motion";

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`} />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 h-full flex flex-col space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </div>
        </div>
    );
}

export function CollectionSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 h-full flex flex-col">
            <Skeleton className="w-14 h-14 rounded-2xl mb-6" />
            <Skeleton className="h-7 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-8" />
            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </div>
        </div>
    );
}

export function GridSkeleton({ count = 8, type = "card" }: { count?: number; type?: "card" | "collection" }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i}>
                    {type === "card" ? <CardSkeleton /> : <CollectionSkeleton />}
                </div>
            ))}
        </div>
    );
}

export function PageHeaderSkeleton() {
    return (
        <div className="space-y-6 mb-12">
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4 w-full max-w-2xl">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <Skeleton className="h-10 w-64" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-4">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-32 rounded-2xl" />
                    <Skeleton className="h-12 w-32 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

export function SectionSkeleton() {
    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="grid grid-cols-1 gap-4">
                <Skeleton className="h-32 w-full rounded-3xl" />
                <Skeleton className="h-32 w-full rounded-3xl" />
                <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 space-y-8">
            <Skeleton className="h-8 w-1/2" />
            <div className="flex items-center justify-center p-8">
                <Skeleton className="w-48 h-48 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
        </div>
    );
}

