"use client";

import React from "react";

interface DataReadyProps {
    loading: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function DataReady({ loading, children, fallback = null }: DataReadyProps) {
    if (loading) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
