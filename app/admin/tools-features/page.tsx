"use client";

import React, { useState } from "react";
import { useFeatureControl, AppFeatures } from "@/lib/hooks/useFeatureControl";
import { 
  Wrench, 
  Zap, 
  Utensils, 
  RefreshCw, 
  Compass, 
  PlusCircle, 
  Library, 
  Heart, 
  Ban, 
  Clock, 
  Target,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

/**
 * Tools & Features Control Panel
 * Production-ready feature flagging system for the CustomDailyDiet SaaS.
 */
export default function ToolsFeaturesPage() {
  const { features, updateFeature, isLoaded, resetToDefaults } = useFeatureControl();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Syncing feature states...</p>
        </div>
      </div>
    );
  }

  const FeatureToggle = ({ 
    label, 
    featureKey, 
    icon: Icon,
    description 
  }: { 
    label: string, 
    featureKey: keyof AppFeatures, 
    icon: any,
    description: string
  }) => (
    <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
      features[featureKey] 
        ? "bg-white border-slate-200 shadow-sm hover:border-blue-200" 
        : "bg-slate-50/50 border-slate-100 grayscale-[0.5] opacity-80"
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-colors ${
          features[featureKey] ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
        }`}>
          <Icon size={22} className={features[featureKey] ? "animate-pulse-subtle" : ""} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          {!features[featureKey] && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500 mt-2 uppercase tracking-widest">
              <AlertTriangle size={10} /> Feature Disabled Globally
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => updateFeature(featureKey, !features[featureKey])}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${
          features[featureKey] ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            features[featureKey] ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, colorClass }: { title: string, icon: any, colorClass: string }) => (
    <div className="flex items-center gap-2 mb-6">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={18} className="text-white" />
      </div>
      <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h2>
    </div>
  );

  const handleReset = () => {
    if (showConfirmReset) {
      resetToDefaults();
      setShowConfirmReset(false);
    } else {
      setShowConfirmReset(true);
      setTimeout(() => setShowConfirmReset(false), 10000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                <Wrench size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Feature Control</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Switchboard</p>
                </div>
             </div>
          </div>
          <p className="text-slate-500 max-w-md italic">
            Enable or disable major application subsystems. Changes are reflected across the entire user journey.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleReset}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
              showConfirmReset 
                ? "bg-rose-600 border-rose-600 text-white" 
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 shadow-sm"
            }`}
          >
            {showConfirmReset ? (
              <>Confirm Reset? <AlertTriangle size={14} /></>
            ) : (
              <>Reset to Defaults <RotateCcw size={14} /></>
            )}
          </button>
          
          <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-700 text-[10px] font-black uppercase tracking-[0.1em]">
            <ShieldCheck size={16} />
            System Authority: Admin
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        
        {/* AI Features Section */}
        <section>
          <SectionHeader title="🧠 Artificial Intelligence" icon={Zap} colorClass="bg-amber-500" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureToggle 
              label="Meal Generation" 
              featureKey="enableMealGeneration" 
              icon={Utensils} 
              description="Primary AI engine for multi-day plan creation." 
            />
            <FeatureToggle 
              label="Recipe Synthesis" 
              featureKey="enableRecipes" 
              icon={Zap} 
              description="Deep generation of ingredients and instructions." 
            />
            <FeatureToggle 
              label="Rebalance Engine" 
              featureKey="enableRebalance" 
              icon={RefreshCw} 
              description="Real-time macro correction after manual changes." 
            />
            <FeatureToggle 
              label="Discover AI" 
              featureKey="enableDiscoverAI" 
              icon={Compass} 
              description="Intelligent search and recommendation system." 
            />
          </div>
        </section>

        {/* Food System Section */}
        <section>
          <SectionHeader title="🍽️ Food Ecosystem" icon={Utensils} colorClass="bg-blue-500" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureToggle 
              label="Custom Foods" 
              featureKey="enableCustomFoods" 
              icon={PlusCircle} 
              description="Allow users to create and store private food items." 
            />
            <FeatureToggle 
              label="Collections" 
              featureKey="enableCollections" 
              icon={Library} 
              description="Folder-based organization for meals and recipes." 
            />
            <FeatureToggle 
              label="Favorites" 
              featureKey="enableFavorites" 
              icon={Heart} 
              description="One-click bookmarking for frequently used items." 
            />
            <FeatureToggle 
              label="Blocked Foods" 
              featureKey="enableBlockedFoods" 
              icon={Ban} 
              description="Exclusion list for allergens and preferences." 
            />
          </div>
        </section>

        {/* Advanced Section */}
        <section>
          <SectionHeader title="⚙️ Logic & Subsystems" icon={Wrench} colorClass="bg-slate-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureToggle 
              label="Leftovers Engine" 
              featureKey="enableLeftovers" 
              icon={Clock} 
              description="Automated projection of cooking vs. leftovers." 
            />
            <FeatureToggle 
              label="Nutrition Targets" 
              featureKey="enableNutritionTargets" 
              icon={Target} 
              description="Custom macro and calorie goal enforcement." 
            />
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-125 transition-transform duration-1000">
           <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-4 text-center md:text-left">
              <h2 className="text-xl font-bold text-white tracking-tight">System Integrity Notice</h2>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                Disabling a feature here will propagate down to all client modules. Ensure you have informed the engineering team before disabling core AI subsystems in production.
              </p>
           </div>
           <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
              <Zap size={14} className="text-amber-500" />
              Live Deployment Control
           </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
