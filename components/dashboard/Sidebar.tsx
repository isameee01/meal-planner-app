"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Compass, 
    ChefHat, 
    Library, 
    CalendarRange,
    Apple,
    Clock,
    UserCircle,
    Target,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Users,
    HelpCircle,
    Bell,
    CreditCard,
    Key,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMounted } from "../../lib/hooks/useMounted";
import { useAuth } from "../../hooks/useAuth";

interface SidebarItemProps {
    icon: any;
    label: string;
    href: string;
    active?: boolean;
    collapsed: boolean;
    dropdown?: { label: string; href: string }[];
}

const SidebarItem = ({ icon: Icon, label, href, active, collapsed, dropdown }: SidebarItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="mb-1">
            <Link 
                href={dropdown ? "#" : href}
                onClick={() => dropdown && setIsOpen(!isOpen)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                    active 
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200/50" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
            >
                <div className={`flex items-center justify-center ${collapsed ? "mx-auto" : "mr-3"}`}>
                    <Icon size={20} className={active ? "text-white" : "group-hover:text-emerald-500 transition-colors"} />
                </div>
                {!collapsed && (
                    <div className="flex flex-1 justify-between items-center">
                        <span className="font-medium text-sm">{label}</span>
                        {dropdown && (
                            <ChevronDown 
                                size={14} 
                                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                            />
                        )}
                    </div>
                )}
            </Link>
            {!collapsed && dropdown && (
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg mt-1 ml-9 overflow-hidden"
                        >
                            {dropdown.map((item) => {
                                const isSubActive = pathname === item.href;
                                return (
                                    <Link 
                                        key={item.label}
                                        href={item.href}
                                        className={`block px-3 py-2 text-xs font-semibold transition-colors ${
                                            isSubActive 
                                                ? "text-emerald-500 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20" 
                                                : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
    const mounted = useMounted();
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    
    // User metadata lookup if using full_name from supabase
    const fullName = user?.user_metadata?.full_name || user?.email || "User";

    if (!mounted) return null;

    const navItems = [
        { icon: LayoutDashboard, label: "Planner", href: "/dashboard" },
        { icon: ShoppingCart, label: "Groceries", href: "/dashboard/groceries" },
        { icon: Compass, label: "Discover", href: "/dashboard/discover" },
        { icon: ChefHat, label: "Custom Recipes", href: "/dashboard/custom-recipes" },
        { icon: Library, label: "Collections", href: "/dashboard/collections" },
        { icon: CalendarRange, label: "Saved Plans", href: "/dashboard/saved-plans" },
    ];

    const dropdownItems = [
        { 
            icon: Apple, 
            label: "Diet & Nutrition", 
            href: "#",
            dropdown: [
                { label: "Nutrition Targets", href: "/dashboard/diet-nutrition/nutrition-targets" },
                { label: "Primary Diet", href: "/dashboard/diet-nutrition/primary-diet" },
                { label: "Food Exclusions", href: "/dashboard/diet-nutrition/food-exclusions" },
                { label: "Blocked Foods", href: "/dashboard/diet-nutrition/blocked-foods" }
            ]
        },
        { 
            icon: Clock, 
            label: "Meals & Schedule", 
            href: "/dashboard/meals-schedule/settings",
            dropdown: [
                { label: "Meal Settings", href: "/dashboard/meals-schedule/settings" },
                { label: "Leftovers", href: "/dashboard/meals-schedule/leftovers" }
            ]
        },
    ];

    const statsItems = [
        { icon: UserCircle, label: "Physical Stats", href: "/dashboard/stats" },
        { icon: Target, label: "Weight and Goal", href: "/dashboard/goals" },
        { icon: Settings, label: "Generator Settings", href: "/dashboard/generator" },
    ];

    const accountItems = [
        { icon: Key, label: "Credentials", href: "/dashboard/account" },
        { icon: CreditCard, label: "Linked Accounts", href: "/dashboard/billing" },
        { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed", error);
            router.push("/auth/login");
        }
    };

    return (
        <motion.aside 
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            className="h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-all duration-300 ease-in-out shrink-0"
        >
            <div className="p-4 flex items-center justify-between">
                {!collapsed && (
                    <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                        CustomDailyDiet
                    </Link>
                )}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors mx-auto"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
                {!collapsed && (
                    <div className="mb-6 px-3 py-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{fullName}</p>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full inline-block mt-1">PRO PLAN</span>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <p className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 px-3 ${collapsed ? "text-center" : ""}`}>MAIN</p>
                        {navItems.map((item) => (
                            <SidebarItem 
                                key={item.label} 
                                {...item} 
                                active={pathname === item.href} 
                                collapsed={collapsed} 
                            />
                        ))}
                    </div>

                    <div>
                        <p className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 px-3 ${collapsed ? "text-center" : ""}`}>SETTINGS</p>
                        {dropdownItems.map((item) => {
                            const isParentActive = pathname.startsWith(item.href) || 
                                (item.dropdown?.some(sub => pathname === sub.href) ?? false);
                            
                            return (
                                <SidebarItem 
                                    key={item.label} 
                                    {...item} 
                                    active={isParentActive} 
                                    collapsed={collapsed} 
                                />
                            );
                        })}
                        {statsItems.map((item) => (
                            <SidebarItem 
                                key={item.label} 
                                {...item} 
                                active={false} 
                                collapsed={collapsed} 
                            />
                        ))}
                    </div>

                    <div>
                        <p className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 px-3 ${collapsed ? "text-center" : ""}`}>ACCOUNT</p>
                        {accountItems.map((item) => (
                            <SidebarItem 
                                key={item.label} 
                                {...item} 
                                active={false} 
                                collapsed={collapsed} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <SidebarItem icon={Users} label="Invite Friends" href="#" collapsed={collapsed} />
                <SidebarItem icon={HelpCircle} label="Help & Support" href="#" collapsed={collapsed} />
                <button 
                    onClick={handleLogout}
                    className={`flex items-center px-3 py-2 w-full rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors group ${collapsed ? "justify-center" : ""}`}
                >
                    <LogOut size={20} className="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                    {!collapsed && <span className="ml-3 font-medium text-sm">Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
}
