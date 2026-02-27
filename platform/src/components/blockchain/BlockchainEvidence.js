"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Database, Link as LinkIcon, Cpu, Check, Terminal, Loader2, Box, Activity, XCircle } from 'lucide-react';
import { blockchainApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

const BlockchainEvidence = ({ dataId, recordType = "Medical Record" }) => {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(false);
    const [step, setStep] = useState(0);
    const [chainStats, setChainStats] = useState(null);
    const [integrity, setIntegrity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verificationResult, setVerificationResult] = useState(null);

    const logs = [
        "Connecting to Healthcare Blockchain Ledger...",
        "Resolving chain integrity...",
        "Verifying block hashes with SHA-256...",
        "Validating chain link sequence...",
        "Integrity verification complete."
    ];

    // Fetch real chain stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [statsRes, integrityRes] = await Promise.all([
                    blockchainApi.getStats(),
                    blockchainApi.getIntegrity()
                ]);
                setChainStats(statsRes.stats);
                setIntegrity(integrityRes);
            } catch (err) {
                console.error('Failed to fetch blockchain stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const startVerification = async () => {
        setIsVerifying(true);
        setStep(0);
        setVerificationResult(null);

        // Animate through verification steps
        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < logs.length - 1) {
                currentStep++;
                setStep(currentStep);
            } else {
                clearInterval(interval);
            }
        }, 700);

        // Run actual verification in parallel
        try {
            const result = await blockchainApi.getIntegrity();
            setVerificationResult(result);
            setIntegrity(result);
        } catch (err) {
            setVerificationResult({ valid: false, message: 'Verification failed' });
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-3" />
                <span className="text-sm text-slate-500">Loading blockchain data...</span>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-800/50 dark:to-violet-900/10 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-violet-500" />
                        <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">Blockchain Ledger</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Immutable Record Provenance</h3>
                </div>
                {!isVerifying ? (
                    <button
                        onClick={startVerification}
                        className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all hover:scale-105"
                    >
                        <ShieldCheck className="w-4 h-4" /> Verify Chain
                    </button>
                ) : (
                    <div className="px-4 py-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl border border-violet-200 dark:border-violet-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Verifying...</span>
                    </div>
                )}
            </div>

            {/* Chain Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total Blocks', value: chainStats?.totalBlocks || 0, icon: Box, color: 'text-violet-500' },
                    { label: 'Chain Status', value: integrity?.valid ? 'Valid' : 'Invalid', icon: integrity?.valid ? ShieldCheck : XCircle, color: integrity?.valid ? 'text-emerald-500' : 'text-rose-500' },
                    { label: 'Last 24h', value: chainStats?.blocksLast24h || 0, icon: Activity, color: 'text-blue-500' },
                    { label: 'Difficulty', value: chainStats?.difficulty || 2, icon: Cpu, color: 'text-amber-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Latest Block Hash</p>
                        <code className="text-xs font-mono text-violet-600 dark:text-violet-400 break-all">
                            {chainStats?.lastBlockHash || 'No blocks yet'}
                        </code>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Last Block Number</p>
                        <code className="text-xs font-mono text-slate-600 dark:text-slate-300">
                            #{chainStats?.lastBlockNumber || 0}
                        </code>
                        {chainStats?.lastBlockTime && (
                            <span className="text-[10px] text-slate-400 ml-3">
                                {new Date(chainStats.lastBlockTime).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Verification Steps</p>
                        <div className="space-y-2.5">
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0.3 }}
                                    animate={{
                                        opacity: isVerifying && i <= step ? 1 : 0.3,
                                    }}
                                    className="flex items-center gap-2.5"
                                >
                                    {isVerifying && i < step ? (
                                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                    ) : (
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isVerifying && i === step ? 'bg-violet-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                    )}
                                    <span className={`text-[11px] font-medium font-mono ${isVerifying && i === step ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
                                        {log}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <AnimatePresence>
                        {isVerifying && step === logs.length - 1 && verificationResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-4 flex items-center gap-2.5 p-3 rounded-xl border ${
                                    verificationResult.valid
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                        : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                                }`}
                            >
                                <Terminal className={`w-4 h-4 ${verificationResult.valid ? 'text-emerald-500' : 'text-rose-500'}`} />
                                <div>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${verificationResult.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {verificationResult.valid ? 'Chain Integrity Verified' : 'Chain Integrity Failed'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {verificationResult.totalBlocks || 0} blocks verified
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => router.push('/blockchain')}
                    className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 hover:text-violet-500 transition-colors"
                >
                    <LinkIcon className="w-3 h-3" /> Open Block Explorer
                </button>
            </div>
        </div>
    );
};

export default BlockchainEvidence;
