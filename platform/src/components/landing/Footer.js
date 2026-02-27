"use client";
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Heart, Send, ArrowRight, Shield } from 'lucide-react';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="relative bg-slate-900 text-slate-300 pt-20 pb-10 overflow-hidden">
            {/* Animated gradient top border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-[gradient-shift_3s_linear_infinite]" />

            {/* Background decoration */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Newsletter Section */}
                <div className="mb-16 p-8 md:p-12 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-md">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Stay Updated with Healthcare Innovation</h3>
                            <p className="text-sm text-slate-400">Get weekly insights on AI diagnostics, blockchain health records, and platform updates.</p>
                        </div>
                        <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3">
                            <div className="relative flex-1 md:w-72">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-teal-500/30 transition-all whitespace-nowrap"
                            >
                                {subscribed ? 'Subscribed!' : 'Subscribe'}
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div>
                        <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            HealthChain
                        </h3>
                        <p className="text-sm leading-relaxed mb-6 text-slate-400">
                            A global-scale blockchain and AI ecosystem designed to unify the healthcare journey across all stakeholders.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-500 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-600/30">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-slate-500/30">
                                <Github className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            {['Digital Health ID', 'AI Clinical Analysis', 'Smart Hospital Network', 'Inventory Validation', 'Telemedicine'].map((item, i) => (
                                <li key={i} className="group flex items-center gap-2 cursor-pointer">
                                    <ArrowRight className="w-3 h-3 text-teal-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    <span className="hover:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Security</h4>
                        <ul className="space-y-3 text-sm">
                            {['Blockchain Privacy', 'HIPAA Compliance', 'Emergency SLA', 'Data Encryption', 'Audit Logs'].map((item, i) => (
                                <li key={i} className="group flex items-center gap-2 cursor-pointer">
                                    <ArrowRight className="w-3 h-3 text-purple-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    <span className="hover:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                                    <Mail className="w-4 h-4 text-teal-400" />
                                </div>
                                <span className="text-slate-400 group-hover:text-white transition-colors">support@healthchain.org</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                                    <Phone className="w-4 h-4 text-teal-400" />
                                </div>
                                <span className="text-slate-400 group-hover:text-white transition-colors">+1 (800) HEALTH</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                                    <MapPin className="w-4 h-4 text-teal-400" />
                                </div>
                                <span className="text-slate-400 group-hover:text-white transition-colors">Digital Health Square</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p className="flex items-center gap-1">
                        © 2026 HealthChain Platform. Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for better healthcare.
                    </p>
                    <div className="flex gap-6 font-medium uppercase tracking-widest">
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Security</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Status</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
