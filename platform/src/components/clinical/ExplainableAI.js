"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Info, ShieldCheck, ExternalLink, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExplainableAI({ recommendation, confidence, sources = [] }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getConfidenceColor = (score) => {
        if (score > 90) return 'text-emerald-500';
        if (score > 70) return 'text-teal-500';
        return 'text-amber-500';
    };

    const getConfidenceGradient = (score) => {
        if (score > 90) return 'from-emerald-500 to-teal-500';
        if (score > 70) return 'from-teal-500 to-cyan-500';
        return 'from-amber-500 to-orange-500';
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-20 h-20" />
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Clinical Reasoning</h4>
                        <p className="text-xs text-violet-500">XAI Engine</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">Confidence</p>
                    <p className={`text-xl font-bold ${getConfidenceColor(confidence)}`}>{confidence}%</p>
                </div>
            </div>

            <div className="mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {recommendation}
                </p>
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-slate-500 hover:text-violet-500 transition-colors"
            >
                <span>View Sources</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Based on <span className="font-semibold">National Medical Protocol v4.2</span> and patient history.
                                </p>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                                <p className="text-xs text-slate-500 mb-2">Supporting Evidence</p>
                                <div className="space-y-2">
                                    {sources.length > 0 ? sources.map((source, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ x: 2 }}
                                            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                                    <ExternalLink className="w-3 h-3 text-violet-500" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{source}</span>
                                            </div>
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        </motion.div>
                                    )) : (
                                        <div className="text-xs text-slate-400 italic">No external sources cited.</div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    AI advisory only. Clinical validation required.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
