"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Zap, User, FileText, Settings, Shield, Activity, X, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const togglePalette = useCallback(() => setIsOpen(open => !open), []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                togglePalette();
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePalette]);

    const results = [
        { id: '1', title: 'Ethan Hunt', type: 'Patient', icon: User, desc: 'Record #9021 | Critical' },
        { id: '2', title: 'Cardiac Lab Sync', type: 'Ops', icon: Activity, desc: 'Edge Node 4-B' },
        { id: '3', title: 'Crisis Protocol Alpha', type: 'Security', icon: Shield, desc: 'Bypass Consent' },
        { id: '4', title: 'Annual Claims Audit', type: 'Report', icon: FileText, desc: 'PDF Export Ready' },
    ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            {/* Search Bar */}
                            <div className="flex items-center p-6 border-b border-slate-100 dark:border-slate-800">
                                <Search className="w-6 h-6 text-slate-400 mr-4" />
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search patients, protocols, or clinical nodes... (⌘K)"
                                    className="flex-1 bg-transparent outline-none text-xl font-medium placeholder:text-slate-400"
                                />
                                <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400">
                                    <Command className="w-3 h-3" /> <span>K</span>
                                </div>
                            </div>

                            {/* Results Area */}
                            <div className="max-height-[60vh] overflow-y-auto p-4 custom-scrollbar">
                                {results.length > 0 ? (
                                    <div className="space-y-1">
                                        {results.map((res) => (
                                            <div
                                                key={res.id}
                                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-health-teal transition-colors">
                                                        <res.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm flex items-center gap-2">
                                                            {res.title}
                                                            <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase tracking-widest text-slate-400">{res.type}</span>
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-medium">{res.desc}</p>
                                                    </div>
                                                </div>
                                                <CornerDownLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium">No medical entities found matching your signal.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="flex gap-6">
                                    <span className="flex items-center gap-1.5"><CornerDownLeft className="w-3 h-3" /> Select</span>
                                    <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Navigate</span>
                                </div>
                                <div className="flex gap-4">
                                    <span>Esc to Close</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
