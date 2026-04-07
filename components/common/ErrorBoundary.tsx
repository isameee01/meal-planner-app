"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-xl m-4">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                        <AlertTriangle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Something went wrong</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium">
                        We encountered an unexpected error while rendering this section. Our team has been notified.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={this.handleReset}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
                        >
                            <RefreshCcw size={18} />
                            Try Again
                        </button>
                        <button 
                            onClick={() => window.location.href = "/dashboard"}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                        >
                            <Home size={18} />
                            Return Home
                        </button>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-left overflow-auto max-w-full">
                            <code className="text-xs text-red-500 block whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
