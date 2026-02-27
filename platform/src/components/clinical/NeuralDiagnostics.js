"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Activity, Maximize2, Filter, Zap, Target, Loader2, AlertCircle } from 'lucide-react';

const NeuralDiagnostics = ({ imageUrl = "/medical-sample.jpg" }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeFilter, setActiveFilter] = useState('neural');
    const [showHotspots, setShowHotspots] = useState(false);

    const startDiagnostics = () => {
        setIsScanning(true);
        setProgress(0);
        setShowHotspots(false);
    };

    useEffect(() => {
        if (isScanning && progress < 100) {
            const timer = setTimeout(() => setProgress(p => p + 2), 50);
            return () => clearTimeout(timer);
        } else if (progress >= 100) {
            setIsScanning(false);
            setShowHotspots(true);
        }
    }, [isScanning, progress]);

    const filters = [
        { id: 'neural', label: 'Neural Reconstruction', icon: Zap },
        { id: 'contrast', label: 'High-Contrast', icon: Filter },
        { id: 'bone', label: 'Bone Density', icon: Activity },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-violet-500">
                        <Scan className="w-4 h-4" /> Neural Processor v4.2
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Diagnostic Studio</h3>
                </div>
                <div className="flex gap-2">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`p-2.5 rounded-lg transition-all ${activeFilter === f.id ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-violet-500'}`}
                        >
                            <f.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </header>

            {/* Image Canvas */}
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                {/* Simulated Medical Image (Placeholder) */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                    <div className="w-full h-full opacity-40 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 70%)' }} />
                    <Target className="w-10 h-10 text-violet-500/30 animate-pulse" />
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                {/* Processing Overlay */}
                <AnimatePresence>
                    {isScanning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                        >
                            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                            <p className="text-xs font-medium text-white mb-3">Enhancing Medical Image...</p>
                            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-violet-400">{progress}%</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hotspots (Findings) */}
                {showHotspots && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-1/3 left-1/2 w-24 h-24 border-2 border-dashed border-rose-500 rounded-full flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
                            <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded absolute -top-2">Anomaly</div>
                        </motion.div>
                    </div>
                )}

                {/* Metadata HUD */}
                <div className="absolute bottom-4 left-4 p-3 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10 pointer-events-none hidden md:block">
                    <p className="text-[10px] text-slate-400 mb-1">Patient Metadata</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <div>
                            <p className="text-[9px] text-slate-500">Slice Depth</p>
                            <p className="text-xs font-semibold text-white">12.4 mm</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500">Confidence</p>
                            <p className="text-xs font-semibold text-violet-400">98.2%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="flex justify-between items-center mt-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={startDiagnostics}
                        disabled={isScanning}
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
                    >
                        {isScanning ? 'Scanning...' : 'Execute Neural Scan'}
                    </button>
                    {!showHotspots && !isScanning && (
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-500">
                            <AlertCircle className="w-4 h-4" /> Ready
                        </div>
                    )}
                </div>
                <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <Maximize2 className="w-4 h-4 text-slate-500" />
                </button>
            </div>
        </div>
    );
};

export default NeuralDiagnostics;
