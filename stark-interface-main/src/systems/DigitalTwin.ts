/**
 * JARVIS Digital Twin Engine
 * Probabilistic model of the user that learns and predicts needs
 */

import { useDigitalTwinStore } from '@/store/digitalTwin';
import { jarvisBus } from '@/lib/jarvisBus';

interface InteractionRecord {
  timestamp: number;
  type: 'query' | 'typing' | 'mouse' | 'focus' | 'break';
  data: Record<string, unknown>;
  cognitiveLoad: number;
  stressIndex: number;
  focusDepth: number;
}

class DigitalTwinEngine {
  private history: InteractionRecord[] = [];
  private keyEvents: { t: number; key: string }[] = [];
  private windowSwitches: number[] = [];
  private sessionStartTime: number = Date.now();

  constructor() {
    this.loadHistory();
    this.setupEventListeners();
    this.startPeriodicAnalysis();
  }

  /**
   * TYPING PATTERN ANALYSIS
   * Runs on keyboard events to estimate cognitive state
   */
  analyzeTypingPattern(events: { timeStamp: number; key: string }[]): void {
    if (events.length < 2) return;

    const intervals: number[] = [];
    for (let i = 1; i < events.length; i++) {
      intervals.push(events[i].timeStamp - events[i - 1].timeStamp);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((a, b) => a + (b - avgInterval) ** 2, 0) / intervals.length;
    const errorRate = events.filter((e) => e.key === 'Backspace').length / events.length;

    // High variance + high error = stressed/distracted
    const stressIndex = Math.min(1, (variance / 10000 + errorRate * 3) / 2);
    // Low interval + low variance = focused/in-flow
    const focusDepth = Math.max(0, 1 - stressIndex - (avgInterval > 300 ? 0.3 : 0));

    const store = useDigitalTwinStore.getState();
    store.updateStressIndex(stressIndex);
    store.updateFocusDepth(focusDepth);

    this.recordInteraction('typing', {
      avgInterval,
      variance,
      errorRate,
    });
  }

  /**
   * MOUSE MOVEMENT ANALYSIS
   * Hesitation, micro-tremors, speed changes indicate stress
   */
  analyzeMousePatterns(movements: { x: number; y: number; t: number }[]): void {
    if (movements.length < 2) return;

    const speeds: number[] = [];
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i - 1].x;
      const dy = movements[i].y - movements[i - 1].y;
      const dt = movements[i].t - movements[i - 1].t;
      speeds.push(Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 1));
    }

    const speedVariance = this.calculateVariance(speeds);
    const store = useDigitalTwinStore.getState();
    const currentStress = store.stressIndex;

    // High speed variance = erratic mouse = stress
    store.updateStressIndex(
      (currentStress + Math.min(1, speedVariance / 100)) / 2
    );

    this.recordInteraction('mouse', { speedVariance });
  }

  /**
   * QUERY COMPLEXITY ANALYSIS
   * NLP analysis of user queries
   */
  analyzeQuery(query: string): void {
    const tokens = query.toLowerCase().split(/\s+/);
    const complexity = Math.min(
      1,
      tokens.length / 30 +
        (query.includes('?') ? 0.1 : 0) +
        (query.includes('because') || query.includes('therefore') ? 0.2 : 0) +
        (query.includes('compare') ||
        query.includes('analyze') ||
        query.includes('evaluate')
          ? 0.3
          : 0)
    );

    // Simple sentiment (emoji-based for now, would use ML later)
    const sentiment = query.match(/[😢😞😔😤😡😠]/);
    const emotionalValence = sentiment
      ? -0.7
      : query.match(/[😊😄😃😁😆]/)?  0.7 : 0;

    const store = useDigitalTwinStore.getState();
    store.updateCognitiveLoad(complexity);
    store.updateEmotionalValence(emotionalValence);

    this.recordInteraction('query', {
      query: query.slice(0, 100),
      complexity,
      emotionalValence,
    });
  }

  /**
   * ENERGY LEVEL ESTIMATION
   * Based on time of day and interaction patterns
   */
  private updateEnergyLevel(): void {
    const hour = new Date().getHours();
    const store = useDigitalTwinStore.getState();
    const peakHours = store.peakHours;

    // Base energy from circadian rhythm (simplified)
    let energy = 0.5; // baseline
    if (hour >= 6 && hour < 9) energy = 0.7; // morning ramp-up
    else if (hour >= 9 && hour < 12) energy = 0.9; // morning peak
    else if (hour >= 12 && hour < 14) energy = 0.4; // post-lunch dip
    else if (hour >= 14 && hour < 18) energy = 0.85; // afternoon peak
    else if (hour >= 18 && hour < 21) energy = 0.6; // evening decline
    else energy = 0.2; // night

    // Adjust based on stress
    energy *= 1 - store.stressIndex * 0.5;

    // Boost if in known peak hours
    if (peakHours.includes(hour)) energy = Math.min(1, energy + 0.1);

    store.updateEnergyLevel(energy);
  }

  /**
   * PERIODIC ANALYSIS & PREDICTION
   * Every 30 seconds, update energy and check for pattern updates
   */
  private startPeriodicAnalysis(): void {
    setInterval(() => {
      this.updateEnergyLevel();
      this.detectPeakHours();
      this.identifyDecisionStyle();
      this.emitTwinStateUpdate();
    }, 30000); // 30 seconds

    // Weekly pattern learning (every 5 minutes for demo, would be hourly)
    setInterval(() => {
      this.learnPatterns();
    }, 300000); // 5 minutes
  }

  /**
   * DETECT PEAK HOURS
   * Learn when user is most productive
   */
  private detectPeakHours(): void {
    const store = useDigitalTwinStore.getState();
    const recentInteractions = this.history.filter(
      (r) => Date.now() - r.timestamp < 86400000 // last 24 hours
    );

    if (recentInteractions.length < 10) return;

    // Group by hour and calculate average focus
    const hourlyFocus: Record<number, number[]> = {};
    recentInteractions.forEach((r) => {
      const hour = new Date(r.timestamp).getHours();
      if (!hourlyFocus[hour]) hourlyFocus[hour] = [];
      hourlyFocus[hour].push(r.focusDepth);
    });

    // Find peak hours (top 6 hours by average focus)
    const hourlyAvg = Object.entries(hourlyFocus).map(([hour, values]) => ({
      hour: parseInt(hour),
      avgFocus: values.reduce((a, b) => a + b, 0) / values.length,
    }));

    const peaks = hourlyAvg
      .sort((a, b) => b.avgFocus - a.avgFocus)
      .slice(0, 6)
      .map((h) => h.hour)
      .sort((a, b) => a - b);

    if (peaks.length > 0) {
      store.updatePeakHours(peaks);
    }
  }

  /**
   * IDENTIFY DECISION STYLE
   * Based on query patterns and response times
   */
  private identifyDecisionStyle(): void {
    const store = useDigitalTwinStore.getState();
    const recentQueries = this.history
      .filter((r) => r.type === 'query')
      .slice(-20);

    if (recentQueries.length === 0) return;

    // Simple heuristic: if high complexity & high stress = analytical
    // Low complexity & low stress = intuitive
    const avgComplexity =
      recentQueries.reduce((a, b) => a + b.cognitiveLoad, 0) /
      recentQueries.length;
    const avgStress =
      recentQueries.reduce((a, b) => a + b.stressIndex, 0) /
      recentQueries.length;

    let style = 'analytical';
    if (avgComplexity > 0.7 && avgStress > 0.6) style = 'analytical';
    else if (avgComplexity < 0.4 && avgStress < 0.4) style = 'intuitive';
    else style = 'collaborative';

    store.updateDecisionStyle(style);
  }

  /**
   * LEARN PATTERNS
   * Update pattern count and other learned metrics
   */
  private learnPatterns(): void {
    const store = useDigitalTwinStore.getState();
    if (this.history.length > 0) {
      store.updateTwinState({
        learningDays: Math.floor((Date.now() - this.sessionStartTime) / 86400000) + 1,
        patternCount: this.history.length,
      });
    }
  }

  /**
   * PROACTIVE SUGGESTION GENERATION
   * Generate helpful suggestion based on current state
   */
  async generateProactiveSuggestion(): Promise<string | null> {
    const store = useDigitalTwinStore.getState();

    // Don't interrupt when in deep focus
    if (store.focusDepth > 0.8) return null;

    // Don't suggest when stressed
    if (store.stressIndex > 0.7) return null;

    // Don't suggest too frequently
    if (Math.random() > 0.3) return null;

    const suggestions = [
      '💡 Time for a break? You\'ve been focused for a while.',
      '🎯 Your energy is high right now—great time for deep work.',
      '☕ How about a quick coffee break?',
      '📝 Consider jotting down your thoughts before they fade.',
      '🚶 A short walk might help reset your mind.',
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  /**
   * RECORD INTERACTION
   * Store interaction data for learning
   */
  private recordInteraction(
    type: InteractionRecord['type'],
    data: Record<string, unknown>
  ): void {
    const store = useDigitalTwinStore.getState();
    const record: InteractionRecord = {
      timestamp: Date.now(),
      type,
      data,
      cognitiveLoad: store.cognitiveLoad,
      stressIndex: store.stressIndex,
      focusDepth: store.focusDepth,
    };

    this.history.push(record);
    if (this.history.length > 5000) this.history.shift();
    this.saveHistory();
  }

  /**
   * EMIT STATE UPDATE EVENT
   * Notify other systems of current state
   */
  private emitTwinStateUpdate(): void {
    const store = useDigitalTwinStore.getState();
    jarvisBus.emit('twin:state-updated', {
      cognitiveLoad: store.cognitiveLoad,
      stressIndex: store.stressIndex,
      focusDepth: store.focusDepth,
    });
  }

  /**
   * SETUP EVENT LISTENERS
   */
  private setupEventListeners(): void {
    // Listen for predictions from other systems
    jarvisBus.on('focus:start', (data) => {
      this.recordInteraction('focus', data);
    });

    jarvisBus.on('task:created', (data) => {
      this.recordInteraction('query', data);
    });
  }

  /**
   * PERSISTENCE
   */
  private saveHistory(): void {
    try {
      const recent = this.history.slice(-100); // only save last 100
      localStorage.setItem('jarvis_twin_history', JSON.stringify(recent));
    } catch (e) {
      console.warn('Failed to save twin history:', e);
    }
  }

  private loadHistory(): void {
    try {
      const saved = localStorage.getItem('jarvis_twin_history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load twin history:', e);
    }
  }

  /**
   * UTILITY
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length;
  }

  getState() {
    return useDigitalTwinStore.getState();
  }

  getAnalytics() {
    return {
      totalInteractions: this.history.length,
      avgStress: this.history.reduce((a, b) => a + b.stressIndex, 0) / this.history.length || 0,
      avgFocus: this.history.reduce((a, b) => a + b.focusDepth, 0) / this.history.length || 0,
      avgCognition: this.history.reduce((a, b) => a + b.cognitiveLoad, 0) / this.history.length || 0,
    };
  }
}

export const digitalTwin = new DigitalTwinEngine();
