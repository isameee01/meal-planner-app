"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function getSession() {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("[Auth] getSession error:", error);
                }
                
                if (mounted) {
                    setSession(data.session);
                    setUser(data.session?.user ?? null);
                    setLoading(false);
                }
            } catch (error) {
                console.error("[Auth] Unexpected error during getSession:", error);
                if (mounted) setLoading(false);
            }
        }

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (mounted) {
                    if (event === 'SIGNED_IN') {
                        setSession(session);
                        setUser(session?.user ?? null);
                    } else if (event === 'SIGNED_OUT') {
                        setSession(null);
                        setUser(null);
                    } else if (event === 'TOKEN_REFRESHED') {
                        setSession(session);
                        setUser(session?.user ?? null);
                    } else {
                        // For INITIAL_SESSION or other obscure events
                        setSession(session);
                        setUser(session?.user ?? null);
                    }
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuthContext() {
    return useContext(AuthContext);
}
