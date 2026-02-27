"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const DashboardCard = ({ icon: Icon, title, description, href, colorClass = "health-teal" }) => {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass p-10 rounded-platinum cursor-pointer group transition-all duration-500 hover:shadow-2xl border-white/10 dark:hover:border-white/20"
            >
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}
                    style={{ background: `hsla(var(--h-${colorClass.replace('health-', '')}), var(--s-${colorClass.replace('health-', '')}), var(--l-${colorClass.replace('health-', '')}), 0.1)` }}>
                    <Icon className={`w-10 h-10`} style={{ color: `hsl(var(--h-${colorClass.replace('health-', '')}), var(--s-${colorClass.replace('health-', '')}), var(--l-${colorClass.replace('health-', '')}))` }} />
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl font-black tracking-tighter transition-colors group-hover:text-health-teal">
                        {title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                        {description}
                    </p>
                </div>

                <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 group-hover:text-health-teal transition-all duration-500">
                    Access Sovereign Node <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-2 transition-transform" />
                </div>

                {/* Particle Glow Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                    <Icon className="w-24 h-24" />
                </div>
            </motion.div>
        </Link>
    );
};


export default DashboardCard;
