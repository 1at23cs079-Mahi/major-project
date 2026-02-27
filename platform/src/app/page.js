"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from '@/components/landing/Hero';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import PortalSelection from '@/components/landing/PortalSelection';
import Footer from '@/components/landing/Footer';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/useAuthStore';
import { Sparkles, ArrowRight, Menu, X, Heart } from 'lucide-react';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const { isAuthenticated, getDashboardPath } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'Portals', href: '#portals' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-health-teal selection:text-white">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Navbar */}
      <motion.nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6">
          <div className="h-16 md:h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-shadow">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                  Health<span className="text-teal-500">Chain</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Healthcare Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((item, i) => (
                <a 
                  key={i}
                  href={item.href} 
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link href={getDashboardPath()}>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all">
                    <Sparkles className="w-4 h-4" />
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-900/20">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
            >
              <div className="container mx-auto px-6 py-4 space-y-2">
                {navLinks.map((item, i) => (
                  <a 
                    key={i}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all font-medium"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {isAuthenticated ? (
                    <Link href={getDashboardPath()}>
                      <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl">
                        <Sparkles className="w-4 h-4" />
                        Dashboard
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login">
                        <button className="w-full px-5 py-3 text-slate-600 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          Sign In
                        </button>
                      </Link>
                      <Link href="/auth/register">
                        <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl">
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main>
        <Hero />
        <div id="features">
          <FeatureShowcase />
        </div>
        <PortalSelection />

        {/* Call to action section */}
        <section className="py-24 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-blue-600 to-purple-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          {/* Floating shapes */}
          <motion.div 
            className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/2 right-1/4 w-16 h-16 bg-pink-400/20 rounded-full blur-xl"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold text-white mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">secure the future</span> of health?
            </motion.h2>
            <motion.p 
              className="text-white/90 max-w-2xl mx-auto mb-12 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join the unified ecosystem today and experience a healthcare platform powered by decentralized intelligence and human-centric design.
            </motion.p>
            <motion.button 
              className="group relative bg-white text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-purple-600 px-10 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.5)] transition-all active:scale-95 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                ✨ Request a Demo
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
