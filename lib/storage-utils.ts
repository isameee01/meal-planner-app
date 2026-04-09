import { CustomFood, CustomRecipe } from "../types/custom-recipes";
import { Collection } from "../types/collections";
import { STATIC_FOOD_DATA } from "./constants/collections-data";
import { FULL_DISCOVER_DATABASE } from "./discover-db";

const FOODS_KEY = "customFoods";
const RECIPES_KEY = "customRecipes";
const COLLECTIONS_KEY = "customCollections";
const FAVORITES_KEY = "favoriteFoods";
const FOLLOWED_KEY = "followedCollections";
const RECURRING_KEY = "recurringCollections";

export const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === "undefined") return defaultValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    },
    set: <T>(key: string, value: T): void => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
        }
    }
};

export const getCustomFoods = (): CustomFood[] => storage.get<CustomFood[]>(FOODS_KEY, []);
export const saveCustomFood = (food: CustomFood): void => {
    const current = getCustomFoods();
    storage.set(FOODS_KEY, [...current, food]);
};

export const getCustomRecipes = (): CustomRecipe[] => storage.get<CustomRecipe[]>(RECIPES_KEY, []);
export const saveCustomRecipe = (recipe: CustomRecipe): void => {
    const current = getCustomRecipes();
    storage.set(RECIPES_KEY, [...current, recipe]);
};

// Collections & State
export const getCollections = (): Collection[] => storage.get<Collection[]>(COLLECTIONS_KEY, []);
export const saveCollection = (collection: Collection): void => {
    const current = getCollections();
    storage.set(COLLECTIONS_KEY, [...current, collection]);
};

export const getFavorites = (): string[] => storage.get<string[]>(FAVORITES_KEY, []);
export const getFollowedCollections = (): string[] => storage.get<string[]>(FOLLOWED_KEY, []);
export const getRecurringCollections = (): string[] => storage.get<string[]>(RECURRING_KEY, []);

/**
 * Universal Food Resolver
 * Searches across all possible sources to return a full food/recipe object
 */
export const getFoodById = (id: string): any => {
    // 1. Check Custom Foods
    const customFoods = getCustomFoods();
    const cf = customFoods.find(f => f.id === id);
    if (cf) return { ...cf, type: 'food' };

    // 2. Check Custom Recipes
    const customRecipes = getCustomRecipes();
    const cr = customRecipes.find(r => r.id === id);
    if (cr) return { ...cr, type: 'recipe' };

    // 3. Check Discover Database
    const discoverFood = FULL_DISCOVER_DATABASE.find(f => f.id === id);
    if (discoverFood) return { ...discoverFood, type: 'food' };

    // 4. Check Static Food Data
    const staticFood = STATIC_FOOD_DATA.find(f => f.id === id);
    if (staticFood) return { ...staticFood, type: 'food' };

    return null;
};

