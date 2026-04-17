import type { Metadata } from "next";
import Script from "next/script";
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
                <Script
                    id="theme-initializer"
                    strategy="beforeInteractive"
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: `
                        (function() {
                            try {
                                var theme = localStorage.getItem('theme') || 'system';
                                var root = document.documentElement;
                                var isDark = false;
                                
                                if (theme === 'system') {
                                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                } else {
                                    isDark = theme === 'dark';
                                }
                                
                                root.classList.remove('dark');
                                if (isDark) {
                                    root.classList.add('dark');
                                }
                            } catch (e) {}
                        })();
                    ` }} 
                />
            </head>
            <body className="antialiased" suppressHydrationWarning>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
