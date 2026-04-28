"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || loading) return;

        // If explicitly loaded and no user, force redirect to login
        if (!user) {
            console.log(`[Auth] Unauthorized access to ${pathname}, redirecting...`);
            router.push(`/auth/login`);
        }
    }, [user, loading, isMounted, router, pathname]);

    // Anti-flicker and hydration guard
    if (!isMounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh] bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 size={40} className="text-emerald-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Authenticating Session...</p>
                </div>
            </div>
        );
    }

    // Only render children when definitively authenticated
    if (!user) {
        return null; // Don't render anything while the router is pushing to /login
    }

    return <>{children}</>;
};
