import React, { createContext, useContext, useState, useEffect } from 'react';

const FeatureContext = createContext();

export const useFeatures = () => useContext(FeatureContext);

export const FeatureProvider = ({ children }) => {
    const [elderMode, setElderMode] = useState(
        localStorage.getItem('elderMode') === 'true'
    );
    const [language, setLanguage] = useState(
        localStorage.getItem('language') || 'en'
    );

    useEffect(() => {
        localStorage.setItem('elderMode', elderMode);
        if (elderMode) {
            document.body.classList.add('elder-mode');
        } else {
            document.body.classList.remove('elder-mode');
        }
    }, [elderMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    const toggleElderMode = () => setElderMode(prev => !prev);

    const changeLanguage = (lang) => setLanguage(lang);

    const value = {
        elderMode,
        toggleElderMode,
        language,
        changeLanguage,
        t: (key) => {
            // Simple translation helper
            const translations = {
                en: {
                    welcome: 'Welcome to Healthcare System',
                    emergency_sos: 'Emergency SOS',
                    book_appointment: 'Book Appointment',
                    my_prescriptions: 'My Prescriptions',
                    elder_mode_on: 'Disable Elder Friendly Mode',
                    elder_mode_off: 'Enable Elder Friendly Mode',
                    dashboard: 'Dashboard',
                    profile: 'Profile',
                    logout: 'Logout'
                },
                hi: {
                    welcome: 'स्वास्थ्य सेवा प्रणाली में आपका स्वागत है',
                    emergency_sos: 'आपातकालीन एसओएस',
                    book_appointment: 'अपॉइंटमेंट बुक करें',
                    my_prescriptions: 'मेरी नुस्खे',
                    elder_mode_on: 'वृद्ध अनुकूल मोड अक्षम करें',
                    elder_mode_off: 'वृद्ध अनुकूल मोड सक्षम करें',
                    dashboard: 'डैशबोर्ड',
                    profile: 'प्रोफ़ाइल',
                    logout: 'लॉग आउट'
                }
            };
            return translations[language]?.[key] || key;
        }
    };

    return (
        <FeatureContext.Provider value={value}>
            {children}
        </FeatureContext.Provider>
    );
};
