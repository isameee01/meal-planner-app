export interface Collection {
    id: string;
    name: string;
    description?: string;
    foodIds: string[]; // IDs of foods in this collection
    createdAt: string;
    image?: string;
    creator?: string;
    isFeatured?: boolean;
}

export interface CollectionState {
    favoriteFoods: string[]; // List of custom food/recipe IDs
    followedCollections: string[]; // List of collection IDs
    recurringCollections: string[]; // List of collection IDs
}
