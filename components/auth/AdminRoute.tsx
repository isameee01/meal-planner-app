"use client";

import React, { useEffect, useState } from "react";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

/**
 * AdminRoute
 * Enforces Role-Based Access Control (RBAC) for administrative pages.
 * Prevents UI leakage by showing a denial/loading state during verification.
 */
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { profile, loading } = useUserProfile();
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    
    // Explicit authorization check
    const isAuthorized = profile && profile.role === "admin";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || loading) return;

        // Redirect if explicitly unauthorized AFTER loading is done
        if (!isAuthorized) {
            console.warn(`[Admin] Unauthorized access to ${pathname} by ${profile?.fullName || 'Guest'}. Redirecting...`);
            router.replace("/dashboard"); 
        }
    }, [isAuthorized, loading, isMounted, router, pathname, profile]);

    // 1. Initial mounting/auth fetch state
    if (!isMounted || loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center shadow-xl relative overflow-hidden">
                    <Loader2 className="animate-spin text-emerald-500 relative z-10" size={32} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Authenticating Admin...</p>
            </div>
        );
    }

    // 2. Access Denied state (shown briefly before redirect or if redirect fails)
    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-50 dark:bg-slate-950 p-8 text-center">
                <ShieldAlert size={64} className="text-red-500 mb-6" />
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium">
                    This sector is restricted to system administrators. Redirecting to home...
                </p>
                <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full animate-progress" />
                </div>
            </div>
        );
    }

    // 3. Authorized state
    return <>{children}</>;
};
