// Mock Data for Admin Dashboard
export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'User';
    plan: 'Free' | 'Paid';
    status: 'Active' | 'Blocked';
    createdAt: string;
    featuresEnabled: string[];
}

export interface AdminStats {
    totalUsers: number;
    activeSubscriptions: number;
    totalAiGenerations: number;
    systemUptime: string;
}

export interface AIConfig {
    id: string;
    feature: string;
    prompt: string;
    model: string;
    temperature: number;
    enabled: boolean;
}

export interface APIProvider {
    id: string;
    name: string;
    key: string;
    model: string;
    priority: number;
    enabled: boolean;
}

export interface AdminSettings {
    siteName: string;
    description: string;
    logoUrl: string;
    theme: 'dark' | 'light';
    customCss: string;
    customJs: string;
}

export interface SaaSConfig {
    subscriptionEnabled: boolean;
    monthlyPrice: number;
    yearlyPrice: number;
    premiumTools: string[];
}

export interface AdConfig {
    id: 'header' | 'footer' | 'sidebar' | 'popup';
    name: string;
    enabled: boolean;
    code: string;
}

export interface ToolItem {
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
    order: number;
}

export const INITIAL_USERS: AdminUser[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', plan: 'Paid', status: 'Active', createdAt: '2025-01-10', featuresEnabled: ['recipe-gen', 'ai-rebalance', 'bmr-calc'] },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', plan: 'Free', status: 'Active', createdAt: '2025-02-15', featuresEnabled: ['bmr-calc'] },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Manager', plan: 'Paid', status: 'Active', createdAt: '2025-03-01', featuresEnabled: ['recipe-gen', 'bmr-calc'] },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'User', plan: 'Free', status: 'Blocked', createdAt: '2025-03-20', featuresEnabled: [] },
    { id: '5', name: 'Alex Brown', email: 'alex@example.com', role: 'User', plan: 'Paid', status: 'Active', createdAt: '2025-04-05', featuresEnabled: ['recipe-gen', 'ai-rebalance'] },
];

export const INITIAL_AI_CONFIGS: AIConfig[] = [
    { id: 'meal-gen', feature: 'Meal Generator AI', prompt: 'You are a professional nutritionist. Generate a meal plan for...', model: 'gpt-4o', temperature: 0.7, enabled: true },
    { id: 'recipe-gen', feature: 'Recipe AI', prompt: 'You are a master chef. Create a detailed recipe based on...', model: 'llama-3.3-70b', temperature: 0.5, enabled: true },
    { id: 'chat-ai', feature: 'Nutrition Chat AI', prompt: 'You are a supportive health coach answering user questions about...', model: 'gpt-4o-mini', temperature: 0.8, enabled: true },
];

export const INITIAL_APIS: APIProvider[] = [
    { id: 'api-1', name: 'OpenAI', key: 'sk-proj-xxxxxxxxxxxxxxxx', model: 'gpt-4o', priority: 1, enabled: true },
    { id: 'api-2', name: 'Groq', key: 'gsk_EZFrxxxxxxxxxxxxxxxx', model: 'llama-3.3-70b', priority: 2, enabled: true },
    { id: 'api-3', name: 'Anthropic', key: 'sk-ant-xxxxxxxxxxxxxxxx', model: 'claude-3-5-sonnet', priority: 3, enabled: false },
];

export const INITIAL_SETTINGS: AdminSettings = {
    siteName: 'CustomDailyDiet',
    description: 'The ultimate AI-powered diet planning platform.',
    logoUrl: '/logo.png',
    theme: 'light',
    customCss: '',
    customJs: '',
};

export const INITIAL_SAAS: SaaSConfig = {
    subscriptionEnabled: true,
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    premiumTools: ['recipe-gen', 'ai-rebalance'],
};

export const INITIAL_ADS: AdConfig[] = [
    { id: 'header', name: 'Header Ad', enabled: false, code: '<div class="thead"></div>' },
    { id: 'footer', name: 'Footer Ad', enabled: false, code: '<div class="tfoot"></div>' },
    { id: 'sidebar', name: 'Sidebar Ad', enabled: true, code: '<div class="tside"></div>' },
    { id: 'popup', name: 'Popup Ad', enabled: false, code: '<div class="tpop"></div>' },
];

export const INITIAL_TOOLS: ToolItem[] = [
    { id: 'tool-1', name: 'Meal Planner', slug: 'meal-planner', enabled: true, order: 1 },
    { id: 'tool-2', name: 'Recipe Generator', slug: 'recipe-generator', enabled: true, order: 2 },
    { id: 'tool-3', name: 'BMR Calculator', slug: 'bmr-calculator', enabled: true, order: 3 },
    { id: 'tool-4', name: 'Macro Tracker', slug: 'macro-tracker', enabled: true, order: 4 },
];
