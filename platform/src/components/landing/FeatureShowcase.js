"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
    Dna, Brain, BookOpen, Hotel, Navigation,
    MapPin, Radio, Pill, FileText, Trash2, CalendarCheck
} from 'lucide-react';

const features = [
    { icon: Dna, title: "Decentralized Health Identity", desc: "Blockchain-secured digital IDs for unified patient access.", gradient: "from-teal-400 to-cyan-500" },
    { icon: Brain, title: "AI Clinical Decision Support", desc: "Intelligent analysis of treatments for safer medical outcomes.", gradient: "from-violet-500 to-purple-600" },
    { icon: BookOpen, title: "Blockchain Rx Management", desc: "Tamper-proof prescriptions and medication history.", gradient: "from-blue-500 to-indigo-600" },
    { icon: Hotel, title: "Cross-Hospital Availability", desc: "Real-time tracking of beds, ICU, and specialists across the network.", gradient: "from-pink-500 to-rose-500" },
    { icon: Navigation, title: "Smart Hospital Routing", desc: "Automated patient routing based on facility capacity and proximity.", gradient: "from-amber-400 to-orange-500" },
    { icon: MapPin, title: "Real-Time Emergency Reporting", desc: "Instant incident logging for accidents and medical emergencies.", gradient: "from-red-500 to-pink-600" },
    { icon: Radio, title: "Ambulance SLA Monitoring", desc: "Live tracking and response time optimization for emergency units.", gradient: "from-emerald-400 to-teal-500" },
    { icon: Pill, title: "Pharmacy Validation", desc: "Secure medicine dispense tracking and inventory validation.", gradient: "from-lime-400 to-green-500" },
    { icon: FileText, title: "Smart Claim Settlement", desc: "Automated insurance verification and fraud-resistant claims.", gradient: "from-sky-400 to-blue-500" },
    { icon: Trash2, title: "Bio-Waste Management", desc: "End-to-end tracking of hazardous medical waste disposal.", gradient: "from-slate-400 to-slate-600" },
    { icon: CalendarCheck, title: "AI Patient Follow-Up", desc: "Intelligent reminders and treatment continuity monitoring.", gradient: "from-fuchsia-500 to-purple-600" }
];

const FeatureShowcase = () => {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
            </div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.span 
                        className="inline-block px-4 py-1 mb-4 text-xs font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase bg-teal-100 dark:bg-teal-900/50 rounded-full"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Features
                    </motion.span>
                    <motion.h2 
                        className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Core Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500">Intelligence</span>
                    </motion.h2>
                    <motion.p 
                        className="text-slate-500 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        Powering the next generation of healthcare through decentralized trust and artificial intelligence.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-transparent transition-all shadow-sm hover:shadow-2xl overflow-hidden"
                        >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                            
                            {/* Animated border gradient */}
                            <div className={`absolute -inset-[1px] bg-gradient-to-r ${f.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm`} />
                            
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                <f.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-purple-500 transition-all">{f.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            
                            {/* Shine effect */}
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-700 ease-in-out" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
