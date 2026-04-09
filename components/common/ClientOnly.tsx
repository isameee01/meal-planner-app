"use client";

import React from "react";
import { useMounted } from "../../lib/hooks/useMounted";

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const mounted = useMounted();

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
