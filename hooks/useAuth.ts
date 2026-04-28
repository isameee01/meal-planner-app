"use client";

import { useAuthContext } from "../lib/contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
    const context = useAuthContext();
    
    // Safely fallback if used outside context (though we'll wrap app)
    const authState = context || { user: null, session: null, loading: false };

    const signup = async (email: string, password: string, fullName: string = "") => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });
        
        if (error) throw error;
        return data;
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Clean up any legacy manual local storage if it existed
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
    };

    return {
        user: authState.user,
        session: authState.session,
        loading: authState.loading,
        signup,
        login,
        logout,
    };
}
