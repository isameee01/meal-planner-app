"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical } from "lucide-react";

interface DropdownItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "danger";
    disabled?: boolean;
}

interface DropdownMenuProps {
    items: DropdownItem[];
    trigger?: React.ReactNode;
    align?: "left" | "right";
}

export default function DropdownMenu({ items, trigger, align = "right" }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger || (
                    <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                        <MoreVertical size={18} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute z-[100] mt-2 min-w-[200px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 ${
                            align === "right" ? "right-0" : "left-0"
                        }`}
                    >
                        {items.map((item, index) => (
                            <button
                                key={index}
                                disabled={item.disabled}
                                onClick={() => {
                                    if (item.disabled) return;
                                    item.onClick();
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    item.disabled
                                        ? "opacity-30 cursor-not-allowed grayscale"
                                        : item.variant === "danger"
                                            ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                {item.icon && <span className="text-current">{item.icon}</span>}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
