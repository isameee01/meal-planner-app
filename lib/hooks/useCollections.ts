"use client";

import { useState, useEffect } from "react";
import { Collection } from "../../types/collections";
import { getCollections, storage } from "../storage-utils";

export function useCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCollections(getCollections());
        setLoading(false);
    }, []);

    const addCollection = (collection: Collection) => {
        setCollections(prev => {
            const updated = [...prev, collection];
            storage.set("customCollections", updated);
            return updated;
        });
    };

    const deleteCollection = (id: string) => {
        setCollections(prev => {
            const updated = prev.filter(c => c.id !== id);
            storage.set("customCollections", updated);
            return updated;
        });
    };

    const updateCollection = (id: string, updates: Partial<Collection>) => {
        setCollections(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
            storage.set("customCollections", updated);
            return updated;
        });
    };

    return { 
        collections, 
        loading, 
        addCollection, 
        deleteCollection, 
        updateCollection 
    };
}
