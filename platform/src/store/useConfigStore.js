import { create } from 'zustand';

/**
 * Feature Configuration Store (WHO-Grade Governance)
 * Enables national-scale flexibility by toggling core infrastructure modules.
 */
const useConfigStore = create((set, get) => ({
    // Pluggable Feature Toggles
    features: {
        ai: true,             // Clinical Decision Support
        blockchain: true,     // Verifiable Records & Provenance
        insurance: true,      // Claim Settlement Engine
        emergency: true,      // Real-time Response Systems
        wasteMgt: true,       // Bio-hazard Compliance
    },

    // Regional/Regulatory Deployment Profile
    profile: {
        region: "GLOBAL",      // e.g., "EU", "INDIA", "US"
        compliance: "HIPAA",   // e.g., "GDPR", "WHO-STD"
        offlineMode: true,     // Edge-runtime survival capability
    },

    // Governance Mode
    isEmergencyOverride: false,
    isAuditMode: false,
    crisisType: null, // 'mass-casualty', 'pandemic', etc.

    // Actions
    toggleEmergency: (status) => set({ isEmergencyOverride: status }),
    toggleAudit: (status) => set({ isAuditMode: status }),
    setAuditMode: (status) => set({ isAuditMode: status }),
    setEmergencyOverride: (status) => set({ isEmergencyOverride: status }),

    setCrisisMode: (type) => set({
        crisisType: type,
        isEmergencyOverride: type !== null
    }),

    updateFeature: (key, status) => set((state) => ({
        features: { ...state.features, [key]: status }
    })),


    // Feature Gate Check
    isFeatureEnabled: (key) => get().features[key] ?? false,
}));

export default useConfigStore;
