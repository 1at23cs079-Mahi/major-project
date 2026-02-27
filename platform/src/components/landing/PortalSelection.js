"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Stethoscope, Building2, AlertCircle, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

const portals = [
    {
        title: "Patient Dashboard",
        desc: "Access your medical history, health insights, and book appointments in a secure environment.",
        icon: User,
        href: "/patient",
        gradient: "from-teal-400 to-cyan-500",
        shadow: "group-hover:shadow-[0_20px_50px_-15px_rgba(20,184,166,0.5)]",
        iconBg: "bg-gradient-to-br from-teal-400 to-cyan-500"
    },
    {
        title: "Doctor Dashboard",
        desc: "Manage patient consultations, AI-driven insights, and secure prescription workflows.",
        icon: Stethoscope,
        href: "/doctor",
        gradient: "from-violet-500 to-purple-600",
        shadow: "group-hover:shadow-[0_20px_50px_-15px_rgba(139,92,246,0.5)]",
        iconBg: "bg-gradient-to-br from-violet-500 to-purple-600"
    },
    {
        title: "Hospital Dashboard",
        desc: "Optimize bed availability, track emergency inflow, and manage biomedical waste compliance.",
        icon: Building2,
        href: "/hospital",
        gradient: "from-blue-500 to-indigo-600",
        shadow: "group-hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.5)]",
        iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600"
    },
    {
        title: "Emergency Portal",
        desc: "Real-time ambulance tracking, incident reporting, and hospital routing decisions.",
        icon: AlertCircle,
        href: "/emergency",
        gradient: "from-rose-500 to-pink-600",
        shadow: "group-hover:shadow-[0_20px_50px_-15px_rgba(244,63,94,0.5)]",
        iconBg: "bg-gradient-to-br from-rose-500 to-pink-600"
    },
    {
        title: "Insurance Portal",
        desc: "Automate policy verification, claim settlements, and fraud prevention through blockchain.",
        icon: ShieldCheck,
        href: "/insurance",
        gradient: "from-amber-400 to-orange-500",
        shadow: "group-hover:shadow-[0_20px_50px_-15px_rgba(251,191,36,0.5)]",
        iconBg: "bg-gradient-to-br from-amber-400 to-orange-500"
    }
];

const PortalSelection = () => {
    return (
        <section className="py-24 relative overflow-hidden" id="portals">
            {/* Animated background blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                    className="absolute top-20 left-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
                    transition={{ duration: 12, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.span 
                        className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-xs font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase bg-purple-100 dark:bg-purple-900/50 rounded-full"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Sparkles className="w-4 h-4" />
                        Portals
                    </motion.span>
                    <motion.h2 
                        className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500">Healthcare Portal</span>
                    </motion.h2>
                    <motion.p 
                        className="text-slate-500 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        Select the appropriate gateway to access the platform's specialized features and services.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portals.map((portal, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={portal.href}>
                                <motion.div
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`group relative p-8 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all duration-500 ${portal.shadow} overflow-hidden cursor-pointer h-full`}
                                >
                                    {/* Background gradient on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                    
                                    {/* Animated border */}
                                    <div className={`absolute -inset-[1px] bg-gradient-to-r ${portal.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                                    <div className="absolute inset-[1px] bg-white dark:bg-slate-800 rounded-[22px] -z-[5]" />
                                    
                                    {/* Icon */}
                                    <div className={`relative w-16 h-16 ${portal.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        <portal.icon className="w-8 h-8 text-white" />
                                        {/* Glow effect */}
                                        <div className={`absolute inset-0 ${portal.iconBg} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
                                    </div>
                                    
                                    {/* Content */}
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all">
                                        {portal.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{portal.desc}</p>
                                    
                                    {/* CTA */}
                                    <div className={`flex items-center gap-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${portal.gradient}`}>
                                        <span>Enter Portal</span>
                                        <ArrowRight className={`w-4 h-4 text-current opacity-70 group-hover:translate-x-2 transition-transform`} style={{ color: 'currentColor' }} />
                                    </div>
                                    
                                    {/* Shine effect */}
                                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-full transition-all duration-1000 ease-out" />
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PortalSelection;
