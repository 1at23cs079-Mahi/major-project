"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

export default function ProgressiveDisclosure({
    title,
    preview,
    children,
    defaultExpanded = false,
    role = "standard" // clinical, etc.
}) {
    const [isOpen, setIsOpen] = useState(defaultExpanded);

    return (
        <div className={`glass rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all ${isOpen ? 'ring-1 ring-health-teal/20' : ''}`}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
            >
                <div className="flex-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{title}</h4>
                    {!isOpen && (
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-md">{preview}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {isOpen ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-health-teal" />}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
