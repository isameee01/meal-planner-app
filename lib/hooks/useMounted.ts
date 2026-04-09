"use client";

import { useState, useEffect } from "react";

/**
 * useMounted Hook
 * Ensures a component has successfully hydrated on the client.
 * Use this to gate client-only logic (localStorage, window, etc.)
 * to avoid Next.js hydration mismatches.
 */
export function useMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
