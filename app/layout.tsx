import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
    title: "CustomDailyDiet - Autopilot your diet",
    description: "Generate personalized meal plans based on your goals.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: `
                    (function() {
                        try {
                            var theme = localStorage.getItem('theme') || 'system';
                            var root = document.documentElement;
                            var isDark = false;
                            
                            console.log('[ThemeSystem-Script] Executing pre-hydration script with theme:', theme);
                            
                            if (theme === 'system') {
                                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                            } else {
                                isDark = theme === 'dark';
                            }
                            
                            root.classList.remove('dark');
                            if (isDark) {
                                root.classList.add('dark');
                                console.log('[ThemeSystem-Script] Applied "dark" class pre-hydration');
                            } else {
                                console.log('[ThemeSystem-Script] Removed "dark" class pre-hydration');
                            }
                        } catch (e) {
                            console.error('[ThemeSystem-Script] Error applying theme:', e);
                        }
                    })();
                ` }} />
            </head>
            <body className="antialiased" suppressHydrationWarning>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
