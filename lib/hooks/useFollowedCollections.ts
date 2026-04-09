"use client";

import { useState, useEffect } from "react";
import { getFollowedCollections, getRecurringCollections, storage } from "../storage-utils";

export function useFollowedCollections() {
    const [followedIds, setFollowedIds] = useState<string[]>([]);
    const [recurringIds, setRecurringIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setFollowedIds(getFollowedCollections());
        setRecurringIds(getRecurringCollections());
        setLoading(false);
    }, []);

    const toggleFollow = (id: string) => {
        setFollowedIds(prev => {
            const isFollowed = prev.includes(id);
            const updated = isFollowed 
                ? prev.filter(fid => fid !== id) 
                : [...prev, id];
            
            storage.set("followedCollections", updated);
            return updated;
        });
    };

    const toggleRecurring = (id: string) => {
        setRecurringIds(prev => {
            const isRecurring = prev.includes(id);
            const updated = isRecurring 
                ? prev.filter(rid => rid !== id) 
                : [...prev, id];
            
            storage.set("recurringCollections", updated);
            return updated;
        });
    };

    const isFollowed = (id: string) => followedIds.includes(id);
    const isRecurring = (id: string) => recurringIds.includes(id);

    return { 
        followedIds, 
        recurringIds, 
        loading, 
        toggleFollow, 
        toggleRecurring, 
        isFollowed, 
        isRecurring 
    };
}
