"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Hash, CheckCircle, XCircle, Search, ArrowLeft, ArrowRight, Activity, FileText, Lock, Unlock, Clock, Database, Cpu, Link2, ChevronRight, Loader2, AlertTriangle, Layers, Zap, Box, ShieldCheck } from 'lucide-react';
import { blockchainApi } from '@/lib/api';

const recordTypeConfig = {
    PRESCRIPTION: { label: 'Prescription', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600', icon: FileText },
    MEDICAL_RECORD: { label: 'Medical Record', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', icon: Database },
    CONSENT_GRANT: { label: 'Consent Grant', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', icon: Unlock },
    CONSENT_REVOKE: { label: 'Consent Revoke', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600', icon: Lock },
    APPOINTMENT: { label: 'Appointment', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', icon: Clock },
    PATIENT_REGISTRATION: { label: 'Registration', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600', icon: Activity },
    AUDIT_LOG: { label: 'Audit', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500', icon: Shield },
    EMERGENCY_ACCESS: { label: 'Emergency', color: 'bg-red-100 dark:bg-red-900/30 text-red-600', icon: Zap },
};

export default function BlockchainExplorerPage() {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [totalTx, setTotalTx] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const [searchHash, setSearchHash] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [filter, setFilter] = useState('');
    const [integrity, setIntegrity] = useState(null);

    // Fetch stats and initial transactions
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, integrityRes] = await Promise.all([
                    blockchainApi.getStats(),
                    blockchainApi.getIntegrity()
                ]);
                setStats(statsRes.stats);
                setIntegrity(integrityRes);
            } catch (err) {
                console.error('Failed to fetch blockchain data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch transactions when page or filter changes
    useEffect(() => {
        const fetchTx = async () => {
            try {
                setTxLoading(true);
                const params = { page, limit: 15 };
                if (filter) params.record_type = filter;
                const res = await blockchainApi.getTransactions(params);
                setTransactions(res.transactions || []);
                setTotalTx(res.total || 0);
                setTotalPages(res.totalPages || 1);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
            } finally {
                setTxLoading(false);
            }
        };
        fetchTx();
    }, [page, filter]);

    const handleVerify = async () => {
        if (!searchHash.trim()) return;
        try {
            setVerifying(true);
            setVerifyResult(null);
            const result = await blockchainApi.verify(searchHash.trim());
            setVerifyResult(result);
        } catch (err) {
            setVerifyResult({ verified: false, message: 'Hash not found in blockchain' });
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Blockchain Explorer</h1>
                            <p className="text-sm text-slate-500">Healthcare Immutable Ledger &middot; SHA-256 Chain</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                ) : (
                    <>
                        {/* Chain Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Blocks', value: stats?.totalBlocks || 0, icon: Box, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
                                { label: 'Chain Status', value: integrity?.valid ? 'Valid' : 'Invalid', icon: integrity?.valid ? ShieldCheck : AlertTriangle, gradient: integrity?.valid ? 'from-emerald-500 to-green-500' : 'from-rose-500 to-red-500', shadow: integrity?.valid ? 'shadow-emerald-500/20' : 'shadow-rose-500/20' },
                                { label: 'Last 24h', value: stats?.blocksLast24h || 0, icon: Activity, gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
                                { label: 'Difficulty', value: stats?.difficulty || 2, icon: Cpu, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20' },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-xl transition-all group">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</h2>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <s.icon className="w-6 h-6 text-white" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Record Type Stats */}
                        {stats?.typeCounts && Object.keys(stats.typeCounts).length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-8">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Blocks by Type</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(stats.typeCounts).map(([type, count]) => {
                                        const config = recordTypeConfig[type] || recordTypeConfig.AUDIT_LOG;
                                        const Icon = config.icon;
                                        return (
                                            <button key={type} onClick={() => setFilter(filter === type ? '' : type)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${filter === type ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                <Icon className="w-4 h-4 text-slate-500" />
                                                <div className="text-left">
                                                    <p className="text-xs font-medium text-slate-500">{config.label}</p>
                                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{count}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Verify Hash */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-8">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                                    <Search className="w-5 h-5 text-white" />
                                </div>
                                Verify Record Hash
                            </h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={searchHash}
                                    onChange={(e) => setSearchHash(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                    placeholder="Enter data hash or block hash to verify..."
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono"
                                />
                                <button onClick={handleVerify} disabled={verifying}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all disabled:opacity-50">
                                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                    Verify
                                </button>
                            </div>

                            <AnimatePresence>
                                {verifyResult && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className={`mt-4 p-4 rounded-xl border ${verifyResult.verified ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'}`}>
                                        <div className="flex items-center gap-3">
                                            {verifyResult.verified ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
                                            <div>
                                                <p className={`text-sm font-semibold ${verifyResult.verified ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                                    {verifyResult.message}
                                                </p>
                                                {verifyResult.block_number !== undefined && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Block #{verifyResult.block_number} &middot; {verifyResult.record_type} &middot; {new Date(verifyResult.timestamp).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Transaction List */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                        <Link2 className="w-5 h-5 text-white" />
                                    </div>
                                    Recent Blocks
                                    <span className="text-xs font-normal text-slate-400 ml-2">({totalTx} total)</span>
                                </h3>
                                {filter && (
                                    <button onClick={() => setFilter('')} className="text-xs text-violet-500 font-semibold flex items-center gap-1 hover:text-violet-600">
                                        Clear filter <XCircle className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {txLoading ? (
                                <div className="flex items-center justify-center py-16 text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading blocks...
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-16">
                                    <Box className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500">No blocks found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.map((tx, i) => {
                                        const config = recordTypeConfig[tx.record_type] || recordTypeConfig.AUDIT_LOG;
                                        const Icon = config.icon;
                                        return (
                                            <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                                className="p-4 md:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                onClick={() => setSelectedBlock(selectedBlock?.id === tx.id ? null : tx)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold text-slate-500">#{tx.block_number}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                                                                    <Icon className="w-3 h-3" />
                                                                    {config.label}
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    {new Date(tx.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-mono text-slate-400 truncate mt-1">
                                                                {tx.hash}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${selectedBlock?.id === tx.id ? 'rotate-90' : ''}`} />
                                                </div>

                                                <AnimatePresence>
                                                    {selectedBlock?.id === tx.id && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                            className="mt-4 ml-14 overflow-hidden">
                                                            <div className="space-y-2 text-xs">
                                                                <div className="flex gap-2"><span className="font-semibold text-slate-500 w-24">Block Hash:</span><code className="font-mono text-slate-600 dark:text-slate-300 break-all">{tx.hash}</code></div>
                                                                <div className="flex gap-2"><span className="font-semibold text-slate-500 w-24">Prev Hash:</span><code className="font-mono text-slate-600 dark:text-slate-300 break-all">{tx.previous_hash}</code></div>
                                                                <div className="flex gap-2"><span className="font-semibold text-slate-500 w-24">Data Hash:</span><code className="font-mono text-slate-600 dark:text-slate-300 break-all">{tx.data_hash}</code></div>
                                                                <div className="flex gap-2"><span className="font-semibold text-slate-500 w-24">Record ID:</span><code className="font-mono text-slate-600 dark:text-slate-300">{tx.record_id}</code></div>
                                                                <div className="flex gap-2"><span className="font-semibold text-slate-500 w-24">Nonce:</span><span className="text-slate-600 dark:text-slate-300">{tx.nonce}</span></div>
                                                                {tx.metadata?.summary && (
                                                                    <div className="flex gap-2"><span className="font-semibold text-slate-500 w-24">Summary:</span><span className="text-slate-600 dark:text-slate-300">{tx.metadata.summary}</span></div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors">
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chain Integrity Details */}
                        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${integrity?.valid ? 'from-emerald-500 to-green-500' : 'from-rose-500 to-red-500'} flex items-center justify-center`}>
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                Chain Integrity
                            </h3>
                            <div className={`p-4 rounded-xl border ${integrity?.valid ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'}`}>
                                <div className="flex items-center gap-3">
                                    {integrity?.valid ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
                                    <div>
                                        <p className={`font-semibold ${integrity?.valid ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                            {integrity?.message || 'Checking...'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {integrity?.totalBlocks || 0} blocks verified &middot; Last hash: <code className="font-mono">{integrity?.lastHash?.slice(0, 16)}...</code>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
