"use client";
import React from 'react';
import { motion } from 'framer-motion';
import useConfigStore from '@/store/useConfigStore';

export default function SovereignMesh() {
    const { isEmergencyOverride, crisisType } = useConfigStore();

    const getThemeColor = () => {
        if (isEmergencyOverride) {
            if (crisisType === 'mass-casualty') return 'hsla(var(--h-red), 80%, 50%, 0.15)';
            if (crisisType === 'pandemic') return 'hsla(30, 80%, 50%, 0.15)';
            return 'hsla(var(--h-red), 60%, 50%, 0.1)';
        }
        return 'hsla(var(--h-teal), 80%, 50%, 0.06)';
    };

    return (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-background transition-colors duration-1000">
            {/* Primary Bio-Mesh Gradient */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: ['-5%', '5%', '-5%'],
                    y: ['-5%', '5%', '-5%'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] blur-[120px] rounded-full"
                style={{ background: `radial-gradient(circle at center, ${getThemeColor()} 0%, transparent 60%)` }}
            />

            {/* Secondary Pulse */}
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                    x: ['10%', '-10%', '10%'],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] blur-[100px] rounded-full"
                style={{ background: `radial-gradient(circle at center, hsla(var(--h-purple), 60%, 50%, 0.04) 0%, transparent 50%)` }}
            />

            {/* Data-Stream Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] select-none dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
    );
}
