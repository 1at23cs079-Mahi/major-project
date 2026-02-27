"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import useConfigStore from '@/store/useConfigStore';

const MedicalAccessibilityContext = createContext();

export const MedicalAccessibilityProvider = ({ children }) => {
    const { isEmergencyOverride } = useConfigStore();
    const [isStressSafe, setIsStressSafe] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        // Automatically enable stress-safe mode during emergency overrides
        if (isEmergencyOverride) {
            setIsStressSafe(true);
            setReduceMotion(true);
            document.documentElement.classList.add('stress-safe-ui');
            document.documentElement.classList.add('reduce-motion');
        } else {
            setIsStressSafe(false);
            setReduceMotion(false);
            document.documentElement.classList.remove('stress-safe-ui');
            document.documentElement.classList.remove('reduce-motion');
        }
    }, [isEmergencyOverride]);

    return (
        <MedicalAccessibilityContext.Provider value={{ isStressSafe, reduceMotion }}>
            <div className={`${isStressSafe ? 'high-contrast' : ''} ${reduceMotion ? 'no-animations' : ''}`}>
                {children}
            </div>
        </MedicalAccessibilityContext.Provider>
    );
};

export const useMedicalA11y = () => useContext(MedicalAccessibilityContext);
