"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Shield, Activity, Plus, Ambulance, Lock, ArrowRight, Sparkles, Heart, Users, Building2, Clock, TrendingUp, Zap, CheckCircle } from 'lucide-react';

// Animated counter component
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;
        let start = 0;
        const end = parseFloat(target);
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start * 10) / 10);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration, hasStarted]);

    useEffect(() => {
        const timeout = setTimeout(() => setHasStarted(true), 800);
        return () => clearTimeout(timeout);
    }, []);

    return <span>{typeof target === 'number' && target % 1 !== 0 ? count.toFixed(1) : Math.floor(count)}{suffix}</span>;
};

// Typewriter cycling effect
const TypewriterText = ({ words, className }) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [words.length]);

    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={index}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.5 }}
                className={className}
            >
                {words[index]}
            </motion.span>
        </AnimatePresence>
    );
};

const Hero = () => {
    const dashboards = [
        { name: 'Patient Portal', href: '/patient', icon: Heart, color: 'from-teal-400 to-cyan-500', shadow: 'shadow-teal', glow: 'hover:shadow-[0_0_40px_-5px_rgba(20,184,166,0.6)]' },
        { name: 'Doctor Portal', href: '/doctor', icon: Activity, color: 'from-violet-500 to-purple-600', shadow: 'shadow-purple', glow: 'hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.6)]' },
        { name: 'Hospital Portal', href: '/hospital', icon: Plus, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue', glow: 'hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.6)]' },
        { name: 'Emergency Portal', href: '/emergency', icon: Ambulance, color: 'from-rose-500 to-pink-600', shadow: 'shadow-pink', glow: 'hover:shadow-[0_0_40px_-5px_rgba(244,63,94,0.6)]' },
        { name: 'Insurance Portal', href: '/insurance', icon: Shield, color: 'from-amber-400 to-orange-500', shadow: 'shadow-[0_10px_40px_-10px_rgba(249,115,22,0.4)]', glow: 'hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.6)]' },
    ];

    const stats = [
        { label: 'Active Patients', value: 10000, suffix: '+', icon: Users, color: 'text-teal-500' },
        { label: 'Verified Doctors', value: 500, suffix: '+', icon: Activity, color: 'text-purple-500' },
        { label: 'Platform Uptime', value: 99.9, suffix: '%', icon: Clock, color: 'text-blue-500' },
        { label: 'Partner Hospitals', value: 50, suffix: '+', icon: Building2, color: 'text-pink-500' },
    ];

    const highlights = [
        { text: 'HIPAA Compliant', icon: CheckCircle },
        { text: 'Blockchain Secured', icon: Lock },
        { text: 'AI-Powered', icon: Zap },
        { text: 'Real-Time Analytics', icon: TrendingUp },
    ];

    return (
        <section className="relative pt-32 pb-24 overflow-hidden selection:bg-health-teal selection:text-white">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-teal-400/25 to-cyan-500/25 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/25 to-purple-600/25 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], x: [0, 30, 0], y: [0, -50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute -bottom-20 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-pink-500/15 to-rose-500/15 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-teal-400/30 rounded-full"
                        style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                        animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                    />
                ))}
            </div>

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

            <div className="container mx-auto px-6 text-center relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.span
                        className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/40 rounded-full border border-teal-200/50 dark:border-teal-800/50 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                        </span>
                        <span>Trusted by 10,000+ Healthcare Professionals</span>
                    </motion.span>

                    {/* Main Headline with Typewriter */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
                        <span className="text-slate-800 dark:text-slate-100">The Future of</span>
                        <br />
                        <span className="relative inline-flex h-[1.2em] items-center justify-center">
                            <TypewriterText
                                words={['Healthcare', 'Medicine', 'Wellness', 'Patient Care']}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"
                            />
                        </span>
                        <br />
                        <span className="text-slate-800 dark:text-slate-100">is Here</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Secure, AI-powered healthcare management connecting patients, doctors, and hospitals in one intelligent blockchain ecosystem.
                    </p>

                    {/* Trust Highlights */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {highlights.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300"
                            >
                                <item.icon className="w-3.5 h-3.5 text-teal-500" />
                                {item.text}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Dashboard Portal Buttons */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-4 mb-20"
                >
                    {dashboards.map((db, i) => (
                        <Link key={i} href={db.href}>
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`group relative px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${db.shadow} ${db.glow}`}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl bg-gradient-to-r ${db.color} transition-opacity duration-200`} />
                                <div className={`p-2 rounded-xl bg-gradient-to-r ${db.color} text-white relative z-10 group-hover:scale-110 transition-transform duration-200`}>
                                    <db.icon className="w-4 h-4" />
                                </div>
                                <span className="relative z-10 text-slate-700 dark:text-slate-200 group-hover:text-white transition-colors duration-200">{db.name}</span>
                                <ArrowRight className="w-4 h-4 relative z-10 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                            </motion.button>
                        </Link>
                    ))}
                </motion.div>

                {/* Live Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, scale: 1.03 }}
                            className="relative group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all"
                        >
                            <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                            <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-1">
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                            </p>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent transition-all duration-500" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12"
                >
                    {[
                        { label: "WHO-Platinum Standard", color: "text-teal-500" },
                        { label: "AES-GCM-256 Encrypted", color: "text-blue-500" },
                        { label: "P2P Sovereign Network", color: "text-purple-500" },
                        { label: "HIPAA Certified", color: "text-emerald-500" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className={`text-[10px] font-black tracking-[0.25em] uppercase ${item.color} opacity-60 hover:opacity-100 transition-opacity cursor-default`}
                            whileHover={{ scale: 1.1 }}
                        >
                            {item.label}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
