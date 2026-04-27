// Mock API System for Admin Dashboard
import { 
    AdminUser, 
    AIConfig, 
    APIProvider, 
    AdminSettings, 
    SaaSConfig, 
    AdConfig, 
    ToolItem,
    AdminStats,
    INITIAL_USERS,
    INITIAL_AI_CONFIGS,
    INITIAL_APIS,
    INITIAL_SETTINGS,
    INITIAL_SAAS,
    INITIAL_ADS,
    INITIAL_TOOLS
} from './mock-data';

// Simulation of a persistent state in the session
let users = [...INITIAL_USERS];
let aiConfigs = [...INITIAL_AI_CONFIGS];
let apis = [...INITIAL_APIS];
let settings = { ...INITIAL_SETTINGS };
let saas = { ...INITIAL_SAAS };
let ads = [...INITIAL_ADS];
let tools = [...INITIAL_TOOLS];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    // Users
    getUsers: async (): Promise<AdminUser[]> => {
        await delay(500);
        return [...users];
    },
    getUserById: async (id: string): Promise<AdminUser | undefined> => {
        await delay(300);
        return users.find(u => u.id === id);
    },
    updateUser: async (id: string, updates: Partial<AdminUser>): Promise<AdminUser> => {
        await delay(600);
        users = users.map(u => u.id === id ? { ...u, ...updates } : u);
        return users.find(u => u.id === id)!;
    },
    getStats: async (): Promise<AdminStats> => {
        await delay(400);
        return {
            totalUsers: users.length,
            activeSubscriptions: users.filter(u => u.plan === 'Paid').length,
            totalAiGenerations: 12543,
            systemUptime: '99.99%',
        };
    },

    // AI Configs
    getAIConfigs: async (): Promise<AIConfig[]> => {
        await delay(400);
        return [...aiConfigs];
    },
    updateAIConfig: async (id: string, updates: Partial<AIConfig>): Promise<AIConfig> => {
        await delay(500);
        aiConfigs = aiConfigs.map(c => c.id === id ? { ...c, ...updates } : c);
        return aiConfigs.find(c => c.id === id)!;
    },

    // APIs
    getAPIs: async (): Promise<APIProvider[]> => {
        await delay(300);
        return [...apis];
    },
    updateAPI: async (id: string, updates: Partial<APIProvider>): Promise<APIProvider> => {
        await delay(500);
        apis = apis.map(a => a.id === id ? { ...a, ...updates } : a);
        return apis.find(a => a.id === id)!;
    },
    reorderAPIs: async (newOrder: APIProvider[]): Promise<APIProvider[]> => {
        await delay(400);
        apis = newOrder.map((a, index) => ({ ...a, priority: index + 1 }));
        return [...apis];
    },

    // General Settings
    getSettings: async (): Promise<AdminSettings> => {
        await delay(300);
        return { ...settings };
    },
    updateSettings: async (updates: Partial<AdminSettings>): Promise<AdminSettings> => {
        await delay(600);
        settings = { ...settings, ...updates };
        return { ...settings };
    },

    // SaaS
    getSaaSConfig: async (): Promise<SaaSConfig> => {
        await delay(300);
        return { ...saas };
    },
    updateSaaSConfig: async (updates: Partial<SaaSConfig>): Promise<SaaSConfig> => {
        await delay(500);
        saas = { ...saas, ...updates };
        return { ...saas };
    },

    // Ads
    getAds: async (): Promise<AdConfig[]> => {
        await delay(300);
        return [...ads];
    },
    updateAd: async (id: string, updates: Partial<AdConfig>): Promise<AdConfig> => {
        await delay(400);
        ads = ads.map(a => a.id === id ? { ...a, ...updates } : a);
        return ads.find(a => a.id === id)!;
    },

    // Tools
    getTools: async (): Promise<ToolItem[]> => {
        await delay(400);
        return [...tools];
    },
    updateTool: async (id: string, updates: Partial<ToolItem>): Promise<ToolItem> => {
        await delay(500);
        tools = tools.map(t => t.id === id ? { ...t, ...updates } : t);
        return tools.find(t => t.id === id)!;
    },
    reorderTools: async (newOrderIds: string[]): Promise<ToolItem[]> => {
        await delay(600);
        tools = newOrderIds.map((id, index) => {
            const tool = tools.find(t => t.id === id)!;
            return { ...tool, order: index + 1 };
        });
        return [...tools];
    }
};
