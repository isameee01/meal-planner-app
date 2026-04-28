import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";

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
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
