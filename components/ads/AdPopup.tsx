"use client";

import React, { useState, useEffect } from "react";
import { useAdsConfig } from "@/lib/hooks/useAdsConfig";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AdPopup Component
 * Implements session-locked interstitial triggers.
 * Shows only once per browser session.
 */
export default function AdPopup() {
  const { config, isLoaded } = useAdsConfig();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLoaded || !config.enableAds || !config.enablePopupAd) return;

    // Check session lock
    const adShown = sessionStorage.getItem("custom_daily_diet_ad_shown");
    
    if (!adShown) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem("custom_daily_diet_ad_shown", "true");
      }, config.popupDelay);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, config.enableAds, config.enablePopupAd, config.popupDelay]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm"
        onClick={() => setShow(false)}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={() => setShow(false)}
            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="p-12 space-y-8">
             <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-rose-100">Sponsored</div>
                <div className="h-[2px] flex-1 bg-slate-100" />
             </div>

             <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight italic">
                   Unlock Your Potential with Our Premium Partner
                </h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed italic">
                   Experience the next generation of localized meal intelligence. Join thousands of users optimizing their journey today.
                </p>
             </div>

             {/* External Placeholder Content */}
             <div 
               className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]"
               dangerouslySetInnerHTML={{ __html: config.popupAdCode }}
             />

             <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={() => setShow(false)}
                  className="w-full py-5 bg-slate-900 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 italic"
                >
                   Learn More <ExternalLink size={16} className="inline ml-2" />
                </button>
                <button 
                  onClick={() => setShow(false)}
                  className="w-full py-5 bg-white border-2 border-slate-100 text-slate-500 rounded-3xl text-sm font-black uppercase tracking-widest hover:border-slate-300 transition-all italic"
                >
                   Dismiss
                </button>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
