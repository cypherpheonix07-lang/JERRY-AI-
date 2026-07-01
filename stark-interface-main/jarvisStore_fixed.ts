// Corrected jarvisStore.ts with proper guardrailStatus initialization
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuardrailStatus {
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

interface AlertItem {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  timestamp: string;
}

interface SecurityState {
  alerts: AlertItem[];
  guardrailStatus: GuardrailStatus[]; // <-- This is properly typed and initialized
}

interface JARVISState {
  // ... other state slices (dashboard, sensors, ops, etc.)
  security: SecurityState;
  // ... other actions
}

const useJarvisStore = create<JARVISState>()(
  persist(
    (set) => ({
      // ... initial state for other slices
      security: {
        alerts: [],
        guardrailStatus: [ // <-- Properly initialized as an array
          {
            name: 'Encryption Layer',
            description: 'AES-256 encryption active',
            status: 'active'
          },
          {
            name: 'Firewall',
            description: 'Next-gen firewall monitoring',
            status: 'active'
          },
          {
            name: 'Intrusion Detection',
            description: 'Real-time threat monitoring',
            status: 'active'
          }
        ],
      },
      // ... your existing actions
    }),
    {
      name: 'jarvis-store',
    }
  )
);

// Selector for SecurityPage
export const useSecurityState = () => {
  const security = useJarvisStore(state => state.security);
  return { security };
};

export default useJarvisStore;