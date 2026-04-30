"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("[AuthCallback] Error getting session:", error.message);
                router.push("/auth/login?error=Session link expired or invalid");
            } else if (data.session) {
                console.log("[AuthCallback] Session verified, redirecting to dashboard...");
                router.push("/dashboard");
            } else {
                console.warn("[AuthCallback] No session found, redirecting to login.");
                router.push("/auth/login");
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-xl font-bold text-slate-800">Verifying your account...</h2>
                <p className="text-slate-500 text-sm">Please wait while we establish a secure session.</p>
            </div>
        </div>
    );
}
