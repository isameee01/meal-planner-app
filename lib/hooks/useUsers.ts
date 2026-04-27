"use client";

import { useState, useEffect } from "react";
import { AdminUser, INITIAL_USERS } from "@/lib/admin/mock-data";

const STORAGE_KEY = "custom_daily_diet_users_v1";

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse Users from localStorage", e);
        setUsers(INITIAL_USERS);
      }
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  const saveUsers = (updatedUsers: AdminUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const addUser = (userData: Omit<AdminUser, "id" | "createdAt" | "featuresEnabled">) => {
    // Check for duplicate email
    if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error("Email address already exists in the system.");
    }

    const newUser: AdminUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split("T")[0],
      featuresEnabled: [],
    };

    saveUsers([newUser, ...users]);
    return newUser;
  };

  const deleteUser = (id: string) => {
    saveUsers(users.filter((u) => u.id !== id));
  };

  const updateUser = (id: string, updates: Partial<AdminUser>) => {
    saveUsers(
      users.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  return { users, isLoaded, addUser, deleteUser, updateUser };
}
