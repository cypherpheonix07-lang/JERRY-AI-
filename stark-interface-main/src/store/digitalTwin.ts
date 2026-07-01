/**
 * Digital Twin Store - Zustand store for user state model
 * Tracks all aspects of user state for prediction and adaptation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserState {
  // Current moment metrics
  cognitiveLoad: number;      // 0-1, estimated from typing speed + errors
  energyLevel: number;        // 0-1, from time of day + patterns
  focusDepth: number;         // 0-1, from session length + complexity
  emotionalValence: number;   // -1 to +1, sentiment of messages
  stressIndex: number;        // 0-1, from response time + errors + rPPG
  heartRate: number;          // BPM from rPPG (if available)

  // Learned patterns over time
  peakHours: number[];        // hours (0-23) when most productive
  topicClusters: string[][];  // groups of related topics user thinks about
  decisionStyle: string;      // 'analytical' | 'intuitive' | 'collaborative'
  communicationTone: string;  // 'formal' | 'casual' | 'technical' | 'creative'

  // Predictions
  nextLikelyQuery: string;    // predicted next question
  nextLikelyTask: string;     // predicted next task creation
  todayMoodForecast: string;  // emotional arc prediction
  weekPriorityForecast: string; // what will dominate week

  // Metadata
  lastUpdated: number;
  learningDays: number;
  patternCount: number;
}

interface DigitalTwinStore extends UserState {
  // State updates
  updateCognitiveLoad: (load: number) => void;
  updateEnergyLevel: (energy: number) => void;
  updateFocusDepth: (depth: number) => void;
  updateEmotionalValence: (valence: number) => void;
  updateStressIndex: (stress: number) => void;
  updateHeartRate: (bpm: number) => void;

  // Pattern updates
  updatePeakHours: (hours: number[]) => void;
  updateDecisionStyle: (style: string) => void;
  updateCommunicationTone: (tone: string) => void;
  addTopicCluster: (topics: string[]) => void;

  // Prediction updates
  updatePredictions: (predictions: {
    nextQuery?: string;
    nextTask?: string;
    moodForecast?: string;
    priorityForecast?: string;
  }) => void;

  // Batch update
  updateTwinState: (partial: Partial<UserState>) => void;

  // Reset
  resetTwin: () => void;
}

const DEFAULT_USER_STATE: UserState = {
  cognitiveLoad: 0.5,
  energyLevel: 0.5,
  focusDepth: 0.5,
  emotionalValence: 0,
  stressIndex: 0.5,
  heartRate: 0,
  
  peakHours: [9, 10, 11, 14, 15, 16],
  topicClusters: [],
  decisionStyle: 'analytical',
  communicationTone: 'technical',
  
  nextLikelyQuery: '',
  nextLikelyTask: '',
  todayMoodForecast: '',
  weekPriorityForecast: '',
  
  lastUpdated: Date.now(),
  learningDays: 0,
  patternCount: 0,
};

export const useDigitalTwinStore = create<DigitalTwinStore>(
  persist(
    (set) => ({
      ...DEFAULT_USER_STATE,

      updateCognitiveLoad: (load: number) =>
        set(() => ({
          cognitiveLoad: Math.min(1, Math.max(0, load)),
          lastUpdated: Date.now(),
        })),

      updateEnergyLevel: (energy: number) =>
        set(() => ({
          energyLevel: Math.min(1, Math.max(0, energy)),
          lastUpdated: Date.now(),
        })),

      updateFocusDepth: (depth: number) =>
        set(() => ({
          focusDepth: Math.min(1, Math.max(0, depth)),
          lastUpdated: Date.now(),
        })),

      updateEmotionalValence: (valence: number) =>
        set(() => ({
          emotionalValence: Math.min(1, Math.max(-1, valence)),
          lastUpdated: Date.now(),
        })),

      updateStressIndex: (stress: number) =>
        set(() => ({
          stressIndex: Math.min(1, Math.max(0, stress)),
          lastUpdated: Date.now(),
        })),

      updateHeartRate: (bpm: number) =>
        set(() => ({
          heartRate: Math.max(40, Math.min(180, bpm)),
          lastUpdated: Date.now(),
        })),

      updatePeakHours: (hours: number[]) =>
        set(() => ({
          peakHours: hours,
          lastUpdated: Date.now(),
        })),

      updateDecisionStyle: (style: string) =>
        set(() => ({
          decisionStyle: style,
          lastUpdated: Date.now(),
        })),

      updateCommunicationTone: (tone: string) =>
        set(() => ({
          communicationTone: tone,
          lastUpdated: Date.now(),
        })),

      addTopicCluster: (topics: string[]) =>
        set((state) => ({
          topicClusters: [...state.topicClusters, topics],
          patternCount: state.patternCount + 1,
          lastUpdated: Date.now(),
        })),

      updatePredictions: (predictions) =>
        set((state) => ({
          nextLikelyQuery: predictions.nextQuery ?? state.nextLikelyQuery,
          nextLikelyTask: predictions.nextTask ?? state.nextLikelyTask,
          todayMoodForecast: predictions.moodForecast ?? state.todayMoodForecast,
          weekPriorityForecast: predictions.priorityForecast ?? state.weekPriorityForecast,
          lastUpdated: Date.now(),
        })),

      updateTwinState: (partial) =>
        set(() => ({
          ...partial,
          lastUpdated: Date.now(),
        })),

      resetTwin: () =>
        set(() => ({
          ...DEFAULT_USER_STATE,
          lastUpdated: Date.now(),
        })),
    }),
    {
      name: 'digital-twin-store',
      version: 1,
    }
  )
);
