"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, Bell, User, LayoutDashboard,
    Stethoscope, ShieldAlert, Activity, Search,
    Settings, LogOut, ChevronRight, Command, Wifi, ShieldCheck, Heart, Sparkles
} from 'lucide-react';
import useConfigStore from '@/store/useConfigStore';
import useAuthStore from '@/store/useAuthStore';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import CommandPalette from '@/components/ui/CommandPalette';
import SovereignMesh from '@/components/layout/SovereignMesh';

// Role-specific gradient configurations
const roleGradients = {
    patient: { from: 'from-teal-500', to: 'to-cyan-500', shadow: 'shadow-teal-500/20', text: 'text-teal-500', bg: 'bg-teal-500', hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/20' },
    doctor: { from: 'from-violet-500', to: 'to-purple-600', shadow: 'shadow-purple-500/20', text: 'text-purple-500', bg: 'bg-purple-500', hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
    hospital: { from: 'from-blue-500', to: 'to-indigo-600', shadow: 'shadow-blue-500/20', text: 'text-blue-500', bg: 'bg-blue-500', hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    emergency: { from: 'from-rose-500', to: 'to-pink-600', shadow: 'shadow-rose-500/20', text: 'text-rose-500', bg: 'bg-rose-500', hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/20' },
    insurance: { from: 'from-amber-500', to: 'to-orange-500', shadow: 'shadow-amber-500/20', text: 'text-amber-500', bg: 'bg-amber-500', hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/20' },
    admin: { from: 'from-slate-600', to: 'to-slate-800', shadow: 'shadow-slate-500/20', text: 'text-slate-600', bg: 'bg-slate-600', hover: 'hover:bg-slate-50 dark:hover:bg-slate-800/50' },
};

const DashboardShell = ({ children, role = "patient", sidebarItems = [] }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const { isEmergencyOverride, isAuditMode } = useConfigStore();
    const pathname = usePathname();
    const router = useRouter();
    const gradient = roleGradients[role] || roleGradients.patient;

    // User data and greeting
    const { user } = useAuthStore();
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };
    const breadcrumbs = pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '));

    // Unified Sidebar Configuration
    const defaultItems = [
        { name: 'Dashboard', href: `/${role}`, icon: LayoutDashboard },
        { name: 'Profile', href: `/${role}/profile`, icon: User },
        { name: 'Security', href: `/${role}/security`, icon: ShieldAlert },
    ];

    const items = sidebarItems.length > 0 ? sidebarItems : defaultItems;

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${isEmergencyOverride ? 'state-emergency' : 'bg-slate-50 dark:bg-slate-950'
            } ${isAuditMode ? 'border-[4px] border-audit-slate' : ''}`}>

            <SovereignMesh />
            <CommandPalette />


            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 relative z-30 hidden md:flex flex-col shadow-xl"
            >
                {/* Sidebar gradient accent */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient.from} ${gradient.to}`} />
                
                <div className="p-6 flex items-center justify-between mb-4">
                    <Link href="/" className="font-bold flex items-center gap-3 overflow-hidden group">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center shadow-lg ${gradient.shadow} group-hover:scale-110 transition-transform`}>
                            <Heart className="w-5 h-5 text-white" fill="white" />
                        </div>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col"
                            >
                                <span className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                                    Health<span className={gradient.text}>Chain</span>
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{role} Portal</span>
                            </motion.div>
                        )}
                    </Link>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        {isSidebarOpen ? <X className="w-4 h-4 text-slate-400" /> : <Menu className="w-4 h-4 text-slate-400" />}
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {items.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={i} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${isActive 
                                        ? `bg-gradient-to-r ${gradient.from} ${gradient.to} text-white shadow-lg ${gradient.shadow}` 
                                        : `text-slate-600 dark:text-slate-400 ${gradient.hover}`
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 shrink-0" />
                                    {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                                    {isActive && isSidebarOpen && <ChevronRight className="ml-auto w-4 h-4" />}
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <button
                        onClick={() => useConfigStore.getState().setAuditMode(!isAuditMode)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isAuditMode ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <ShieldCheck className={`w-5 h-5 ${isAuditMode ? 'animate-pulse' : ''}`} />
                        {isSidebarOpen && <span className="font-medium text-sm">Audit Mode</span>}
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
                    </button>
                </div>

            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Urgent Alert Banner (Mass Casualty/Emergency Mode) */}
                {isEmergencyOverride && (
                    <motion.div 
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-2 px-6 flex justify-between items-center"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                            Emergency System Protocol Active - Priority Level 1
                        </span>
                        <span className="text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full uppercase">Crisis UX Mode</span>
                    </motion.div>
                )}

                {/* Audit Mode Banner */}
                {isAuditMode && (
                    <div className="bg-slate-800 text-white py-2 px-6 text-center text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3 inline mr-2" />
                        Regulatory Audit Mode Session - All interactions logged & provenance frozen
                    </div>
                )}

                {/* Global Header */}
                <header className="h-16 md:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shadow-sm">
                    <div className="flex-1 md:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div
                        onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'k',
                                metaKey: true,
                                ctrlKey: true,
                                bubbles: true
                            });
                            window.dispatchEvent(event);
                        }}
                        className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl w-80 transition-all hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer group"
                    >
                        <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-500" />
                        <span className="text-sm text-slate-400 flex-1">Search...</span>
                        <kbd className="text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">⌘K</kbd>
                    </div>

                    {/* Version Badge */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <div className={`w-2 h-2 rounded-full ${gradient.bg} shadow-sm`} />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">v2.4</span>
                    </div>


                    <div className="flex items-center gap-3">
                        {/* Mesh Status */}
                        <div className="hidden xl:flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="relative">
                                <Wifi className="w-4 h-4 text-emerald-500" />
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
                        </div>

                        <button className="relative p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>
                        
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                        
                        <div className="flex items-center gap-3 pl-2">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center text-white font-bold text-sm shadow-lg ${gradient.shadow}`}>
                                {user?.firstName?.[0]?.toUpperCase() || role.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.firstName || role}</p>
                                <p className="text-[10px] text-slate-400 font-medium capitalize">{role} Portal</p>
                            </div>
                        </div>
                    </div>

                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 selection:bg-health-teal selection:text-white relative bg-slate-50 dark:bg-slate-950">
                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 1 && (
                        <div className="flex items-center gap-2 mb-6 text-xs font-medium relative z-10">
                            {breadcrumbs.map((crumb, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                                    <span className={i === breadcrumbs.length - 1 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>{crumb}</span>
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Background gradient */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-full blur-[100px] opacity-10`} />
                        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-full blur-[100px] opacity-10`} />
                    </div>
                    
                    {/* Crisis Mesh Pulse */}
                    {isEmergencyOverride && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emergency-red/5 rounded-full blur-[120px] animate-pulse" />
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="container mx-auto relative z-10"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Responsive Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardShell;

